import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './email.service';

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async notifySecretChanged(params: {
    workspaceId: string;
    environmentId: string;
    environmentName: string;
    secretKey: string;
    action: 'created' | 'updated' | 'deleted' | 'revealed';
    actorId: string;
  }) {
    const titleMap: Record<string, string> = {
      created: 'Secret Created',
      updated: 'Secret Updated',
      deleted: 'Secret Deleted',
      revealed: 'Secret Revealed',
    };

    const messageMap: Record<string, string> = {
      created: `${params.secretKey} was created in ${params.environmentName}`,
      updated: `${params.secretKey} was updated in ${params.environmentName}`,
      deleted: `${params.secretKey} was deleted from ${params.environmentName}`,
      revealed: `${params.secretKey} was revealed in ${params.environmentName}`,
    };

    const typeMap: Record<string, string> = {
      created: 'secret_created',
      updated: 'secret_updated',
      deleted: 'secret_deleted',
      revealed: 'secret_revealed',
    };

    // Get workspace members to notify (include user for email)
    const members = await this.prisma.workspaceMember.findMany({
      where: { workspaceId: params.workspaceId },
      include: { user: true },
    });

    // Filter out actor
    const otherMembers = members.filter(m => m.userId !== params.actorId);

    // Persist in-app notification for each member (except actor)
    const notifications = otherMembers.map(m => ({
      workspaceId: params.workspaceId,
      userId: m.userId,
      type: typeMap[params.action],
      title: titleMap[params.action],
      message: messageMap[params.action],
    }));

    if (notifications.length > 0) {
      await this.prisma.notification.createMany({ data: notifications });
    }

    // Send email notifications (opt-in via SMTP_API_KEY)
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: params.workspaceId },
      select: { name: true },
    });

    if (workspace) {
      await Promise.allSettled(
        otherMembers.map(m =>
          this.emailService.sendSecretChangeEmail({
            to: m.user.email,
            secretKey: params.secretKey,
            environmentName: params.environmentName,
            workspaceName: workspace.name,
            action: params.action,
          }),
        ),
      );
    }
  }

  async getUserNotifications(userId: string, limit = 20, offset = 0) {
    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);

    return { notifications, total };
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, read: false },
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }
}
