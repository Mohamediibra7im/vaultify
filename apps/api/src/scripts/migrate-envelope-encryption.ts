/**
 * Envelope Encryption Migration Script (Phase B2)
 *
 * Re-encrypts all existing secrets (those without workspaceKeyId) under their
 * workspace's envelope key.
 *
 * Run this BEFORE deploying the no-fallback code — it decrypts old secrets
 * (encrypted directly with MASTER_KEY) using crypto, then re-encrypts them
 * with the workspace key via the service.
 *
 * Usage: npx ts-node -P apps/api/tsconfig.json apps/api/src/scripts/migrate-envelope-encryption.ts
 *
 * Prerequisites:
 * - DATABASE_URL and MASTER_KEY must be set in environment
 * - Run Prisma migrations first
 */
import { NestFactory } from '@nestjs/core';
import * as crypto from 'crypto';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';
import { SecretKeyService } from '../secret/secret-key.service';
import { SecretEncryptionService } from '../secret/secret-encryption.service';

/** Decrypt old secrets that were encrypted directly with MASTER_KEY (no workspace key) */
function decryptWithMasterKey(
  ciphertext: string,
  ivHex: string,
  tagHex: string,
  masterKey: Buffer,
): string {
  const decipher = crypto.createDecipheriv('aes-256-gcm', masterKey, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  let plain = decipher.update(ciphertext, 'hex', 'utf8');
  plain += decipher.final('utf8');
  return plain;
}

async function migrate() {
  const masterKeyB64 = process.env.MASTER_KEY;
  if (!masterKeyB64) {
    console.error('MASTER_KEY env var is required');
    process.exit(1);
  }
  const masterKey = Buffer.from(masterKeyB64, 'base64');

  console.log('Starting envelope encryption migration...');

  const app = await NestFactory.createApplicationContext(AppModule);

  const prisma = app.get(PrismaService);
  const secretKey = app.get(SecretKeyService);
  const encryption = app.get(SecretEncryptionService);

  const workspaces = await prisma.workspace.findMany();
  console.log(`Found ${workspaces.length} workspaces`);

  let secretsMigrated = 0;
  let historyMigrated = 0;

  for (const workspace of workspaces) {
    // Idempotent — creates workspace key if none exists
    const { id: workspaceKeyId, rawKey } =
      await secretKey.getOrCreateWorkspaceKey(workspace.id);
    console.log(`  Workspace ${workspace.id}: key ${workspaceKeyId}`);

    // Migrate secrets without workspaceKeyId (old master-key encryption)
    const secrets = await prisma.secret.findMany({
      where: {
        workspaceKeyId: null,
        environment: { project: { workspaceId: workspace.id } },
      },
    });

    for (const secret of secrets) {
      const plaintext = decryptWithMasterKey(
        secret.valueEncrypted,
        secret.iv,
        secret.tag,
        masterKey,
      );
      const { ciphertext, iv, tag } = encryption.encrypt(plaintext, rawKey);
      await prisma.secret.update({
        where: { id: secret.id },
        data: { valueEncrypted: ciphertext, iv, tag, workspaceKeyId },
      });
      secretsMigrated++;
    }

    // Migrate SecretHistory records without workspaceKeyId
    const histories = await prisma.secretHistory.findMany({
      where: {
        workspaceKeyId: null,
        secret: {
          environment: { project: { workspaceId: workspace.id } },
        },
      },
    });

    for (const h of histories) {
      const plaintext = decryptWithMasterKey(
        h.valueEncrypted,
        h.iv,
        h.tag,
        masterKey,
      );
      const { ciphertext, iv, tag } = encryption.encrypt(plaintext, rawKey);
      await prisma.secretHistory.update({
        where: { id: h.id },
        data: { valueEncrypted: ciphertext, iv, tag, workspaceKeyId },
      });
      historyMigrated++;
    }
  }

  console.log(`\nMigration complete:`);
  console.log(`  Secrets migrated:  ${secretsMigrated}`);
  console.log(`  History records:   ${historyMigrated}`);
  console.log(`\nMigration complete.`);

  await app.close();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
