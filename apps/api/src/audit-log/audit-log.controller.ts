import { Controller, Get, Param, Query, Res, UseGuards, ForbiddenException } from '@nestjs/common';
import { JwtOrApiTokenGuard } from '../common/guards/jwt-or-api-token.guard';
import { Response } from 'express';
import { AuditLogService } from './audit-log.service';
import { PrismaService } from '../prisma/prisma.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtOrApiTokenGuard)
@Controller('workspaces')
export class AuditLogController {
  constructor(
    private readonly auditLog: AuditLogService,
    private readonly prisma: PrismaService,
  ) {}

  @Get(':id/audit-logs')
  async findByWorkspace(
    @CurrentUser('sub') userId: string,
    @Param('id') workspaceId: string,
    @Query('limit') limit?: string,
  ) {
    const member = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
    if (!member) throw new ForbiddenException('Not a workspace member');

    return this.auditLog.findByWorkspace(workspaceId, limit ? parseInt(limit, 10) : 50);
  }

  @Get(':id/audit-logs/export')
  async exportCsv(
    @CurrentUser('sub') userId: string,
    @Param('id') workspaceId: string,
    @Res() res: Response,
  ) {
    const member = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
    if (!member) throw new ForbiddenException('Not a workspace member');

    const csv = await this.auditLog.exportCsv(workspaceId);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="audit-log.csv"');
    res.send(csv);
  }
}
