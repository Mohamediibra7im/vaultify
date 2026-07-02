import { Module } from '@nestjs/common';
import { ApiTokenModule } from '../api-token/api-token.module';
import { JwtOrApiTokenGuard } from './guards/jwt-or-api-token.guard';

@Module({
  imports: [ApiTokenModule],
  providers: [JwtOrApiTokenGuard],
  exports: [JwtOrApiTokenGuard],
})
export class CommonModule {}
