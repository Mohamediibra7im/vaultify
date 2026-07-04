import { Module } from '@nestjs/common';
import { WorkspaceController } from './workspace.controller';
import { WorkspaceService } from './workspace.service';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [AuditLogModule, CommonModule],
  controllers: [WorkspaceController],
  providers: [WorkspaceService],
})
export class WorkspaceModule {}
