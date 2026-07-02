<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/NestJS-11-E0234E?style=for-the-badge&logo=nestjs" alt="NestJS" />
  <img src="https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
</p>

<h1 align="center">🔐 Vaultify</h1>

<p align="center">
  <strong>Open-source secrets management for modern development teams.</strong><br/>
  Encrypt, organize, and sync environment variables across your entire stack — from local dev to production.
</p>

<p align="center">
  <a href="#-quickstart">Quickstart</a> •
  <a href="#-features">Features</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-api-reference">API Reference</a> •
  <a href="#-contributing">Contributing</a>
</p>

---

## Why Vaultify?

Teams still share secrets through Slack, WhatsApp, and email — easy to leak, impossible to audit. There's no single source of truth for what's configured in each environment. Onboarding a new teammate means manually resending a pile of `.env` values.

**Vaultify fixes this.** It provides a structured hierarchy — `Workspace → Project → Environment → Secrets` — with AES-256-GCM encryption at rest, granular RBAC, real-time sync, and a full audit trail. Think of it as a self-hostable alternative to Doppler or Infisical, built with a modern TypeScript stack.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **🔒 AES-256-GCM Encryption** | Every secret is encrypted with a unique initialization vector before storage |
| **👥 Team Workspaces** | Invite members with a single link. Granular roles: Owner, Editor, Viewer |
| **🌍 Multi-Environment** | Dev, staging, production — each isolated with independent access controls |
| **🔍 Environment Diff** | Compare secrets across environments to catch configuration drift |
| **📋 Audit Trail** | Every secret read, write, reveal, and change is logged immutably |
| **🔑 API Tokens** | Generate scoped tokens for CI/CD pipelines and automation scripts |
| **📦 .env Import/Export** | Bulk-import from `.env` files, export back out anytime |
| **🕐 Version History** | Track every secret change with full rollback capability |
| **👁️ Click-to-Reveal** | Secret values masked by default — each reveal is audit-logged |
| **🔔 Real-time Notifications** | WebSocket-powered live updates when secrets or members change |
| **🛡️ Per-Environment RBAC** | Override member roles at the environment level for fine-grained access |
| **🌐 GitHub OAuth** | One-click sign-in with GitHub alongside email/password auth |

---

## 🚀 Quickstart

### Prerequisites

