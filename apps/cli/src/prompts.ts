import { select, input, password, confirm, search } from '@inquirer/prompts';
import { brand, icon, spinner } from './ui.js';
import type { VaultifyApi } from './api.js';

// ─── Interfaces ──────────────────────────────────────────────

export interface WorkspaceDto {
  id: string;
  name: string;
  slug: string;
  _count?: { projects: number };
}

export interface ProjectDto {
  id: string;
  name: string;
  workspaceId: string;
  _count?: { secrets: number; environments: number };
}

export interface EnvironmentDto {
  id: string;
  projectId: string;
  name: string;
  _count?: { secrets: number };
}

// ─── Interactive pickers ─────────────────────────────────────

export async function pickWorkspace(api: VaultifyApi): Promise<WorkspaceDto> {
  const spin = spinner('Fetching workspaces…');
  const workspaces = await api.get<WorkspaceDto[]>('/workspaces');
  spin.stop();

  if (workspaces.length === 0) {
    throw new Error('No workspaces found. Create one in the dashboard first.');
  }

  if (workspaces.length === 1) {
    console.log(`  ${icon.arrow} Workspace: ${brand.primary.bold(workspaces[0].name)}`);
    return workspaces[0];
  }

  const ws = await select({
    message: 'Select workspace',
    choices: workspaces.map((w) => ({
      name: `${w.name}${w._count ? brand.dim(` · ${w._count.projects} projects`) : ''}`,
      value: w,
    })),
    theme: inquirerTheme,
  });

  return ws;
}

export async function pickProject(api: VaultifyApi, workspaceId: string): Promise<ProjectDto> {
  const spin = spinner('Fetching projects…');
  const projects = await api.get<ProjectDto[]>(`/workspaces/${workspaceId}/projects`);
  spin.stop();

  if (projects.length === 0) {
    throw new Error('No projects found in this workspace.');
  }

  if (projects.length === 1) {
    console.log(`  ${icon.arrow} Project: ${brand.primary.bold(projects[0].name)}`);
    return projects[0];
  }

  const project = await select({
    message: 'Select project',
    choices: projects.map((p) => ({
      name: `${p.name}${p._count ? brand.dim(` · ${p._count.secrets ?? '?'} secrets, ${p._count.environments ?? '?'} envs`) : ''}`,
      value: p,
    })),
    theme: inquirerTheme,
  });

  return project;
}

export async function pickEnvironment(api: VaultifyApi, projectId: string): Promise<EnvironmentDto> {
  const spin = spinner('Fetching environments…');
  const envs = await api.get<EnvironmentDto[]>(`/projects/${projectId}/environments`);
  spin.stop();

  if (envs.length === 0) {
    throw new Error('No environments found in this project.');
  }

  if (envs.length === 1) {
    console.log(`  ${icon.arrow} Environment: ${brand.primary.bold(envs[0].name)}`);
    return envs[0];
  }

  const env = await select({
    message: 'Select environment',
    choices: envs.map((e) => ({
      name: `${e.name}${e._count ? brand.dim(` · ${e._count.secrets ?? '?'} secrets`) : ''}`,
      value: e,
    })),
    theme: inquirerTheme,
  });

  return env;
}

/** Navigate: workspace → project → environment in one flow. */
export async function pickContext(
  api: VaultifyApi,
  opts?: { skipEnv?: boolean },
): Promise<{ workspace: WorkspaceDto; project: ProjectDto; environment?: EnvironmentDto }> {
  const workspace = await pickWorkspace(api);
  const project = await pickProject(api, workspace.id);

  if (opts?.skipEnv) {
    return { workspace, project };
  }

  const environment = await pickEnvironment(api, project.id);
  return { workspace, project, environment };
}

// ─── Input helpers ───────────────────────────────────────────

export async function askInput(message: string, defaultVal?: string): Promise<string> {
  const answer = await input({
    message,
    default: defaultVal,
    theme: inquirerTheme,
  });
  return answer.trim();
}

export async function askPassword(message: string): Promise<string> {
  const answer = await password({
    message,
    mask: '*',
    theme: inquirerTheme,
  });
  return answer;
}

export async function askConfirm(message: string, defaultVal = true): Promise<boolean> {
  return confirm({
    message,
    default: defaultVal,
    theme: inquirerTheme,
  });
}

export async function askSearch<T>(
  message: string,
  items: T[],
  getLabel: (item: T) => string,
): Promise<T> {
  const result = await search({
    message,
    source: async (term) => {
      const filtered = term
        ? items.filter((item) => getLabel(item).toLowerCase().includes(term.toLowerCase()))
        : items;
      return filtered.map((item) => ({
        name: getLabel(item),
        value: item,
      }));
    },
    theme: inquirerTheme,
  });
  return result;
}

// ─── Theme ───────────────────────────────────────────────────

const inquirerTheme = {
  prefix: {
    idle: brand.primary('❯'),
    done: brand.accent('✓'),
  },
  style: {
    answer: (text: string) => brand.primary.bold(text),
    message: (text: string) => brand.white(text),
    highlight: (text: string) => brand.primary.bold(text),
  },
};
