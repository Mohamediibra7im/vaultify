import { Test, TestingModule } from '@nestjs/testing';
import { SecretKeyService } from '../secret/secret-key.service';
import { PrismaService } from '../prisma/prisma.service';
import { SecretEncryptionService } from '../secret/secret-encryption.service';

describe('SecretKeyService', () => {
  let service: SecretKeyService;

  const mockRawKey = Buffer.alloc(32, 0x42);

  const mockRecord = {
    id: 'wk-1',
    workspaceId: 'ws-1',
    keyEncryptedWithMaster: 'enc-key',
    keyIv: 'enc-iv',
    keyTag: 'enc-tag',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const mockPrisma = {
    workspaceKey: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockEncryption = {
    wrapKey: jest
      .fn()
      .mockReturnValue({ ciphertext: 'enc-key', iv: 'enc-iv', tag: 'enc-tag' }),
    unwrapKey: jest.fn().mockReturnValue(mockRawKey),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SecretKeyService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: SecretEncryptionService, useValue: mockEncryption },
      ],
    }).compile();

    service = module.get<SecretKeyService>(SecretKeyService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrCreateWorkspaceKey', () => {
    it('creates new key when none exists', async () => {
      mockPrisma.workspaceKey.findUnique.mockResolvedValue(null);
      mockPrisma.workspaceKey.create.mockResolvedValue(mockRecord);

      const result = await service.getOrCreateWorkspaceKey('ws-1');

      expect(mockEncryption.wrapKey).toHaveBeenCalledTimes(1);
      expect(mockEncryption.wrapKey).toHaveBeenCalledWith(expect.any(Buffer));
      expect(mockPrisma.workspaceKey.create).toHaveBeenCalledWith({
        data: {
          workspaceId: 'ws-1',
          keyEncryptedWithMaster: 'enc-key',
          keyIv: 'enc-iv',
          keyTag: 'enc-tag',
        },
      });
      expect(mockEncryption.unwrapKey).toHaveBeenCalledWith(
        'enc-key',
        'enc-iv',
        'enc-tag',
      );
      expect(result).toEqual({ id: 'wk-1', rawKey: mockRawKey });
    });

    it('returns existing key when one exists', async () => {
      mockPrisma.workspaceKey.findUnique.mockResolvedValue(mockRecord);

      const result = await service.getOrCreateWorkspaceKey('ws-1');

      expect(mockPrisma.workspaceKey.findUnique).toHaveBeenCalledWith({
        where: { workspaceId: 'ws-1' },
      });
      expect(mockPrisma.workspaceKey.create).not.toHaveBeenCalled();
      expect(mockEncryption.wrapKey).not.toHaveBeenCalled();
      expect(mockEncryption.unwrapKey).toHaveBeenCalledWith(
        'enc-key',
        'enc-iv',
        'enc-tag',
      );
      expect(result).toEqual({ id: 'wk-1', rawKey: mockRawKey });
    });
  });

  describe('getWorkspaceKey', () => {
    it('returns decrypted raw key buffer', async () => {
      mockPrisma.workspaceKey.findUnique.mockResolvedValue(mockRecord);

      const result = await service.getWorkspaceKey('wk-1');

      expect(mockPrisma.workspaceKey.findUnique).toHaveBeenCalledWith({
        where: { id: 'wk-1' },
      });
      expect(mockEncryption.unwrapKey).toHaveBeenCalledWith(
        'enc-key',
        'enc-iv',
        'enc-tag',
      );
      expect(result).toEqual(mockRawKey);
    });

    it('throws when key record not found', async () => {
      mockPrisma.workspaceKey.findUnique.mockResolvedValue(null);

      await expect(service.getWorkspaceKey('bad-id')).rejects.toThrow(
        'WorkspaceKey bad-id not found',
      );
    });
  });
});
