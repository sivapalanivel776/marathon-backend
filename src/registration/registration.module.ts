import { Module, forwardRef } from '@nestjs/common';
import { PaymentModule } from '../payment/payment.module';
import { RegistrationController } from './registration.controller';
import { RegistrationService } from './registration.service';

@Module({
    imports: [forwardRef(() => PaymentModule)],
    controllers: [RegistrationController],
    providers: [RegistrationService],
    exports: [RegistrationService],
})
export class RegistrationModule { }
