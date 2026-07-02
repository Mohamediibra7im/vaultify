import { IsEnum, IsInt, IsOptional, IsEmail, Min } from 'class-validator';
import { Role } from '../../generated/prisma/client';

export class CreateInviteLinkDto {
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  expiresInHours?: number; // will be converted to Date in service

  @IsOptional()
  @IsInt()
  @Min(1)
  maxUses?: number;

  @IsOptional()
  @IsEmail()
  email?: string;
}
