import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new BadRequestException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash,
      },
    });

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildAuthResponse(user);
  }

  async githubLogin(githubProfile: {
    githubId: string;
    email?: string;
    name?: string;
    avatarUrl?: string;
  }) {
    let user = await this.prisma.user.findUnique({
      where: { githubId: githubProfile.githubId },
    });

    if (user) {
      // Update avatar/name in case they changed on GitHub
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          name: githubProfile.name || user.name,
          avatarUrl: githubProfile.avatarUrl || user.avatarUrl,
        },
      });
    } else {
      // Create new user from GitHub profile
      user = await this.prisma.user.create({
        data: {
          githubId: githubProfile.githubId,
          email: githubProfile.email || `${githubProfile.githubId}@github.user`,
          name: githubProfile.name || 'GitHub User',
          avatarUrl: githubProfile.avatarUrl || null,
        },
      });
    }

    return this.buildAuthResponse(user);
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, avatarUrl: true },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  private buildAuthResponse(user: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
  }) {
    const token = this.jwt.sign({ sub: user.id, email: user.email });
    return {
      token,
      user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl },
    };
  }
}
