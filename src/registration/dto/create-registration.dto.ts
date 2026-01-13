import { IsString, IsEmail, IsEnum, IsNumber, IsBoolean, IsOptional, IsDateString, IsUUID } from 'class-validator';

export enum RaceCategory {
  KM_1_5 = '1.5 KM',
  KM_3 = '3 KM',
  KM_5 = '5 KM',
  KM_5_ALT = '5KM',
  KM_3_ALT = '3KM',
  KM_1_5_ALT = '1.5KM',
  KM_5_NUM = '5',
  KM_3_NUM = '3',
  KM_1_5_NUM = '1.5',
}

export enum Gender {
  Male = 'Male',
  Female = 'Female',
  Others = 'Others',
}

export class CreateRegistrationDto {

  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsEnum(Gender)
  gender: Gender;

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
