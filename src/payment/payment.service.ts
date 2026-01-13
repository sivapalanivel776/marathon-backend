import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Razorpay = require('razorpay');

@Injectable()
export class PaymentService {
    private razorpayInstance: any;

    constructor() {
        this.razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }

    async createOrder(amount: number, currency: string = 'INR') {
        const options = {
            amount: amount * 100, // amount in smallest currency unit
            currency,
            receipt: `receipt_order_${Date.now()}`,
        };

        try {
            const order = await this.razorpayInstance.orders.create(options);
            return order;
        } catch (error) {
            throw error;
        }
    }

    verifyPayment(razorpayOrderId: string, razorpayPaymentId: string, signature: string): boolean {
        // TEST MODE: Allow test payments for development
        // Remove this in production or use environment variable
        if (razorpayPaymentId.startsWith('pay_test')) {
            console.log('⚠️ TEST MODE: Bypassing signature validation for test payment');
            return true;
        }

        const body = razorpayOrderId + '|' + razorpayPaymentId;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        return expectedSignature === signature;
    }
}
