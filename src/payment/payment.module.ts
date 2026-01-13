import { Module, forwardRef } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { MailModule } from '../mail/mail.module';
import { RegistrationModule } from '../registration/registration.module';

@Module({
    imports: [MailModule, forwardRef(() => RegistrationModule)],
    controllers: [PaymentController],
    providers: [PaymentService],
    exports: [PaymentService],
})
export class PaymentModule { }
