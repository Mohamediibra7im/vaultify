import { IsEnum } from 'class-validator';
import { Role } from '../../generated/prisma/client';

export class SetMemberEnvironmentRoleDto {
  @IsEnum(Role)
  role!: Role;
}
