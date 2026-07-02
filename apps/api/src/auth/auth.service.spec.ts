import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let auth: AuthService;
  let prisma: PrismaService;
  let jwt: JwtService;

  const mockUser = {
    id: 'user-1',
    email: 'test@vaultify.dev',
    name: 'Test User',
    passwordHash: null as string | null,
    avatarUrl: null,
  };

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwt = { sign: jest.fn().mockReturnValue('jwt-token') };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();
    auth = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('creates user and returns auth response', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({ ...mockUser, passwordHash: 'hashed' });

      const result = await auth.register({
        email: 'test@vaultify.dev',
        password: 'password123',
        name: 'Test User',
      });

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@vaultify.dev' },
      });
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'test@vaultify.dev',
          name: 'Test User',
          passwordHash: expect.any(String),
        }),
      });
      expect(jwt.sign).toHaveBeenCalledWith({ sub: 'user-1', email: 'test@vaultify.dev' });
      expect(result.token).toBe('jwt-token');
      expect(result.user.email).toBe('test@vaultify.dev');
    });

    it('throws BadRequestException if email already in use', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        auth.register({ email: 'test@vaultify.dev', password: 'password123', name: 'Test' }),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    beforeEach(() => {
      mockUser.passwordHash = bcrypt.hashSync('password123', 4); // low rounds for speed
    });

    it('returns auth response for valid credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await auth.login({ email: 'test@vaultify.dev', password: 'password123' });

      expect(result.token).toBe('jwt-token');
      expect(result.user.email).toBe('test@vaultify.dev');
    });

    it('throws UnauthorizedException for unknown email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        auth.login({ email: 'none@vaultify.dev', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException for wrong password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        auth.login({ email: 'test@vaultify.dev', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException if user has no passwordHash (GitHub-only)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ ...mockUser, passwordHash: null });

      await expect(
        auth.login({ email: 'test@vaultify.dev', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('githubLogin', () => {
    it('creates new user from GitHub profile', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({ ...mockUser, passwordHash: null });

      const result = await auth.githubLogin({
        githubId: 'gh-1',
        email: 'gh@test.dev',
        name: 'GitHub User',
        avatarUrl: 'https://avatars.example.com/1',
      });

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          githubId: 'gh-1',
          email: 'gh@test.dev',
          name: 'GitHub User',
          avatarUrl: 'https://avatars.example.com/1',
        }),
      });
      expect(result.token).toBe('jwt-token');
    });

    it('updates existing GitHub user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue(mockUser);

      const result = await auth.githubLogin({
        githubId: 'gh-1',
        email: 'test@vaultify.dev',
        name: 'Updated Name',
        avatarUrl: 'https://avatars.example.com/new',
      });

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: expect.objectContaining({ name: 'Updated Name' }),
      });
      expect(result.token).toBe('jwt-token');
    });
  });

  describe('me', () => {
    it('returns user for valid id', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@vaultify.dev',
        name: 'Test User',
        avatarUrl: null,
      });

      const result = await auth.me('user-1');

      expect(result.email).toBe('test@vaultify.dev');
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('throws UnauthorizedException if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(auth.me('nonexistent')).rejects.toThrow(UnauthorizedException);
    });
  });
});
