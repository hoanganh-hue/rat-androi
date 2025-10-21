# DogeRat Web Admin - Deployment Validation Guide

## 🎯 Mục đích

Hướng dẫn này cung cấp quy trình chi tiết để validate và đảm bảo hệ thống DogeRat Web Admin hoạt động chính xác với **dữ liệu thực tế 100%** (không có mock data, demo data, hay simulated data).

## 📋 Yêu cầu

- Node.js 20+
- PostgreSQL 15+ hoặc MySQL 8+
- Docker & Docker Compose (optional nhưng recommended)
- curl (cho API testing)
- jq (optional, cho JSON parsing)

## 🚀 Quick Start Validation

### 1. Validation Script

Chạy script validation tự động:

```bash
# Basic validation
./scripts/validate-deployment.sh

# With custom URLs
BASE_URL=https://your-domain.com ./scripts/validate-deployment.sh

# With custom credentials
ADMIN_USER=admin ADMIN_PASS=YourPassword ./scripts/validate-deployment.sh
```

Script này sẽ test:

- ✅ Backend health check
- ✅ API documentation (Swagger)
- ✅ Authentication với real credentials
- ✅ Device management endpoints
- ✅ User management endpoints
- ✅ Frontend accessibility
- ✅ Database persistence
- ✅ Real-time communication (Socket.IO)
- ✅ Security headers
- ✅ Rate limiting

### 2. Manual Validation Steps

Nếu muốn test thủ công từng bước:

#### A. Backend API Validation

```bash
# 1. Health Check
curl http://localhost:5000/api/health

# Expected Response:
# {
#   "status": "ok",
#   "timestamp": "2024-10-21T05:35:52.925Z",
#   "database": "connected",
#   "uptime": 123456
# }

# 2. Login with real admin credentials
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123456"}'

# Expected Response:
# {
#   "token": "eyJhbGc...",
#   "user": {
#     "id": "...",
#     "username": "admin",
#     "email": "admin@dogerat.local",
#     "role": "admin"
#   }
# }

# Save the token for next requests
TOKEN="your-token-here"

# 3. Get devices (with real data from database)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/devices

# Expected Response:
# {
#   "devices": [
#     {
#       "id": "...",
#       "device_id": "...",
#       "model": "Samsung Galaxy S21",
#       "version": "Android 12",
#       "ip": "192.168.1.100",
#       "last_seen_at": "2024-10-21T05:30:00.000Z",
#       "isOnline": true
#     }
#   ]
# }

# 4. Get users (with real data from database)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/users

# Expected Response:
# {
#   "users": [
#     {
#       "id": "...",
#       "username": "admin",
#       "email": "admin@dogerat.local",
#       "role": "admin",
#       "created_at": "2024-10-20T00:00:00.000Z"
#     }
#   ]
# }

# 5. Get audit logs (real audit trail)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/audit

# Expected Response:
# {
#   "logs": [
#     {
#       "id": "...",
#       "user_id": "...",
#       "action": "auth.login",
#       "target_type": null,
#       "target_id": null,
#       "ip_address": "::1",
#       "user_agent": "curl/7.68.0",
#       "created_at": "2024-10-21T05:35:52.925Z"
#     }
#   ],
#   "total": 1
# }
```

#### B. Screen Streaming Validation

```bash
# 1. Start screen stream (requires real connected device)
curl -X POST "http://localhost:5000/api/devices/DEVICE_ID/start-screen-stream" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"quality":"medium","fps":10}'

# Expected Response:
# {
#   "message": "Screen stream started",
#   "deviceId": "..."
# }

# 2. Stop screen stream
curl -X POST "http://localhost:5000/api/devices/DEVICE_ID/stop-screen-stream" \
  -H "Authorization: Bearer $TOKEN"

# Expected Response:
# {
#   "message": "Screen stream stopped"
# }
```

#### C. Remote Control Validation

```bash
# 1. Inject touch event
curl -X POST "http://localhost:5000/api/devices/DEVICE_ID/inject-touch" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"down","x":500,"y":1000}'

# Expected Response:
# {
#   "message": "Touch event sent"
# }

# 2. Inject keyboard input
curl -X POST "http://localhost:5000/api/devices/DEVICE_ID/inject-keyboard" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello World"}'

# Expected Response:
# {
#   "message": "Keyboard event sent"
# }
```

#### D. Frontend Validation

