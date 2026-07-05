#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { select } from '@inquirer/prompts';
import chalk from 'chalk';
import { config } from './config.js';
import { VaultifyApi, apiPost } from './api.js';
import {
  pickWorkspace,
  pickProject,
  pickEnvironment,
  pickContext,
  askInput,
  askPassword,
  askConfirm,
  type WorkspaceDto,
  type ProjectDto,
  type EnvironmentDto,
} from './prompts.js';
import {
  brand,
  icon,
  printHeader,
  spinner,
  success,
  error,
  info,
  hint,
  divider,
  blank,
  printTable,
} from './ui.js';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf-8'));

// ─── Interfaces ──────────────────────────────────────────────

interface UserDto {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

interface LoginResponse {
  token: string;
  user: UserDto;
}

interface ApiTokenDto {
  id: string;
  name: string;
  tokenPrefix: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  active: boolean;
  createdAt: string;
}

interface CreateApiTokenDto extends ApiTokenDto {
  rawToken?: string;
}

interface MemberDto {
  id: string;
  role: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

// ─── Helpers ─────────────────────────────────────────────────

function getApi(): { api: VaultifyApi; token: string; apiUrl: string } {
  const token = config.getToken();
  const apiUrl = config.getApiUrl();

  if (!token) {
    blank();
    error('Not logged in.');
    hint(`Run ${brand.primary('vlt-cli')} and select ${brand.white.bold('Login')} to get started.`);
    hint(`Or set the ${brand.primary('VAULTIFY_TOKEN')} environment variable.`);
    blank();
    process.exit(1);
  }

  return { api: new VaultifyApi(apiUrl, token), token, apiUrl };
}

const DEFAULT_API_URL = 'https://vaultify-api.vercel.app/api';

// ─── Theme for top-level select ──────────────────────────────

const menuTheme = {
  prefix: {
    idle: brand.primary('❯'),
    done: brand.accent('✓'),
  },
  style: {
    answer: (text: string) => brand.primary.bold(text),
    message: (text: string) => brand.white.bold(text),
    highlight: (text: string) => brand.primary.bold(text),
  },
};

// ─── Commands ────────────────────────────────────────────────

async function cmdLogin(): Promise<void> {
  blank();
  console.log(`  ${icon.lock} ${brand.white.bold('Login to Vaultify')}`);
  blank();

  const method = await select({
    message: 'How would you like to authenticate?',
    choices: [
      {
        name: `${icon.user}  Email & Password`,
        value: 'email' as const,
        description: 'Sign in with your Vaultify account',
      },
      {
        name: `${icon.key}  API Token`,
        value: 'token' as const,
        description: 'Paste a token from the dashboard (for OAuth users or CI/CD)',
      },
    ],
    theme: menuTheme,
  });

  const useCustomUrl = await askConfirm('Use custom API URL?', false);
  const apiUrl = useCustomUrl
    ? await askInput('API URL', DEFAULT_API_URL)
    : DEFAULT_API_URL;

  config.setApiUrl(apiUrl);

  if (method === 'token') {
    blank();
    hint(`Create tokens at: ${brand.secondary('https://vaultiify.vercel.app/dashboard/settings')}`);
    blank();
    const token = await askInput('Paste your API token');

    if (!token) {
      error('Token cannot be empty');
      process.exit(1);
    }

    config.setToken(token);
    blank();
    success('Token saved');
    info('API', apiUrl);
    blank();
  } else {
    const email = await askInput('Email');
    if (!email) {
      error('Email cannot be empty');
      process.exit(1);
    }

    const pwd = await askPassword('Password');
    if (!pwd) {
      error('Password cannot be empty');
      process.exit(1);
    }

    const spin = spinner('Authenticating…');
    try {
      const data = await apiPost<LoginResponse>(apiUrl, '/auth/login', {
        email,
        password: pwd,
      });
      spin.stop();

      config.setToken(data.token);
      blank();
      success(`Logged in as ${brand.white.bold(data.user.email)}`);
      info('API', apiUrl);
      blank();
    } catch (err) {
      spin.stop();
      throw err;
    }
  }
}

async function cmdLogout(): Promise<void> {
  const confirmed = await askConfirm('Log out and clear saved credentials?');
  if (confirmed) {
    config.clear();
    blank();
    success('Logged out — session cleared');
    blank();
  }
}

async function cmdWhoami(): Promise<void> {
  const { api, apiUrl } = getApi();
  const spin = spinner('Fetching profile…');
  const user = await api.get<UserDto>('/auth/me');
  spin.stop();

  blank();
  console.log(`  ${icon.user} ${brand.white.bold('Current Session')}`);
  blank();
  info('Name', user.name);
  info('Email', user.email);
  info('ID', brand.dim(user.id));
  info('API', apiUrl);
  blank();
}

async function cmdPull(): Promise<void> {
  const { api } = getApi();
  blank();
  console.log(`  ${icon.arrow} ${brand.white.bold('Pull Secrets')}`);
  blank();

  const { environment } = await pickContext(api);
  if (!environment) return;

  const resolve = await askConfirm('Resolve secret references ({{ env.KEY }})?', false);
  const defaultOut = `${environment.name}.env`;
  const outFile = await askInput('Output file', defaultOut);

  const spin = spinner('Downloading secrets…');
  const qs = resolve ? '?resolve=true' : '';
  const text = await api.getText(`/environments/${environment.id}/secrets/export${qs}`);
  spin.stop();

  await writeFile(outFile, text, 'utf-8');
  blank();
  success(`Exported ${brand.white.bold(environment.name)} secrets → ${brand.primary.bold(outFile)}`);
  blank();
}

async function cmdPush(): Promise<void> {
  const { api } = getApi();
  blank();
  console.log(`  ${icon.arrow} ${brand.white.bold('Push Secrets')}`);
  blank();

  const { environment } = await pickContext(api);
  if (!environment) return;

  const file = await askInput('Path to .env file', '.env');

  let fileContent: string;
  try {
    fileContent = readFileSync(file, 'utf-8');
  } catch {
    error(`Could not read file: ${file}`);
    process.exit(1);
  }

  const lines = fileContent.split('\n').filter((l) => l.trim() && !l.startsWith('#')).length;
  const confirmed = await askConfirm(
    `Import ${brand.primary.bold(String(lines))} vars from ${brand.white.bold(file)} into ${brand.primary.bold(environment.name)}?`,
  );
  if (!confirmed) return;

  const spin = spinner('Uploading secrets…');
  const result = await api.post<{ imported: number }>(`/environments/${environment.id}/secrets/import`, {
    text: fileContent,
  });
  spin.stop();

  const count = result.imported ?? (Array.isArray(result) ? result.length : '?');
  blank();
  success(`Imported ${brand.white.bold(String(count))} secrets → ${brand.primary.bold(environment.name)}`);
  blank();
}

async function cmdList(): Promise<void> {
  const { api } = getApi();
  blank();
  console.log(`  ${icon.folder} ${brand.white.bold('Browse Resources')}`);
  blank();

  const scope = await select({
    message: 'What do you want to list?',
    choices: [
      { name: 'Workspaces', value: 'workspaces' as const },
      { name: 'Projects in a workspace', value: 'projects' as const },
      { name: 'Secrets in an environment', value: 'secrets' as const },
    ],
    theme: menuTheme,
  });

  if (scope === 'workspaces') {
    const spin = spinner('Fetching workspaces…');
    const workspaces = await api.get<WorkspaceDto[]>('/workspaces');
    spin.stop();

    if (workspaces.length === 0) {
      hint('No workspaces found.');
      blank();
      return;
    }

    blank();
    printTable(
      ['Workspace', 'Projects'],
      workspaces.map((w) => [
        brand.primary(w.name),
        brand.dim(String(w._count?.projects ?? '—')),
      ]),
    );
    blank();
  } else if (scope === 'projects') {
    const ws = await pickWorkspace(api);
    const spin = spinner('Fetching projects…');
    const projects = await api.get<(ProjectDto & { _count?: { secrets: number; environments: number } })[]>(
      `/workspaces/${ws.id}/projects`,
    );
    spin.stop();

    if (projects.length === 0) {
      hint(`No projects in ${ws.name}.`);
      blank();
      return;
    }

    blank();
    printTable(
      ['Project', 'Secrets', 'Environments'],
      projects.map((p) => [
        brand.primary(p.name),
        brand.dim(String(p._count?.secrets ?? '—')),
        brand.dim(String(p._count?.environments ?? '—')),
      ]),
    );
    blank();
  } else {
    const { environment, project, workspace } = await pickContext(api);
    if (!environment) return;

    const spin = spinner('Fetching secrets…');
    const secrets = await api.get<Array<{ id: string; key: string; version: number }>>(
      `/environments/${environment.id}/secrets`,
    );
    spin.stop();

    if (secrets.length === 0) {
      hint(`No secrets in ${environment.name}.`);
      blank();
      return;
    }

    blank();
    console.log(`  ${brand.dim(`${workspace.name} / ${project.name} / ${environment.name}`)}`);
    blank();
    printTable(
      ['Key', 'Version'],
      secrets.map((s) => [brand.accent(s.key), brand.dim(`v${s.version}`)]),
    );
    blank();
  }
}

async function cmdDiff(): Promise<void> {
  const { api } = getApi();
  blank();
  console.log(`  ${brand.white.bold('⇄  Compare Environments')}`);
  blank();

  const ws = await pickWorkspace(api);
  const project = await pickProject(api, ws.id);

  console.log(`  ${brand.dim('Select the two environments to compare:')}`);
  blank();

  const spin1 = spinner('Fetching environments…');
  const envs = await api.get<EnvironmentDto[]>(`/projects/${project.id}/environments`);
  spin1.stop();

  if (envs.length < 2) {
    error('Need at least 2 environments to compare.');
    blank();
    return;
  }

  const env1 = await select({
    message: 'First environment',
    choices: envs.map((e) => ({ name: e.name, value: e })),
    theme: menuTheme,
  });

  const env2 = await select({
    message: 'Second environment',
    choices: envs.filter((e) => e.id !== env1.id).map((e) => ({ name: e.name, value: e })),
    theme: menuTheme,
  });

  const includeValues = await askConfirm('Include decrypted values?', false);

  const spin2 = spinner('Comparing…');
  const qs = `?id1=${env1.id}&id2=${env2.id}${includeValues ? '&includeValues=true' : ''}`;
  const diff = await api.get<{
    onlyInA: Array<{ key: string; value?: string }>;
    onlyInB: Array<{ key: string; value?: string }>;
    common: Array<{ key: string; same: boolean; valueA?: string; valueB?: string }>;
  }>(`/projects/${project.id}/environments/diff${qs}`);
  spin2.stop();

  blank();
  console.log(`  ${brand.white.bold(`${env1.name}  ↔  ${env2.name}`)}`);
  divider();

  if (diff.onlyInA.length > 0) {
    blank();
    console.log(`  ${brand.accent(`Only in ${env1.name}`)} ${brand.dim(`(${diff.onlyInA.length})`)}`);
    for (const item of diff.onlyInA) {
      const val = item.value ? brand.dim(` = ${item.value}`) : '';
      console.log(`    ${brand.accent('+')} ${brand.white(item.key)}${val}`);
    }
  }

  if (diff.onlyInB.length > 0) {
    blank();
    console.log(`  ${brand.secondary(`Only in ${env2.name}`)} ${brand.dim(`(${diff.onlyInB.length})`)}`);
    for (const item of diff.onlyInB) {
      const val = item.value ? brand.dim(` = ${item.value}`) : '';
      console.log(`    ${brand.secondary('+')} ${brand.white(item.key)}${val}`);
    }
  }

  const changed = diff.common.filter((c) => !c.same);
  const same = diff.common.filter((c) => c.same);

  if (changed.length > 0) {
    blank();
    console.log(`  ${brand.warn('Changed')} ${brand.dim(`(${changed.length})`)}`);
    for (const item of changed) {
      const vA = item.valueA ? brand.dim(` ${item.valueA}`) : '';
      const vB = item.valueB ? brand.dim(` ${item.valueB}`) : '';
      console.log(`    ${brand.warn('~')} ${brand.white(item.key)}${vA} ${brand.dim('→')}${vB}`);
    }
  }

  if (same.length > 0) {
    blank();
    hint(`Unchanged: ${same.length} keys`);
  }

  blank();
}

async function cmdMembers(): Promise<void> {
  const { api } = getApi();
  blank();
  console.log(`  ${icon.team} ${brand.white.bold('Workspace Members')}`);
  blank();

  const ws = await pickWorkspace(api);

  const spin = spinner('Fetching members…');
  const members = await api.get<MemberDto[]>(`/workspaces/${ws.id}/members`);
  spin.stop();

  if (members.length === 0) {
    hint('No members found.');
    blank();
    return;
  }

  blank();
  printTable(
    ['Role', 'Name', 'Email'],
    members.map((m) => {
      const roleColor =
        m.role === 'OWNER' ? brand.warn : m.role === 'EDITOR' ? brand.accent : brand.dim;
      return [roleColor(m.role), brand.white(m.user.name), brand.dim(m.user.email)];
    }),
  );
  blank();
}

async function cmdTokens(): Promise<void> {
  const { api } = getApi();
  blank();
  console.log(`  ${icon.key} ${brand.white.bold('API Tokens')}`);
  blank();

  const action = await select({
    message: 'What would you like to do?',
    choices: [
      { name: 'List tokens', value: 'list' as const },
      { name: 'Create new token', value: 'create' as const },
      { name: 'Revoke a token', value: 'revoke' as const },
    ],
    theme: menuTheme,
  });

  const ws = await pickWorkspace(api);

  if (action === 'list') {
    const spin = spinner('Fetching tokens…');
    const tokens = await api.get<ApiTokenDto[]>(`/workspaces/${ws.id}/tokens`);
    spin.stop();

    if (tokens.length === 0) {
      hint('No API tokens for this workspace.');
      blank();
      return;
    }

    blank();
    printTable(
      ['Name', 'Status', 'Prefix', 'Last Used'],
      tokens.map((t) => {
        const status = t.active ? brand.accent('active') : brand.error('revoked');
        const lastUsed = t.lastUsedAt ? new Date(t.lastUsedAt).toLocaleDateString() : 'never';
        return [brand.white(t.name), status, brand.dim(t.tokenPrefix), brand.dim(lastUsed)];
      }),
    );
    blank();
  } else if (action === 'create') {
    const name = await askInput('Token name');
    if (!name) {
      error('Token name cannot be empty');
      return;
    }

    const spin = spinner('Creating token…');
    const result = await api.post<CreateApiTokenDto>(`/workspaces/${ws.id}/tokens`, { name });
    spin.stop();

    blank();
    success('Token created');
    info('Name', result.name);
    info('Prefix', result.tokenPrefix);
    if (result.rawToken) {
      blank();
      console.log(`  ${brand.warn.bold('Token')}  ${brand.white.bold(result.rawToken)}`);
      blank();
      console.log(`  ${icon.warn} ${brand.warn('This will not be shown again. Store it safely.')}`);
    }
    blank();
  } else {
    const spin = spinner('Fetching tokens…');
    const tokens = await api.get<ApiTokenDto[]>(`/workspaces/${ws.id}/tokens`);
    spin.stop();

    const activeTokens = tokens.filter((t) => t.active);
    if (activeTokens.length === 0) {
      hint('No active tokens to revoke.');
      blank();
      return;
    }

    const tokenToRevoke = await select({
      message: 'Select token to revoke',
      choices: activeTokens.map((t) => ({
        name: `${t.name} ${brand.dim(`(${t.tokenPrefix}…)`)}`,
        value: t,
      })),
      theme: menuTheme,
    });

    const confirmed = await askConfirm(`Revoke token "${tokenToRevoke.name}"?`, false);
    if (!confirmed) return;

    const spin2 = spinner('Revoking…');
    await api.del(`/workspaces/${ws.id}/tokens/${tokenToRevoke.id}`);
    spin2.stop();

    blank();
    success('Token revoked');
    blank();
  }
}

async function cmdSecrets(): Promise<void> {
  const { api } = getApi();
  blank();
  console.log(`  ${icon.shield} ${brand.white.bold('Secrets')}`);
  blank();

  const action = await select({
    message: 'What would you like to do?',
    choices: [
      { name: 'Search secrets by key', value: 'search' as const },
      { name: 'Reveal a secret value', value: 'reveal' as const },
    ],
    theme: menuTheme,
  });

  if (action === 'search') {
    const ws = await pickWorkspace(api);
    const query = await askInput('Search query (matches key names)');

    const spin = spinner('Searching…');
    const results = await api.post<
      Array<{
        id: string;
        key: string;
        version: number;
        environment: { id: string; name: string; project: { name: string } };
      }>
    >('/secrets/search', { workspaceId: ws.id, query });
    spin.stop();

    if (results.length === 0) {
      hint(`No secrets matching "${query}".`);
      blank();
      return;
    }

    blank();
    printTable(
      ['Key', 'Project / Env', 'Version'],
      results.map((s) => [
        brand.accent(s.key),
        brand.dim(`${s.environment.project.name} / ${s.environment.name}`),
        brand.dim(`v${s.version}`),
      ]),
    );
    blank();
  } else {
    const secretId = await askInput('Secret ID');

    const spin = spinner('Decrypting…');
    const result = await api.post<{ id: string; key: string; value: string }>(
      `/secrets/${secretId}/reveal`,
    );
    spin.stop();

    blank();
    info('Key', brand.white.bold(result.key));
    info('Value', brand.accent(result.value));
    blank();
  }
}

// ─── init ────────────────────────────────────────────────────

async function cmdInit(): Promise<void> {
  const { api } = getApi();
  blank();
  console.log(`  ${icon.folder} ${brand.white.bold('Link this directory to a Vaultify project')}`);
  blank();

  const { workspace, project, environment } = await pickContext(api);

  config.setProjectConfig({
    workspaceId: workspace.id,
    workspaceName: workspace.name,
    projectId: project.id,
    projectName: project.name,
    environmentId: environment?.id,
    environmentName: environment?.name,
  });

  blank();
  success(`Linked to ${brand.primary.bold(workspace.name)} / ${brand.primary.bold(project.name)}${environment ? ` / ${brand.primary.bold(environment.name)}` : ''}`);
  info('Config', config.getProjectConfigPath());
  hint('Add .vaultify.json to .gitignore');
  blank();
}

// ─── run ─────────────────────────────────────────────────────

async function cmdRun(): Promise<void> {
  const { api } = getApi();

  // Find the command after "--"
  const rawArgs = process.argv.slice(2);
  const ddIdx = rawArgs.indexOf('--');
  const childArgs = ddIdx >= 0 ? rawArgs.slice(ddIdx + 1) : [];

  if (childArgs.length === 0) {
    blank();
    error('No command specified. Usage: vlt-cli run -- <command>');
    hint('Example: vlt-cli run -- npm start');
    blank();
    process.exit(1);
  }

  // Try project config first
  let envId: string | undefined;
  let envName: string | undefined;
  const projCfg = config.getProjectConfig();

  if (projCfg?.environmentId) {
    envId = projCfg.environmentId;
    envName = projCfg.environmentName;
    console.log(`  ${icon.arrow} Using linked env: ${brand.primary.bold(envName || envId)}`);
  } else {
    blank();
    console.log(`  ${icon.run} ${brand.white.bold('Run with secrets')}`);
    blank();
    const ctx = await pickContext(api);
    envId = ctx.environment?.id;
    envName = ctx.environment?.name;
  }

  if (!envId) {
    error('No environment selected.');
    process.exit(1);
  }

  const spin = spinner('Fetching secrets…');
  const text = await api.getText(`/environments/${envId}/secrets/export?resolve=true`);
  spin.stop();

  // Parse .env text into key=value pairs
  const envVars: Record<string, string> = {};
  let count = 0;
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    // Strip surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    envVars[key] = val;
    count++;
  }

