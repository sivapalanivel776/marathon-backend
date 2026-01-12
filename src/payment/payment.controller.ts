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
        @Body('email') email: string,
    ) {
        if (!razorpayOrderId || !razorpayPaymentId || !signature || !email) {
            throw new BadRequestException('Missing payment details or email');
        }

        const isValid = this.paymentService.verifyPayment(
            razorpayOrderId,
            razorpayPaymentId,
            signature,
        );

        if (isValid) {
            const ticketId = `TICKET-${razorpayPaymentId}`;

            // Update DB status to PAID
            await this.registrationService.updatePaymentStatus(
                razorpayOrderId,
                razorpayPaymentId,
                'PAID',
                ticketId
            );

            // Send Email
            await this.mailService.sendTicketId(email, ticketId);

            return {
                success: true,
                message: 'Payment verified and Ticket ID sent to email',
                ticketId,
            };
        } else {
            // Update DB status to FAILED
            await this.registrationService.updatePaymentStatus(
                razorpayOrderId,
                razorpayPaymentId,
                'FAILED'
            );
            throw new BadRequestException('Invalid payment signature');
        }
    }
}
