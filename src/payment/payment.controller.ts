import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { MailService } from '../mail/mail.service';
import { RegistrationService } from '../registration/registration.service';

@Controller('payment')
export class PaymentController {
    constructor(
        private readonly paymentService: PaymentService,
        private readonly mailService: MailService,
        private readonly registrationService: RegistrationService,
    ) { }

    @Post('order')
    async createOrder(@Body('registrationId') registrationId: string, @Body('amount') amount: number) {
        if (!registrationId || !amount) {
            throw new BadRequestException('Registration ID and Amount are required');
        }

        // Create Razorpay Order
        const order = await this.paymentService.createOrder(amount);

        // Logic to update registration with the razorpayOrderId would go here
        // For simplicity, we assume registration is created first, then we update it
        // In a real app, you might find specific registration and update it:
        // await this.prisma.registration.update({ where: { id: registrationId }, data: { razorpayOrderId: order.id } });

        return order;
    }

    @Post('verify')
    async verifyPayment(
        @Body('razorpayOrderId') razorpayOrderId: string,
        @Body('razorpayPaymentId') razorpayPaymentId: string,
        @Body('signature') signature: string,
    ) {
        if (!razorpayOrderId || !razorpayPaymentId || !signature) {
            throw new BadRequestException('Missing payment details');
        }

        const isValid = this.paymentService.verifyPayment(
            razorpayOrderId,
            razorpayPaymentId,
            signature,
        );

        if (isValid) {
            let emailSent = false;

            try {
                // Finalize Registration: Move from Temp to Main
                const registration = await this.registrationService.finalizeRegistration(
                    razorpayOrderId,
                    razorpayPaymentId
                );

                // Send Email
                if (registration && registration.email) {
                    const formatCategory = (cat: string) => {
                        if (cat === 'KM_5') return '5 KM';
                        if (cat === 'KM_3') return '3 KM';
                        if (cat === 'KM_1_5') return '1.5 KM';
                        return cat;
                    };
                    const displayCategory = formatCategory(registration.raceCategory as string);

                    try {
                        await this.mailService.sendTicketId(registration.email, registration.ticketId, registration.amount.toString(), {
                            name: 'AYYAPANTHANGAL MARATHON 2026',
                            venue: 'Ayyapanthangal',
                            date: 'Sunday, 15 February 2026',
                            category: displayCategory,
                            userName: registration.name
                        });
                        emailSent = true;
                    } catch (emailError) {
                        console.error('Failed to send email:', emailError);
                    }

                    if (emailSent) {
                        await this.registrationService.updateEmailStatus(registration.id, true);
                    }

                    return {
                        success: true,
                        message: 'Payment verified and Registration confirmed.',
                        referenceNumber: registration.ticketId,
                        emailSent,
                        userDetails: {
                            name: registration.name,
                            email: registration.email,
                            mobileNumber: registration.mobileNumber,
                            category: displayCategory,
                            amount: registration.amount
                        }
                    };
                }

            } catch (error) {
                // If finalize fails (e.g. data already moved?), handle gracefully
                throw new BadRequestException(error.message || 'Registration confirmation failed');
            }

        } else {
            // Logic for failed payment - potentially delete temp registration or mark logic?
            // For now, simple error
            throw new BadRequestException('Invalid payment signature');
        }
    }
}
