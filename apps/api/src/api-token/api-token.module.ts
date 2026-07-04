import { Module, Global } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CommonModule } from '../common/common.module';
import { ApiTokenController } from './api-token.controller';
import { ApiTokenService } from './api-token.service';

@Global()
@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [ApiTokenController],
  providers: [ApiTokenService],
  exports: [ApiTokenService],
})
export class ApiTokenModule {}