  blank();
  success(`Injecting ${brand.white.bold(String(count))} secrets from ${brand.primary.bold(envName || 'environment')}`);
  hint(`Running: ${brand.white(childArgs.join(' '))}`);
  blank();

  const child = spawn(childArgs[0], childArgs.slice(1), {
    stdio: 'inherit',
    env: { ...process.env, ...envVars },
    shell: true,
  });

  child.on('close', (code) => {
    process.exit(code ?? 0);
  });

  child.on('error', (err) => {
    error(`Failed to start: ${err.message}`);
    process.exit(1);
  });
}

// ─── Non-interactive fallback (CI/CD) ────────────────────────

function runNonInteractive(args: string[]): boolean {
  const cmd = args[0];

  // Only support quick non-interactive shortcuts
  if (cmd === '--version' || cmd === '-v' || cmd === '-V') {
    console.log(pkg.version);
    return true;
  }

  if (cmd === '--help' || cmd === '-h') {
    printHeader();
    console.log(brand.white.bold('  Usage'));
    blank();
    console.log(`  ${brand.primary('$')} vlt-cli              ${brand.dim('Interactive mode (recommended)')}`);
    console.log(`  ${brand.primary('$')} vlt-cli ${brand.dim('<command>')}     ${brand.dim('Jump directly to a command')}`);
    blank();
    console.log(brand.white.bold('  Commands'));
    blank();
    const cmds = [
      ['login', 'Authenticate with Vaultify'],
      ['logout', 'Clear saved session'],
      ['whoami', 'Show current user info'],
      ['init', 'Link current dir to a project'],
      ['pull', 'Export secrets as .env file'],
      ['push', 'Import .env file into environment'],
      ['run', 'Run a command with injected secrets'],
      ['ls', 'Browse workspaces, projects, secrets'],
      ['diff', 'Compare two environments'],
      ['members', 'List workspace members'],
      ['tokens', 'Manage API tokens'],
      ['secrets', 'Search & reveal secrets'],
    ];
    for (const [name, desc] of cmds) {
      console.log(`    ${brand.primary(name.padEnd(14))} ${brand.dim(desc)}`);
    }
    blank();
    console.log(brand.white.bold('  Environment Variables'));
    blank();
    console.log(`    ${brand.primary('VAULTIFY_TOKEN')}     ${brand.dim('API token (overrides saved token)')}`);
    console.log(`    ${brand.primary('VAULTIFY_API_URL')}   ${brand.dim('API base URL (overrides saved URL)')}`);
    blank();
    console.log(`  ${brand.dim(`v${pkg.version} · Config: ~/.vaultify/config.json`)}`);
    blank();
    return true;
  }

  return false;
}

// ─── Main ────────────────────────────────────────────────────

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  // Handle --version, --help
  if (args.length > 0 && runNonInteractive(args)) {
    return;
  }

