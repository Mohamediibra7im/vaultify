import { IsString, MinLength } from 'class-validator';

export class CreateSecretDto {
  @IsString()
  @MinLength(1)
  key!: string;

  @IsString()
  value!: string;
}
