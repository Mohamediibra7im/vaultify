import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtOrApiTokenGuard } from '../common/guards/jwt-or-api-token.guard';
import { ProjectService } from './project.service';
import { CreateProjectDto, UpdateProjectDto } from './dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtOrApiTokenGuard)
@Controller()
export class ProjectController {
  constructor(private readonly project: ProjectService) {}

  @Post('workspaces/:workspaceId/projects')
  create(
    @CurrentUser() user: { sub: string },
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateProjectDto,
  ) {
    return this.project.create(user.sub, workspaceId, dto);
  }

  @Get('workspaces/:workspaceId/projects')
  findAll(
    @CurrentUser() user: { sub: string },
    @Param('workspaceId') workspaceId: string,
  ) {
    return this.project.findAll(user.sub, workspaceId);
  }

  @Get('projects/:id')
  findOne(
    @CurrentUser() user: { sub: string },
    @Param('id') id: string,
  ) {
    return this.project.findOne(user.sub, id);
  }

  @Patch('projects/:id')
  update(
    @CurrentUser() user: { sub: string },
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.project.update(user.sub, id, dto);
  }

  @Delete('projects/:id')
  remove(
    @CurrentUser() user: { sub: string },
    @Param('id') id: string,
  ) {
    return this.project.remove(user.sub, id);
  }
}
