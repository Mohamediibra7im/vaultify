<p align="center">
  <img src="https://img.shields.io/badge/Next.js%2016-000?style=plastic&logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/NestJS%2011-E0234E?style=plastic&logo=nestjs" alt="NestJS 11" />
  <img src="https://img.shields.io/badge/Prisma%207-2D3748?style=plastic&logo=prisma" alt="Prisma 7" />
  <img src="https://img.shields.io/badge/TypeScript%206-3178C6?style=plastic&logo=typescript" alt="TypeScript 6" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=plastic&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis%207-DC382D?style=plastic&logo=redis" alt="Redis 7" />
  <img src="https://img.shields.io/badge/Tailwind%20CSS%204-06B6D4?style=plastic&logo=tailwindcss" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/pnpm-F69220?style=plastic&logo=pnpm" alt="pnpm" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=plastic" alt="MIT License" />
</p>

# Vaultify

**Zero-knowledge secrets management for teams that ship.**

Encrypt, organize, and sync environment variables across workspaces, projects,
and environments — from local dev to production. Self-hosted alternative to
Doppler or Infisical.

---

## The short version

Teams shouldn't share `DATABASE_URL` over Slack. Vaultify gives you a
structured hierarchy — `Workspace → Project → Environment → Secret` — with
AES-256-GCM encryption at rest, granular RBAC, real-time WebSocket sync, and
an immutable audit trail for every read, write, and reveal.

---

## Features

| Area | What it does |
|------|-------------|
| **AES-256-GCM encryption** | Every secret gets a unique IV before storage. Key management is yours. |
| **Team workspaces** | Invite link system, roles (Owner / Editor / Viewer), per-environment role overrides |
| **Multi-environment** | Dev, staging, production — isolated access controls per environment |
| **Environment diff** | Compare secrets across environments, catch config drift before it hits prod |
| **Audit trail** | Every read, write, reveal, and change logged immutably. Who saw what, when. |
| **API tokens** | Scoped tokens for CI/CD. Prefix-based identification, workspace-scoped. |
| **.env import / export** | Bulk-import from `.env` files, export back out. Works both directions. |
| **Version history** | Every secret change tracked. Full rollback to any previous version. |
| **Click-to-reveal** | Values masked by default. Each reveal is audit-logged. |
| **Real-time notifications** | WebSocket push when secrets or members change. |
| **Per-environment RBAC** | Override member roles at the environment level. Fine-grained, not all-or-nothing. |
| **GitHub OAuth** | One-click sign-in. Email/password also available. |
| **CLI tool** | `npm install -g @vaultiify/cli` — manage secrets from your terminal for CI/CD pipelines |
| **Secret versioning** | Track history, diff versions, rollback any secret |

---

## Quickstart

### Prerequisites

