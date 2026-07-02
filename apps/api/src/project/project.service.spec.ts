import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ProjectService } from './project.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';

describe('ProjectService', () => {
  let service: ProjectService;
  let prisma: PrismaService;

  const mockProject = {
    id: 'proj-1',
    workspaceId: 'ws-1',
    name: 'My Project',
    description: 'A test project',
    createdAt: new Date(),
  };

  const mockProjectWithEnvs = {
    ...mockProject,
    environments: [
      {
        id: 'env-1',
        name: 'staging',
        createdAt: new Date(),
        _count: { secrets: 3 },
      },
    ],
  };

  const mockProjectWithCount = {
    ...mockProject,
    _count: { environments: 2 },
  };

  const mockPrisma = {
    project: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    workspaceMember: {
      findUnique: jest.fn(),
    },
  };

  const mockEventsGateway = { emitToWorkspace: jest.fn(), emitToUser: jest.fn() };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EventsGateway, useValue: mockEventsGateway },
      ],
    }).compile();
    service = module.get<ProjectService>(ProjectService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('creates a project with given data', async () => {
      mockPrisma.workspaceMember.findUnique.mockResolvedValue({
        workspaceId: 'ws-1',
        userId: 'user-1',
      });
      mockPrisma.project.create.mockResolvedValue(mockProject);

      const result = await service.create('user-1', 'ws-1', {
        name: 'My Project',
        description: 'A test project',
      });

      expect(mockPrisma.workspaceMember.findUnique).toHaveBeenCalledWith({
        where: { workspaceId_userId: { workspaceId: 'ws-1', userId: 'user-1' } },
      });
      expect(mockPrisma.project.create).toHaveBeenCalledWith({
        data: {
          name: 'My Project',
          description: 'A test project',
          workspaceId: 'ws-1',
        },
        select: {
          id: true,
          workspaceId: true,
          name: true,
          description: true,
          createdAt: true,
        },
      });
      expect(result).toEqual(mockProject);
    });

    it('throws ForbiddenException if user is not a workspace member', async () => {
      mockPrisma.workspaceMember.findUnique.mockResolvedValue(null);

      await expect(
        service.create('user-x', 'ws-1', { name: 'Hacked' }),
      ).rejects.toThrow(ForbiddenException);

      expect(mockPrisma.project.create).not.toHaveBeenCalled();
    });

    it('creates a project without optional description', async () => {
      mockPrisma.workspaceMember.findUnique.mockResolvedValue({
        workspaceId: 'ws-1',
        userId: 'user-1',
      });
      mockPrisma.project.create.mockResolvedValue({
        ...mockProject,
        name: 'Minimal',
        description: null,
      });

      const result = await service.create('user-1', 'ws-1', { name: 'Minimal' });

      expect(mockPrisma.project.create).toHaveBeenCalledWith({
        data: {
          name: 'Minimal',
          description: undefined,
          workspaceId: 'ws-1',
        },
        select: expect.any(Object),
      });
      expect(result.name).toBe('Minimal');
    });
  });

  describe('findAll', () => {
    it('returns projects for workspace with _count', async () => {
      mockPrisma.workspaceMember.findUnique.mockResolvedValue({
        workspaceId: 'ws-1',
        userId: 'user-1',
      });
      mockPrisma.project.findMany.mockResolvedValue([mockProjectWithCount]);

      const result = await service.findAll('user-1', 'ws-1');

      expect(mockPrisma.project.findMany).toHaveBeenCalledWith({
        where: { workspaceId: 'ws-1' },
        select: {
          id: true,
          workspaceId: true,
          name: true,
          description: true,
          createdAt: true,
          _count: { select: { environments: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(1);
      expect(result[0]._count.environments).toBe(2);
    });

    it('throws ForbiddenException if user is not a workspace member', async () => {
      mockPrisma.workspaceMember.findUnique.mockResolvedValue(null);

      await expect(
        service.findAll('user-x', 'ws-1'),
      ).rejects.toThrow(ForbiddenException);

      expect(mockPrisma.project.findMany).not.toHaveBeenCalled();
    });

    it('returns empty array when no projects exist', async () => {
      mockPrisma.workspaceMember.findUnique.mockResolvedValue({
        workspaceId: 'ws-1',
        userId: 'user-1',
      });
      mockPrisma.project.findMany.mockResolvedValue([]);

      const result = await service.findAll('user-1', 'ws-1');

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('returns project with environments for member', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(mockProjectWithEnvs);
      mockPrisma.workspaceMember.findUnique.mockResolvedValue({
        workspaceId: 'ws-1',
        userId: 'user-1',
      });

      const result = await service.findOne('user-1', 'proj-1');

      expect(mockPrisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: 'proj-1' },
        select: expect.objectContaining({
          environments: expect.any(Object),
        }),
      });
      expect(result).toEqual(mockProjectWithEnvs);
      expect(result.environments).toHaveLength(1);
    });

    it('throws NotFoundException if project does not exist', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(null);

      await expect(
        service.findOne('user-1', 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException if user is not a workspace member', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(mockProjectWithEnvs);
      mockPrisma.workspaceMember.findUnique.mockResolvedValue(null);

      await expect(
        service.findOne('user-x', 'proj-1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('updates project name and description', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(mockProject);
      mockPrisma.workspaceMember.findUnique.mockResolvedValue({
        workspaceId: 'ws-1',
        userId: 'user-1',
      });
      const updatedProject = { ...mockProject, name: 'Updated', description: 'New desc' };
      mockPrisma.project.update.mockResolvedValue(updatedProject);

      const result = await service.update('user-1', 'proj-1', {
        name: 'Updated',
        description: 'New desc',
      });

      expect(mockPrisma.project.update).toHaveBeenCalledWith({
        where: { id: 'proj-1' },
        data: { name: 'Updated', description: 'New desc' },
        select: {
          id: true,
          workspaceId: true,
          name: true,
          description: true,
          createdAt: true,
        },
      });
      expect(result.name).toBe('Updated');
      expect(result.description).toBe('New desc');
    });

    it('throws NotFoundException if project does not exist', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(null);

      await expect(
        service.update('user-1', 'nonexistent', { name: 'Hacked' }),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrisma.project.update).not.toHaveBeenCalled();
    });

    it('throws ForbiddenException if user is not a workspace member', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(mockProject);
      mockPrisma.workspaceMember.findUnique.mockResolvedValue(null);

      await expect(
        service.update('user-x', 'proj-1', { name: 'Hacked' }),
      ).rejects.toThrow(ForbiddenException);

      expect(mockPrisma.project.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deletes project', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(mockProject);
      mockPrisma.workspaceMember.findUnique.mockResolvedValue({
        workspaceId: 'ws-1',
        userId: 'user-1',
      });
      mockPrisma.project.delete.mockResolvedValue(mockProject);

      await service.remove('user-1', 'proj-1');

      expect(mockPrisma.project.delete).toHaveBeenCalledWith({
        where: { id: 'proj-1' },
      });
    });

    it('throws NotFoundException if project does not exist', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(null);

      await expect(
        service.remove('user-1', 'nonexistent'),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrisma.project.delete).not.toHaveBeenCalled();
    });

    it('throws ForbiddenException if user is not a workspace member', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(mockProject);
      mockPrisma.workspaceMember.findUnique.mockResolvedValue(null);

      await expect(
        service.remove('user-x', 'proj-1'),
      ).rejects.toThrow(ForbiddenException);

      expect(mockPrisma.project.delete).not.toHaveBeenCalled();
    });
  });
});
