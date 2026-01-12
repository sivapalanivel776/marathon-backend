import { IsString, IsEmail, IsEnum, IsNumber, IsBoolean, IsOptional, IsDateString, IsUUID } from 'class-validator';

export enum RaceCategory {
  KM_1_5 = 1.5,
  KM_3 = 3,
  KM_5 = 5,
}

export class CreateRegistrationDto {

    @IsUUID()
    @IsOptional()
    userId?: string;

    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    gender: string;

    @IsDateString()
    dateOfBirth: string;

    @IsNumber()
    age: number;

    @IsString()
    presentAddress: string;

    @IsString()
    mobileNumber: string;

    @IsString()
    @IsOptional()
    medicalHistory?: string;

    @IsString()
    tshirtSize: string;

    @IsEnum(RaceCategory)
    raceCategory: RaceCategory;

    @IsString()
    emergencyContactName: string;

    @IsString()
    emergencyContactMobile: string;

    @IsBoolean()
    waiverAccepted: boolean;

    @IsNumber()
    amount: number;
}
