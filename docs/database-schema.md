# Database Schema Documentation

## Overview

DogeRat Web Admin uses a relational database (PostgreSQL or MySQL) to store users, devices, logs, commands, and audit trails. The schema is managed using Sequelize-TypeScript ORM.

## Entity Relationship Diagram

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│    users    │◄────┐   │   devices    │◄────┐   │ device_logs  │
├─────────────┤     │   ├──────────────┤     │   ├──────────────┤
│ id (PK)     │     │   │ id (PK)      │     │   │ id (PK)      │
│ username    │     │   │ socket_id    │     │   │ device_id(FK)│
│ email       │     │   │ device_id    │     │   │ type         │
│ password_   │     │   │ model        │     │   │ payload      │
│   hash      │     │   │ version      │     │   │ file_path    │
│ role        │     │   │ ip           │     │   │ created_at   │
│ created_at  │     │   │ user_agent   │     │   └──────────────┘
│ updated_at  │     │   │ last_seen_at │     │
│ last_login  │     │   │ owner_user_  │     │
│   _at       │     │   │   id (FK)    │     │
└─────────────┘     │   │ created_at   │     │
      ▲             │   │ updated_at   │     │
      │             │   └──────────────┘     │
      │             │         ▲               │
      │             │         │               │
      │             │         │               │
      │             │   ┌──────────────┐     │
      │             └───┤   commands   │     │
      │                 ├──────────────┤     │
      │                 │ id (PK)      │     │
      │                 │ device_id(FK)├─────┘
      │                 │ command      │
      │                 │ params       │
      │                 │ status       │
      │                 │ response     │
      │                 │ error_msg    │
      │                 │ created_by   │───┐
      │                 │   (FK)       │   │
      │                 │ created_at   │   │
      │                 │ updated_at   │   │
      │                 │ executed_at  │   │
      │                 └──────────────┘   │
      │                                     │
      │                 ┌──────────────┐   │
      └─────────────────┤ audit_trail  │   │
                        ├──────────────┤   │
                        │ id (PK)      │   │
                        │ user_id (FK) │◄──┘
                        │ action       │
                        │ target_id    │
                        │ target_type  │
                        │ metadata     │
                        │ ip_address   │
                        │ user_agent   │
                        │ timestamp    │
                        └──────────────┘