- **Node.js** ≥ 22
- **pnpm** ≥ 9 — `npm install -g pnpm`
- **Docker** — for local Redis
- **Neon account** — free tier at [neon.tech](https://neon.tech)

### 1. Clone & Install

```bash
git clone https://github.com/Mohamediibra7im/vaultify.git
cd vaultify
pnpm install
```

### 2. Start Redis

```bash
docker compose up -d
```

### 3. Configure Environment

```bash
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env` with your credentials:

```env
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.neon.tech/dbname?sslmode=require"
DIRECT_URL="postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require"
REDIS_URL=redis://localhost:6379
JWT_SECRET=<run: openssl rand -base64 32>
PORT=4000
```

### 4. Initialize Database

```bash
cd apps/api
npx prisma generate
npx prisma migrate dev --name init
cd ../..
```

### 5. Launch

```bash
pnpm dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:4000/api |
| Health Check | http://localhost:4000/api/health |

---

## 🏗️ Architecture

Vaultify is a **pnpm monorepo** with three packages:

```
vaultify/
├── apps/
│   ├── web/          → Next.js 16 (App Router, React 19, Tailwind v4)
│   ├── api/          → NestJS 11 (REST API, Prisma 7, Neon PostgreSQL)
│   └── cli/          → CLI tool (planned)
├── packages/
│   └── shared-types/ → Shared TypeScript DTOs & enums
├── docs/             → Product & technical documentation
└── docker-compose.yml
```

### Data Model

```
User ──owns──→ Workspace ──has──→ Project ──has──→ Environment ──has──→ Secret
  │                │                                     │                │
  └──member──→ WorkspaceMember ──override──→ MemberEnvironment     SecretHistory
                   │
              InviteLink, ApiToken, AuditLog, Notification
```

### Tech Stack

<table>
<tr><th>Layer</th><th>Technology</th><th>Version</th></tr>
<tr><td rowspan="7"><strong>Frontend</strong></td><td>Next.js (App Router)</td><td>16</td></tr>
<tr><td>React</td><td>19</td></tr>
<tr><td>Tailwind CSS</td><td>4</td></tr>
<tr><td>shadcn/ui + Radix UI</td><td>latest</td></tr>
<tr><td>Motion (Framer Motion)</td><td>12</td></tr>
<tr><td>Sonner (toasts)</td><td>2</td></tr>
<tr><td>Socket.IO Client</td><td>4</td></tr>
<tr><td rowspan="5"><strong>Backend</strong></td><td>NestJS</td><td>11</td></tr>
<tr><td>Prisma ORM</td><td>7</td></tr>
<tr><td>Neon (Serverless PostgreSQL)</td><td>—</td></tr>
<tr><td>Redis (via ioredis)</td><td>7</td></tr>
<tr><td>Socket.IO</td><td>4</td></tr>
<tr><td rowspan="3"><strong>Auth</strong></td><td>Passport.js (JWT strategy)</td><td>—</td></tr>
<tr><td>GitHub OAuth (passport-github2)</td><td>—</td></tr>
<tr><td>bcrypt</td><td>6</td></tr>
<tr><td rowspan="2"><strong>Tooling</strong></td><td>TypeScript (strict)</td><td>5.8</td></tr>
<tr><td>pnpm workspaces</td><td>9+</td></tr>
</table>

---

## 🔒 Security

| Layer | Implementation |
|-------|---------------|
| **Encryption at rest** | AES-256-GCM with unique IV per secret value |
| **Password hashing** | bcrypt with configurable salt rounds |
| **Invite tokens** | Stored as cryptographic hashes — raw token never persisted |
| **RBAC enforcement** | Server-side role checks on every endpoint |
| **Secrets masking** | Values hidden in UI by default; each reveal is audit-logged |
| **API token scoping** | Workspace-scoped tokens for CI/CD with prefix-based identification |
| **Rate limiting** | Throttler guard on auth and invite endpoints |

---

## 📡 API Reference

All endpoints are prefixed with `/api` and require JWT authentication unless noted.

<details>
<summary><strong>🔑 Authentication</strong></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register with email, password, name |
| `POST` | `/auth/login` | Login → returns JWT |
| `GET` | `/auth/github` | GitHub OAuth redirect |
| `GET` | `/auth/github/callback` | GitHub OAuth callback |
| `GET` | `/auth/me` | Get current user profile |
| `PATCH` | `/auth/me` | Update profile name |

</details>

<details>
<summary><strong>🏢 Workspaces</strong></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/workspaces` | Create workspace |
| `GET` | `/workspaces` | List my workspaces |
| `GET` | `/workspaces/:id` | Get workspace with members & projects |
| `PATCH` | `/workspaces/:id` | Update workspace |
| `DELETE` | `/workspaces/:id` | Delete workspace |
| `GET` | `/workspaces/:id/members` | List workspace members |
| `PATCH` | `/workspaces/:id/members/:mid/role` | Update member role |
| `DELETE` | `/workspaces/:id/members/:mid` | Remove member |

</details>

<details>
<summary><strong>📁 Projects</strong></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/workspaces/:wid/projects` | Create project |
| `GET` | `/workspaces/:wid/projects` | List projects in workspace |
| `GET` | `/projects/:id` | Get project with environments |
| `PATCH` | `/projects/:id` | Update project name/description |
| `DELETE` | `/projects/:id` | Delete project |

</details>

<details>
<summary><strong>🌍 Environments</strong></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/projects/:pid/environments` | Create environment |
| `GET` | `/projects/:pid/environments` | List environments |
| `GET` | `/environments/:id` | Get environment details |
| `GET` | `/projects/:pid/environments/diff` | Compare two environments |
| `DELETE` | `/environments/:id` | Delete environment |

</details>

<details>
<summary><strong>🔐 Secrets</strong></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/environments/:eid/secrets` | List secrets (values masked) |
| `POST` | `/environments/:eid/secrets` | Create secret |
| `GET` | `/secrets/:id` | Get single secret |
| `PATCH` | `/secrets/:id` | Update secret |
| `DELETE` | `/secrets/:id` | Delete secret |
| `POST` | `/secrets/:id/reveal` | Reveal decrypted value (audit-logged) |
| `GET` | `/secrets/:id/history` | Get version history |
| `POST` | `/secrets/:id/rollback` | Rollback to previous version |
| `POST` | `/environments/:eid/secrets/import` | Import from .env format |
| `GET` | `/environments/:eid/secrets/export` | Export as .env format |

</details>

<details>
<summary><strong>🔗 Invite Links</strong></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/workspaces/:wid/invite-link` | Generate invite link |
| `POST` | `/workspaces/:wid/invite-links` | Create invite link with options |
| `GET` | `/workspaces/:wid/invite-links` | List invite links |
| `POST` | `/workspaces/:wid/invite-links/:id/revoke` | Revoke invite |
| `GET` | `/invite/:token` | Validate & preview invite |
| `POST` | `/invite/:token/accept` | Accept invite & join workspace |

</details>

<details>
<summary><strong>🛡️ Member Environment Access</strong></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/workspaces/:wid/members/:mid/environments` | List member's environment overrides |
| `PUT` | `/workspaces/:wid/members/:mid/environments/:eid` | Grant/update environment access |
| `DELETE` | `/workspaces/:wid/members/:mid/environments/:eid` | Revoke environment access |

</details>

<details>
<summary><strong>📊 Audit, Tokens & Notifications</strong></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/workspaces/:id/audit-logs` | List audit logs |
| `POST` | `/workspaces/:wid/tokens` | Create API token |
| `GET` | `/workspaces/:wid/tokens` | List API tokens |
| `DELETE` | `/workspaces/:wid/tokens/:id` | Revoke API token |
| `GET` | `/notifications` | List notifications |
| `GET` | `/notifications/unread-count` | Get unread count |
| `POST` | `/notifications/:id/read` | Mark as read |
| `POST` | `/notifications/read-all` | Mark all as read |

</details>

---

## 🛠️ Development

### Available Scripts

```bash
# Root — run everything
pnpm dev              # Start both apps in watch mode
pnpm build            # Production build
pnpm lint             # Lint all packages

# Frontend (apps/web)
pnpm --filter @vaultify/web dev
pnpm --filter @vaultify/web build

# Backend (apps/api)
pnpm --filter @vaultify/api dev
pnpm --filter @vaultify/api build
pnpm --filter @vaultify/api prisma:generate
pnpm --filter @vaultify/api prisma:migrate
pnpm --filter @vaultify/api prisma:studio
```

### Environment Variables

| Variable | Required | Description |
|----------|:--------:|-------------|
| `DATABASE_URL` | ✅ | Pooled Neon connection string (runtime) |
| `DIRECT_URL` | ✅ | Unpooled Neon connection string (migrations) |
| `REDIS_URL` | ✅ | Redis connection — `redis://localhost:6379` for local |
| `JWT_SECRET` | ✅ | 32-byte random key — `openssl rand -base64 32` |
| `PORT` | — | API port (default: `4000`) |
| `FRONTEND_URL` | — | CORS origin (default: `http://localhost:3000`) |
| `GITHUB_CLIENT_ID` | — | GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | — | GitHub OAuth app client secret |

### Design System

Vaultify uses a dark-first vault aesthetic with a premium, operational feel:

- **Background** — Near-black charcoal (`oklch(0.145 0 0)`)
- **Primary accent** — Emerald/teal (`oklch(0.596 0.145 163.2)`)
- **Cards** — Glassmorphism with `backdrop-blur-xl` and subtle border glow
- **Typography** — Inter (sans) + JetBrains Mono (code/secrets)
- **Animations** — Motion (Framer Motion v12) — fade-up on scroll, staggered children, hover effects

---

## 📖 Documentation

| Document | Contents |
|----------|----------|
| [Product Plan](./docs/product-plan.md) | Vision, phased roadmap, data model, security architecture |
| [Implementation Plan](./docs/implementation-plan.md) | Build milestones, API contracts, encryption patterns |
| [Architecture](./docs/architecture.md) | Monorepo structure, tech stack, design system |
| [Setup Guide](./docs/setup.md) | Prerequisites, environment config, running instructions |
| [API Overview](./docs/api-overview.md) | All endpoints with request/response DTOs |

---

## 🗺️ Roadmap

- [x] Monorepo with pnpm workspaces
- [x] Auth system (email/password + GitHub OAuth + JWT)
- [x] Workspace, Project, Environment CRUD
- [x] Secret CRUD with AES-256-GCM encryption
- [x] .env import/export + version history + rollback
- [x] RBAC with per-environment role overrides
- [x] Invite link system
- [x] Audit logs, API tokens, in-app notifications
- [x] Real-time WebSocket sync
- [x] Premium dark-themed dashboard & landing page
- [ ] CLI tool for CI/CD integration
- [ ] Envelope encryption (master key → workspace data key → secrets)
- [ ] Frontend test suite
- [ ] Self-hosted Docker deployment guide

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch — `git checkout -b feat/amazing-feature`
3. Commit using [Conventional Commits](https://www.conventionalcommits.org/) — `git commit -m "feat: add amazing feature"`
4. Push to the branch — `git push origin feat/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/Mohamediibra7im">Mohamed Ibrahim</a>
</p>
