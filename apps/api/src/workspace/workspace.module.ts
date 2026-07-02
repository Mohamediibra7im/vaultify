import { Module } from '@nestjs/common';
import { WorkspaceController } from './workspace.controller';
import { WorkspaceService } from './workspace.service';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [AuditLogModule, EventsModule],
  controllers: [WorkspaceController],
  providers: [WorkspaceService],
})
export class WorkspaceModule {}
