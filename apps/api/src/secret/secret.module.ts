import { Module } from '@nestjs/common';
import { SecretController } from './secret.controller';
import { SecretService } from './secret.service';
import { SecretEncryptionService } from './secret-encryption.service';
import { SecretKeyService } from './secret-key.service';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { NotificationModule } from '../notification/notification.module';
import { CommonModule } from '../common/common.module';
import { WorkspaceMemberEnvironmentModule } from '../workspace-member-environment/workspace-member-environment.module';

@Module({
  imports: [AuditLogModule, NotificationModule, WorkspaceMemberEnvironmentModule, CommonModule],
  controllers: [SecretController],
  providers: [SecretService, SecretEncryptionService, SecretKeyService],
  exports: [SecretEncryptionService, SecretKeyService],
})
export class SecretModule {}
