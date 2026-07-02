import { IsString } from 'class-validator';

export class RotateSecretDto {
  @IsString()
  value!: string;
}
