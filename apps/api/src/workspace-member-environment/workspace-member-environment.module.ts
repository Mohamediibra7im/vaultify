import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { WorkspaceMemberEnvironmentService } from './workspace-member-environment.service';
import { WorkspaceMemberEnvironmentController } from './workspace-member-environment.controller';

@Module({
  imports: [PrismaModule],
  controllers: [WorkspaceMemberEnvironmentController],
  providers: [WorkspaceMemberEnvironmentService],
  exports: [WorkspaceMemberEnvironmentService],
})
export class WorkspaceMemberEnvironmentModule {}
