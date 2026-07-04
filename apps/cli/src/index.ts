#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { Command } from 'commander';
import chalk from 'chalk';
import { config } from './config.js';
import { VaultifyApi, apiPost } from './api.js';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf-8'));

// ─── Interfaces ──────────────────────────────────────────────

interface UserDto {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

interface WorkspaceDto {
  id: string;
  name: string;
  slug: string;
}

interface ProjectDto {
  id: string;
  name: string;
  workspaceId: string;
}

interface EnvironmentDto {
  id: string;
  projectId: string;
  name: string;
}

interface ListWorkspaceDto extends WorkspaceDto {
  _count?: { projects: number };
}

interface ListProjectDto extends ProjectDto {
  _count?: { secrets: number; environments: number };
}

interface ListEnvironmentDto extends EnvironmentDto {
  _count?: { secrets: number };
}

interface LoginResponse {
  token: string;
  user: UserDto;
}

// ─── Helpers ─────────────────────────────────────────────────

function getApi(): { api: VaultifyApi; token: string; apiUrl: string } {
  const token = config.getToken();
  const apiUrl = config.getApiUrl();

  if (!token) {
    console.error(
      chalk.red('✘ Not logged in. Run'),
      chalk.cyan('vaultify login <api-url>'),
      chalk.red('or set'),
      chalk.cyan('VAULTIFY_TOKEN'),
      chalk.red('env var.'),
    );
    process.exit(1);
  }

  return { api: new VaultifyApi(apiUrl, token), token, apiUrl };
}

/** Prompt for password with hidden input. */
async function promptPassword(question: string): Promise<string> {
  output.write(question);

  if (!input.isTTY) {
    const rl = createInterface({ input, output });
    const answer = await rl.question('');
    rl.close();
    return answer;
  }

  return new Promise<string>((resolve) => {
    input.setRawMode(true);
    input.resume();

    const buf: string[] = [];

    const handler = (chunk: Buffer) => {
      const char = chunk.toString();

      if (char === '\r' || char === '\n') {
        input.removeListener('data', handler);
        input.setRawMode(false);
        input.pause();
        output.write('\n');
        resolve(buf.join(''));
        return;
      }

      if (char === '\x03') {
        // Ctrl+C — exit gracefully
        input.removeListener('data', handler);
        input.setRawMode(false);
        input.pause();
        process.exit(0);
      }

      if (char === '\x7f' || char === '\b') {
        // Backspace
        if (buf.length > 0) {
          buf.pop();
          output.write('\b \b');
        }
        return;
      }

      buf.push(char);
      output.write('*');
    };

    input.on('data', handler);
  });
}

async function promptInput(question: string): Promise<string> {
  const rl = createInterface({ input, output });
  const answer = await rl.question(question);
  rl.close();
  return answer;
}

// ponytail: Prisma Workspace has no slug field — match on name
async function resolveWorkspaceSlug(api: VaultifyApi, slug: string): Promise<WorkspaceDto> {
  const workspaces = await api.get<WorkspaceDto[]>('/workspaces');
  const ws = workspaces.find((w) => w.name === slug);
  if (!ws) {
    throw new Error(`Workspace with name "${slug}" not found. Available: ${workspaces.map((w) => w.name).join(', ')}`);
  }
  return ws;
}

// ponytail: Resolve a single project from a workspace.
// If projectName is provided, match by name (case-insensitive).
// If omitted and exactly 1 project exists, use it.
// If omitted and multiple projects exist, throw with guidance.
async function resolveProject(api: VaultifyApi, workspaceId: string, projectName?: string): Promise<ProjectDto> {
  const projects = await api.get<ProjectDto[]>(`/workspaces/${workspaceId}/projects`);
  if (projects.length === 0) {
    throw new Error(`No projects found in workspace ${workspaceId}`);
  }
  if (projectName) {
    const match = projects.find((p) => p.name.toLowerCase() === projectName.toLowerCase());
    if (!match) {
      throw new Error(`Project "${projectName}" not found. Available: ${projects.map((p) => p.name).join(', ')}`);
    }
    return match;
  }
  if (projects.length === 1) {
    return projects[0];
  }
  throw new Error(
    `Workspace has ${projects.length} projects — use --project <name>. Available: ${projects.map((p) => p.name).join(', ')}`,
  );
}

/** Resolve environment name to ID within a project. */
async function resolveEnvironmentId(
  api: VaultifyApi,
  projectId: string,
  envName: string,
): Promise<string> {
  const envs = await api.get<EnvironmentDto[]>(`/projects/${projectId}/environments`);
  const env = envs.find((e) => e.name === envName);
  if (!env) {
    const names = envs.map((e) => e.name).join(', ');
    throw new Error(`Environment "${envName}" not found. Available: ${names}`);
  }
  return env.id;
}

// ─── Program ─────────────────────────────────────────────────

const program = new Command();

program
  .name('vaultify')
  .version(pkg.version)
  .description(chalk.bold('Vaultify CLI — manage secrets from your terminal'));

// ─── login ───────────────────────────────────────────────────
const DEFAULT_API_URL = 'https://vaultify-api.vercel.app/api';

program
  .command('login')
  .description('Authenticate with Vaultify')
  .argument('[api-url]', 'API base URL (default: https://vaultify-api.vercel.app/api)', DEFAULT_API_URL)
  .option('--token <token>', 'Skip interactive login — save an API token directly')
  .addHelpText(
    'after',
    `
Interactive login with method selection:

  vaultify login                         → uses default API URL
  vaultify login https://my-api.com/api  → uses custom URL
  vaultify login --token <token>         → save token directly (for CI/CD)

  API tokens can be created from the Vaultify dashboard:
    Settings → API Tokens → Create Token

  Or set env vars instead of logging in:
    export VAULTIFY_TOKEN=your-token
    export VAULTIFY_API_URL=https://vaultify-api.vercel.app/api
`,
  )
  .action(async (apiUrl: string, opts: { token?: string }) => {
    try {
      // Save API URL first
      config.setApiUrl(apiUrl);

      // --token flag: skip interactive flow
      if (opts.token) {
        config.setToken(opts.token);
        console.log();
        console.log(chalk.green('✓ Token saved'));
        console.log(chalk.dim('  API:'), apiUrl);
        console.log();
        return;
      }

      // Interactive login
      console.log();
      console.log(chalk.bold.cyan('🔐 Vaultify Login'));
      console.log(chalk.dim('  API: ') + apiUrl);
      console.log();
      console.log(chalk.dim('  Choose login method:'));
      console.log();
      console.log('  ' + chalk.bold('1') + '  ' + chalk.white('Email & Password') + chalk.dim('  — login with your Vaultify account'));
      console.log('  ' + chalk.bold('2') + '  ' + chalk.white('API Token') + chalk.dim('      — for GitHub OAuth users or CI/CD'));
      console.log();
      console.log(chalk.dim('  Don\'t have a token? Create one from the dashboard:'));
      console.log(chalk.dim('  ') + chalk.cyan('https://vaultiify.vercel.app/dashboard/settings'));
      console.log();

      const method = await promptInput(chalk.bold('  Select method [1/2]: '));

      if (method === '2' || method.toLowerCase() === 'token') {
        console.log();
        console.log(chalk.dim('  Paste your API token:'));
        console.log(chalk.dim('  (create one at Settings → API Tokens in the dashboard)'));
        console.log();
        const token = await promptInput(chalk.bold('  Token: '));

        if (!token.trim()) {
          console.error(chalk.red('\n  ✘ Token cannot be empty'));
          process.exit(1);
        }

        config.setToken(token.trim());
        console.log();
        console.log(chalk.green('  ✓ Token saved'));
        console.log();
      } else {
        // Email/password login
        console.log();
        const email = await promptInput(chalk.bold('  Email: '));

        if (!email.trim()) {
          console.error(chalk.red('\n  ✘ Email cannot be empty'));
          process.exit(1);
        }

        const password = await promptPassword(chalk.bold('  Password: '));

        if (!password) {
          console.error(chalk.red('\n  ✘ Password cannot be empty'));
          process.exit(1);
        }

        console.log();
        console.log(chalk.dim('  Authenticating…'));

        const data = await apiPost<LoginResponse>(apiUrl, '/auth/login', {
          email,
          password,
        });

        config.setToken(data.token);

        console.log();
        console.log(chalk.green('  ✓ Logged in as'), chalk.bold(data.user.email));
        console.log();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(chalk.red(`\n  ✘ ${message}`));
      process.exit(1);
    }
  });

// ─── whoami ──────────────────────────────────────────────────
program
  .command('whoami')
  .description('Show current authenticated user info')
  .addHelpText('after', '\nShows your Vaultify user profile and current API endpoint.\n')
  .action(async () => {
    try {
      const { api, apiUrl } = getApi();
      const user = await api.get<UserDto>('/auth/me');

      console.log(chalk.bold('Authenticated as:'));
      console.log(`  ${chalk.dim('ID:')}     ${user.id}`);
      console.log(`  ${chalk.dim('Email:')}  ${user.email}`);
      console.log(`  ${chalk.dim('Name:')}   ${user.name}`);
      console.log(`  ${chalk.dim('API:')}    ${apiUrl}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(chalk.red(`✘ ${message}`));
      process.exit(1);
    }
  });

// ─── logout ──────────────────────────────────────────────────
program
  .command('logout')
  .description('Clear saved session and API URL')
  .addHelpText('after', '\nRemoves your stored token from ~/.vaultify/config.json.\n')
  .action(() => {
    config.clear();
    console.log(chalk.green('✓ Logged out — session cleared'));
  });

// ─── pull ────────────────────────────────────────────────────
program
  .command('pull')
  .description('Export secrets from an environment as .env file')
  .argument('<workspace-slug>', 'Workspace slug (e.g. "my-team")')
  .argument('<environment>', 'Environment name (e.g. "development")')
  // ponytail: --project option for multi-project workspaces
  .option('-p, --project <name>', 'Project name (required when workspace has multiple projects)')
  .option('-o, --output <file>', 'Output file path (default: <environment>.env)', undefined)
  .option('--resolve', 'Resolve secret references ({{ env.KEY }})')
  .addHelpText(
    'after',
    `
Examples:
  vaultify pull my-team production                   → writes production.env
  vaultify pull my-team staging -o .env               → writes .env
  vaultify pull my-team dev --resolve                 → resolve references
  vaultify pull my-team production -p my-api          → select project by name
`,
  )
  .action(async (workspaceSlug: string, environment: string, opts: { project?: string; output?: string; resolve?: boolean }) => {
    try {
      const { api } = getApi();
      const ws = await resolveWorkspaceSlug(api, workspaceSlug);
      // ponytail: use resolveProject with optional --project name
      const project = await resolveProject(api, ws.id, opts.project);
      const envId = await resolveEnvironmentId(api, project.id, environment);

      const qs = opts.resolve ? '?resolve=true' : '';
      const text = await api.getText(`/environments/${envId}/secrets/export${qs}`);

      const outFile = opts.output || `${environment}.env`;
      await writeFile(outFile, text, 'utf-8');
      console.log(chalk.green(`✓ Exported ${chalk.bold(environment)} secrets → ${chalk.bold(outFile)}`));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(chalk.red(`✘ ${message}`));
      process.exit(1);
    }
  });

// ─── push ────────────────────────────────────────────────────
program
  .command('push')
  .description('Import .env file into an environment')
  .argument('<workspace-slug>', 'Workspace slug (e.g. "my-team")')
  .argument('<environment>', 'Environment name (e.g. "development")')
  .argument('[file]', 'Path to .env file (default: .env)', '.env')
  // ponytail: --project option for multi-project workspaces
  .option('-p, --project <name>', 'Project name (required when workspace has multiple projects)')
  .addHelpText(
    'after',
    `
Examples:
  vaultify push my-team production                   → reads .env, imports to production
  vaultify push my-team staging .env.prod             → reads .env.prod
  vaultify push my-team production -p my-api          → select project by name
`,
  )
  .action(async (workspaceSlug: string, environment: string, file: string, opts: { project?: string }) => {
    try {
      const { api } = getApi();
      const ws = await resolveWorkspaceSlug(api, workspaceSlug);
      // ponytail: use resolveProject with optional --project name
      const project = await resolveProject(api, ws.id, opts.project);
      const envId = await resolveEnvironmentId(api, project.id, environment);

      const fileContent = readFileSync(file, 'utf-8');
      const result = await api.post<{ imported: number }>(`/environments/${envId}/secrets/import`, {
        text: fileContent,
      });

      const count = result.imported ?? (Array.isArray(result) ? result.length : '?');
      console.log(chalk.green(`✓ Imported ${chalk.bold(count)} secrets → ${chalk.bold(environment)}`));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(chalk.red(`✘ ${message}`));
      process.exit(1);
    }
  });

// ─── ls ──────────────────────────────────────────────────────
program
  .command('ls')
  .description('List workspaces, projects, or environments')
  .argument('[slug]', 'Workspace slug to list projects under')
  .argument('[environment]', 'Environment name to list secrets under (requires slug)')
  // ponytail: --project option for multi-project workspaces
  .option('-p, --project <name>', 'Project name (required when workspace has multiple projects)')
  .addHelpText(
    'after',
    `
Examples:
  vaultify ls                                 → list workspaces
  vaultify ls my-team                         → list projects in workspace
  vaultify ls my-team production              → list secrets in environment
  vaultify ls my-team production -p my-api    → select project by name
`,
  )
  .action(async (slug?: string, environment?: string, opts?: { project?: string }) => {
    try {
      const { api } = getApi();

      if (!slug) {
        const workspaces = await api.get<ListWorkspaceDto[]>('/workspaces');
        if (workspaces.length === 0) {
          console.log(chalk.dim('No workspaces found.'));
          return;
        }
        console.log(chalk.bold(`Workspaces (${workspaces.length}):`));
        for (const ws of workspaces) {
          const count = ws._count?.projects ?? '?';
          console.log(`  ${chalk.cyan(ws.name.padEnd(20))} ${chalk.dim(`(${count} projects)`)}`);
        }
        return;
      }

      const ws = await resolveWorkspaceSlug(api, slug);

      if (!environment) {
        const projects = await api.get<ListProjectDto[]>(`/workspaces/${ws.id}/projects`);
        if (projects.length === 0) {
          console.log(chalk.dim(`No projects in ${chalk.bold(ws.name)}.`));
          return;
        }
        console.log(chalk.bold(`Projects in ${ws.name} (${projects.length}):`));
        for (const p of projects) {
          const sCount = p._count?.secrets ?? '?';
          const eCount = p._count?.environments ?? '?';
          console.log(`  ${chalk.cyan(p.name.padEnd(20))} ${chalk.dim(`${sCount} secrets, ${eCount} environments`)}`);
        }
        return;
      }

      // ponytail: use resolveProject with optional --project name
      const project = await resolveProject(api, ws.id, opts?.project);
      const envId = await resolveEnvironmentId(api, project.id, environment);
      const secrets = await api.get<Array<{ id: string; key: string; version: number }>>(`/environments/${envId}/secrets`);
      if (secrets.length === 0) {
        console.log(chalk.dim(`No secrets in ${environment}.`));
        return;
      }
      console.log(chalk.bold(`Secrets in ${ws.name} / ${project.name} / ${environment} (${secrets.length}):`));
      for (const s of secrets) {
        console.log(`  ${chalk.green(s.key.padEnd(30))} ${chalk.dim(`v${s.version}`)}`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(chalk.red(`✘ ${message}`));
      process.exit(1);
    }
  });

// ─── token ────────────────────────────────────────────────────
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

const tokenCmd = program
  .command('token')
  .description('Manage API tokens for CI/CD');

tokenCmd
  .command('create')
  .description('Create a new API token')
  .argument('<workspace-slug>', 'Workspace slug')
  .argument('<name>', 'Token name')
  .addHelpText('after', '\nThe raw token is shown only once on creation.\n')
  .action(async (workspaceSlug: string, name: string) => {
    try {
      const { api } = getApi();
      const ws = await resolveWorkspaceSlug(api, workspaceSlug);
      const result = await api.post<CreateApiTokenDto>(`/workspaces/${ws.id}/tokens`, { name });
      console.log(chalk.green('✓ Token created:'));
      console.log(`  ${chalk.dim('Name:')}      ${result.name}`);
      console.log(`  ${chalk.dim('Prefix:')}    ${result.tokenPrefix}`);
      if (result.rawToken) {
        console.log(`  ${chalk.bold.yellow('Token:')}     ${chalk.bold(result.rawToken)}`);
        console.log(chalk.yellow('  ⚠  This will not be shown again. Store it safely.'));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(chalk.red(`✘ ${message}`));
      process.exit(1);
    }
  });

tokenCmd
  .command('ls')
  .description('List API tokens for a workspace')
  .argument('<workspace-slug>', 'Workspace slug')
  .action(async (workspaceSlug: string) => {
    try {
      const { api } = getApi();
      const ws = await resolveWorkspaceSlug(api, workspaceSlug);
      const tokens = await api.get<ApiTokenDto[]>(`/workspaces/${ws.id}/tokens`);
      if (tokens.length === 0) {
        console.log(chalk.dim('No API tokens for this workspace.'));
        return;
      }
      console.log(chalk.bold(`API tokens for ${ws.name}:`));
      for (const t of tokens) {
        const status = t.active ? chalk.green('active') : chalk.red('revoked');
        const lastUsed = t.lastUsedAt ? new Date(t.lastUsedAt).toLocaleDateString() : 'never';
        console.log(`  ${chalk.cyan(t.name.padEnd(20))} ${status}  prefix: ${t.tokenPrefix}  last used: ${lastUsed}`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(chalk.red(`✘ ${message}`));
      process.exit(1);
    }
  });

tokenCmd
  .command('revoke')
  .description('Revoke (deactivate) an API token')
  .argument('<workspace-slug>', 'Workspace slug')
  .argument('<token-id>', 'Token ID to revoke')
  .action(async (workspaceSlug: string, tokenId: string) => {
    try {
      const { api } = getApi();
      const ws = await resolveWorkspaceSlug(api, workspaceSlug);
      await api.del(`/workspaces/${ws.id}/tokens/${tokenId}`);
      console.log(chalk.green('✓ Token revoked'));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(chalk.red(`✘ ${message}`));
      process.exit(1);
    }
  });

// ─── diff ──────────────────────────────────────────────────────
program
  .command('diff')
  .description('Compare secrets between two environments')
  .argument('<workspace-slug>', 'Workspace slug')
  .argument('<env1>', 'First environment name')
  .argument('<env2>', 'Second environment name')
  // ponytail: --project option for multi-project workspaces
  .option('-p, --project <name>', 'Project name (required when workspace has multiple projects)')
  .option('--values', 'Include decrypted values (requires EDITOR+ role)')
  .addHelpText(
    'after',
    `
Examples:
  vaultify diff my-team staging production
  vaultify diff my-team dev staging --values
  vaultify diff my-team staging production -p my-api
`,
  )
  .action(async (workspaceSlug: string, env1: string, env2: string, opts: { project?: string; values?: boolean }) => {
    try {
      const { api } = getApi();
      const ws = await resolveWorkspaceSlug(api, workspaceSlug);
      // ponytail: use resolveProject with optional --project name
      const project = await resolveProject(api, ws.id, opts.project);
      const env1Id = await resolveEnvironmentId(api, project.id, env1);
      const env2Id = await resolveEnvironmentId(api, project.id, env2);

      const qs = `?id1=${env1Id}&id2=${env2Id}${opts.values ? '&includeValues=true' : ''}`;
      const diff = await api.get<{
        onlyInA: Array<{ key: string; value?: string }>;
        onlyInB: Array<{ key: string; value?: string }>;
        common: Array<{ key: string; same: boolean; valueA?: string; valueB?: string }>;
      }>(`/projects/${project.id}/environments/diff${qs}`);

      console.log(chalk.bold(`Diff: ${env1} ↔ ${env2}`));

      console.log(chalk.bold(`\n  Only in ${chalk.green(env1)} (${diff.onlyInA.length}):`));
      for (const item of diff.onlyInA) {
        const val = item.value ? ` = ${item.value}` : '';
        console.log(`    ${chalk.green(item.key)}${chalk.dim(val)}`);
      }

      console.log(chalk.bold(`\n  Only in ${chalk.cyan(env2)} (${diff.onlyInB.length}):`));
      for (const item of diff.onlyInB) {
        const val = item.value ? ` = ${item.value}` : '';
        console.log(`    ${chalk.cyan(item.key)}${chalk.dim(val)}`);
      }

      const changed = diff.common.filter((c) => !c.same);
      const same = diff.common.filter((c) => c.same);
      console.log(chalk.bold(`\n  Changed (${changed.length}):`));
      for (const item of changed) {
        const vA = item.valueA ? ` (${item.valueA})` : '';
        const vB = item.valueB ? ` (${item.valueB})` : '';
        console.log(`    ${chalk.yellow(item.key)}  ${env1}:${chalk.dim(vA)}  →  ${env2}:${chalk.dim(vB)}`);
      }

      if (same.length > 0) {
        console.log(chalk.dim(`\n  Unchanged: ${same.length} keys`));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(chalk.red(`✘ ${message}`));
      process.exit(1);
    }
  });

// ─── members ───────────────────────────────────────────────────
interface MemberDto {
  id: string;
  role: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

program
  .command('members')
  .description('List workspace members')
  .argument('<workspace-slug>', 'Workspace slug')
  .addHelpText(
    'after',
    `
Examples:
  vaultify members my-team
`,
  )
  .action(async (workspaceSlug: string) => {
    try {
      const { api } = getApi();
      const ws = await resolveWorkspaceSlug(api, workspaceSlug);
      const members = await api.get<MemberDto[]>(`/workspaces/${ws.id}/members`);

      if (members.length === 0) {
        console.log(chalk.dim('No members found.'));
        return;
      }

      console.log(chalk.bold(`Members of ${ws.name} (${members.length}):`));
      for (const m of members) {
        const roleColor = m.role === 'OWNER' ? chalk.yellow : m.role === 'EDITOR' ? chalk.green : chalk.dim;
        console.log(`  ${roleColor(m.role.padEnd(10))} ${chalk.bold(m.user.name.padEnd(20))} ${chalk.dim(m.user.email)}`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(chalk.red(`✘ ${message}`));
      process.exit(1);
    }
  });

// ─── secrets ───────────────────────────────────────────────────
const secretsCmd = program
  .command('secrets')
  .description('Search, reveal, and manage secrets');

secretsCmd
  .command('search')
  .description('Search secrets across a workspace')
  .argument('<workspace-slug>', 'Workspace slug')
  .argument('<query>', 'Search query (matches key names)')
  .addHelpText(
    'after',
    `
Examples:
  vaultify secrets search my-team DATABASE
  vaultify secrets search my-team API_KEY
`,
  )
  .action(async (workspaceSlug: string, query: string) => {
    try {
      const { api } = getApi();
      const ws = await resolveWorkspaceSlug(api, workspaceSlug);
      const results = await api.post<Array<{
        id: string;
        key: string;
        version: number;
        environment: { id: string; name: string; project: { name: string } };
      }>>('/secrets/search', { workspaceId: ws.id, query });

      if (results.length === 0) {
        console.log(chalk.dim(`No secrets matching "${query}" in ${ws.name}.`));
        return;
      }

      console.log(chalk.bold(`Secrets matching "${query}" (${results.length}):`));
      for (const s of results) {
        const env = s.environment;
        console.log(`  ${chalk.green(s.key.padEnd(30))} ${chalk.dim(`${env.project.name} / ${env.name}`)}  v${s.version}`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(chalk.red(`✘ ${message}`));
      process.exit(1);
    }
  });

secretsCmd
  .command('reveal')
  .description('Reveal a secret value')
  .argument('<secret-id>', 'Secret ID')
  .addHelpText(
    'after',
    `
Examples:
  vaultify secrets reveal <secret-id>
`,
  )
  .action(async (secretId: string) => {
    try {
      const { api } = getApi();
      const result = await api.post<{ id: string; key: string; value: string }>(`/secrets/${secretId}/reveal`);
      console.log(`${chalk.bold(result.key)}:`);
      console.log(`  ${chalk.green(result.value)}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(chalk.red(`✘ ${message}`));
      process.exit(1);
    }
  });

program.parse();
