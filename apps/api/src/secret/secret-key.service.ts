import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { SecretEncryptionService } from './secret-encryption.service';

@Injectable()
export class SecretKeyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: SecretEncryptionService,
  ) {}

  async getOrCreateWorkspaceKey(workspaceId: string): Promise<{ id: string; rawKey: Buffer }> {
    let wk = await this.prisma.workspaceKey.findUnique({ where: { workspaceId } });
    if (!wk) {
      const rawKey = crypto.randomBytes(32);
      const { ciphertext, iv, tag } = this.encryption.wrapKey(rawKey);
      wk = await this.prisma.workspaceKey.create({
        data: {
          workspaceId,
          keyEncryptedWithMaster: ciphertext,
          keyIv: iv,
          keyTag: tag,
        },
      });
    }
    const rawKey = this.encryption.unwrapKey(wk.keyEncryptedWithMaster, wk.keyIv, wk.keyTag);
    return { id: wk.id, rawKey };
  }

  async getWorkspaceKey(workspaceKeyId: string): Promise<Buffer> {
    const wk = await this.prisma.workspaceKey.findUnique({ where: { id: workspaceKeyId } });
    if (!wk) throw new Error(`WorkspaceKey ${workspaceKeyId} not found`);
    return this.encryption.unwrapKey(wk.keyEncryptedWithMaster, wk.keyIv, wk.keyTag);
  }
}
