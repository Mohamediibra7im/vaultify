import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { Role } from '../generated/prisma/client';

describe('WorkspaceService (RBAC)', () => {
  let service: WorkspaceService;
  let prisma: PrismaService;

  const mockMember = {
    id: 'member-1',
    workspaceId: 'ws-1',
    userId: 'user-1',
    role: Role.OWNER,
    joinedAt: new Date(),
  };

  const mockWorkspace = {
    id: 'ws-1',
    name: 'Test Workspace',
    createdAt: new Date(),
    ownerId: 'user-1',
    _count: { members: 2, projects: 1 },
  };

  const mockPrisma = {
    workspace: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    workspaceMember: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockAuditLog = { log: jest.fn() };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditLogService, useValue: mockAuditLog },
      ],
    }).compile();
    service = module.get<WorkspaceService>(WorkspaceService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('assertOwner operations', () => {
    beforeEach(() => {
      mockPrisma.workspace.findUnique.mockResolvedValue({
        ...mockWorkspace,
        members: [
          { id: 'm-1', role: Role.OWNER, joinedAt: new Date(), user: { id: 'user-1', name: 'Owner', email: 'owner@t.com', avatarUrl: null } },
        ],
      });
    });

    it('update throws ForbiddenException for non-OWNER', async () => {
      mockPrisma.workspaceMember.findUnique.mockResolvedValue({ ...mockMember, role: Role.EDITOR });

      await expect(
        service.update('user-1', 'ws-1', { name: 'Hacked' }),
      ).rejects.toThrow(ForbiddenException);
      expect(mockPrisma.workspace.update).not.toHaveBeenCalled();
    });

    it('remove throws ForbiddenException for non-OWNER', async () => {
      mockPrisma.workspaceMember.findUnique.mockResolvedValue({ ...mockMember, role: Role.EDITOR });

      await expect(service.remove('user-1', 'ws-1')).rejects.toThrow(ForbiddenException);
      expect(mockPrisma.workspace.delete).not.toHaveBeenCalled();
    });

    it('updateMemberRole throws ForbiddenException for non-OWNER', async () => {
      mockPrisma.workspaceMember.findUnique.mockResolvedValue({ ...mockMember, role: Role.EDITOR });

      await expect(
        service.updateMemberRole('user-1', 'ws-1', 'target-member', { role: Role.VIEWER }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('removeMember throws ForbiddenException for non-OWNER', async () => {
      mockPrisma.workspaceMember.findUnique.mockResolvedValue({ ...mockMember, role: Role.EDITOR });

      await expect(
        service.removeMember('user-1', 'ws-1', 'target-member'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('update succeeds for OWNER', async () => {
      mockPrisma.workspaceMember.findUnique.mockResolvedValue({ ...mockMember, role: Role.OWNER });
      mockPrisma.workspace.update.mockResolvedValue(mockWorkspace);

      const result = await service.update('user-1', 'ws-1', { name: 'Updated' });

      expect(result.name).toBe('Test Workspace');
    });

    it('remove succeeds for OWNER', async () => {
      mockPrisma.workspaceMember.findUnique.mockResolvedValue({ ...mockMember, role: Role.OWNER });
      mockPrisma.workspace.delete.mockResolvedValue(mockWorkspace);

      await expect(service.remove('user-1', 'ws-1')).resolves.toBeUndefined();
    });
  });

  describe('assertMember operations', () => {
    it('findMembers throws ForbiddenException for non-member', async () => {
      mockPrisma.workspaceMember.findUnique.mockResolvedValue(null);

      await expect(service.findMembers('user-x', 'ws-1')).rejects.toThrow(ForbiddenException);
    });

    it('findMembers succeeds for any role', async () => {
      mockPrisma.workspaceMember.findUnique.mockResolvedValue({ ...mockMember, role: Role.VIEWER });
      mockPrisma.workspaceMember.findMany.mockResolvedValue([]);

      const result = await service.findMembers('user-1', 'ws-1');

      expect(result).toEqual([]);
    });
  });

  describe('WorkspaceService (other edge cases)', () => {
    it('findOne throws NotFoundException for missing workspace', async () => {
      mockPrisma.workspace.findUnique.mockResolvedValue(null);

      await expect(service.findOne('user-1', 'bad-id')).rejects.toThrow(NotFoundException);
    });

    it('findOne throws ForbiddenException for non-member', async () => {
      mockPrisma.workspace.findUnique.mockResolvedValue({
        ...mockWorkspace,
        members: [
          { id: 'm-1', role: Role.OWNER, joinedAt: new Date(), user: { id: 'other-user', name: 'Other', email: 'o@t.com', avatarUrl: null } },
        ],
      });

      await expect(service.findOne('user-x', 'ws-1')).rejects.toThrow(ForbiddenException);
    });

    it('updateMemberRole throws NotFoundException for missing target', async () => {
      mockPrisma.workspaceMember.findUnique
        .mockResolvedValueOnce({ ...mockMember, role: Role.OWNER }) // owner check
        .mockResolvedValueOnce(null); // target member not found

      await expect(
        service.updateMemberRole('user-1', 'ws-1', 'nonexistent', { role: Role.VIEWER }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
