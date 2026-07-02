import { randomBytes, createHash } from 'node:crypto';
import {
  BadRequestException,
  ForbiddenException,
  GoneException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditLogService } from '../audit-log/audit-log.service';
import { EmailService } from '../notification/email.service';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../generated/prisma/client';
import { CreateInviteLinkDto } from './dto/create-invite-link.dto';

@Injectable()
export class InviteLinkService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly auditLog: AuditLogService,
  ) {}

  async generate(userId: string, workspaceId: string, dto?: CreateInviteLinkDto) {
    await this.assertOwner(userId, workspaceId);

    const raw = randomBytes(32).toString('hex');
    const tokenHash = this.hash(raw);

    const role = dto?.role ?? Role.EDITOR;
    const data: Record<string, unknown> = {
      workspaceId,
      tokenHash,
      role,
    };

    if (dto?.expiresInHours) {
      data.expiresAt = new Date(Date.now() + dto.expiresInHours * 3_600_000);
    }
    if (dto?.maxUses != null) {
      data.maxUses = dto.maxUses;
    }
    if (dto?.email) {
      data.email = dto.email;
    }

    const link = await this.prisma.inviteLink.create({
      data: data as any,
      select: {
        id: true,
        role: true,
        createdAt: true,
        expiresAt: true,
        maxUses: true,
        email: true,
      },
    });

    await this.auditLog.log({
      workspaceId,
      actorId: userId,
      action: 'invite.create',
      target: 'invite',
      targetId: link.id,
      details: JSON.stringify({ role: link.role, email: dto?.email ?? null }),
    });

    const url = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/invite/${raw}`;

    // Send invitation email if email was specified
    if (dto?.email) {
      const workspace = await this.prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { name: true },
      });
      if (workspace) {
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
          select: { name: true },
        });
        this.emailService.sendInviteEmail({
          to: dto.email,
          workspaceName: workspace.name,
          inviterName: user?.name ?? 'A team member',
          inviteUrl: url,
          role: link.role,
        }).catch(() => {
          // Email sending is best-effort; don't fail the invite
        });
      }
    }

    return {
      token: raw,
      url,
      ...link,
    };
  }

  async preview(token: string) {
    const link = await this.findActiveLink(token);
    if (!link) throw new NotFoundException('Invalid or expired invite link');

    const isExpired = link.expiresAt && link.expiresAt < new Date();
    const isFull = link.maxUses != null && link.usesCount >= link.maxUses;

    const workspace = await this.prisma.workspace.findUnique({
      where: { id: link.workspaceId },
      select: {
        id: true,
        name: true,
        _count: { select: { members: true } },
      },
    });
    if (!workspace) throw new NotFoundException('Workspace not found');

    return {
      workspace: { id: workspace.id, name: workspace.name },
      memberCount: workspace._count.members,
      role: link.role,
      isExpired,
      isFull,
    };
  }

  async accept(userId: string, token: string) {
    const link = await this.findActiveLink(token);
    if (!link) throw new NotFoundException('Invalid or expired invite link');

    if (link.expiresAt && link.expiresAt < new Date()) {
      throw new GoneException('Invite link has expired');
    }

    if (link.maxUses != null && link.usesCount >= link.maxUses) {
      throw new BadRequestException('Invite link has reached maximum uses');
    }

    const existing = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId: link.workspaceId, userId } },
    });
    if (existing) {
      throw new BadRequestException('Already a member of this workspace');
    }

    await this.prisma.$transaction([
      this.prisma.workspaceMember.create({
        data: { workspaceId: link.workspaceId, userId, role: link.role },
      }),
      this.prisma.inviteLink.update({
        where: { id: link.id },
        data: { usesCount: { increment: 1 } },
      }),
    ]);

    await this.auditLog.log({
      workspaceId: link.workspaceId,
      actorId: userId,
      action: 'member.add',
      target: 'member',
      targetId: userId,
      details: JSON.stringify({ role: link.role }),
    });

    return { workspaceId: link.workspaceId };
  }

  async list(workspaceId: string, userId: string) {
    await this.assertOwner(userId, workspaceId);

    return this.prisma.inviteLink.findMany({
      where: { workspaceId },
      select: {
        id: true,
        role: true,
        active: true,
        expiresAt: true,
        maxUses: true,
        usesCount: true,
        email: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async revoke(workspaceId: string, linkId: string, userId: string) {
    await this.assertOwner(userId, workspaceId);

    const link = await this.prisma.inviteLink.findFirst({
      where: { id: linkId, workspaceId },
    });
    if (!link) throw new NotFoundException('Invite link not found');

    const updated = await this.prisma.inviteLink.update({
      where: { id: linkId },
      data: { active: false },
      select: { id: true, active: true },
    });

    await this.auditLog.log({
      workspaceId,
      actorId: userId,
      action: 'invite.revoke',
      target: 'invite',
      targetId: linkId,
      details: JSON.stringify({ role: link.role }),
    });

    return updated;
  }

  private async findActiveLink(token: string) {
    return this.prisma.inviteLink.findFirst({
      where: { tokenHash: this.hash(token), active: true },
    });
  }

  private hash(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private async assertOwner(userId: string, workspaceId: string) {
    const member = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
    if (!member || member.role !== Role.OWNER) {
      throw new ForbiddenException('Only workspace owner can manage invite links');
    }
  }
}
