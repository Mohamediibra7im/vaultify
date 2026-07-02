import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

@Injectable()
export class SecretEncryptionService {
  private readonly masterKey: Buffer;

  constructor(private readonly config: ConfigService) {
    const raw = config.getOrThrow<string>('MASTER_KEY');
    this.masterKey = Buffer.from(raw, 'base64');
    if (this.masterKey.length !== 32) {
      throw new Error('MASTER_KEY must be 32 bytes (44 base64 chars)');
    }
  }

  encrypt(plaintext: string, workspaceKey: Buffer): { ciphertext: string; iv: string; tag: string } {
    const key = workspaceKey;
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag().toString('hex');
    return { ciphertext: encrypted, iv: iv.toString('hex'), tag };
  }

  decrypt(ciphertext: string, ivHex: string, tagHex: string, workspaceKey: Buffer): string {
    const key = workspaceKey;
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /** Encrypt a 32-byte raw key with the master key (key-wrapping) */
  wrapKey(rawKey: Buffer): { ciphertext: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, this.masterKey, iv);
    let encrypted = cipher.update(rawKey.toString('latin1'), 'latin1', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag().toString('hex');
    return { ciphertext: encrypted, iv: iv.toString('hex'), tag };
  }

  /** Decrypt a wrapped key back to raw 32-byte Buffer */
  unwrapKey(ciphertext: string, ivHex: string, tagHex: string): Buffer {
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, this.masterKey, iv);
    decipher.setAuthTag(tag);
    let decrypted = decipher.update(ciphertext, 'hex', 'latin1');
    decrypted += decipher.final('latin1');
    return Buffer.from(decrypted, 'latin1');
  }
}
