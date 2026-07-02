import { Module } from '@nestjs/common';
import { EnvironmentController } from './environment.controller';
import { EnvironmentService } from './environment.service';
import { CommonModule } from '../common/common.module';
import { SecretModule } from '../secret/secret.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { ApiTokenModule } from '../api-token/api-token.module';

@Module({
  imports: [CommonModule, SecretModule, AuditLogModule, ApiTokenModule],
  controllers: [EnvironmentController],
  providers: [EnvironmentService],
})
export class EnvironmentModule {}
