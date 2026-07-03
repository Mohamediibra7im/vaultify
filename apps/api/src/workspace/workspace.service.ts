import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { Role } from '../generated/prisma/client';
import { CreateWorkspaceDto, UpdateMemberRoleDto, UpdateWorkspaceDto } from './dto';

@Injectable()
export class WorkspaceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async create(userId: string, dto: CreateWorkspaceDto) {
    const workspace = await this.prisma.workspace.create({
      data: {
        name: dto.name,
        ownerId: userId,
        members: {
          create: { userId, role: Role.OWNER },
        },
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });

    await this.auditLog.log({
      workspaceId: workspace.id,
      actorId: userId,
      action: 'workspace.create',
      target: 'workspace',
      targetId: workspace.id,
    });

    return workspace;
  }

  async findAll(userId: string) {
    return this.prisma.workspace.findMany({
      where: { members: { some: { userId } } },
      select: {
        id: true,
        name: true,
        createdAt: true,
        ownerId: true,
        _count: { select: { members: true, projects: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, workspaceId: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        id: true,
        name: true,
        createdAt: true,
        ownerId: true,
        members: {
          select: {
            id: true,
            role: true,
            joinedAt: true,
            user: { select: { id: true, name: true, email: true, avatarUrl: true } },
          },
          orderBy: { joinedAt: 'asc' },
        },
        projects: {
          select: { id: true, name: true, description: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!workspace) throw new NotFoundException('Workspace not found');

    const isMember = workspace.members.some((m) => m.user.id === userId);
    if (!isMember) throw new ForbiddenException('Not a workspace member');

    return workspace;
  }

  async update(userId: string, workspaceId: string, dto: UpdateWorkspaceDto) {
    await this.assertOwner(userId, workspaceId);
    const result = await this.prisma.workspace.update({
      where: { id: workspaceId },
      data: { name: dto.name },
      select: { id: true, name: true, createdAt: true },
    });

    await this.auditLog.log({
      workspaceId,
      actorId: userId,
      action: 'workspace.update',
      target: 'workspace',
      targetId: workspaceId,
      details: JSON.stringify({ name: dto.name }),
    });

    return result;
  }

  async remove(userId: string, workspaceId: string) {
    await this.assertOwner(userId, workspaceId);
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { name: true },
    });
    await this.prisma.workspace.delete({ where: { id: workspaceId } });

    await this.auditLog.log({
      workspaceId,
      actorId: userId,
      action: 'workspace.delete',
      target: 'workspace',
      targetId: workspaceId,
      details: JSON.stringify({ name: workspace?.name }),
    });
  }

  async findMembers(userId: string, workspaceId: string) {
    await this.assertMember(userId, workspaceId);
    return this.prisma.workspaceMember.findMany({
      where: { workspaceId },
      select: {
        id: true,
        role: true,
        joinedAt: true,
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
      orderBy: { joinedAt: 'asc' },
    });
  }

  async updateMemberRole(userId: string, workspaceId: string, memberId: string, dto: UpdateMemberRoleDto) {
    await this.assertOwner(userId, workspaceId);

    const member = await this.prisma.workspaceMember.findUnique({ where: { id: memberId } });
    if (!member) throw new NotFoundException('Member not found');
    if (member.workspaceId !== workspaceId) throw new NotFoundException('Member not in this workspace');

    const result = await this.prisma.workspaceMember.update({
      where: { id: memberId },
      data: { role: dto.role },
      select: {
        id: true,
        role: true,
        joinedAt: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    await this.auditLog.log({
      workspaceId,
      actorId: userId,
      action: 'member.role',
      target: 'member',
      targetId: memberId,
      details: JSON.stringify({ role: dto.role }),
    });

    return result;
  }

  async removeMember(userId: string, workspaceId: string, memberId: string) {
    await this.assertOwner(userId, workspaceId);

    const member = await this.prisma.workspaceMember.findUnique({ where: { id: memberId } });
    if (!member) throw new NotFoundException('Member not found');
    if (member.workspaceId !== workspaceId) throw new NotFoundException('Member not in this workspace');

    await this.prisma.workspaceMember.delete({ where: { id: memberId } });

    await this.auditLog.log({
      workspaceId,
      actorId: userId,
      action: 'member.remove',
      target: 'member',
      targetId: memberId,
      details: JSON.stringify({ removedUserId: member.userId }),
    });
  }

  private async assertMember(userId: string, workspaceId: string) {
    const member = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
    if (!member) throw new ForbiddenException('Not a workspace member');
  }

  private async assertOwner(userId: string, workspaceId: string) {
    const member = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
    if (!member || member.role !== Role.OWNER) {
      throw new ForbiddenException('Only workspace owner can perform this action');
    }
  }
}