```bash
# 1. Check frontend is accessible
curl http://localhost:4200

# Should return HTML with Angular app

# 2. Check if frontend loads correctly
# Open in browser: http://localhost:4200

# 3. Test login flow
# - Navigate to /login
# - Enter credentials: admin / Admin@123456
# - Should redirect to /dashboard

# 4. Test dashboard displays real data
# - Statistics should show actual device counts from database
# - Device list should show real devices (or empty if none connected)

# 5. Test real-time updates
# - When a device connects, dashboard should update immediately
# - No refresh needed
```

## 🔍 Data Verification

### 1. Database Verification

Kết nối trực tiếp vào database để verify data:

```bash
# PostgreSQL
psql -U dogerat -d dogerat

# Check users table (should have admin user)
SELECT id, username, email, role, created_at FROM users;

# Check devices table (should have real device data)
SELECT id, device_id, model, version, ip, last_seen_at FROM devices;

# Check audit logs (should have real activity logs)
SELECT id, action, target_type, ip_address, created_at
FROM audit_trail
ORDER BY created_at DESC
LIMIT 10;

# Check commands table (should have real command history)
SELECT id, device_id, command_type, status, created_at
FROM commands
ORDER BY created_at DESC
LIMIT 10;
```

### 2. No Mock Data Verification

Verify rằng không có mock/demo data:

```bash
# Search for mock data patterns
grep -r "mock\|fake\|dummy\|test\|demo" server/scripts/ --include="*.ts" \
  | grep -v "node_modules" \
  | grep -v ".test.ts"

# Should not find any seed-demo-data.ts or similar files

# Check package.json for demo scripts
grep "demo\|seed:demo" package.json

# Should not find any demo-related scripts
```

### 3. Real Device Connection Test

Test với Android device thật:

```bash
# 1. Install DogeRat app trên Android device
# 2. Configure server URL trong app
# 3. Start app và verify connection

# 4. Check backend logs
docker-compose logs -f server

# Should see:
# ✅ Device connected: [device_id]

# 5. Verify trong admin panel
# - Go to http://localhost:4200/devices
# - Should see device với status "Online"
# - Device info should show real data (model, Android version, IP, etc.)

# 6. Send command to device
curl -X POST "http://localhost:5000/api/devices/DEVICE_ID/command" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "command": "toast",
    "params": {
      "message": "Test from Admin Panel"
    }
  }'

# Device should show toast notification
# Command should be logged in database
```

## 📊 Performance Validation

### 1. API Response Times

```bash
# Test API performance
for i in {1..10}; do
  time curl -s -H "Authorization: Bearer $TOKEN" \
    http://localhost:5000/api/devices > /dev/null
done

# Should average < 200ms
```

### 2. Database Query Performance

```sql
-- Check query performance
EXPLAIN ANALYZE
SELECT * FROM devices
WHERE last_seen_at > NOW() - INTERVAL '5 minutes';

-- Should execute in < 50ms
```

### 3. WebSocket Performance

```bash
# Monitor Socket.IO connections
# In browser DevTools > Network > WS tab
# Should see:
# - Connection established < 1s
# - Ping/pong every 30s
# - No disconnections
```

## 🔒 Security Validation

### 1. Authentication

```bash
# Test without token (should fail)
curl -w "%{http_code}" http://localhost:5000/api/devices

# Expected: 401 Unauthorized

# Test with invalid token (should fail)
curl -w "%{http_code}" \
  -H "Authorization: Bearer invalid-token" \
  http://localhost:5000/api/devices

# Expected: 401 Unauthorized
```

### 2. Authorization

```bash
# Create viewer user
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "viewer",
    "email": "viewer@test.com",
    "password": "Viewer@123",
    "role": "viewer"
  }'

# Login as viewer
VIEWER_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"viewer","password":"Viewer@123"}')

VIEWER_TOKEN=$(echo $VIEWER_RESPONSE | jq -r '.token')

# Try to create user as viewer (should fail)
curl -w "%{http_code}" -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer $VIEWER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "hacker",
    "email": "hacker@test.com",
    "password": "Hack@123",
    "role": "admin"
  }'

# Expected: 403 Forbidden
```

### 3. Rate Limiting

```bash
# Send many requests quickly
for i in {1..150}; do
  curl -s -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"wrong"}' &
done

# Should see 429 Too Many Requests after ~100 requests
```

## ✅ Validation Checklist

### Backend