```

## Tables

### 1. users

Stores user accounts with role-based access control (RBAC).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `username` | VARCHAR(100) | NO | - | Unique username |
| `email` | VARCHAR(255) | NO | - | Unique email address |
| `password_hash` | VARCHAR(255) | NO | - | Bcrypt hashed password (12 rounds) |
| `role` | ENUM | NO | `viewer` | User role: `admin`, `manager`, `operator`, `viewer` |
| `last_login_at` | TIMESTAMP | YES | NULL | Last login timestamp |
| `created_at` | TIMESTAMP | NO | NOW() | Record creation time |
| `updated_at` | TIMESTAMP | NO | NOW() | Last update time |

**Indexes:**
- PRIMARY KEY: `id`
- UNIQUE: `username`, `email`

**Roles:**
- `admin`: Full system access, user management, audit logs
- `manager`: View devices, read-only commands, view audit logs
- `operator`: Execute device commands, view devices
- `viewer`: Read-only access to device list

---

### 2. devices

Stores Android devices connected to the system.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `socket_id` | VARCHAR(255) | NO | - | Current Socket.IO connection ID |
| `device_id` | VARCHAR(255) | NO | - | Unique device identifier (from Android) |
| `model` | VARCHAR(255) | NO | - | Device model name |
| `version` | VARCHAR(100) | NO | - | Android version |
| `ip` | VARCHAR(45) | NO | - | Device IP address (IPv4/IPv6) |
| `user_agent` | VARCHAR(500) | YES | NULL | HTTP user agent string |
| `last_seen_at` | TIMESTAMP | YES | NULL | Last heartbeat/activity timestamp |
| `owner_user_id` | UUID | YES | NULL | Foreign key to `users.id` |
| `created_at` | TIMESTAMP | NO | NOW() | First connection time |
| `updated_at` | TIMESTAMP | NO | NOW() | Last update time |

**Indexes:**
- PRIMARY KEY: `id`
- FOREIGN KEY: `owner_user_id` → `users.id`

**Virtual Fields:**
- `isOnline`: Computed boolean (true if `last_seen_at` within 15 seconds)

---

### 3. device_logs

Stores data collected from devices (contacts, SMS, screenshots, etc.).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `device_id` | UUID | NO | - | Foreign key to `devices.id` |
| `type` | ENUM | NO | - | Log type (see below) |
| `payload` | JSON | NO | - | Log data (structured JSON) |
| `file_path` | VARCHAR(500) | YES | NULL | Path to uploaded file (if applicable) |
| `created_at` | TIMESTAMP | NO | NOW() | Log creation time |

**Indexes:**
- PRIMARY KEY: `id`
- FOREIGN KEY: `device_id` → `devices.id`
- INDEX: `device_id`, `created_at`

**Log Types (ENUM):**
- `contacts`: Contact list
- `sms`: SMS messages
- `calls`: Call logs
- `location`: GPS location
- `clipboard`: Clipboard content
- `screenshot`: Screen capture
- `camera`: Camera photo
- `audio`: Audio recording
- `gallery`: Gallery images
- `keylogger`: Keylogger data
- `apps`: Installed apps list
- `file`: Generic file upload
- `message`: Text message
- `other`: Other data

---

### 4. commands

Tracks commands sent to devices and their execution status.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `device_id` | UUID | NO | - | Foreign key to `devices.id` |
| `command` | VARCHAR(100) | NO | - | Command type (see below) |
| `params` | JSON | NO | `{}` | Command parameters |
| `status` | ENUM | NO | `pending` | Execution status (see below) |
| `response` | JSON | YES | NULL | Device response data |
| `error_message` | TEXT | YES | NULL | Error message (if failed) |
| `created_by` | UUID | NO | - | Foreign key to `users.id` (who sent the command) |
| `created_at` | TIMESTAMP | NO | NOW() | Command creation time |
| `updated_at` | TIMESTAMP | NO | NOW() | Last status update |
| `executed_at` | TIMESTAMP | YES | NULL | When the command was executed |

**Indexes:**
- PRIMARY KEY: `id`
- FOREIGN KEY: `device_id` → `devices.id`
- FOREIGN KEY: `created_by` → `users.id`
- INDEX: `device_id`, `created_at`

**Command Types:**
- Data collection: `contacts`, `sms`, `calls`, `gallery`, `clipboard`, `apps`, `all-sms`
- Camera: `main-camera`, `selfie-camera`, `screenshot`
- Audio: `microphone`, `play-audio`, `stop-audio`
- UI: `toast`, `vibrate`, `popNotification`
- Actions: `sendSms`, `open-url`
- Advanced: `keylogger-on`, `keylogger-off`, `phishing`, `encrypt`, `decrypt`, `file-explorer`

**Status Values (ENUM):**
- `pending`: Command created, not yet sent
- `sent`: Command sent to device via Socket.IO
- `ok`: Command executed successfully
- `error`: Command failed
- `timeout`: Device did not respond in time

---

### 5. audit_trail

Audit log of all user actions for security and compliance.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `user_id` | UUID | NO | - | Foreign key to `users.id` |
| `action` | VARCHAR(255) | NO | - | Action identifier (e.g., `devices.sendCommand`) |
| `target_id` | VARCHAR(255) | YES | NULL | ID of affected resource |
| `target_type` | VARCHAR(100) | YES | NULL | Type of affected resource (`device`, `user`) |
| `metadata` | JSON | NO | `{}` | Additional action context |
| `ip_address` | VARCHAR(45) | YES | NULL | User's IP address |
| `user_agent` | VARCHAR(500) | YES | NULL | User's browser user agent |
| `timestamp` | TIMESTAMP | NO | NOW() | When the action occurred |

**Indexes:**
- PRIMARY KEY: `id`
- FOREIGN KEY: `user_id` → `users.id`
- INDEX: `user_id`, `timestamp`
- INDEX: `action`, `timestamp`

**Common Actions:**
- Authentication: `auth.login`, `auth.register`
- Users: `users.list`, `users.view`, `users.create`, `users.update`, `users.delete`
- Devices: `devices.list`, `devices.view`, `devices.sendCommand`, `devices.delete`
- Audit: `audit.view`, `audit.export`

---

## Relationships

- **users ↔ devices**: One-to-many (optional). A device can optionally be assigned to a user.
- **users ↔ commands**: One-to-many. Each command is created by a user.
- **users ↔ audit_trail**: One-to-many. Each audit entry is linked to a user.
- **devices ↔ device_logs**: One-to-many. Each log belongs to a device.
- **devices ↔ commands**: One-to-many. Each command targets a device.

## Data Retention

- **device_logs**: Consider implementing periodic cleanup (e.g., delete logs older than 90 days)
- **audit_trail**: Retain for compliance period (typically 1-7 years depending on regulations)
- **commands**: Can be cleaned up after a retention period (e.g., 30 days)

## Security Considerations

1. **Password Storage**: Always use bcrypt with 10+ rounds. Never store plain text passwords.
2. **JWT Tokens**: Store `JWT_SECRET` securely. Rotate regularly.
3. **Sensitive Data**: `password_hash` should never be exposed in API responses.
4. **Audit Trail**: Log all sensitive operations for security review.
5. **Indexes**: Ensure proper indexing for performance on large datasets.

## Migration Notes

- The application uses Sequelize `sync()` for automatic schema creation/updates
- In production, consider using Sequelize migrations for controlled schema changes
- Run `npm run db:migrate` to initialize the database
- Run `npm run db:seed` to create initial admin user
- Run `npm run db:seed:demo` for demo data (development only)

