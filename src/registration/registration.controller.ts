import { Controller, Post, Body, Get, UseGuards, Param, NotFoundException } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('registrations')
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) { }

  @Post()
  async register(@Body() data: CreateRegistrationDto) {
    return this.registrationService.createRegistration(data);
  }

  @Get('admin/stats')
  @UseGuards(JwtAuthGuard)
  async getStats() {
    const stats = await this.registrationService.getAdminStats();
    return {
      message: 'Stats fetched successfully',
      data: stats,
    };
  }

  @Get('admin/list')
  @UseGuards(JwtAuthGuard)
  async getAll() {
    const registrations = await this.registrationService.getAllRegistrations();
    return {
      message: 'Registrations fetched successfully',
      data: registrations,
    };
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard)
  async getOne(@Param('id') id: string) {
    const registration = await this.registrationService.getRegistrationById(id);
    if (!registration) {
      throw new NotFoundException('Registration not found');
    }
    return {
      message: 'Registration fetched successfully',
      data: registration,
    };
  }
}
