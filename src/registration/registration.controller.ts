import { Controller, Post, Body, Get } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';

@Controller('registrations')
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post()
  async register(@Body() data: CreateRegistrationDto) {
    return this.registrationService.createRegistration(data);
  }

    @Get('admin/stats')
    async getStats() {
        return this.registrationService.getAdminStats();
    }

    @Get('admin/list')
    async getAll() {
        return this.registrationService.getAllRegistrations();
    }
}
