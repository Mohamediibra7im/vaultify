import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from './dto';

@Injectable()
export class ProjectService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(userId: string, workspaceId: string, dto: CreateProjectDto) {
    await this.assertMember(userId, workspaceId);
    const result = await this.prisma.project.create({
      data: { name: dto.name, description: dto.description, workspaceId },
      select: { id: true, workspaceId: true, name: true, description: true, createdAt: true },
    });
    return result;
  }

  async findAll(userId: string, workspaceId: string) {
    await this.assertMember(userId, workspaceId);
    return this.prisma.project.findMany({
      where: { workspaceId },
      select: {
        id: true,
        workspaceId: true,
        name: true,
        description: true,
        createdAt: true,
        _count: { select: { environments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        workspaceId: true,
        name: true,
        description: true,
        createdAt: true,
        environments: {
          select: {
            id: true,
            name: true,
            createdAt: true,
            _count: { select: { secrets: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!project) throw new NotFoundException('Project not found');

    const isMember = await this.isMember(userId, project.workspaceId);
    if (!isMember) throw new ForbiddenException('Not a workspace member');

    return project;
  }

  async update(userId: string, projectId: string, dto: UpdateProjectDto) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');
    await this.assertMember(userId, project.workspaceId);

    const result = await this.prisma.project.update({
      where: { id: projectId },
      data: dto,
      select: { id: true, workspaceId: true, name: true, description: true, createdAt: true },
    });
    return result;
  }

  async remove(userId: string, projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');
    await this.assertMember(userId, project.workspaceId);

    await this.prisma.project.delete({ where: { id: projectId } });
  }

  private async isMember(userId: string, workspaceId: string) {
    const member = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
    return !!member;
  }

  private async assertMember(userId: string, workspaceId: string) {
    if (!(await this.isMember(userId, workspaceId))) {
      throw new ForbiddenException('Not a workspace member');
    }
  }
}
