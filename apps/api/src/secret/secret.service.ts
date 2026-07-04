import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SecretEncryptionService } from './secret-encryption.service';
import { SecretKeyService } from './secret-key.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { NotificationService } from '../notification/notification.service';
import { WorkspaceMemberEnvironmentService } from '../workspace-member-environment/workspace-member-environment.service';
import { Role } from '../generated/prisma/client';
import { CreateSecretDto, UpdateSecretDto, ImportSecretsDto, SearchSecretsDto, RotateSecretDto } from './dto';

const secretListSelect = {
  id: true,
  environmentId: true,
  key: true,
  version: true,
  updatedAt: true,
  createdAt: true,
} as const;

@Injectable()
export class SecretService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: SecretEncryptionService,
    private readonly auditLog: AuditLogService,
    private readonly notification: NotificationService,
    private readonly memberEnv: WorkspaceMemberEnvironmentService,
    private readonly secretKey: SecretKeyService,
  ) {}

  async create(userId: string, environmentId: string, dto: CreateSecretDto) {
    const env = await this.prisma.environment.findUnique({
      where: { id: environmentId },
      include: { project: true },
    });
    if (!env) throw new NotFoundException('Environment not found');
    await this.assertMember(userId, env.project.workspaceId, Role.EDITOR, environmentId);

    const { id: workspaceKeyId, rawKey } = await this.secretKey.getOrCreateWorkspaceKey(env.project.workspaceId);

    const existing = await this.prisma.secret.findUnique({
      where: { environmentId_key: { environmentId, key: dto.key } },
    });
    if (existing) {
      throw new ConflictException('Secret key already exists in this environment');
    }

    const { ciphertext, iv, tag } = this.encryption.encrypt(dto.value, rawKey);

    const secret = await this.prisma.secret.create({
      data: {
        key: dto.key,
        valueEncrypted: ciphertext,
        iv,
        tag,
        workspaceKeyId,
        environmentId,
        updatedById: userId,
      },
      select: { ...secretListSelect, valueEncrypted: true, iv: true, tag: true, version: true },
    });

    // Save initial history
    await this.saveHistory(secret.id, secret.key, secret.valueEncrypted, secret.iv, secret.tag, secret.version, userId, workspaceKeyId);

    await this.auditLog.log({
      workspaceId: env.project.workspaceId,
      actorId: userId,
      action: 'secret.create',
      target: 'secret',
      targetId: secret.id,
      details: JSON.stringify({ key: dto.key, environmentId }),
    });

    await this.notification.notifySecretChanged({
      workspaceId: env.project.workspaceId,
      environmentId,
      environmentName: env.name,
      secretKey: dto.key,
      action: 'created',
      actorId: userId,
    });

    return {
      id: secret.id,
      environmentId: secret.environmentId,
      key: secret.key,
      version: secret.version,
      updatedAt: secret.updatedAt,
      createdAt: secret.createdAt,
    };
  }

  async findAll(userId: string, environmentId: string) {
    const env = await this.prisma.environment.findUnique({
      where: { id: environmentId },
      include: { project: true },
    });
    if (!env) throw new NotFoundException('Environment not found');
    await this.assertMember(userId, env.project.workspaceId, undefined, environmentId);

    return this.prisma.secret.findMany({
      where: { environmentId },
      select: secretListSelect,
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(userId: string, secretId: string) {
    const secret = await this.prisma.secret.findUnique({
      where: { id: secretId },
    });
    if (!secret) throw new NotFoundException('Secret not found');

    const env = await this.prisma.environment.findUnique({
      where: { id: secret.environmentId },
      include: { project: true },
    });
    if (!env) throw new NotFoundException('Environment not found');
    await this.assertMember(userId, env.project.workspaceId, undefined, secret.environmentId);

    return {
      id: secret.id,
      environmentId: secret.environmentId,
      key: secret.key,
      version: secret.version,
      updatedAt: secret.updatedAt,
      createdAt: secret.createdAt,
    };
  }

  async reveal(userId: string, secretId: string) {
    const secret = await this.prisma.secret.findUnique({
      where: { id: secretId },
    });
    if (!secret) throw new NotFoundException('Secret not found');

    const env = await this.prisma.environment.findUnique({
      where: { id: secret.environmentId },
      include: { project: true },
    });
    if (!env) throw new NotFoundException('Environment not found');
    await this.assertMember(userId, env.project.workspaceId, undefined, secret.environmentId);

    const workspaceKey = await this.secretKey.getWorkspaceKey(secret.workspaceKeyId!);
    const value = this.encryption.decrypt(
      secret.valueEncrypted,
      secret.iv,
      secret.tag,
      workspaceKey,
    );

    await this.auditLog.log({
      workspaceId: env.project.workspaceId,
      actorId: userId,
      action: 'secret.reveal',
      target: 'secret',
      targetId: secretId,
      details: JSON.stringify({ key: secret.key, environmentId: secret.environmentId }),
    });

    await this.notification.notifySecretChanged({
      workspaceId: env.project.workspaceId,
      environmentId: secret.environmentId,
      environmentName: env.name,
      secretKey: secret.key,
      action: 'revealed',
      actorId: userId,
    });

    return {
      id: secret.id,
      key: secret.key,
      value,
    };
  }

  async update(userId: string, secretId: string, dto: UpdateSecretDto) {
    const secret = await this.prisma.secret.findUnique({
      where: { id: secretId },
    });
    if (!secret) throw new NotFoundException('Secret not found');

    const env = await this.prisma.environment.findUnique({
      where: { id: secret.environmentId },
      include: { project: true },
    });
    if (!env) throw new NotFoundException('Environment not found');
    await this.assertMember(userId, env.project.workspaceId, Role.EDITOR, secret.environmentId);

    const workspaceKey = await this.secretKey.getWorkspaceKey(secret.workspaceKeyId!);

    // Save old version to history
    await this.saveHistory(secret.id, secret.key, secret.valueEncrypted, secret.iv, secret.tag, secret.version, userId, secret.workspaceKeyId!);

    const { ciphertext, iv, tag } = this.encryption.encrypt(dto.value, workspaceKey);

    const updated = await this.prisma.secret.update({
      where: { id: secretId },
      data: {
        valueEncrypted: ciphertext,
        iv,
        tag,
        version: { increment: 1 },
        updatedById: userId,
      },
      select: secretListSelect,
    });

    await this.auditLog.log({
      workspaceId: env.project.workspaceId,
      actorId: userId,
      action: 'secret.update',
      target: 'secret',
      targetId: secretId,
      details: JSON.stringify({ key: secret.key, environmentId: secret.environmentId }),
    });

    await this.notification.notifySecretChanged({
      workspaceId: env.project.workspaceId,
      environmentId: secret.environmentId,
      environmentName: env.name,
      secretKey: secret.key,
      action: 'updated',
      actorId: userId,
    });

    return updated;
  }

  async rotate(userId: string, secretId: string, dto: RotateSecretDto) {
    const secret = await this.prisma.secret.findUnique({
      where: { id: secretId },
    });
    if (!secret) throw new NotFoundException('Secret not found');

    const env = await this.prisma.environment.findUnique({
      where: { id: secret.environmentId },
      include: { project: true },
    });
    if (!env) throw new NotFoundException('Environment not found');
    await this.assertMember(userId, env.project.workspaceId, Role.EDITOR, secret.environmentId);

    const workspaceKey = await this.secretKey.getWorkspaceKey(secret.workspaceKeyId!);

    // Save old version to history
    await this.saveHistory(secret.id, secret.key, secret.valueEncrypted, secret.iv, secret.tag, secret.version, userId, secret.workspaceKeyId!);

    const { ciphertext, iv, tag } = this.encryption.encrypt(dto.value, workspaceKey);

    const updated = await this.prisma.secret.update({
      where: { id: secretId },
      data: {
        valueEncrypted: ciphertext,
        iv,
        tag,
        version: { increment: 1 },
        updatedById: userId,
      },
      select: secretListSelect,
    });

    await this.auditLog.log({
      workspaceId: env.project.workspaceId,
      actorId: userId,
      action: 'secret.rotate',
      target: 'secret',
      targetId: secretId,
      details: JSON.stringify({ key: secret.key, environmentId: secret.environmentId }),
    });

    await this.notification.notifySecretChanged({
      workspaceId: env.project.workspaceId,
      environmentId: secret.environmentId,
      environmentName: env.name,
      secretKey: secret.key,
      action: 'updated',
      actorId: userId,
    });

    return updated;
  }

  async remove(userId: string, secretId: string) {
    const secret = await this.prisma.secret.findUnique({
      where: { id: secretId },
    });
    if (!secret) throw new NotFoundException('Secret not found');

    const env = await this.prisma.environment.findUnique({
      where: { id: secret.environmentId },
      include: { project: true },
    });
    if (!env) throw new NotFoundException('Environment not found');
    await this.assertMember(userId, env.project.workspaceId, Role.EDITOR, secret.environmentId);

    await this.prisma.secret.delete({ where: { id: secretId } });

    await this.auditLog.log({
      workspaceId: env.project.workspaceId,
      actorId: userId,
      action: 'secret.delete',
      target: 'secret',
      targetId: secretId,
      details: JSON.stringify({ key: secret.key, environmentId: secret.environmentId }),
    });

    await this.notification.notifySecretChanged({
      workspaceId: env.project.workspaceId,
      environmentId: secret.environmentId,
      environmentName: env.name,
      secretKey: secret.key,
      action: 'deleted',
      actorId: userId,
    });
  }

  async importSecrets(
    userId: string,
    environmentId: string,
    dto: ImportSecretsDto,
  ) {
    const env = await this.prisma.environment.findUnique({
      where: { id: environmentId },
      include: { project: true },
    });
    if (!env) throw new NotFoundException('Environment not found');
    await this.assertMember(userId, env.project.workspaceId, Role.EDITOR, environmentId);

    const { id: workspaceKeyId, rawKey } = await this.secretKey.getOrCreateWorkspaceKey(env.project.workspaceId);

    let entries: { key: string; value: string }[] = [];
    if (dto.text) {
      entries = dto.text
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('#'))
        .map((line) => {
          const eqIdx = line.indexOf('=');
          if (eqIdx === -1) {
            throw new BadRequestException(
              `Invalid .env line (no '=' found): ${line}`,
            );
          }
          return {
            key: line.slice(0, eqIdx).trim(),
            value: line.slice(eqIdx + 1).trim(),
          };
        });
    } else if (dto.secrets) {
      entries = dto.secrets;
    } else {
      throw new BadRequestException(
        'Provide either text (.env format) or secrets array',
      );
    }

    if (entries.length === 0) {
      return { imported: 0, skipped: 0, errors: [] };
    }

    const results = { imported: 0, skipped: 0, errors: [] as string[] };

    for (const entry of entries) {
      if (!entry.key) {
        results.errors.push('Empty key found, skipping');
        continue;
      }
      try {
        const existing = await this.prisma.secret.findUnique({
          where: {
            environmentId_key: { environmentId, key: entry.key },
          },
        });
        if (existing) {
          // ponytail: decrypt existing, compare, skip if same value
          const oldDecrypted = this.encryption.decrypt(
            existing.valueEncrypted, existing.iv, existing.tag, rawKey,
          );
          if (oldDecrypted === entry.value) {
            results.skipped++;
            continue;
          }
          // value changed — save history, re-encrypt, update
          await this.saveHistory(
            existing.id, existing.key, existing.valueEncrypted,
            existing.iv, existing.tag, existing.version ?? 1, userId, workspaceKeyId,
          );
          const { ciphertext, iv, tag } = this.encryption.encrypt(entry.value, rawKey);
          await this.prisma.secret.update({
            where: { id: existing.id },
            data: {
              valueEncrypted: ciphertext,
              iv,
              tag,
              version: { increment: 1 },
              updatedById: userId,
            },
          });
          await this.notification.notifySecretChanged({
            workspaceId: env.project.workspaceId,
            environmentId: env.id,
            environmentName: env.name,
            secretKey: entry.key,
            action: 'updated',
            actorId: userId,
          });
          results.imported++;
          continue;
        }
        const { ciphertext, iv, tag } = this.encryption.encrypt(entry.value, rawKey);
        await this.prisma.secret.create({
          data: {
            key: entry.key,
            valueEncrypted: ciphertext,
            iv,
            tag,
            workspaceKeyId,
            environmentId,
            updatedById: userId,
          },
        });
        await this.notification.notifySecretChanged({
          workspaceId: env.project.workspaceId,
          environmentId: env.id,
          environmentName: env.name,
          secretKey: entry.key,
          action: 'created',
          actorId: userId,
        });
        results.imported++;
      } catch (err) {
        results.errors.push(
          `Failed to import ${entry.key}: ${(err as Error).message}`,
        );
      }
    }

    await this.auditLog.log({
      workspaceId: env.project.workspaceId,
      actorId: userId,
      action: 'secret.import',
      target: 'environment',
      targetId: environmentId,
      details: JSON.stringify({ count: entries.length, imported: results.imported, skipped: results.skipped }),
    });

    return results;
  }

  async resolveReferences(
    value: string,
    currentEnvId: string,
    projectId: string,
    visited: Set<string> = new Set(),
    depth = 0,
  ): Promise<string> {
    if (depth > 4) return value;

    const pattern = /\{\{\s*([^.]+)\.([^}]+)\s*\}\}/g;
    const parts: string[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(value)) !== null) {
      parts.push(value.slice(lastIndex, match.index));

      const [fullMatch, envName, key] = match;
      const visitKey = `${envName}:${key}`;

      if (visited.has(visitKey)) {
        parts.push(fullMatch);
      } else {
        const env = await this.prisma.environment.findFirst({
          where: { projectId, name: envName },
        });
        if (!env) { parts.push(fullMatch); continue; }

        const secret = await this.prisma.secret.findUnique({
          where: { environmentId_key: { environmentId: env.id, key } },
        });
        if (!secret) { parts.push(fullMatch); continue; }

        const workspaceKey = await this.secretKey.getWorkspaceKey(secret.workspaceKeyId!);
        const decrypted = this.encryption.decrypt(secret.valueEncrypted, secret.iv, secret.tag, workspaceKey);
        visited.add(visitKey);
        const resolved = await this.resolveReferences(decrypted, currentEnvId, projectId, visited, depth + 1);
        visited.delete(visitKey);
        parts.push(resolved);
      }

      lastIndex = match.index + fullMatch.length;
    }

    parts.push(value.slice(lastIndex));
    return parts.join('');
  }

  async exportSecrets(userId: string, environmentId: string, resolve = false) {
    const env = await this.prisma.environment.findUnique({
      where: { id: environmentId },
      include: { project: true },
    });
    if (!env) throw new NotFoundException('Environment not found');
    await this.assertMember(userId, env.project.workspaceId, undefined, environmentId);

    const secrets = await this.prisma.secret.findMany({
      where: { environmentId },
    });

    const lines = await Promise.all(secrets.map(async (s) => {
      const workspaceKey = await this.secretKey.getWorkspaceKey(s.workspaceKeyId!);
      const value = this.encryption.decrypt(s.valueEncrypted, s.iv, s.tag, workspaceKey);
      const finalValue = resolve
        ? await this.resolveReferences(value, environmentId, env.project.id)
        : value;
      return `${s.key}=${finalValue}`;
    }));

    return lines.join('\n');
  }

  async getHistory(userId: string, secretId: string) {
    const secret = await this.prisma.secret.findUnique({ where: { id: secretId } });
    if (!secret) throw new NotFoundException('Secret not found');

    const env = await this.prisma.environment.findUnique({
      where: { id: secret.environmentId },
      include: { project: true },
    });
    if (!env) throw new NotFoundException('Environment not found');
    await this.assertMember(userId, env.project.workspaceId, undefined, secret.environmentId);

    return this.prisma.secretHistory.findMany({
      where: { secretId },
      orderBy: { changedAt: 'desc' },
      include: {
        changedBy: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async rollback(userId: string, secretId: string, historyId: string) {
    const secret = await this.prisma.secret.findUnique({ where: { id: secretId } });
    if (!secret) throw new NotFoundException('Secret not found');

    const env = await this.prisma.environment.findUnique({
      where: { id: secret.environmentId },
      include: { project: true },
    });
    if (!env) throw new NotFoundException('Environment not found');
    await this.assertMember(userId, env.project.workspaceId, Role.EDITOR, secret.environmentId);

    const history = await this.prisma.secretHistory.findUnique({ where: { id: historyId } });
    if (!history || history.secretId !== secretId) {
      throw new NotFoundException('History entry not found');
    }

    const workspaceKey = await this.secretKey.getWorkspaceKey(secret.workspaceKeyId!);

    // Save current version before rollback
    await this.saveHistory(secret.id, secret.key, secret.valueEncrypted, secret.iv, secret.tag, secret.version, userId, secret.workspaceKeyId!);

    // Restore old version
    const restored = await this.prisma.secret.update({
      where: { id: secretId },
      data: {
        valueEncrypted: history.valueEncrypted,
        iv: history.iv,
        tag: history.tag,
        workspaceKeyId: history.workspaceKeyId,
        version: { increment: 1 },
        updatedById: userId,
      },
      select: secretListSelect,
    });

    await this.auditLog.log({
      workspaceId: env.project.workspaceId,
      actorId: userId,
      action: 'secret.rollback',
      target: 'secret',
      targetId: secretId,
      details: JSON.stringify({ key: secret.key, historyId, fromVersion: secret.version, toVersion: history.version }),
    });

    await this.notification.notifySecretChanged({
      workspaceId: env.project.workspaceId,
      environmentId: env.id,
      environmentName: env.name,
      secretKey: secret.key,
      action: 'updated',
      actorId: userId,
    });

    return restored;
  }

  private async saveHistory(secretId: string, oldKey: string, oldValueEncrypted: string, oldIv: string, oldTag: string, oldVersion: number, changedById: string, workspaceKeyId?: string) {
    return this.prisma.secretHistory.create({
      data: {
        secretId,
        key: oldKey,
        valueEncrypted: oldValueEncrypted,
        iv: oldIv,
        tag: oldTag,
        version: oldVersion,
        changedById,
        ...(workspaceKeyId ? { workspaceKeyId } : {}),
      },
    });
  }

  async search(userId: string, dto: SearchSecretsDto) {
    const { workspaceId, query, environmentId } = dto;

    // Verify user is workspace member
    await this.assertMember(userId, workspaceId, undefined);

    // Build filter: secrets where key contains query, in workspace, optionally filtered by environment
    const where: any = {
      key: { contains: query, mode: 'insensitive' },
      environment: {
        project: {
          workspaceId,
        },
      },
    };

    if (environmentId) {
      where.environmentId = environmentId;
    }

    const secrets = await this.prisma.secret.findMany({
      where,
      include: {
        environment: {
          include: {
            project: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // Decrypt values
    const results: Array<{
      id: string;
      key: string;
      value: string;
      environmentId: string;
      environmentName: string;
      projectId: string;
      projectName: string;
      updatedAt: Date;
    }> = [];
    for (const s of secrets) {
      const workspaceKey = await this.secretKey.getWorkspaceKey(s.workspaceKeyId!);
      const value = this.encryption.decrypt(s.valueEncrypted, s.iv, s.tag, workspaceKey);
      results.push({
        id: s.id,
        key: s.key,
        value,
        environmentId: s.environmentId,
        environmentName: s.environment.name,
        projectId: s.environment.project.id,
        projectName: s.environment.project.name,
        updatedAt: s.updatedAt,
      });
    }

    return results;
  }

  async findStaleSecretsByWorkspace(userId: string, workspaceId: string, days = 90) {
    await this.assertMember(userId, workspaceId);

    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const secrets = await this.prisma.secret.findMany({
      where: {
        updatedAt: { lt: cutoff },
        environment: { project: { workspaceId } },
      },
      select: {
        id: true,
        key: true,
        version: true,
        updatedAt: true,
        environment: { select: { id: true, name: true, project: { select: { name: true } } } },
      },
      orderBy: { updatedAt: 'asc' },
    });

    const total = secrets.length;
    const perEnv: Record<string, { environmentName: string; projectName: string; secrets: typeof secrets }> = {};
    for (const s of secrets) {
      const key = s.environment.id;
      if (!perEnv[key]) {
        perEnv[key] = { environmentName: s.environment.name, projectName: s.environment.project.name, secrets: [] };
      }
      perEnv[key].secrets.push({ id: s.id, key: s.key, version: s.version, updatedAt: s.updatedAt, environment: s.environment });
    }

    return { total, days, environments: Object.values(perEnv) };
  }

  async notifyStaleSecrets(userId: string, workspaceId: string, days = 90) {
    await this.assertMember(userId, workspaceId);

    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const staleSecrets = await this.prisma.secret.findMany({
      where: {
        updatedAt: { lt: cutoff },
        environment: { project: { workspaceId } },
      },
      include: { environment: { select: { name: true } } },
    });

    if (staleSecrets.length === 0) return { notified: 0 };

    // Get workspace members (exclude actor)
    const members = await this.prisma.workspaceMember.findMany({
      where: { workspaceId, userId: { not: userId } },
      select: { userId: true },
    });

    if (members.length === 0) return { notified: 0 };

    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { name: true },
    });

    const staleSummary = staleSecrets.map(s => `${s.key} (${s.environment.name})`).join(', ');

    const notifications = members.map(m => ({
      workspaceId,
      userId: m.userId,
      type: 'rotation_reminder',
      title: `Rotation Reminder: ${staleSecrets.length} stale secret${staleSecrets.length > 1 ? 's' : ''}`,
      message: `The following secret${staleSecrets.length > 1 ? 's have' : ' has'} not been rotated in ${days}+ days: ${staleSummary}`,
    }));

    await this.prisma.notification.createMany({ data: notifications });

    return { notified: notifications.length, totalStale: staleSecrets.length };
  }

  private async assertMember(userId: string, workspaceId: string, minRole?: Role, environmentId?: string) {
    const member = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
    if (!member) {
      throw new ForbiddenException('Not a workspace member');
    }

    let effectiveRole = member.role;

    // Check environment-level override if applicable
    if (environmentId) {
      const overrideRole = await this.memberEnv.getOverrideRole(member.id, environmentId);
      if (overrideRole && this.hasRoleAtLeast(overrideRole, effectiveRole)) {
        effectiveRole = overrideRole;
      }
    }

    if (minRole && !this.hasRoleAtLeast(effectiveRole, minRole)) {
      throw new ForbiddenException('Insufficient permissions — requires at least ' + minRole);
    }
  }

  private hasRoleAtLeast(role: Role, minRole: Role): boolean {
    const hierarchy: Record<Role, number> = { OWNER: 3, EDITOR: 2, VIEWER: 1 };
    return hierarchy[role] >= hierarchy[minRole];
  }
}
