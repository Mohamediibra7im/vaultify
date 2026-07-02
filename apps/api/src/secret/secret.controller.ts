import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtOrApiTokenGuard } from '../common/guards/jwt-or-api-token.guard';
import { SecretService } from './secret.service';
import { CreateSecretDto, UpdateSecretDto, ImportSecretsDto, SearchSecretsDto, RotateSecretDto } from './dto';

@UseGuards(JwtOrApiTokenGuard)
@Controller()
export class SecretController {
  constructor(private readonly secretService: SecretService) {}

  @Get('environments/:environmentId/secrets')
  findAll(
    @CurrentUser('sub') userId: string,
    @Param('environmentId') environmentId: string,
  ) {
    return this.secretService.findAll(userId, environmentId);
  }

  @Post('environments/:environmentId/secrets')
  create(
    @CurrentUser('sub') userId: string,
    @Param('environmentId') environmentId: string,
    @Body() dto: CreateSecretDto,
  ) {
    return this.secretService.create(userId, environmentId, dto);
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('environments/:environmentId/secrets/import')
  importSecrets(
    @CurrentUser('sub') userId: string,
    @Param('environmentId') environmentId: string,
    @Body() dto: ImportSecretsDto,
  ) {
    return this.secretService.importSecrets(userId, environmentId, dto);
  }

  @Get('environments/:environmentId/secrets/export')
  @Header('Content-Type', 'text/plain')
  @Header('Content-Disposition', 'attachment; filename=".env"')
  exportSecrets(
    @CurrentUser('sub') userId: string,
    @Param('environmentId') environmentId: string,
    @Query('resolve') resolve?: string,
  ) {
    return this.secretService.exportSecrets(userId, environmentId, resolve === 'true');
  }

  @Get('workspaces/:workspaceId/secrets/stale')
  findStale(
    @CurrentUser('sub') userId: string,
    @Param('workspaceId') workspaceId: string,
    @Query('days') days?: string,
  ) {
    return this.secretService.findStaleSecretsByWorkspace(userId, workspaceId, days ? parseInt(days, 10) : 90);
  }

  @Post('workspaces/:workspaceId/secrets/stale/notify')
  notifyStale(
    @CurrentUser('sub') userId: string,
    @Param('workspaceId') workspaceId: string,
    @Query('days') days?: string,
  ) {
    return this.secretService.notifyStaleSecrets(userId, workspaceId, days ? parseInt(days, 10) : 90);
  }

  @Get('secrets/:id')
  findOne(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.secretService.findOne(userId, id);
  }

  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Post('secrets/:id/reveal')
  reveal(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.secretService.reveal(userId, id);
  }

  @Patch('secrets/:id')
  update(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSecretDto,
  ) {
    return this.secretService.update(userId, id, dto);
  }

  @Delete('secrets/:id')
  remove(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.secretService.remove(userId, id);
  }

  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Post('secrets/search')
  search(
    @CurrentUser() user: { sub: string },
    @Body() dto: SearchSecretsDto,
  ) {
    return this.secretService.search(user.sub, dto);
  }

  @Get('secrets/:id/history')
  getHistory(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.secretService.getHistory(userId, id);
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('secrets/:id/rollback')
  rollback(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body('historyId') historyId: string,
  ) {
    return this.secretService.rollback(userId, id, historyId);
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('secrets/:id/rotate')
  rotate(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: RotateSecretDto,
  ) {
    return this.secretService.rotate(userId, id, dto);
  }
}
