import { Module } from '@nestjs/common';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { CommonModule } from '../common/common.module';
import { NotificationModule } from '../notification/notification.module';
import { InviteLinkController } from './invite-link.controller';
import { InviteLinkService } from './invite-link.service';

@Module({
  imports: [AuditLogModule, CommonModule, NotificationModule],
  controllers: [InviteLinkController],
  providers: [InviteLinkService],
})
export class InviteLinkModule {}
