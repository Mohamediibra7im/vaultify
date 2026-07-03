import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SecretEncryptionService } from './secret-encryption.service';

const mockWorkspaceKey = Buffer.from(
  '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  'hex',
);

function makeTestKey(): string {
  return mockWorkspaceKey.toString('base64');
}

describe('SecretEncryptionService', () => {
  let service: SecretEncryptionService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SecretEncryptionService,
        {
          provide: ConfigService,
          useValue: { getOrThrow: () => makeTestKey() },
        },
      ],
    }).compile();

    service = module.get<SecretEncryptionService>(SecretEncryptionService);
  });

  it('encrypts and decrypts a value round-trip', () => {
    const original = 'MY_SUPER_SECRET_API_KEY';
    const encrypted = service.encrypt(original, mockWorkspaceKey);
    expect(encrypted.ciphertext).toBeDefined();
    expect(encrypted.iv).toBeDefined();
    expect(encrypted.tag).toBeDefined();
    expect(encrypted.ciphertext).not.toBe(original);

    const decrypted = service.decrypt(
      encrypted.ciphertext,
      encrypted.iv,
      encrypted.tag,
      mockWorkspaceKey,
    );
    expect(decrypted).toBe(original);
  });

  it('produces different ciphertext for same plaintext (random IV)', () => {
    const plain = 'same-value';
    const a = service.encrypt(plain, mockWorkspaceKey);
    const b = service.encrypt(plain, mockWorkspaceKey);
    expect(a.ciphertext).not.toBe(b.ciphertext);
    expect(a.iv).not.toBe(b.iv);
  });

  it('throws on corrupted ciphertext', () => {
    const encrypted = service.encrypt('secret', mockWorkspaceKey);
    const badCiphertext =
      encrypted.ciphertext[0] === '0'
        ? '1' + encrypted.ciphertext.slice(1)
        : '0' + encrypted.ciphertext.slice(1);
    expect(() =>
      service.decrypt(badCiphertext, encrypted.iv, encrypted.tag, mockWorkspaceKey),
    ).toThrow();
  });

  it('throws on tampered auth tag', () => {
    const encrypted = service.encrypt('secret', mockWorkspaceKey);
    const badTag =
      encrypted.tag[0] === '0'
        ? '1' + encrypted.tag.slice(1)
        : '0' + encrypted.tag.slice(1);
    expect(() =>
      service.decrypt(encrypted.ciphertext, encrypted.iv, badTag, mockWorkspaceKey),
    ).toThrow();
  });

  it('handles empty string', () => {
    const encrypted = service.encrypt('', mockWorkspaceKey);
    const decrypted = service.decrypt(
      encrypted.ciphertext,
      encrypted.iv,
      encrypted.tag,
      mockWorkspaceKey,
    );
    expect(decrypted).toBe('');
  });

  it('handles unicode characters', () => {
    const unicode = 'héllo wörld 🔐 €';
    const encrypted = service.encrypt(unicode, mockWorkspaceKey);
    const decrypted = service.decrypt(
      encrypted.ciphertext,
      encrypted.iv,
      encrypted.tag,
      mockWorkspaceKey,
    );
    expect(decrypted).toBe(unicode);
  });

  it('throws on empty key (construction)', () => {
    expect(() => {
      new SecretEncryptionService({
        getOrThrow: () => '',
      } as unknown as ConfigService);
    }).toThrow('MASTER_KEY must be 32 bytes');
  });

  it('throws on wrong-length key (construction)', () => {
    expect(() => {
      new SecretEncryptionService({
        getOrThrow: () => Buffer.from('tooshort').toString('base64'),
      } as unknown as ConfigService);
    }).toThrow('MASTER_KEY must be 32 bytes');
  });
});