  // Direct command jump: `vlt-cli pull`, `vlt-cli login`, etc.
  const directCommand = args[0];
  const commandMap: Record<string, () => Promise<void>> = {
    login: cmdLogin,
    logout: cmdLogout,
    whoami: cmdWhoami,
    init: cmdInit,
    pull: cmdPull,
    push: cmdPush,
    run: cmdRun,
    ls: cmdList,
    list: cmdList,
    diff: cmdDiff,
    members: cmdMembers,
    tokens: cmdTokens,
    token: cmdTokens,
    secrets: cmdSecrets,
  };

  if (directCommand && commandMap[directCommand]) {
    try {
      await commandMap[directCommand]();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      blank();
      error(message);
      blank();
      process.exit(1);
    }
    return;
  }

  // ─── Interactive menu (persistent loop) ──────────────────
  printHeader();

  while (true) {
    // Check auth status each iteration (may change after login/logout)
    const token = config.getToken();
    if (token) {
      hint(`Logged in ${brand.dim('·')} ${brand.dim(config.getApiUrl())}`);
    } else {
      hint(`Not logged in ${brand.dim('·')} Run ${brand.primary('Login')} to get started`);
    }
    blank();

    let command: string;
    try {
      command = await select({
        message: 'What would you like to do?',
        choices: [
          ...(token
            ? [
                { name: `${icon.link}  Init (link project)`,      value: 'init'    as const, description: 'Link this directory to a workspace/project' },
                { name: `${icon.arrow}  Pull secrets`,            value: 'pull'    as const, description: 'Export an environment as .env file' },
                { name: `${icon.arrow}  Push secrets`,            value: 'push'    as const, description: 'Import a .env file into an environment' },
                { name: `${icon.run}  Run with secrets`,          value: 'run'     as const, description: 'Run a command with injected env vars' },
                { name: `${icon.folder}  Browse`,                 value: 'ls'      as const, description: 'List workspaces, projects, and secrets' },
                { name: `${icon.diff}  Compare environments`,    value: 'diff'    as const, description: 'Diff secrets between two environments' },
                { name: `${icon.shield}  Secrets`,                value: 'secrets' as const, description: 'Search or reveal a secret' },
                { name: `${icon.team}  Members`,                  value: 'members' as const, description: 'View workspace members' },
                { name: `${icon.key}  API Tokens`,                value: 'tokens'  as const, description: 'Create, list, or revoke API tokens' },
                { name: `${icon.user}  Who am I?`,                value: 'whoami'  as const, description: 'Show current session info' },
                { name: `${icon.logout}  Logout`,                 value: 'logout'  as const, description: 'Clear saved credentials' },
              ]
            : []),
          ...(!token
            ? [
                { name: `${icon.lock}  Login`,   value: 'login' as const, description: 'Authenticate with Vaultify' },
              ]
            : [
                { name: `${icon.lock}  Switch account`,   value: 'login' as const, description: 'Log in as a different user' },
              ]),
          { name: `${brand.dim('✕  Exit')}`, value: 'exit' as const, description: 'Quit vlt-cli' },
        ],
        theme: menuTheme,
      });
    } catch {
      // User pressed Ctrl+C during select
      blank();
      hint('Goodbye!');
      blank();
      process.exit(0);
    }

    if (command === 'exit') {
      blank();
      hint('Goodbye!');
      blank();
      process.exit(0);
    }

    // `run` spawns a child process and takes over — don't loop back
    if (command === 'run') {
      try {
        await cmdRun();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        blank();
        error(message);
        blank();
        process.exit(1);
      }
      return;
    }

    try {
      await commandMap[command]();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      blank();
      error(message);
    }

    blank();
  }
}

main();
