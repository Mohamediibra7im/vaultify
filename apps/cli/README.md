# @vaultify/cli

**Vaultify CLI** — manage secrets from your terminal.

## Install

```bash
pnpm --filter @vaultify/cli build
```

Or link globally:

```bash
cd apps/cli && pnpm link --global
```

## Commands

| Command | Description |
|---------|-------------|
| `login <api-url>` | Authenticate with email/password, save session |
| `pull <workspace-slug> <environment>` | Export secrets as `.env` file |
| `push <workspace-slug> <environment> [file]` | Import `.env` file into an environment |
| `whoami` | Show current user info |

## Usage

```bash
# Login
vaultify login https://api.vaultify.dev/api

# Pull secrets
vaultify pull my-team production
vaultify pull my-team staging -o .env.staging
vaultify pull my-team dev --resolve

# Push secrets
vaultify push my-team production .env
vaultify push my-team staging .env.staging

# Who am I?
vaultify whoami
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VAULTIFY_TOKEN` | API token (overrides saved token) |
| `VAULTIFY_API_URL` | API base URL (overrides saved URL) |

## Configuration

Credentials are stored in `~/.vaultify/config.json`.
