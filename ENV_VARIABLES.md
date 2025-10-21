# Environment Variables Documentation

This document describes all environment variables used in the DogeRat Web Admin application.

## Quick Setup

Copy the example below into a `.env` file in the project root:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
HOST=0.0.0.0

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:4200
CORS_ORIGIN=http://localhost:4200

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/dogerat
DB_TYPE=postgres

# JWT Configuration
JWT_SECRET=change-this-to-a-random-secret-key-in-production
JWT_EXPIRY=24h

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=52428800
UPLOAD_DIR=./uploads

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/server.log

# Socket.IO
SOCKET_PING_INTERVAL=30000
SOCKET_PING_TIMEOUT=60000

# Admin User (for first-time setup)
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@dogerat.local
ADMIN_PASSWORD=changeme

# Optional: Telegram Bot (legacy support)
DISABLE_TELEGRAM=true
```

## Variable Descriptions

### Server Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `NODE_ENV` | string | `development` | Application environment (`development`, `production`, `test`) |
| `PORT` | number | `5000` | Port number for the server to listen on |
| `HOST` | string | `0.0.0.0` | Host address to bind the server to |

### Frontend & CORS

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `FRONTEND_URL` | string | `http://localhost:4200` | URL of the Angular frontend application |
| `CORS_ORIGIN` | string | `*` | Allowed CORS origin(s). Use specific URL in production |

### Database

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `DATABASE_URL` | string | **Required** | Full database connection string (PostgreSQL or MySQL) |
| `DB_TYPE` | string | `postgres` | Database type: `postgres` or `mysql` |
| `MYSQL_URL` | string | Optional | Alternative MySQL connection string |

**PostgreSQL Example**:
```
DATABASE_URL=postgresql://username:password@localhost:5432/dogerat
```

**MySQL Example**:
```
DATABASE_URL=mysql://username:password@localhost:3306/dogerat
DB_TYPE=mysql
```

### Authentication & Security

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `JWT_SECRET` | string | **Required** | Secret key for signing JWT tokens. **Must be changed in production!** |
| `JWT_EXPIRY` | string | `24h` | JWT token expiration time (e.g., `1h`, `7d`, `30d`) |
| `RATE_LIMIT_WINDOW_MS` | number | `900000` | Rate limit window in milliseconds (15 minutes default) |
| `RATE_LIMIT_MAX_REQUESTS` | number | `100` | Maximum number of requests per window per IP |

**⚠️ Security Warning**: Never commit the actual `.env` file to version control. Always use a strong, randomly generated `JWT_SECRET` in production.

### File Upload

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `MAX_FILE_SIZE` | number | `52428800` | Maximum upload file size in bytes (50MB default) |
| `UPLOAD_DIR` | string | `./uploads` | Directory path for storing uploaded files |

### Logging

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `LOG_LEVEL` | string | `info` | Logging level: `error`, `warn`, `info`, `verbose`, `debug`, `silly` |
| `LOG_FILE` | string | `./logs/server.log` | Path to the log file |

### Socket.IO

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `SOCKET_PING_INTERVAL` | number | `30000` | Interval (ms) between heartbeat pings to connected devices |
| `SOCKET_PING_TIMEOUT` | number | `60000` | Timeout (ms) before considering a device disconnected |

### Initial Admin Setup

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `ADMIN_USERNAME` | string | `admin` | Default admin username (first user only) |
| `ADMIN_EMAIL` | string | `admin@dogerat.local` | Default admin email |
| `ADMIN_PASSWORD` | string | `changeme` | Default admin password. **Change immediately!** |

### Legacy Support

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `DISABLE_TELEGRAM` | boolean | `true` | Disable legacy Telegram bot integration |
| `TELEGRAM_BOT_TOKEN` | string | Optional | Telegram bot token (if legacy support needed) |

## Production Configuration

For production deployments, ensure you:

1. **Set `NODE_ENV=production`**
2. **Use a strong, random `JWT_SECRET`** (use `openssl rand -base64 64` to generate)
3. **Configure specific `CORS_ORIGIN`** (not `*`)
4. **Enable database SSL** if required by your provider
5. **Use environment-specific secrets management** (AWS Secrets Manager, HashiCorp Vault, etc.)
6. **Set strong `ADMIN_PASSWORD`** and change it after first login

### Example Production Configuration

```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://admin.yourdomain.com
CORS_ORIGIN=https://admin.yourdomain.com
DATABASE_URL=postgresql://user:pass@prod-db.example.com:5432/dogerat?sslmode=require
JWT_SECRET=<your-strong-random-secret-here>
JWT_EXPIRY=12h
RATE_LIMIT_MAX_REQUESTS=50
LOG_LEVEL=warn
```

## Docker Deployment

When using Docker Compose, these variables can be set in a `.env` file at the project root, and they will be automatically loaded. See `docker-compose.yml` for details.

## Environment Variable Loading

The application loads environment variables in the following order:

1. System environment variables
2. `.env` file in project root
3. Default values in code

Variables defined earlier in this list take precedence over later ones.

