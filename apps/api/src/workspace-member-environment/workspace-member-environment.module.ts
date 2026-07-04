import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CommonModule } from '../common/common.module';
import { WorkspaceMemberEnvironmentService } from './workspace-member-environment.service';
import { WorkspaceMemberEnvironmentController } from './workspace-member-environment.controller';

@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [WorkspaceMemberEnvironmentController],
  providers: [WorkspaceMemberEnvironmentService],
  exports: [WorkspaceMemberEnvironmentService],
})
export class WorkspaceMemberEnvironmentModule {}
