import { Module } from '@nestjs/common';
import { PaymentModule } from './payment/payment.module';
import { MailModule } from './mail/mail.module';
import { RegistrationModule } from './registration/registration.module';
import { PrismaModule } from './prisma/prisma.module';

import { AuthModule } from './auth/auth.module';

@Module({
    imports: [PrismaModule, PaymentModule, MailModule, RegistrationModule, AuthModule],
    controllers: [],
    providers: [],
})
export class AppModule { }