- [ ] Health endpoint returns OK status
- [ ] Database connection is successful
- [ ] Admin user exists and can login
- [ ] All API endpoints are accessible with auth
- [ ] Protected endpoints reject unauthenticated requests
- [ ] Role-based authorization works correctly
- [ ] Audit logs are being created for all actions
- [ ] Screen streaming endpoints work (with real device)
- [ ] Remote control endpoints work (with real device)
- [ ] Socket.IO connection establishes successfully
- [ ] Rate limiting is enforced
- [ ] Security headers are set
- [ ] Input validation prevents invalid data
- [ ] Error handling returns proper status codes

### Frontend

- [ ] Frontend is accessible at port 4200/80
- [ ] Login page displays correctly
- [ ] Login works with real credentials
- [ ] Dashboard shows real statistics from database
- [ ] Device list shows real devices (or empty state)
- [ ] Device detail page works
- [ ] User management works (admin only)
- [ ] Audit trail displays real logs
- [ ] Real-time updates work (Socket.IO)
- [ ] Logout works correctly
- [ ] Responsive design works on mobile
- [ ] Dark theme is applied consistently

### Database

- [ ] Users table has admin user (no demo users)
- [ ] Devices table is empty or has real devices only
- [ ] Commands table is empty or has real command history
- [ ] Audit_trail table logs all activities
- [ ] No mock/demo/fake data in any table
- [ ] Foreign key constraints are working
- [ ] Indexes are created for performance

### Docker & Deployment

- [ ] Docker Compose starts all services
- [ ] PostgreSQL container is healthy
- [ ] Server container is healthy
- [ ] Client container is healthy
- [ ] Ngrok tunnel is working (if configured)
- [ ] Volumes persist data correctly
- [ ] Environment variables are loaded
- [ ] Logs are being written to volumes

### Real Device Testing

- [ ] Android app can connect to server
- [ ] Device appears in admin panel when connected
- [ ] Device status updates in real-time
- [ ] Commands can be sent to device
- [ ] Command results are received
- [ ] Screen streaming works
- [ ] Remote control (touch/keyboard) works
- [ ] Device disconnection is detected

## 🎯 Success Criteria

Hệ thống được coi là **hoạt động ổn định với dữ liệu thực tế 100%** khi:

1. ✅ **Không có mock/demo data**: Tất cả data đều từ database thực
2. ✅ **Authentication hoạt động**: Login với real credentials từ database
3. ✅ **Authorization hoạt động**: Role-based permissions được enforce
4. ✅ **API endpoints hoạt động**: Tất cả endpoints trả về data từ database
5. ✅ **Real-time updates hoạt động**: Socket.IO updates khi có thay đổi
6. ✅ **Frontend hiển thị data thực**: Dashboard, device list, etc. show real data
7. ✅ **Audit logging hoạt động**: Mọi action được log vào database
8. ✅ **Device connection hoạt động**: Real Android devices có thể connect
9. ✅ **Commands hoạt động**: Commands gửi đến real devices và nhận kết quả
10. ✅ **Security hoạt động**: Auth, authorization, rate limiting, validation

## 📝 Troubleshooting

### Issue: Database connection failed

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Verify credentials
psql -U dogerat -d dogerat -h localhost
```

### Issue: No devices showing up

```bash
# Check if devices are in database
psql -U dogerat -d dogerat -c "SELECT * FROM devices;"

# Check Socket.IO logs
docker-compose logs -f server | grep "Device connected"

# Verify Android app configuration
# Server URL should be: http://your-server-ip:5000
```

### Issue: Authentication not working

```bash
# Verify admin user exists
psql -U dogerat -d dogerat -c "SELECT * FROM users WHERE role='admin';"

# Reset admin password
npm run db:seed

# Check JWT secret is set
docker-compose exec server printenv | grep JWT_SECRET
```

## 📚 Additional Resources

- [TESTING_GUIDE.md](TESTING_GUIDE.md) - Comprehensive testing guide
- [HUONG_DAN_DEPLOYMENT.md](HUONG_DAN_DEPLOYMENT.md) - Deployment guide
- [BAO_CAO_PHAN_TICH_DU_AN.md](BAO_CAO_PHAN_TICH_DU_AN.md) - Project analysis
- [API Documentation](http://localhost:5000/api-docs) - Swagger UI

---

**Lưu ý**: Tài liệu này được tạo để đảm bảo hệ thống hoạt động 100% với dữ liệu thực tế, không có mock/demo data. Mọi test phải pass để đảm bảo production readiness.
