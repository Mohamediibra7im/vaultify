<p align="center">
  <img src="https://img.shields.io/badge/Next.js%2016-000?style=plastic&logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/NestJS%2011-E0234E?style=plastic&logo=nestjs" alt="NestJS 11" />
  <img src="https://img.shields.io/badge/Prisma%207-2D3748?style=plastic&logo=prisma" alt="Prisma 7" />
  <img src="https://img.shields.io/badge/TypeScript%206-3178C6?style=plastic&logo=typescript" alt="TypeScript 6" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=plastic&logo=postgresql" alt="PostgreSQL" />
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

## Problems Vaultify Solves

Teams shouldn't share `DATABASE_URL` over Slack. But most still do. Here's
what that looks like:

- **No audit trail** — when a secret leaks, you have no way to know who saw
  it or when. Was it a former employee? A compromised CI pipeline? No way to
  tell.
- **Configuration drift** — development, staging, and production environments
  get out of sync. A missing variable breaks a deployment and nobody catches
  it until pager duty calls.
- **No version history** — change a secret and the old value is gone.
  Rollback means digging through git history or hoping someone kept a backup.
- **Onboarding friction** — every new team member needs the latest `.env`
  file. Sharing it is manual, insecure, and easy to forget.
- **CI/CD exposure** — pipeline secrets visible to anyone with CI dashboard
  access, even if they shouldn't see production credentials.
- **No access control** — once someone has the `.env` file, they have
  everything. Development, staging, and production keys are all in one file.

Vaultify fixes these by giving teams a centralized, encrypted vault for
secrets with granular access control, full audit logging, and
environment-level isolation.

---

## Features

| Feature | Description |
|---------|-------------|
| **AES-256-GCM encryption** | Every secret gets a unique IV before storage |
| **Team workspaces** | Invite link system, roles (Owner / Editor / Viewer), per-environment role overrides |
| **Multi-environment** | Dev, staging, production — isolated access controls per environment |
| **Environment diff** | Compare secrets across environments, catch config drift before it hits prod |
| **Audit trail** | Every read, write, reveal, and change logged immutably |
| **API tokens** | Scoped tokens for CI/CD, prefix-based identification |
| **.env import / export** | Bulk-import from `.env` files, export back out |
| **Version history** | Every secret change tracked. Full rollback to any version |
| **Click-to-reveal** | Values masked by default. Each reveal is audit-logged |
| **Per-environment RBAC** | Override member roles at the environment level |
| **GitHub OAuth** | One-click sign-in, or email/password |
| **CLI tool** | `npm install -g @vaultiify/cli` — manage secrets from your terminal |

---

## Quickstart

### Prerequisites

- Node.js ≥ 22
- pnpm ≥ 11 (`npm install -g pnpm`)
- PostgreSQL database (Neon, RDS, or any PostgreSQL-compatible service)

```bash
git clone https://github.com/Mohamediibra7im/vaultify.git
cd vaultify
pnpm install
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env` with your database credentials and a JWT secret:

```env
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.neon.tech/dbname?sslmode=require"
DIRECT_URL="postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require"
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

## How It Works

Vaultify organizes secrets in a structured hierarchy:

```
Workspace → Project → Environment → Secret
```

- **Workspace** — top-level container for a team. Members assigned roles here.
- **Project** — a service or application (e.g. "backend-api").
- **Environment** — a deployment stage (development, staging, production).
- **Secret** — an encrypted key-value pair in a specific environment.

Each level adds isolation. A developer might have Editor access to staging
secrets but read-only access to production. Every change is tracked with
version history.

### Data model

```
User ──owns──→ Workspace ──has──→ Project ──has──→ Environment ──has──→ Secret
  │                │                                     │                │
  └──member──→ WorkspaceMember ──override──→ MemberEnvironment     SecretHistory
                   │
              InviteLink, ApiToken, AuditLog, Notification
```

---

## Security

| Layer | Implementation |
|-------|---------------|
| Encryption at rest | AES-256-GCM with unique IV per secret value |
| Password hashing | bcrypt with configurable salt rounds |
| Invite tokens | Stored as cryptographic hashes — raw token never persisted |
| RBAC enforcement | Server-side role checks on every endpoint |
| Secrets masking | Values hidden by default; each reveal is audit-logged |
| API token scoping | Workspace-scoped with prefix-based identification |
| Rate limiting | Throttler on auth and sensitive endpoints |

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
└── docs/
```

### Stack

- **Frontend:** Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · shadcn/ui + Radix
- **Backend:** NestJS 11 · Prisma 7 · Neon (serverless PostgreSQL)
- **Auth:** Passport.js (JWT) · passport-github2 · bcrypt
- **Tooling:** TypeScript 6 (strict) · pnpm workspaces

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

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Short version: fork, branch (`feat/` /
`fix/` / `chore/`), Conventional Commits, PR against `main`.

---

## License

MIT. See [LICENSE](LICENSE).

---

<p align="center">
  Made with ❤️ by <a href="https://mohamediibrahim.dev">Mohamed Ibrahim</a>
</p>
