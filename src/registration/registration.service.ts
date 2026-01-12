import { Injectable } from '@nestjs/common';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { PrismaService } from '../prisma/prisma.service';
import { RaceCategory } from '@prisma/client';

@Injectable()
export class RegistrationService {
    constructor(private prisma: PrismaService) { }

    async createRegistration(data: CreateRegistrationDto) {
        console.log('Registration data received:', data);

        // Map DTO enum to Prisma enum if needed
        // Assuming they match or mapping is handled by Prisma

        return this.prisma.registration.create({
            data: {
                ...data,
                dateOfBirth: new Date(data.dateOfBirth),
                raceCategory: data.raceCategory as unknown as RaceCategory,
            },
        });
    }

    async getAdminStats() {
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
    }

    async getAllRegistrations() {
        return this.prisma.registration.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async updatePaymentStatus(razorpayOrderId: string, razorpayPaymentId: string, status: any, ticketId?: string) {
        console.log(`Updating payment status for ${razorpayOrderId} to ${status}`);
        return this.prisma.registration.update({
            where: { razorpayOrderId },
            data: {
                paymentStatus: status,
                razorpayPaymentId,
                ticketId,
            },
        });
    }
}
