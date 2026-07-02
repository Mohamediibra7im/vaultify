import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { EnvironmentService } from './environment.service';
import { PrismaService } from '../prisma/prisma.service';
import { SecretEncryptionService } from '../secret/secret-encryption.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { SecretKeyService } from '../secret/secret-key.service';
import { Role } from '../generated/prisma/client';
import { CreateEnvironmentDto } from './dto';

describe('EnvironmentService', () => {
  let service: EnvironmentService;
  let prisma: PrismaService;

  const mockProject = {
    id: 'proj-1',
    name: 'Test Project',
    workspaceId: 'ws-1',
  };

  const mockEnvironment = {
    id: 'env-1',
    projectId: 'proj-1',
    name: 'development',
    createdAt: new Date(),
    _count: { secrets: 0 },
    project: { id: 'proj-1', name: 'Test Project', workspaceId: 'ws-1' },
  };

  const mockPrisma = {
    project: { findUnique: jest.fn() },
    environment: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    workspaceMember: { findUnique: jest.fn() },
    secret: { findMany: jest.fn() },
  };

  const mockEncryption = {
    encrypt: jest.fn(),
    decrypt: jest.fn().mockReturnValue('decrypted-value'),
  };

  const mockAuditLog = { log: jest.fn() };

  const mockSecretKey = {
    getWorkspaceKey: jest
      .fn()
      .mockResolvedValue(Buffer.from('abcdefghijklmnopqrstuvwxyz123456')),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnvironmentService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: SecretEncryptionService, useValue: mockEncryption },
        { provide: AuditLogService, useValue: mockAuditLog },
        { provide: SecretKeyService, useValue: mockSecretKey },
      ],
    }).compile();
    service = module.get<EnvironmentService>(EnvironmentService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('creates an environment', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(mockProject);
      mockPrisma.workspaceMember.findUnique.mockResolvedValue({
        role: Role.EDITOR,
      });
      mockPrisma.environment.create.mockResolvedValue(mockEnvironment);
      const dto: CreateEnvironmentDto = { name: 'development' };

      const result = await service.create('user-1', 'proj-1', dto);

      expect(result).toEqual(mockEnvironment);
      expect(mockPrisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: 'proj-1' },
      });
      expect(mockPrisma.environment.create).toHaveBeenCalledWith({
        data: { name: 'development', projectId: 'proj-1' },
        select: {
          id: true,
          projectId: true,
          name: true,
          createdAt: true,
          _count: { select: { secrets: true } },
        },
      });
    });

    it('throws NotFoundException if project does not exist', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(null);

      await expect(
        service.create('user-1', 'bad-proj', { name: 'env' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException if user is viewer', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(mockProject);
      mockPrisma.workspaceMember.findUnique.mockResolvedValue({
        role: Role.VIEWER,
      });

      await expect(
        service.create('user-1', 'proj-1', { name: 'env' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws ForbiddenException if user is not a workspace member', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(mockProject);
      mockPrisma.workspaceMember.findUnique.mockResolvedValue(null);

      await expect(
        service.create('user-x', 'proj-1', { name: 'env' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws ForbiddenException if non-owner creates production environment', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(mockProject);
      mockPrisma.workspaceMember.findUnique.mockResolvedValue({
        role: Role.EDITOR,
      });

      await expect(
        service.create('user-1', 'proj-1', { name: 'production' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('allows owner to create production environment', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(mockProject);
      mockPrisma.workspaceMember.findUnique.mockResolvedValue({
        role: Role.OWNER,
      });
      mockPrisma.environment.create.mockResolvedValue({
        ...mockEnvironment,
        name: 'production',
      });

      const result = await service.create('user-1', 'proj-1', {
        name: 'production',
      });

      expect(result.name).toBe('production');
    });
  });

  describe('findAll', () => {
    it('returns environments for a project', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(mockProject);
      mockPrisma.workspaceMember.findUnique.mockResolvedValue({
        role: Role.VIEWER,
      });
      mockPrisma.environment.findMany.mockResolvedValue([mockEnvironment]);

      const result = await service.findAll('user-1', 'proj-1');

      expect(result).toEqual([mockEnvironment]);
      expect(mockPrisma.environment.findMany).toHaveBeenCalledWith({
        where: { projectId: 'proj-1' },
        select: {
          id: true,
          projectId: true,
          name: true,
          createdAt: true,
          _count: { select: { secrets: true } },
        },
        orderBy: { createdAt: 'asc' },
      });
    });

    it('throws NotFoundException if project does not exist', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(null);

      await expect(
        service.findAll('user-1', 'bad-proj'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException if user is not a member', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(mockProject);
      mockPrisma.workspaceMember.findUnique.mockResolvedValue(null);

      await expect(
        service.findAll('user-x', 'proj-1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findOne', () => {
    it('returns environment by id with role', async () => {
      mockPrisma.environment.findUnique.mockResolvedValue(mockEnvironment);
      mockPrisma.workspaceMember.findUnique.mockResolvedValue({
        role: Role.EDITOR,
      });

      const result = await service.findOne('user-1', 'env-1');

      expect(result).toEqual({ ...mockEnvironment, role: Role.EDITOR });
      expect(mockPrisma.environment.findUnique).toHaveBeenCalledWith({
        where: { id: 'env-1' },
        include: {
          project: { select: { id: true, name: true, workspaceId: true } },
        },
      });
    });

    it('throws NotFoundException if environment does not exist', async () => {
      mockPrisma.environment.findUnique.mockResolvedValue(null);

      await expect(
        service.findOne('user-1', 'bad-env'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException if user is not a workspace member', async () => {
      mockPrisma.environment.findUnique.mockResolvedValue(mockEnvironment);
      mockPrisma.workspaceMember.findUnique.mockResolvedValue(null);

      await expect(
        service.findOne('user-x', 'env-1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('deletes an environment', async () => {
      mockPrisma.environment.findUnique.mockResolvedValue(mockEnvironment);
      mockPrisma.project.findUnique.mockResolvedValue(mockProject);
      mockPrisma.workspaceMember.findUnique.mockResolvedValue({
        role: Role.EDITOR,
      });
      mockPrisma.environment.delete.mockResolvedValue(mockEnvironment);

      await service.remove('user-1', 'env-1');

      expect(mockPrisma.environment.delete).toHaveBeenCalledWith({
        where: { id: 'env-1' },
      });
    });

    it('throws NotFoundException if environment does not exist', async () => {
      mockPrisma.environment.findUnique.mockResolvedValue(null);

      await expect(
        service.remove('user-1', 'bad-env'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException if user is viewer', async () => {
      mockPrisma.environment.findUnique.mockResolvedValue(mockEnvironment);
      mockPrisma.project.findUnique.mockResolvedValue(mockProject);
      mockPrisma.workspaceMember.findUnique.mockResolvedValue({
        role: Role.VIEWER,
      });

      await expect(
        service.remove('user-1', 'env-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws ForbiddenException if non-owner deletes production environment', async () => {
      mockPrisma.environment.findUnique.mockResolvedValue({
        ...mockEnvironment,
        name: 'production',
      });
      mockPrisma.project.findUnique.mockResolvedValue(mockProject);
      mockPrisma.workspaceMember.findUnique.mockResolvedValue({
        role: Role.EDITOR,
      });

      await expect(
        service.remove('user-1', 'env-1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('diff', () => {
    const secretsA = [
      {
        key: 'KEY_A',
        valueEncrypted: 'encA',
        iv: 'ivA',
        tag: 'tagA',
        workspaceKeyId: 'wk-1',
      },
      {
        key: 'KEY_B',
        valueEncrypted: 'encB',
        iv: 'ivB',
        tag: 'tagB',
        workspaceKeyId: 'wk-1',
      },
    ];
    const secretsB = [
      {
        key: 'KEY_B',
        valueEncrypted: 'encB2',
        iv: 'ivB2',
        tag: 'tagB2',
        workspaceKeyId: 'wk-1',
      },
      {
        key: 'KEY_C',
        valueEncrypted: 'encC',
        iv: 'ivC',
        tag: 'tagC',
        workspaceKeyId: 'wk-1',
      },
    ];

    const mockEnvA = {
      id: 'env-a',
      projectId: 'proj-1',
      project: { workspaceId: 'ws-1' },
    };
    const mockEnvB = {
      id: 'env-b',
      projectId: 'proj-1',
      project: { workspaceId: 'ws-1' },
    };

    beforeEach(() => {
      mockPrisma.project.findUnique.mockResolvedValue(mockProject);
      mockPrisma.environment.findUnique.mockImplementation(
        ({ where: { id } }: { where: { id: string } }) => {
          if (id === 'env-a') return mockEnvA;
          if (id === 'env-b') return mockEnvB;
          return null;
        },
      );
      mockPrisma.workspaceMember.findUnique.mockResolvedValue({
        role: Role.EDITOR,
      });
    });

    it('returns diff without values (masked)', async () => {
      mockPrisma.secret.findMany.mockImplementation(
        ({ where: { environmentId } }: { where: { environmentId: string } }) => {
          if (environmentId === 'env-a') return secretsA;
          if (environmentId === 'env-b') return secretsB;
          return [];
        },
      );

      const result = await service.diff(
        'user-1',
        'proj-1',
        'env-a',
        'env-b',
        false,
      );

      expect(result.onlyInA).toEqual([{ key: 'KEY_A', value: null }]);
      expect(result.onlyInB).toEqual([{ key: 'KEY_C', value: null }]);
      expect(result.common).toHaveLength(1);
      expect(result.common[0]).toEqual({
        key: 'KEY_B',
        same: false,
        valueA: null,
        valueB: null,
      });
      expect(mockAuditLog.log).not.toHaveBeenCalled();
    });

    it('returns diff with decrypted values when includeValues is true', async () => {
      mockPrisma.secret.findMany.mockImplementation(
        ({ where: { environmentId } }: { where: { environmentId: string } }) => {
          if (environmentId === 'env-a') return secretsA;
          if (environmentId === 'env-b') return secretsB;
          return [];
        },
      );

      const result = await service.diff(
        'user-1',
        'proj-1',
        'env-a',
        'env-b',
        true,
      );

      expect(result.onlyInA).toEqual([
        { key: 'KEY_A', value: 'decrypted-value' },
      ]);
      expect(result.onlyInB).toEqual([
        { key: 'KEY_C', value: 'decrypted-value' },
      ]);
      expect(result.common).toHaveLength(1);
      expect(result.common[0].valueA).toBe('decrypted-value');
      expect(result.common[0].valueB).toBe('decrypted-value');
      expect(mockEncryption.decrypt).toHaveBeenCalled();
      expect(mockSecretKey.getWorkspaceKey).toHaveBeenCalledWith('wk-1');
      expect(mockAuditLog.log).toHaveBeenCalled();
    });

    it('throws BadRequestException if project not found', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(null);

      await expect(
        service.diff('user-1', 'bad-proj', 'env-a', 'env-b'),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException if environment not found', async () => {
      mockPrisma.environment.findUnique.mockResolvedValue(null);

      await expect(
        service.diff('user-1', 'proj-1', 'bad-env', 'env-b'),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException if environments do not belong to project', async () => {
      mockPrisma.environment.findUnique.mockImplementation(
        ({ where: { id } }: { where: { id: string } }) => {
          if (id === 'env-a') return { id: 'env-a', projectId: 'proj-1' };
          if (id === 'env-b') return { id: 'env-b', projectId: 'proj-2' };
          return null;
        },
      );

      await expect(
        service.diff('user-1', 'proj-1', 'env-a', 'env-b'),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws ForbiddenException if user is not a workspace member', async () => {
      mockPrisma.workspaceMember.findUnique.mockResolvedValue(null);

      await expect(
        service.diff('user-x', 'proj-1', 'env-a', 'env-b'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws ForbiddenException if viewer requests includeValues', async () => {
      mockPrisma.workspaceMember.findUnique.mockResolvedValue({
        role: Role.VIEWER,
      });

      await expect(
        service.diff('user-1', 'proj-1', 'env-a', 'env-b', true),
      ).rejects.toThrow(ForbiddenException);
    });

    it('allows viewer to diff without includeValues', async () => {
      mockPrisma.workspaceMember.findUnique.mockResolvedValue({
        role: Role.VIEWER,
      });
      mockPrisma.secret.findMany.mockResolvedValue([]);

      const result = await service.diff(
        'user-1',
        'proj-1',
        'env-a',
        'env-b',
        false,
      );

      expect(result.onlyInA).toEqual([]);
      expect(result.onlyInB).toEqual([]);
      expect(result.common).toEqual([]);
    });
  });
});
