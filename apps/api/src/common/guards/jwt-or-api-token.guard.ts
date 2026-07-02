import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiTokenService } from '../../api-token/api-token.service';

@Injectable()
export class JwtOrApiTokenGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly apiToken: ApiTokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const auth = request.headers.authorization;
    if (!auth?.startsWith('Bearer ')) throw new UnauthorizedException();

    const token = auth.slice(7);

    // API token flow (vlt_ prefix)
    if (token.startsWith('vlt_')) {
      const session = await this.apiToken.validate(token);
      request.user = { sub: session.userId };
      return true;
    }

    // JWT flow
    try {
      const payload = this.jwt.verify(token);
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