- Node.js ≥ 22
- pnpm ≥ 11 (`npm install -g pnpm`)
- Docker (for local Redis)
- [Neon](https://neon.tech) account (free tier works)

```bash
git clone https://github.com/Mohamediibra7im/vaultify.git
cd vaultify
pnpm install
docker compose up -d
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env`:

```env
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.neon.tech/dbname?sslmode=require"
DIRECT_URL="postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require"
REDIS_URL=redis://localhost:6379
JWT_SECRET=<run: openssl rand -base64 32>
PORT=4000
```

```bash
cd apps/api
npx prisma generate
npx prisma migrate dev --name init
cd ../..
pnpm dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:4000/api |
| Health | http://localhost:4000/api/health |

---

## Architecture

```
vaultify/
├── apps/
│   ├── web/          Next.js 16 dashboard + public site
│   ├── api/          NestJS 11 REST API + Prisma + PostgreSQL
│   └── cli/          TypeScript CLI (Commander + Chalk)
├── packages/
│   └── shared-types/ Shared DTOs, enums, types
├── docs/
└── docker-compose.yml  (Redis 7 only — DB is Neon)
```

### Data model

```
User ──owns──→ Workspace ──has──→ Project ──has──→ Environment ──has──→ Secret
  │                │                                  │                │
  └──member──→ WorkspaceMember ──override──→ MemberEnvironment    SecretHistory
                   │
              InviteLink, ApiToken, AuditLog, Notification
```

### Stack

- **Frontend:** Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · shadcn/ui + Radix · Motion 12 · Socket.IO Client
- **Backend:** NestJS 11 · Prisma 7 · Neon (serverless PostgreSQL) · Redis 7 · Socket.IO
- **Auth:** Passport.js (JWT) · passport-github2 · bcrypt
- **Tooling:** TypeScript 6 (strict) · pnpm workspaces

---

## Security

Every layer has one job: make sure the wrong person never sees a plaintext
secret, and if they do (compromised host, etc.), you know exactly when and how.

| Layer | Implementation |
|-------|---------------|
| Encryption at rest | AES-256-GCM, unique IV per secret value |
| Password hashing | bcrypt, configurable salt rounds |
| Invite tokens | Stored as cryptographic hashes — raw token never hits the DB |
| RBAC | Server-side check on every endpoint, not trust-the-client |
| Secrets masking | Hidden in UI by default, each reveal logged |
| API tokens | Workspace-scoped, prefix-based identification |
| Rate limiting | ThrottlerGuard on auth + invite endpoints |

---

## API

All endpoints under `/api`. JWT auth required unless noted.

<details>
<summary><strong>Auth</strong></summary>

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Register (email, password, name) |
| POST | `/auth/login` | Login → JWT |
| GET | `/auth/github` | GitHub OAuth redirect |
| GET | `/auth/github/callback` | GitHub OAuth callback |
| GET | `/auth/me` | Current user profile |
| PATCH | `/auth/me` | Update profile name |
</details>

<details>
<summary><strong>Workspaces</strong></summary>

| Method | Path | Description |
|--------|------|-------------|
| POST | `/workspaces` | Create |
| GET | `/workspaces` | List mine |
| GET | `/workspaces/:id` | Get + members + projects |
| PATCH | `/workspaces/:id` | Update |
| DELETE | `/workspaces/:id` | Delete |
| GET | `/workspaces/:id/members` | List members |
| PATCH | `/workspaces/:id/members/:mid/role` | Update role |
| DELETE | `/workspaces/:id/members/:mid` | Remove member |
</details>

<details>
<summary><strong>Projects</strong></summary>

| Method | Path | Description |
|--------|------|-------------|
| POST | `/workspaces/:wid/projects` | Create |
| GET | `/workspaces/:wid/projects` | List in workspace |
| GET | `/projects/:id` | Get + environments |
| PATCH | `/projects/:id` | Update name/description |
| DELETE | `/projects/:id` | Delete |
</details>

<details>
<summary><strong>Environments</strong></summary>

| Method | Path | Description |
|--------|------|-------------|
| POST | `/projects/:pid/environments` | Create |
| GET | `/projects/:pid/environments` | List |
| GET | `/environments/:id` | Get details |
| GET | `/projects/:pid/environments/diff` | Compare two environments |
| DELETE | `/environments/:id` | Delete |
</details>

<details>
<summary><strong>Secrets</strong></summary>

| Method | Path | Description |
|--------|------|-------------|
| GET | `/environments/:eid/secrets` | List (values masked) |
| POST | `/environments/:eid/secrets` | Create |
| GET | `/secrets/:id` | Get single |
| PATCH | `/secrets/:id` | Update |
| DELETE | `/secrets/:id` | Delete |
| POST | `/secrets/:id/reveal` | Decrypt + reveal (logged) |
| GET | `/secrets/:id/history` | Version history |
| POST | `/secrets/:id/rollback` | Rollback to previous version |
| POST | `/environments/:eid/secrets/import` | Import .env format |
| GET | `/environments/:eid/secrets/export` | Export .env format |
</details>

<details>
<summary><strong>Invite Links</strong></summary>

| Method | Path | Description |
|--------|------|-------------|
| POST | `/workspaces/:wid/invite-links` | Create with options |
| GET | `/workspaces/:wid/invite-links` | List |
| POST | `/workspaces/:wid/invite-links/:id/revoke` | Revoke |
| GET | `/invite/:token` | Validate + preview |
| POST | `/invite/:token/accept` | Accept + join |
</details>

<details>
<summary><strong>Member Environment Access</strong></summary>

| Method | Path | Description |
|--------|------|-------------|
| GET | `/workspaces/:wid/members/:mid/environments` | List overrides |
| PUT | `/workspaces/:wid/members/:mid/environments/:eid` | Grant/update |
| DELETE | `/workspaces/:wid/members/:mid/environments/:eid` | Revoke |
</details>

<details>
<summary><strong>Audit, Tokens, Notifications</strong></summary>

| Method | Path | Description |
|--------|------|-------------|
| GET | `/workspaces/:id/audit-logs` | List audit logs |
| POST | `/workspaces/:wid/tokens` | Create API token |
| GET | `/workspaces/:wid/tokens` | List tokens |
| DELETE | `/workspaces/:wid/tokens/:id` | Revoke token |
| GET | `/notifications` | List notifications |
| GET | `/notifications/unread-count` | Unread count |
| POST | `/notifications/:id/read` | Mark read |
| POST | `/notifications/read-all` | Mark all read |
</details>

---

## Development

```bash
pnpm dev                  # All services in watch mode
pnpm build                # Production build (web only)
pnpm build:all            # Build everything
pnpm lint                 # Lint all packages

# Frontend only
pnpm --filter @vaultify/web dev
pnpm --filter @vaultify/web build

# Backend only
pnpm --filter @vaultify/api dev
pnpm --filter @vaultify/api build
pnpm --filter @vaultify/api prisma:generate
pnpm --filter @vaultify/api prisma:migrate
pnpm --filter @vaultify/api prisma:studio

# CLI
pnpm --filter @vaultiify/cli build
```

### Environment variables

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | Yes | Pooled Neon connection string |
| `DIRECT_URL` | Yes | Unpooled (for migrations) |
| `REDIS_URL` | Yes | `redis://localhost:6379` locally |
| `JWT_SECRET` | Yes | `openssl rand -base64 32` |
| `PORT` | No | Default 4000 |
| `FRONTEND_URL` | No | CORS origin, default `http://localhost:3000` |
| `GITHUB_CLIENT_ID` | No | For GitHub OAuth |
| `GITHUB_CLIENT_SECRET` | No | For GitHub OAuth |
| `CONTACT_EMAIL` | No | Contact form recipient |

---

## Design

Dark-first vault aesthetic. Not flashy — operational.

- **Background:** Near-black charcoal `oklch(0.145 0 0)`
- **Accent:** Emerald/teal `oklch(0.596 0.145 163.2)`
- **Cards:** Glassmorphism, `backdrop-blur-xl`, subtle border glow
- **Fonts:** Inter (UI) + JetBrains Mono (secrets/code)
- **Animation:** Motion v12 — fade-up on scroll, staggered children, hover states

---

## Roadmap

- [x] pnpm monorepo
- [x] Auth (email/password + GitHub OAuth + JWT)
- [x] Workspace, Project, Environment CRUD
- [x] Secret CRUD + AES-256-GCM encryption
- [x] .env import/export + version history + rollback
- [x] RBAC with per-environment overrides
- [x] Invite links
- [x] Audit logs, API tokens, notifications
- [x] Real-time WebSocket sync
- [x] Dark dashboard + landing page
- [x] CLI tool
- [ ] Envelope encryption (master key → workspace key → secrets)
- [ ] Frontend test suite
- [ ] Self-hosted Docker deployment guide

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Short version: fork, branch (`feat/` /
`fix/` / `chore/`), Conventional Commits, PR against `main`.

---

## License

MIT. See [LICENSE](LICENSE).

---

<p align="center">
  <a href="https://github.com/Mohamediibra7im/vaultify">Mohamed Ibrahim</a>
</p>
