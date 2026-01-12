import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { MailModule } from '../mail/mail.module';
import { RegistrationModule } from '../registration/registration.module';

@Module({
    imports: [MailModule, RegistrationModule],
    controllers: [PaymentController],
    providers: [PaymentService],
})
export class PaymentModule { }
