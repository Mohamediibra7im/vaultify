# @vaultiify/cli

Vaultify CLI — manage secrets from your terminal.

## Install

```bash
npm install -g @vaultiify/cli
```

## Commands

| Command | Description |
|---------|-------------|
| `vaultify login <api-url>` | Authenticate with email/password, save session |
| `vaultify logout` | Clear saved session and API URL |
| `vaultify whoami` | Show current authenticated user |
| `vaultify pull <workspace> <env>` | Export secrets as `.env` file |
| `vaultify push <workspace> <env> [file]` | Import `.env` file into an environment |
| `vaultify ls [workspace] [env]` | List workspaces, projects, environments, or secrets |
| `vaultify diff <workspace> <env1> <env2>` | Compare secrets between two environments |
| `vaultify members <workspace>` | List workspace members |
| `vaultify token create <workspace> <name>` | Create an API token |
| `vaultify token ls <workspace>` | List API tokens |
| `vaultify token revoke <workspace> <token-id>` | Revoke an API token |
| `vaultify secrets search <workspace> <query>` | Search secrets by key name |
| `vaultify secrets reveal <secret-id>` | Reveal a decrypted secret value |

## Usage

```bash
# Login
vaultify login https://vaultify-api.vercel.app/api

# Pull secrets
vaultify pull my-team production
vaultify pull my-team staging -o .env.staging
vaultify pull my-team dev --resolve

# Push secrets
vaultify push my-team production .env
vaultify push my-team staging .env.staging

# List workspaces
vaultify ls

# List projects in a workspace
vaultify ls my-team

# List secrets in an environment
vaultify ls my-team production

# Diff two environments
vaultify diff my-team staging production --values

# List members
vaultify members my-team

# API tokens
vaultify token create my-team ci-deploy
vaultify token ls my-team
vaultify token revoke my-team tok_abc123

# Search secrets
vaultify secrets search my-team DATABASE

# Reveal a secret
vaultify secrets reveal sec_abc123

# Who am I?
vaultify whoami

# Logout
vaultify logout
```

## Options

### `pull`

| Flag | Description |
|------|-------------|
| `-o, --output <file>` | Output file path (default: `<environment>.env`) |
| `--resolve` | Resolve `{{ env.KEY }}` references in values |

### `diff`

| Flag | Description |
|------|-------------|
| `--values` | Include decrypted values (requires EDITOR+ role) |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VAULTIFY_TOKEN` | API token (overrides saved session) |
| `VAULTIFY_API_URL` | API base URL (overrides saved URL) |

## Configuration

Credentials are stored in `~/.vaultify/config.json`.

## License

MIT
