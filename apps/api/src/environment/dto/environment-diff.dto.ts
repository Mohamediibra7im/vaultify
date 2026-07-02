import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class EnvironmentDiffDto {
  @IsString()
  @IsNotEmpty()
  id1!: string;

  @IsString()
  @IsNotEmpty()
  id2!: string;

  @IsOptional()
  @Type(() => Boolean)
  includeValues?: boolean;
}
