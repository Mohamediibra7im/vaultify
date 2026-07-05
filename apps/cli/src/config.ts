import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

// ─── Global config (~/.vaultify/config.json) ─────────────────

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

// ─── Project config (.vaultify.json in project root) ─────────

export interface ProjectConfig {
  workspaceId: string;
  workspaceName: string;
  projectId: string;
  projectName: string;
  environmentId?: string;
  environmentName?: string;
}

const PROJECT_CONFIG_NAME = '.vaultify.json';

/** Walk up from cwd to find .vaultify.json */
function findProjectConfig(): string | null {
  let dir = process.cwd();
  const root = resolve('/');
  while (dir !== root) {
    const candidate = join(dir, PROJECT_CONFIG_NAME);
    if (existsSync(candidate)) {
      return candidate;
    }
    dir = resolve(dir, '..');
  }
  return null;
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

  // ─── Project-level config ────────────────────────────────

  getProjectConfig(): ProjectConfig | null {
    const path = findProjectConfig();
    if (!path) return null;
    try {
      return JSON.parse(readFileSync(path, 'utf-8')) as ProjectConfig;
    } catch {
      return null;
    }
  },

  setProjectConfig(cfg: ProjectConfig): void {
    const path = join(process.cwd(), PROJECT_CONFIG_NAME);
    writeFileSync(path, JSON.stringify(cfg, null, 2) + '\n', 'utf-8');
  },

  getProjectConfigPath(): string {
    return join(process.cwd(), PROJECT_CONFIG_NAME);
  },

  hasProjectConfig(): boolean {
    return findProjectConfig() !== null;
  },
};
