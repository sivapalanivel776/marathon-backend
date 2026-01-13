import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterAdminDto) {
        const existingAdmin = await this.prisma.admin.findUnique({
            where: { email: registerDto.email },
        });

        if (existingAdmin) {
            throw new ConflictException('Admin with this email already exists');
        }

        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        const admin = await this.prisma.admin.create({
            data: {
                email: registerDto.email,
                password: hashedPassword,
            },
        });

        return {
            message: 'Admin registered successfully',
            id: admin.id,
        };
    }

    async login(loginDto: LoginDto) {
        const admin = await this.prisma.admin.findUnique({
            where: { email: loginDto.email },
        });

        if (!admin) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(loginDto.password, admin.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { email: admin.email, sub: admin.id };
        return {
            status: 200,
            message: 'Login successful',
            email: admin.email,
            access_token: this.jwtService.sign(payload),
        };
    }
}
