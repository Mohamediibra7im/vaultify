import { Controller, Get, Post, Param, Query, Req, UseGuards } from '@nestjs/common';
import { JwtOrApiTokenGuard } from '../common/guards/jwt-or-api-token.guard';
import { NotificationService } from './notification.service';

@UseGuards(JwtOrApiTokenGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async findAll(
    @Req() req: any,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const userId = req.user.id;
    const l = limit ? parseInt(limit, 10) : 20;
    const o = offset ? parseInt(offset, 10) : 0;
    return this.notificationService.getUserNotifications(userId, l, o);
  }

  @Get('unread-count')
  async unreadCount(@Req() req: any) {
    const count = await this.notificationService.getUnreadCount(req.user.id);
    return { count };
  }

  @Post(':id/read')
  async markRead(@Req() req: any, @Param('id') id: string) {
    await this.notificationService.markAsRead(id, req.user.id);
    return { success: true };
  }

  @Post('read-all')
  async markAllRead(@Req() req: any) {
    await this.notificationService.markAllAsRead(req.user.id);
    return { success: true };
  }
}
