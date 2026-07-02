import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const CONFIG_DIR = join(homedir(), '.vaultify');
const CONFIG_PATH = join(CONFIG_DIR, 'config.json');

interface ConfigData {
  token?: string;
  apiUrl?: string;
}

function ensureDir(): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

function read(): ConfigData {
  try {
    if (existsSync(CONFIG_PATH)) {
      return JSON.parse(readFileSync(CONFIG_PATH, 'utf-8')) as ConfigData;
    }
  } catch {
    // corrupt config — start fresh
  }
  return {};
}

function write(data: ConfigData): void {
  ensureDir();
  writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export const config = {
  getToken(): string | undefined {
    return process.env.VAULTIFY_TOKEN || read().token;
  },

  getApiUrl(): string {
    return process.env.VAULTIFY_API_URL || read().apiUrl || 'http://localhost:4000/api';
  },

  setToken(token: string): void {
    const data = read();
    data.token = token;
    write(data);
  },

  setApiUrl(url: string): void {
    const data = read();
    data.apiUrl = url;
    write(data);
  },

  clear(): void {
    write({});
  },
};
