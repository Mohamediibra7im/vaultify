import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class SearchSecretsDto {
  @IsString()
  @IsNotEmpty()
  workspaceId!: string;

  @IsString()
  @IsNotEmpty()
  query!: string;

  @IsOptional()
  @IsString()
  environmentId?: string;
}
