import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../notification/email.service';

@Injectable()
export class ContactService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
  ) {}

  async create(data: { name: string; email: string; subject: string; message: string }) {
    const saved = await this.prisma.contactMessage.create({ data });
    await     this.email.sendContactEmail(data).catch((err) => {
      console.error('[Contact] Email send failed:', err?.message || err);
    });
    return saved;
  }

  async findAll() {
    return this.prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async markRead(id: string) {
    return this.prisma.contactMessage.update({
      where: { id },
      data: { read: true },
    });
  }
}
