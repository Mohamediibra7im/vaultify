import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { JwtOrApiTokenGuard } from '../common/guards/jwt-or-api-token.guard';
import { ApiTokenService } from './api-token.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IsString, MinLength } from 'class-validator';

class CreateApiTokenDto {
  @IsString()
  @MinLength(1)
  name!: string;
}

@UseGuards(JwtOrApiTokenGuard)
@Controller('workspaces/:workspaceId/tokens')
export class ApiTokenController {
  constructor(private readonly apiToken: ApiTokenService) {}

  @Post()
  create(
    @CurrentUser('sub') userId: string,
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateApiTokenDto,
  ) {
    return this.apiToken.create(userId, workspaceId, dto.name);
  }

  @Get()
  findAll(
    @CurrentUser('sub') userId: string,
    @Param('workspaceId') workspaceId: string,
  ) {
    return this.apiToken.findAll(userId, workspaceId);
  }

  @Delete(':id')
  revoke(
    @CurrentUser('sub') userId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('id') tokenId: string,
  ) {
    return this.apiToken.revoke(userId, workspaceId, tokenId);
  }
}
