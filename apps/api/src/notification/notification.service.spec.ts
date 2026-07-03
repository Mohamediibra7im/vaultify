import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './email.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let prisma: PrismaService;
  let emailService: EmailService;

  const mockUser1 = { id: 'user-1', email: 'alice@example.com', name: 'Alice' };
  const mockUser2 = { id: 'user-2', email: 'bob@example.com', name: 'Bob' };
  const mockUser3 = { id: 'user-3', email: 'charlie@example.com', name: 'Charlie' };

  const mockMembers = [
    { id: 'wm-1', workspaceId: 'ws-1', userId: 'user-1', role: 'OWNER', joinedAt: new Date(), user: mockUser1 },
    { id: 'wm-2', workspaceId: 'ws-1', userId: 'user-2', role: 'EDITOR', joinedAt: new Date(), user: mockUser2 },
    { id: 'wm-3', workspaceId: 'ws-1', userId: 'user-3', role: 'VIEWER', joinedAt: new Date(), user: mockUser3 },
  ];

  const mockWorkspace = { id: 'ws-1', name: 'Test Workspace' };

  const defaultParams = {
    workspaceId: 'ws-1',
    environmentId: 'env-1',
    environmentName: 'Staging',
    secretKey: 'DB_URL',
    action: 'updated' as const,
    actorId: 'user-1',
  };

  const mockPrisma = {
    workspaceMember: { findMany: jest.fn() },
    notification: {
      createMany: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      updateMany: jest.fn(),
    },
    workspace: { findUnique: jest.fn() },
  };

  const mockEmailService = {
    sendSecretChangeEmail: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    prisma = module.get<PrismaService>(PrismaService);
    emailService = module.get<EmailService>(EmailService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.workspaceMember.findMany.mockResolvedValue(mockMembers);
    mockPrisma.workspace.findUnique.mockResolvedValue(mockWorkspace);
    mockPrisma.notification.createMany.mockResolvedValue({ count: 2 });
  });

  describe('notifySecretChanged', () => {
    it('creates in-app notifications for all workspace members except the actor', async () => {
      await service.notifySecretChanged(defaultParams);

      // Should create notifications for user-2 and user-3 (excluding actor user-1)
      expect(mockPrisma.notification.createMany).toHaveBeenCalledWith({
        data: [
          expect.objectContaining({ userId: 'user-2', type: 'secret_updated', workspaceId: 'ws-1' }),
          expect.objectContaining({ userId: 'user-3', type: 'secret_updated', workspaceId: 'ws-1' }),
        ],
      });
    });

    it('sends email notifications to all workspace members except the actor', async () => {
      await service.notifySecretChanged(defaultParams);

      expect(mockPrisma.workspace.findUnique).toHaveBeenCalledWith({
        where: { id: 'ws-1' },
        select: { name: true },
      });

      expect(mockEmailService.sendSecretChangeEmail).toHaveBeenCalledTimes(2);
      expect(mockEmailService.sendSecretChangeEmail).toHaveBeenCalledWith({
        to: 'bob@example.com',
        secretKey: 'DB_URL',
        environmentName: 'Staging',
        workspaceName: 'Test Workspace',
        action: 'updated',
      });
      expect(mockEmailService.sendSecretChangeEmail).toHaveBeenCalledWith({
        to: 'charlie@example.com',
        secretKey: 'DB_URL',
        environmentName: 'Staging',
        workspaceName: 'Test Workspace',
        action: 'updated',
      });
    });

    it('handles member email send failures gracefully using Promise.allSettled', async () => {
      // Make the first email throw, second succeed
      mockEmailService.sendSecretChangeEmail
        .mockRejectedValueOnce(new Error('SMTP error'))
        .mockResolvedValueOnce(undefined);

      await expect(service.notifySecretChanged(defaultParams)).resolves.toBeUndefined();

      // Both email sends should have been attempted
      expect(mockEmailService.sendSecretChangeEmail).toHaveBeenCalledTimes(2);

      // In-app notifications should still succeed
      expect(mockPrisma.notification.createMany).toHaveBeenCalled();
    });

    it('does nothing when there are no other members besides the actor', async () => {
      mockPrisma.workspaceMember.findMany.mockResolvedValue([mockMembers[0]]); // Only the actor

      await service.notifySecretChanged(defaultParams);

      expect(mockPrisma.notification.createMany).not.toHaveBeenCalled();
      expect(mockEmailService.sendSecretChangeEmail).not.toHaveBeenCalled();
    });

    it('handles all action types correctly', async () => {
      const actions = ['created', 'updated', 'deleted', 'revealed'] as const;
      const expectedTypes = ['secret_created', 'secret_updated', 'secret_deleted', 'secret_revealed'];

      for (let i = 0; i < actions.length; i++) {
        jest.clearAllMocks();
        mockPrisma.workspaceMember.findMany.mockResolvedValue(mockMembers);
        mockPrisma.workspace.findUnique.mockResolvedValue(mockWorkspace);

        await service.notifySecretChanged({ ...defaultParams, action: actions[i] });

        expect(mockPrisma.notification.createMany).toHaveBeenCalledWith({
          data: [
            expect.objectContaining({ type: expectedTypes[i] }),
            expect.objectContaining({ type: expectedTypes[i] }),
          ],
        });
      }
    });

    it('still works even if workspace lookup returns null', async () => {
      mockPrisma.workspace.findUnique.mockResolvedValue(null);

      await expect(service.notifySecretChanged(defaultParams)).resolves.toBeUndefined();

      expect(mockEmailService.sendSecretChangeEmail).not.toHaveBeenCalled();
      expect(mockPrisma.notification.createMany).toHaveBeenCalled();
    });
  });

  describe('getUserNotifications', () => {
    const mockNotifications = [
      { id: 'n1', workspaceId: 'ws-1', userId: 'user-2', type: 'secret_updated', title: 'Secret Updated', message: 'DB_URL was updated in Staging', read: false, createdAt: new Date() },
      { id: 'n2', workspaceId: 'ws-1', userId: 'user-2', type: 'secret_created', title: 'Secret Created', message: 'API_KEY was created in Staging', read: true, createdAt: new Date() },
    ];

    it('returns paginated notifications with total count', async () => {
      mockPrisma.notification.findMany.mockResolvedValue(mockNotifications);
      mockPrisma.notification.count.mockResolvedValue(2);

      const result = await service.getUserNotifications('user-2', 20, 0);

      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-2' },
        orderBy: { createdAt: 'desc' },
        take: 20,
        skip: 0,
      });
      expect(mockPrisma.notification.count).toHaveBeenCalledWith({ where: { userId: 'user-2' } });
      expect(result).toEqual({ notifications: mockNotifications, total: 2 });
    });

    it('applies default pagination when not provided', async () => {
      mockPrisma.notification.findMany.mockResolvedValue([]);
      mockPrisma.notification.count.mockResolvedValue(0);

      const result = await service.getUserNotifications('user-2');

      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-2' },
        orderBy: { createdAt: 'desc' },
        take: 20,
        skip: 0,
      });
      expect(result.total).toBe(0);
    });
  });

  describe('getUnreadCount', () => {
    it('returns count of unread notifications', async () => {
      mockPrisma.notification.count.mockResolvedValue(5);

      const result = await service.getUnreadCount('user-2');

      expect(mockPrisma.notification.count).toHaveBeenCalledWith({
        where: { userId: 'user-2', read: false },
      });
      expect(result).toBe(5);
    });
  });

  describe('markAsRead', () => {
    it('updates a notification to read for the given user', async () => {
      mockPrisma.notification.updateMany.mockResolvedValue({ count: 1 });

      await service.markAsRead('n1', 'user-2');

      expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith({
        where: { id: 'n1', userId: 'user-2' },
        data: { read: true },
      });
    });
  });

  describe('markAllAsRead', () => {
    it('marks all unread notifications as read for the user', async () => {
      mockPrisma.notification.updateMany.mockResolvedValue({ count: 3 });

      await service.markAllAsRead('user-2');

      expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-2', read: false },
        data: { read: true },
      });
    });
  });
});
