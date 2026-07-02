import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(config: ConfigService) {
    super({
      clientID: config.get<string>('GITHUB_CLIENT_ID') || 'missing-client-id',
      clientSecret: config.get<string>('GITHUB_CLIENT_SECRET') || 'missing-client-secret',
      callbackURL: config.get<string>('GITHUB_CALLBACK_URL') || 'http://localhost:4000/api/auth/github/callback',
      scope: ['user:email'],
    });
  }

  validate(_accessToken: string, _refreshToken: string, profile: Profile) {
    return {
      githubId: profile.id,
      email: profile.emails?.[0]?.value,
      name: profile.displayName || profile.username,
      avatarUrl: profile.photos?.[0]?.value,
    };
  }
}
