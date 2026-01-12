import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail', // or use host/port from env
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }x

    async sendTicketId(email: string, ticketId: string) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Marathon Event Registration Successful',
            text: `Thank you for registering! Your Ticket ID is: ${ticketId}`,
            html: `
        <h1>Registration Successful</h1>
        <p>Thank you for registering for the Marathon Event.</p>
        <p><strong>Your Ticket ID is: ${ticketId}</strong></p>
        <p>Please keep this ID safe for entry.</p>
      `,
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email sent: ' + info.response);
            return info;
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }
}
