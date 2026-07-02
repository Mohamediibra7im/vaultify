import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { GithubAuthGuard } from './guards/github-auth.guard';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  me(@CurrentUser() user: { sub: string }) {
    return this.auth.me(user.sub);
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UseGuards(GithubAuthGuard)
  @Get('github')
  github() {
    // Redirects to GitHub OAuth
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UseGuards(GithubAuthGuard)
  @Get('github/callback')
  githubCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as {
      githubId: string;
      email?: string;
      name?: string;
      avatarUrl?: string;
    };
    return this.auth.githubLogin(user).then((result) => {
      const frontendUrl = this.config.get<string>('FRONTEND_URL') || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/auth/github/callback?token=${result.token}`);
    });
  }
}
