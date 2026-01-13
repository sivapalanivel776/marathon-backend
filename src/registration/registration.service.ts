import { Injectable, HttpException, HttpStatus, Logger, Inject, forwardRef } from '@nestjs/common';
import { ErrorCode, ErrorMessages } from '../common/error-code';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { PrismaService } from '../prisma/prisma.service';
import { RaceCategory, Gender } from '@prisma/client';
import { PaymentService } from '../payment/payment.service';

@Injectable()
export class RegistrationService {
    private readonly logger = new Logger(RegistrationService.name);

    constructor(
        private prisma: PrismaService,
        @Inject(forwardRef(() => PaymentService))
        private paymentService: PaymentService,
    ) { }

    async createRegistration(data: CreateRegistrationDto) {
        this.logger.log('Registration data received:', data);

        try {
            // Check if email or mobile already exists in MAIN Registration table
            const existingEmail = await this.prisma.registration.findUnique({ where: { email: data.email } });
            if (existingEmail) {
                this.logger.warn(`Duplicate registration attempt: Email already exists.`);
                throw new HttpException(
                    { ...ErrorMessages[ErrorCode.REGISTRATION_EMAIL_EXISTS], error: ErrorCode.REGISTRATION_EMAIL_EXISTS },
                    HttpStatus.CONFLICT
                );
            }
            const existingMobile = await this.prisma.registration.findUnique({ where: { mobileNumber: data.mobileNumber } });
            if (existingMobile) {
                this.logger.warn(`Duplicate registration attempt: Mobile number already exists.`);
                throw new HttpException(
                    { ...ErrorMessages[ErrorCode.REGISTRATION_MOBILE_EXISTS], error: ErrorCode.REGISTRATION_MOBILE_EXISTS },
                    HttpStatus.CONFLICT
                );
            }

            // Mapping race category from request to DB format
            const dbRaceCategory = (() => {
                const cat = data.raceCategory.toString().toUpperCase().replace(/\s/g, '');
                if (cat === '5KM' || cat === '5') return 'KM_5';
                if (cat === '3KM' || cat === '3') return 'KM_3';
                if (cat === '1.5KM' || cat === '1.5') return 'KM_1_5';
                return cat;
            })();

            // Create Razorpay Order
            const order = await this.paymentService.createOrder(data.amount);

            // Save to TempRegistration
            const tempRegistration = await this.prisma.tempRegistration.create({
                data: {
                    ...data,
                    dateOfBirth: new Date(data.dateOfBirth),
                    raceCategory: dbRaceCategory as RaceCategory,
                    gender: data.gender as unknown as Gender,
                    razorpayOrderId: order.id,
                },
            });

            // Return response without userId and with formatted raceCategory
            const { userId, raceCategory, ...rest } = tempRegistration;

            const formatDisplayCategory = (cat: string) => {
                if (cat === 'KM_5') return '5 KM';
                if (cat === 'KM_3') return '3 KM';
                if (cat === 'KM_1_5') return '1.5 KM';
                return cat;
            };

            return {
                ...rest,
                raceCategory: formatDisplayCategory(raceCategory as string)
            };
        } catch (error) {
            // Propagate known HTTP exceptions
            if (error instanceof HttpException) {
                throw error;
            }
            if (error.code === 'P2002') {
                // Handle unique constraint violations (e.g. if temp registration has dupes?)
                // Usually we care mostly about main registration dupes handled above.
                this.logger.warn(`Duplicate temp registration attempt.`);
                throw new HttpException(
                    { ...ErrorMessages[ErrorCode.REGISTRATION_ALREADY_EXISTS], error: ErrorCode.REGISTRATION_ALREADY_EXISTS },
                    HttpStatus.CONFLICT
                );
            }

            this.logger.error('Error creating registration:', error);
            throw new HttpException(
                { ...ErrorMessages[ErrorCode.REGISTRATION_CREATION_FAILED], error: ErrorCode.REGISTRATION_CREATION_FAILED },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async getAdminStats() {
        try {
            const totalCount = await this.prisma.registration.count();
            const stats = await this.prisma.registration.aggregate({
                _sum: {
                    amount: true,
                },
                where: {
                    paymentStatus: 'PAID',
                },
            });

            return {
                totalCount,
                totalRevenue: stats._sum.amount || 0,
            };
        } catch (error) {
            this.logger.error('Error fetching admin stats:', error);
            throw new HttpException(
                { ...ErrorMessages[ErrorCode.REGISTRATION_FETCH_FAILED], error: ErrorCode.REGISTRATION_FETCH_FAILED },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async getAllRegistrations() {
        try {
            return await this.prisma.registration.findMany({
                orderBy: {
                    createdAt: 'desc',
                },
            });
        } catch (error) {
            this.logger.error('Error fetching registrations:', error);
            throw new HttpException(
                { ...ErrorMessages[ErrorCode.REGISTRATION_FETCH_FAILED], error: ErrorCode.REGISTRATION_FETCH_FAILED },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async getRegistrationById(id: string) {
        try {
            return await this.prisma.registration.findUnique({
                where: { id },
            });
        } catch (error) {
            this.logger.error(`Error fetching registration ${id}:`, error);
            throw new HttpException(
                { ...ErrorMessages[ErrorCode.REGISTRATION_FETCH_FAILED], error: ErrorCode.REGISTRATION_FETCH_FAILED },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async finalizeRegistration(razorpayOrderId: string, razorpayPaymentId: string) {
        // 1. Find Temp Registration
        const tempReg = await this.prisma.tempRegistration.findUnique({
            where: { razorpayOrderId }
        });

        if (!tempReg) {
            // Check if already finalized (in main table)
            const existing = await this.prisma.registration.findUnique({ where: { razorpayOrderId } });
            if (existing) return existing;

            throw new HttpException(
                { ...ErrorMessages[ErrorCode.REGISTRATION_NOT_FOUND], error: ErrorCode.REGISTRATION_NOT_FOUND },
                HttpStatus.NOT_FOUND
            );
        }

        // 2. Generate Sequential Ticket ID
        // Count existing PAID registrations to determine the next sequence number
        // Note: In a high-concurrency real-world app, this needs a transaction or explicit sequence/locking.
        const paidCount = await this.prisma.registration.count({
            where: { paymentStatus: 'PAID' }
        });
        const sequenceNumber = paidCount + 1;
        const ticketId = `AM26-${sequenceNumber.toString().padStart(3, '0')}`;

        // 3. Create Real Registration
        try {
            const newRegistration = await this.prisma.registration.create({
                data: {
                    userId: tempReg.userId,
                    name: tempReg.name,
                    email: tempReg.email,
                    gender: tempReg.gender,
                    dateOfBirth: tempReg.dateOfBirth,
                    age: tempReg.age,
                    presentAddress: tempReg.presentAddress,
                    mobileNumber: tempReg.mobileNumber,
                    medicalHistory: tempReg.medicalHistory,
                    tshirtSize: tempReg.tshirtSize,
                    raceCategory: tempReg.raceCategory,
                    emergencyContactName: tempReg.emergencyContactName,
                    emergencyContactMobile: tempReg.emergencyContactMobile,
                    waiverAccepted: tempReg.waiverAccepted,
                    amount: tempReg.amount,
                    razorpayOrderId: tempReg.razorpayOrderId,
                    razorpayPaymentId: razorpayPaymentId,
                    paymentStatus: 'PAID',
                    ticketId: ticketId,
                    emailSent: false
                }
            });

            // 3. Delete Temp Registration
            await this.prisma.tempRegistration.delete({
                where: { id: tempReg.id }
            });

            return newRegistration;

        } catch (error) {
            this.logger.error(`Error finalizing registration for ${razorpayOrderId}:`, error);
            throw new HttpException(
                { ...ErrorMessages[ErrorCode.REGISTRATION_CREATION_FAILED], error: ErrorCode.REGISTRATION_CREATION_FAILED },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async updateEmailStatus(id: string, status: boolean) {
        return await this.prisma.registration.update({
            where: { id },
            data: { emailSent: status }
        });
    }
}
