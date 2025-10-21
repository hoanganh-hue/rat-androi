# Security Best Practices

## Authentication & Authorization

- Use strong `JWT_SECRET` (>= 32 bytes), rotate periodically
- Shorten token lifetime if possible (e.g., 12h)
- Enforce RBAC (admin, manager, operator, viewer) at route level

## Data Protection

- Enforce HTTPS in production
- Sanitize user input (express-validator) and audit sensitive actions
- Hash passwords with bcrypt (>=10 rounds)

## API Hardening

- Rate limit (`express-rate-limit`) on `/api` and auth routes
- CORS set to exact origin, not `*`
- Helmet security headers enabled

## Secrets & Config

- Never commit secrets to repo
- Use environment variables and secret managers
- Regularly audit dependencies (`npm audit` in CI)

## Logging & Audit

- Use structured logging (Winston)
- Keep audit logs immutable and exportable
- Alert on suspicious actions (failed logins, brute force)
