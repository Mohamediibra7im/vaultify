import { Module, Global } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ApiTokenController } from './api-token.controller';
import { ApiTokenService } from './api-token.service';

@Global()
@Module({
  imports: [PrismaModule],
  controllers: [ApiTokenController],
  providers: [ApiTokenService],
  exports: [ApiTokenService],
})
export class ApiTokenModule {}
