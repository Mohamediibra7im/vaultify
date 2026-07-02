import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../generated/prisma/client';
import { SetMemberEnvironmentRoleDto } from './dto';

@Injectable()
export class WorkspaceMemberEnvironmentService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertOwner(userId: string, workspaceId: string) {
    const member = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
    if (!member || member.role !== Role.OWNER) {
      throw new ForbiddenException('Only workspace owner can manage environment overrides');
    }
  }

  async findByMember(userId: string, workspaceId: string, memberId: string) {
    await this.assertOwner(userId, workspaceId);

    const member = await this.prisma.workspaceMember.findUnique({
      where: { id: memberId },
    });
    if (!member || member.workspaceId !== workspaceId) {
      throw new NotFoundException('Member not found');
    }

    return this.prisma.workspaceMemberEnvironment.findMany({
      where: { memberId },
      include: {
        environment: { select: { id: true, name: true } },
      },
    });
  }

  async setOverride(
    userId: string,
    workspaceId: string,
    memberId: string,
    environmentId: string,
    dto: SetMemberEnvironmentRoleDto,
  ) {
    await this.assertOwner(userId, workspaceId);

    const member = await this.prisma.workspaceMember.findUnique({
      where: { id: memberId },
    });
    if (!member || member.workspaceId !== workspaceId) {
      throw new NotFoundException('Member not found');
    }

    const env = await this.prisma.environment.findUnique({
      where: { id: environmentId },
      include: { project: true },
    });
    if (!env || env.project.workspaceId !== workspaceId) {
      throw new NotFoundException('Environment not found in this workspace');
    }

    return this.prisma.workspaceMemberEnvironment.upsert({
      where: { memberId_environmentId: { memberId, environmentId } },
      create: { memberId, environmentId, role: dto.role },
      update: { role: dto.role },
      include: {
        member: { select: { id: true, userId: true } },
        environment: { select: { id: true, name: true } },
      },
    });
  }

  async removeOverride(
    userId: string,
    workspaceId: string,
    memberId: string,
    environmentId: string,
  ) {
    await this.assertOwner(userId, workspaceId);

    const override = await this.prisma.workspaceMemberEnvironment.findUnique({
      where: { memberId_environmentId: { memberId, environmentId } },
    });
    if (!override) throw new NotFoundException('Override not found');

    await this.prisma.workspaceMemberEnvironment.delete({
      where: { memberId_environmentId: { memberId, environmentId } },
    });
  }

  /**
   * Get the effective role for a member in a specific environment.
   * Returns the override role if set, otherwise null.
   */
  async getOverrideRole(
    memberId: string,
    environmentId: string,
  ): Promise<Role | null> {
    const override = await this.prisma.workspaceMemberEnvironment.findUnique({
      where: { memberId_environmentId: { memberId, environmentId } },
    });
    return override?.role ?? null;
  }
}
