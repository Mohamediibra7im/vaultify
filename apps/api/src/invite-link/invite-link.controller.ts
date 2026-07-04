import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtOrApiTokenGuard } from '../common/guards/jwt-or-api-token.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { InviteLinkService } from './invite-link.service';
import { CreateInviteLinkDto } from './dto/create-invite-link.dto';

@Controller()
export class InviteLinkController {
  constructor(private readonly inviteLink: InviteLinkService) {}

  /** Generate invite link with optional params (new multi-link API) */
  @UseGuards(JwtOrApiTokenGuard)
  @Post('workspaces/:workspaceId/invite-links')
  create(
    @CurrentUser() user: { sub: string },
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateInviteLinkDto,
  ) {
    return this.inviteLink.generate(user.sub, workspaceId, dto);
  }

  /** Generate invite link (backward compat, no body, same as Phase 1) */
  @UseGuards(JwtOrApiTokenGuard)
  @Post('workspaces/:workspaceId/invite-link')
  generate(
    @CurrentUser() user: { sub: string },
    @Param('workspaceId') workspaceId: string,
  ) {
    return this.inviteLink.generate(user.sub, workspaceId);
  }

  /** List all invite links for a workspace (owner only) */
  @UseGuards(JwtOrApiTokenGuard)
  @Get('workspaces/:workspaceId/invite-links')
  list(
    @CurrentUser() user: { sub: string },
    @Param('workspaceId') workspaceId: string,
  ) {
    return this.inviteLink.list(workspaceId, user.sub);
  }

  /** Revoke a specific invite link */
  @UseGuards(JwtOrApiTokenGuard)
  @Post('workspaces/:workspaceId/invite-links/:id/revoke')
  revoke(
    @CurrentUser() user: { sub: string },
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.inviteLink.revoke(workspaceId, id, user.sub);
  }

  /** Preview invite link (public) */
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Get('invite/:token')
  preview(@Param('token') token: string) {
    return this.inviteLink.preview(token);
  }

  /** Accept invite and join workspace */
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @UseGuards(JwtOrApiTokenGuard)
  @Post('invite/:token/accept')
  accept(
    @CurrentUser() user: { sub: string },
    @Param('token') token: string,
  ) {
    return this.inviteLink.accept(user.sub, token);
  }
}
