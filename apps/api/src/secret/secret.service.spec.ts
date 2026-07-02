import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { SecretService } from './secret.service';
import { PrismaService } from '../prisma/prisma.service';
import { SecretEncryptionService } from './secret-encryption.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { NotificationService } from '../notification/notification.service';
import { SecretKeyService } from './secret-key.service';
import { WorkspaceMemberEnvironmentService } from '../workspace-member-environment/workspace-member-environment.service';
import { Role } from '../generated/prisma/client';

describe('SecretService (RBAC)', () => {
  let service: SecretService;
  let prisma: PrismaService;

  const mockEncryption = {
    encrypt: jest.fn().mockReturnValue({ ciphertext: 'enc', iv: 'iv', tag: 'tag' }),
    decrypt: jest.fn().mockReturnValue('decrypted-value'),
  };

  const mockEnv = {
    id: 'env-1',
    name: 'development',
    projectId: 'proj-1',
    project: { id: 'proj-1', workspaceId: 'ws-1' },
  };

  const mockSecret = {
    id: 'secret-1',
    environmentId: 'env-1',
    key: 'DB_URL',
    valueEncrypted: 'enc',
    iv: 'iv',
    tag: 'tag',
    version: 1,
    updatedAt: new Date(),
    createdAt: new Date(),
    updatedById: 'user-1',
  };

  const mockPrisma = {
    environment: { findUnique: jest.fn() },
    workspaceMember: { findUnique: jest.fn() },
    secret: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), findMany: jest.fn() },
    secretHistory: { findMany: jest.fn(), create: jest.fn() },
  };

  const mockAuditLog = { log: jest.fn() };
  const mockNotification = { notifySecretChanged: jest.fn() };

  const mockMemberEnv = {
    getOverrideRole: jest.fn().mockResolvedValue(null),
  };

  const mockSecretKey = {
    getOrCreateWorkspaceKey: jest.fn().mockResolvedValue({ id: 'wk-1', rawKey: Buffer.alloc(32) }),
    getWorkspaceKey: jest.fn().mockResolvedValue(Buffer.alloc(32)),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SecretService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: SecretEncryptionService, useValue: mockEncryption },
        { provide: AuditLogService, useValue: mockAuditLog },
        { provide: NotificationService, useValue: mockNotification },
        { provide: WorkspaceMemberEnvironmentService, useValue: mockMemberEnv },
        { provide: SecretKeyService, useValue: mockSecretKey },
      ],
    }).compile();
    service = module.get<SecretService>(SecretService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.environment.findUnique.mockResolvedValue(mockEnv);
  });

  describe('VIEWER permission restrictions', () => {
    beforeEach(() => {
      mockPrisma.workspaceMember.findUnique.mockResolvedValue({ role: Role.VIEWER });
    });

    it('create throws ForbiddenException for VIEWER', async () => {
      await expect(
        service.create('user-1', 'env-1', { key: 'NEW_KEY', value: 'val' }),
      ).rejects.toThrow(ForbiddenException);
      expect(mockPrisma.secret.create).not.toHaveBeenCalled();
    });

    it('update throws ForbiddenException for VIEWER', async () => {
      mockPrisma.secret.findUnique.mockResolvedValue(mockSecret);

      await expect(
        service.update('user-1', 'secret-1', { value: 'newval' }),
      ).rejects.toThrow(ForbiddenException);
      expect(mockPrisma.secret.update).not.toHaveBeenCalled();
    });

    it('remove throws ForbiddenException for VIEWER', async () => {
      mockPrisma.secret.findUnique.mockResolvedValue(mockSecret);

      await expect(
        service.remove('user-1', 'secret-1'),
      ).rejects.toThrow(ForbiddenException);
      expect(mockPrisma.secret.delete).not.toHaveBeenCalled();
    });

    it('importSecrets throws ForbiddenException for VIEWER', async () => {
      await expect(
        service.importSecrets('user-1', 'env-1', { text: 'KEY=val' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('rollback throws ForbiddenException for VIEWER', async () => {
      mockPrisma.secret.findUnique.mockResolvedValue(mockSecret);

      await expect(
        service.rollback('user-1', 'secret-1', 'history-1'),
      ).rejects.toThrow(ForbiddenException);
      expect(mockPrisma.secret.update).not.toHaveBeenCalled();
    });
  });

  describe('VIEWER read operations allowed', () => {
    beforeEach(() => {
      mockPrisma.workspaceMember.findUnique.mockResolvedValue({ role: Role.VIEWER });
    });

    it('findAll succeeds for VIEWER', async () => {
      mockPrisma.secret.findMany.mockResolvedValue([]);

      const result = await service.findAll('user-1', 'env-1');

      expect(result).toEqual([]);
    });

    it('reveal succeeds for VIEWER', async () => {
      mockPrisma.secret.findUnique.mockResolvedValue(mockSecret);

      const result = await service.reveal('user-1', 'secret-1');

      expect(result.value).toBe('decrypted-value');
    });

    it('exportSecrets succeeds for VIEWER', async () => {
      mockPrisma.secret.findMany.mockResolvedValue([mockSecret]);

      const result = await service.exportSecrets('user-1', 'env-1');

      expect(result).toContain('DB_URL=decrypted-value');
    });
  });

  describe('EDITOR write operations allowed', () => {
    beforeEach(() => {
      mockPrisma.workspaceMember.findUnique.mockResolvedValue({ role: Role.EDITOR });
    });

    it('create succeeds for EDITOR', async () => {
      mockPrisma.secret.findUnique.mockResolvedValue(null);
      mockPrisma.secret.create.mockResolvedValue(mockSecret);

      const result = await service.create('user-1', 'env-1', { key: 'DB_URL', value: 'val' });

      expect(result.key).toBe('DB_URL');
    });

    it('update succeeds for EDITOR', async () => {
      mockPrisma.secret.findUnique.mockResolvedValue(mockSecret);
      mockPrisma.secret.update.mockResolvedValue(mockSecret);

      const result = await service.update('user-1', 'secret-1', { value: 'newval' });

      expect(result).toBeDefined();
    });

    it('remove succeeds for EDITOR', async () => {
      mockPrisma.secret.findUnique.mockResolvedValue(mockSecret);
      mockPrisma.secret.delete.mockResolvedValue(mockSecret);

      await expect(service.remove('user-1', 'secret-1')).resolves.toBeUndefined();
    });
  });

  describe('non-member forbidden', () => {
    beforeEach(() => {
      mockPrisma.workspaceMember.findUnique.mockResolvedValue(null);
    });

    it('all operations throw ForbiddenException for non-members', async () => {
      await expect(
        service.create('user-x', 'env-1', { key: 'X', value: 'x' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('SecretService (other edge cases)', () => {
    it('create throws ConflictException if key exists', async () => {
      mockPrisma.workspaceMember.findUnique.mockResolvedValue({ role: Role.EDITOR });
      mockPrisma.secret.findUnique.mockResolvedValue(mockSecret);

      await expect(
        service.create('user-1', 'env-1', { key: 'DB_URL', value: 'val' }),
      ).rejects.toThrow(ConflictException);
    });

    it('findAll throws NotFoundException for invalid environment', async () => {
      mockPrisma.environment.findUnique.mockResolvedValue(null);

      await expect(service.findAll('user-1', 'bad-env')).rejects.toThrow(NotFoundException);
    });
  });
});
