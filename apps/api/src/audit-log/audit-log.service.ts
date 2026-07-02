import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class AuditLogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async log(params: {
    workspaceId: string;
    actorId: string;
    action: string; // 'secret.create' | 'secret.update' | 'secret.delete' | 'secret.reveal' | 'member.add' | 'member.remove' | 'member.role' | 'invite.create' | 'invite.revoke'
    target: string; // entity type: 'secret' | 'member' | 'invite_link' | 'environment'
    targetId?: string;
    details?: string; // JSON string with extra info
  }) {
    const record = await this.prisma.auditLog.create({ data: params });
    this.eventsGateway.emitToWorkspace(params.workspaceId, 'audit:new', record);
    return record;
  }

  async findByWorkspace(workspaceId: string, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        actor: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async exportCsv(workspaceId: string): Promise<string> {
    const logs = await this.prisma.auditLog.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      include: {
        actor: { select: { id: true, name: true, email: true } },
      },
    });

    const header = 'Action,Target,Actor,Details,Created At';
    const rows = logs.map((l) => {
      const actorName = l.actor?.name || l.actor?.email || 'unknown';
      const details = l.details ? `"${l.details.replace(/"/g, '""')}"` : '';
      return `${l.action},${l.target},"${actorName}",${details},${l.createdAt.toISOString()}`;
    });

    return [header, ...rows].join('\n');
  }
}
