# @vaultify/cli

**Vaultify CLI** — manage secrets from your terminal.

## Install

```bash
npm install -g @vaultify/cli
```

## Commands

| Command | Description |
|---------|-------------|
| `vaultify login [api-url]` | Authenticate (email/password or API token). Default URL: `https://vaultify-api.vercel.app/api` |
| `vaultify login --token <token>` | Save an API token directly (for CI/CD) |
| `vaultify whoami` | Show current user info |
| `vaultify logout` | Clear saved session |
| `vaultify pull <workspace> <env> [-o file] [--resolve]` | Export secrets as `.env` file |
| `vaultify push <workspace> <env> [file]` | Import `.env` file into environment (default: `.env`) |
| `vaultify ls` | List workspaces |
| `vaultify ls <workspace>` | List projects in workspace |
| `vaultify ls <workspace> <env>` | List secrets in environment |
| `vaultify diff <workspace> <env1> <env2> [--values]` | Compare secrets between environments |
| `vaultify members <workspace>` | List workspace members |
| `vaultify token create <workspace> <name>` | Create API token (shown once) |
| `vaultify token ls <workspace>` | List API tokens |
| `vaultify token revoke <workspace> <token-id>` | Revoke API token |
| `vaultify secrets search <workspace> <query>` | Search secrets by key name |
| `vaultify secrets reveal <secret-id>` | Reveal a secret value |

## Usage

### Login

```bash
# Interactive — choose email/password or token
vaultify login

# Use custom API URL
vaultify login https://my-api.com/api

# Save a token directly (for CI/CD)
vaultify login --token your-api-token-here

# Check who you are
vaultify whoami

# Log out
vaultify logout
```

The interactive login shows:
- API URL being used (default: `https://vaultify-api.vercel.app/api`)
- Choice between email/password and API token
- Hint: where to create tokens (dashboard → Settings → API Tokens)

### Work with Secrets

```bash
# List workspaces
vaultify ls

# List projects in a workspace
vaultify ls my-team

# List secrets in an environment
vaultify ls my-team production

# Pull secrets to .env file
vaultify pull my-team production
vaultify pull my-team staging -o .env.staging
vaultify pull my-team dev --resolve

# Push .env file to environment
vaultify push my-team production .env

# Diff two environments
vaultify diff my-team staging production --values

# Search secrets
vaultify secrets search my-team DATABASE

# Reveal a secret
vaultify secrets reveal <secret-id>
```

### API Tokens

```bash
# Create a token for CI/CD
vaultify token create my-team ci-deploy

# List tokens
vaultify token ls my-team

# Revoke a token
vaultify token revoke my-team <token-id>
```

### Manage Members

```bash
vaultify members my-team
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VAULTIFY_TOKEN` | API token (overrides saved token) |
| `VAULTIFY_API_URL` | API base URL (overrides saved URL) |

## Configuration

Credentials are stored in `~/.vaultify/config.json`.
