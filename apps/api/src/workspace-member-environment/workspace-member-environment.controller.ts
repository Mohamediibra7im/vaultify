import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtOrApiTokenGuard } from '../common/guards/jwt-or-api-token.guard';
import { WorkspaceMemberEnvironmentService } from './workspace-member-environment.service';
import { SetMemberEnvironmentRoleDto } from './dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtOrApiTokenGuard)
@Controller('workspaces/:workspaceId/members/:memberId/environments')
export class WorkspaceMemberEnvironmentController {
  constructor(
    private readonly service: WorkspaceMemberEnvironmentService,
  ) {}

  @Get()
  findByMember(
    @CurrentUser() user: { sub: string },
    @Param('workspaceId') workspaceId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.service.findByMember(user.sub, workspaceId, memberId);
  }

  @Put(':environmentId')
  setOverride(
    @CurrentUser() user: { sub: string },
    @Param('workspaceId') workspaceId: string,
    @Param('memberId') memberId: string,
    @Param('environmentId') environmentId: string,
    @Body() dto: SetMemberEnvironmentRoleDto,
  ) {
    return this.service.setOverride(user.sub, workspaceId, memberId, environmentId, dto);
  }

  @Delete(':environmentId')
  removeOverride(
    @CurrentUser() user: { sub: string },
    @Param('workspaceId') workspaceId: string,
    @Param('memberId') memberId: string,
    @Param('environmentId') environmentId: string,
  ) {
    return this.service.removeOverride(user.sub, workspaceId, memberId, environmentId);
  }
}
