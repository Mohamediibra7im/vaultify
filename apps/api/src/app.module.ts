import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import Redis from 'ioredis';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { ProjectModule } from './project/project.module';
import { EnvironmentModule } from './environment/environment.module';
import { SecretModule } from './secret/secret.module';
import { InviteLinkModule } from './invite-link/invite-link.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { NotificationModule } from './notification/notification.module';
import { ApiTokenModule } from './api-token/api-token.module';
import { WorkspaceMemberEnvironmentModule } from './workspace-member-environment/workspace-member-environment.module';
import { EventsModule } from './events/events.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    WorkspaceModule,
    ProjectModule,
    EnvironmentModule,
    SecretModule,
    InviteLinkModule,
    AuditLogModule,
    NotificationModule,
    ApiTokenModule,
    WorkspaceMemberEnvironmentModule,
    EventsModule,
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60000, limit: 20 }],
      storage: process.env.REDIS_URL ? new ThrottlerStorageRedisService(new Redis(process.env.REDIS_URL)) : undefined, // ponytail: in-memory when no REDIS_URL
    }),
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
