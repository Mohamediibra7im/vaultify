import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SecretEncryptionService } from '../secret/secret-encryption.service';
import { SecretKeyService } from '../secret/secret-key.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { Role } from '../generated/prisma/client';
import { CreateEnvironmentDto } from './dto';

export interface SecretDiffItem {
  key: string;
  value: string | null;
}

export interface EnvironmentDiffResult {
  onlyInA: SecretDiffItem[];
  onlyInB: SecretDiffItem[];
  common: Array<{
    key: string;
    same: boolean;
    valueA: string | null;
    valueB: string | null;
  }>;
}

@Injectable()
export class EnvironmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: SecretEncryptionService,
    private readonly auditLog: AuditLogService,
    private readonly secretKey: SecretKeyService,
  ) {}

  async create(userId: string, projectId: string, dto: CreateEnvironmentDto) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');
    await this.assertEditor(userId, project.workspaceId, dto.name);

    return this.prisma.environment.create({
      data: { name: dto.name, projectId },
      select: {
        id: true,
        projectId: true,
        name: true,
        createdAt: true,
        _count: { select: { secrets: true } },
      },
    });
  }

  async findAll(userId: string, projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');
    await this.assertMember(userId, project.workspaceId);

    return this.prisma.environment.findMany({
      where: { projectId },
      select: {
        id: true,
        projectId: true,
        name: true,
        createdAt: true,
        _count: { select: { secrets: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(userId: string, environmentId: string) {
    const env = await this.prisma.environment.findUnique({
      where: { id: environmentId },
      include: {
        project: { select: { id: true, name: true, workspaceId: true } },
      },
    });
    if (!env) throw new NotFoundException('Environment not found');

    const member = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId: env.project.workspaceId, userId } },
    });
    if (!member) throw new ForbiddenException('Not a workspace member');

    return {
      ...env,
      role: member.role,
    };
  }

  async remove(userId: string, environmentId: string) {
    const env = await this.prisma.environment.findUnique({
      where: { id: environmentId },
    });
    if (!env) throw new NotFoundException('Environment not found');

    const project = await this.prisma.project.findUnique({
      where: { id: env.projectId },
    });
    if (!project) throw new NotFoundException('Project not found');
    await this.assertEditor(userId, project.workspaceId, env.name);

    await this.prisma.environment.delete({ where: { id: environmentId } });
  }

  async diff(
    userId: string,
    projectId: string,
    id1: string,
    id2: string,
    includeValues?: boolean,
  ): Promise<EnvironmentDiffResult> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new BadRequestException('Project not found');

    const [envA, envB] = await Promise.all([
      this.prisma.environment.findUnique({
        where: { id: id1 },
        include: { project: true },
      }),
      this.prisma.environment.findUnique({
        where: { id: id2 },
        include: { project: true },
      }),
    ]);
    if (!envA || !envB) {
      throw new BadRequestException('Environment not found');
    }
    if (envA.projectId !== projectId || envB.projectId !== projectId) {
      throw new BadRequestException('Environments do not belong to this project');
    }

    const workspaceId = project.workspaceId;
    const member = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
    if (!member) throw new ForbiddenException('Not a workspace member');

    // Values reveal requires at least EDITOR
    if (includeValues && member.role === Role.VIEWER) {
      throw new ForbiddenException('Viewers cannot reveal secret values');
    }

    const [secretsA, secretsB] = await Promise.all([
      this.prisma.secret.findMany({ where: { environmentId: id1 } }),
      this.prisma.secret.findMany({ where: { environmentId: id2 } }),
    ]);

    const keyMapA = new Map(secretsA.map((s) => [s.key, s]));
    const keyMapB = new Map(secretsB.map((s) => [s.key, s]));
    const allKeys = new Set([...keyMapA.keys(), ...keyMapB.keys()]);

    const onlyInA: SecretDiffItem[] = [];
    const onlyInB: SecretDiffItem[] = [];
    const common: EnvironmentDiffResult['common'] = [];

    for (const key of allKeys) {
      const sA = keyMapA.get(key);
      const sB = keyMapB.get(key);

      if (sA && !sB) {
        const value = includeValues
          ? this.encryption.decrypt(sA.valueEncrypted, sA.iv, sA.tag, await this.secretKey.getWorkspaceKey(sA.workspaceKeyId!))
          : null;
        onlyInA.push({ key, value });
      } else if (!sA && sB) {
        const value = includeValues
          ? this.encryption.decrypt(sB.valueEncrypted, sB.iv, sB.tag, await this.secretKey.getWorkspaceKey(sB.workspaceKeyId!))
          : null;
        onlyInB.push({ key, value });
      } else if (sA && sB) {
        let valueA: string | null = null;
        let valueB: string | null = null;
        let same = false;

        if (includeValues) {
          valueA = this.encryption.decrypt(sA.valueEncrypted, sA.iv, sA.tag, await this.secretKey.getWorkspaceKey(sA.workspaceKeyId!));
          valueB = this.encryption.decrypt(sB.valueEncrypted, sB.iv, sB.tag, await this.secretKey.getWorkspaceKey(sB.workspaceKeyId!));
          same = valueA === valueB;
        }

        common.push({ key, same, valueA, valueB });
      }
    }

    // Log audit entries for bulk reveal if values were decrypted
    if (includeValues) {
      const revealed = [...onlyInA, ...onlyInB, ...common];
      await this.auditLog.log({
        workspaceId,
        actorId: userId,
        action: 'secret.reveal',
        target: 'environment',
        targetId: `${id1}__${id2}`,
        details: JSON.stringify({
          environmentA: id1,
          environmentB: id2,
          count: revealed.length,
          keys: revealed.map((r) => r.key),
        }),
      });
    }

    return { onlyInA, onlyInB, common };
  }

  private async assertEditor(userId: string, workspaceId: string, environmentName?: string) {
    const member = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
    if (!member) throw new ForbiddenException('Not a workspace member');

    // Production environments require OWNER role for mutations
    if (environmentName === 'production' && member.role !== 'OWNER') {
      throw new ForbiddenException('Only workspace owner can modify production environment');
    }

    // All mutations require at least EDITOR
    if (member.role === 'VIEWER') {
      throw new ForbiddenException('Viewers cannot modify environments');
    }

    return member;
  }

  private async assertMember(userId: string, workspaceId: string) {
    const member = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
    if (!member) {
      throw new ForbiddenException('Not a workspace member');
    }
  }
}
