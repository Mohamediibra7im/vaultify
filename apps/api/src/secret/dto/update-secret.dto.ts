import { IsString } from 'class-validator';

export class UpdateSecretDto {
  @IsString()
  value!: string;
}
