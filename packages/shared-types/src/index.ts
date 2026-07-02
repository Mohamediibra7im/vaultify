// ─── Enums ───────────────────────────────────────────────
export enum Role {
  OWNER = "OWNER",
  EDITOR = "EDITOR",
  VIEWER = "VIEWER",
}

// ─── Auth ────────────────────────────────────────────────
export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: UserDto;
}

export interface UserDto {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

// ─── Workspace ───────────────────────────────────────────
export interface WorkspaceDto {
  id: string;
  name: string;
  createdAt: string;
}

export interface WorkspaceMemberDto {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: Role;
  joinedAt: string;
}

// ─── Project ─────────────────────────────────────────────
export interface ProjectDto {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  createdAt: string;
}

// ─── Environment ─────────────────────────────────────────
export interface EnvironmentDto {
  id: string;
  projectId: string;
  name: string;
  createdAt: string;
}

// ─── Secret ──────────────────────────────────────────────
export interface SecretDto {
  id: string;
  environmentId: string;
  key: string;
  masked: boolean;
  version: number;
  updatedAt: string;
  createdAt: string;
}

export interface SecretRevealDto {
  id: string;
  key: string;
  value: string;
}

export interface CreateSecretDto {
  key: string;
  value: string;
}

export interface UpdateSecretDto {
  value: string;
}

// ─── Invite ──────────────────────────────────────────────
export interface InviteLinkDto {
  id: string;
  workspaceId: string;
  active: boolean;
  createdAt: string;
}

export interface InvitePreviewDto {
  workspaceName: string;
}

// ─── API Tokens ─────────────────────────────────────────
export interface ApiTokenDto {
  id: string;
  workspaceId: string;
  name: string;
  tokenPrefix: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  active: boolean;
  createdAt: string;
}

export interface CreateApiTokenDto {
  name: string;
}

export interface ApiTokenCreatedDto extends ApiTokenDto {
  rawToken: string;  // only returned once on creation
}

// ─── API ─────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}
