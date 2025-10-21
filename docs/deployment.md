# Deployment Guide (Production)

## Requirements

- Docker & Docker Compose
- Domain + valid TLS certificates (e.g., via Let's Encrypt)
- PostgreSQL (managed database recommended) or MySQL

## Environment

Create `.env` with values from `ENV_VARIABLES.md`:

```
DATABASE_URL=postgresql://user:pass@host:5432/dogerat
DB_TYPE=postgres
JWT_SECRET=change-me
CORS_ORIGIN=https://admin.example.com
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeMe123!
```

## Build & Run

```
docker-compose pull
docker-compose build
docker-compose up -d
```

## Health Checks

- Backend: `GET /api/health` expects `{ status: "ok" }`
- Frontend: `GET /` returns Angular app
- DB: `pg_isready` (Postgres) or `mysqladmin ping`

## TLS / Reverse Proxy

Use nginx or Traefik in front of `client` and `server`:

- Terminate TLS at proxy
- Proxy `/api` to backend (port 5000)
- Serve frontend on `/`

## Backups

- Schedule DB backups (pg_dump or provider backups)
- Use `scripts/backup.sh` and `scripts/rollback.sh` for quick ops

## Observability

- Aggregate logs (`logs/` volume)
- Enable container restarts (`restart: unless-stopped`)
- Add runtime metrics and alerts (recommended)

## Hardening

- Rotate `JWT_SECRET` periodically
- Enforce strong admin password policy
- Restrict CORS to exact origin
- Put backend behind VPN or allowed IPs (optional)
