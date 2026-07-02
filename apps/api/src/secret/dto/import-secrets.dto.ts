import { IsOptional, IsString } from 'class-validator';

export class ImportSecretsDto {
  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  secrets?: { key: string; value: string }[];
}
