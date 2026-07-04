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
import { WorkspaceService } from './workspace.service';
import { CreateWorkspaceDto, UpdateMemberRoleDto, UpdateWorkspaceDto } from './dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtOrApiTokenGuard)
@Controller('workspaces')
export class WorkspaceController {
  constructor(private readonly workspace: WorkspaceService) {}

  @Post()
  create(@CurrentUser() user: { sub: string }, @Body() dto: CreateWorkspaceDto) {
    return this.workspace.create(user.sub, dto);
  }

  @Get()
  findAll(@CurrentUser() user: { sub: string }) {
    return this.workspace.findAll(user.sub);
  }

  @Get(':id')
  findOne(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.workspace.findOne(user.sub, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { sub: string },
    @Param('id') id: string,
    @Body() dto: UpdateWorkspaceDto,
  ) {
    return this.workspace.update(user.sub, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.workspace.remove(user.sub, id);
  }

  @Get(':id/members')
  findMembers(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.workspace.findMembers(user.sub, id);
  }

  @Patch(':id/members/:memberId/role')
  updateMemberRole(
    @CurrentUser() user: { sub: string },
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.workspace.updateMemberRole(user.sub, id, memberId, dto);
  }

  @Delete(':id/members/:memberId')
  removeMember(
    @CurrentUser() user: { sub: string },
    @Param('id') id: string,
    @Param('memberId') memberId: string,
  ) {
    return this.workspace.removeMember(user.sub, id, memberId);
  }
}
