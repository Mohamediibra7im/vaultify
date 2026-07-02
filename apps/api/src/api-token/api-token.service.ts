import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { randomBytes, createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApiTokenService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, workspaceId: string, name: string) {
    const member = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
    if (!member) throw new ForbiddenException('Not a workspace member');

    const rawToken = 'vlt_' + randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const tokenPrefix = rawToken.slice(0, 11); // "vlt_" + 7 hex chars

    const token = await this.prisma.apiToken.create({
      data: { workspaceId, userId, name, tokenPrefix, tokenHash },
    });

    return {
      id: token.id,
      workspaceId: token.workspaceId,
      name: token.name,
      tokenPrefix: token.tokenPrefix,
      lastUsedAt: token.lastUsedAt,
      expiresAt: token.expiresAt,
      active: token.active,
      createdAt: token.createdAt,
      rawToken,
    };
  }

  async findAll(userId: string, workspaceId: string) {
    const member = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
    if (!member) throw new ForbiddenException('Not a workspace member');

    return this.prisma.apiToken.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        workspaceId: true,
        name: true,
        tokenPrefix: true,
        lastUsedAt: true,
        expiresAt: true,
        active: true,
        createdAt: true,
      },
    });
  }

  async revoke(userId: string, workspaceId: string, tokenId: string) {
    const token = await this.prisma.apiToken.findFirst({
      where: { id: tokenId, workspaceId },
    });
    if (!token) throw new NotFoundException('Token not found');

    const member = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
    if (!member) throw new ForbiddenException('Not a workspace member');

    return this.prisma.apiToken.update({
      where: { id: tokenId },
      data: { active: false },
    });
  }

  async validate(rawToken: string) {
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const token = await this.prisma.apiToken.findUnique({
      where: { tokenHash },
      include: { workspace: { select: { name: true } } },
    });
    if (!token || !token.active) throw new NotFoundException('Invalid or revoked token');
    if (token.expiresAt && token.expiresAt < new Date()) {
      await this.prisma.apiToken.update({ where: { id: token.id }, data: { active: false } });
      throw new NotFoundException('Token expired');
    }

    // Update lastUsedAt
    await this.prisma.apiToken.update({
      where: { id: token.id },
      data: { lastUsedAt: new Date() },
    });

    return { userId: token.userId, workspaceId: token.workspaceId, tokenId: token.id };
  }
}
