import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { EnvironmentService } from './environment.service';
import { CreateEnvironmentDto, EnvironmentDiffDto } from './dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtOrApiTokenGuard } from '../common/guards/jwt-or-api-token.guard';

@UseGuards(JwtOrApiTokenGuard)
@Controller()
export class EnvironmentController {
  constructor(private readonly environment: EnvironmentService) {}

  @Post('projects/:projectId/environments')
  create(
    @CurrentUser() user: { sub: string },
    @Param('projectId') projectId: string,
    @Body() dto: CreateEnvironmentDto,
  ) {
    return this.environment.create(user.sub, projectId, dto);
  }

  @Get('projects/:projectId/environments')
  findAll(
    @CurrentUser() user: { sub: string },
    @Param('projectId') projectId: string,
  ) {
    return this.environment.findAll(user.sub, projectId);
  }

  @Get('environments/:id')
  findOne(
    @CurrentUser() user: { sub: string },
    @Param('id') id: string,
  ) {
    return this.environment.findOne(user.sub, id);
  }

  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Get('projects/:projectId/environments/diff')
  diff(
    @CurrentUser() user: { sub: string },
    @Param('projectId') projectId: string,
    @Query() dto: EnvironmentDiffDto,
  ) {
    return this.environment.diff(user.sub, projectId, dto.id1, dto.id2, dto.includeValues);
  }

  @Delete('environments/:id')
  remove(
    @CurrentUser() user: { sub: string },
    @Param('id') id: string,
  ) {
    return this.environment.remove(user.sub, id);
  }
}
