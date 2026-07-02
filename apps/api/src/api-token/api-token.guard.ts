import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ApiTokenService } from './api-token.service';

@Injectable()
export class ApiTokenGuard implements CanActivate {
  constructor(private readonly apiToken: ApiTokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const auth = request.headers.authorization;
    if (!auth?.startsWith('Bearer ')) throw new UnauthorizedException();

    const token = auth.slice(7);
    if (!token.startsWith('vlt_')) throw new UnauthorizedException('Invalid token format');

    const session = await this.apiToken.validate(token);
    request.user = { sub: session.userId };
    return true;
  }
}
