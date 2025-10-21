# DogeRat Web Admin - Comprehensive Testing Guide

## 📋 Tổng quan

Hướng dẫn này mô tả chi tiết cách chạy và thực hiện testing cho toàn bộ dự án DogeRat Web Admin, đảm bảo hệ thống hoạt động ổn định với dữ liệu thực tế 100%.

## 🎯 Mục tiêu Testing

1. **Không sử dụng dữ liệu giả/mô phỏng**: Tất cả tests chạy với dữ liệu thực từ database
2. **Coverage 80%+**: Đạt độ phủ code tối thiểu 80%
3. **Integration Tests**: Test toàn bộ flow từ API đến database
4. **E2E Tests**: Test giao diện người dùng và tương tác thực tế
5. **Real Device Tests**: Test với thiết bị Android thật

## 🛠️ Công cụ Testing

### Backend Testing

- **Jest**: Test runner và assertion framework
- **Supertest**: HTTP API testing
- **PostgreSQL Test DB**: Database riêng cho testing
- **Socket.IO Client**: Test real-time communication

### Frontend Testing

- **Karma + Jasmine**: Angular testing framework
- **Protractor/Playwright**: E2E testing
- **Chrome Headless**: Browser automation

### CI/CD

- **GitHub Actions**: Automated testing pipeline
- **Docker**: Containerized test environment
- **Codecov**: Coverage reporting

## 📦 Cài đặt

### 1. Setup Test Database

```bash
# Tạo database riêng cho testing
createdb -U dogerat dogerat_test

# Hoặc trong PostgreSQL:
psql -U postgres
CREATE DATABASE dogerat_test;
CREATE USER dogerat WITH PASSWORD 'changeme';
GRANT ALL PRIVILEGES ON DATABASE dogerat_test TO dogerat;
```

### 2. Cấu hình Environment

File `.env.test` đã được tạo với cấu hình test:

```bash
# Xem cấu hình test
cat .env.test
```

### 3. Install Dependencies

```bash
# Backend dependencies
npm install

# Frontend dependencies
cd client && npm install
```

## 🧪 Chạy Tests

### Backend Tests

#### Chạy tất cả tests

```bash
npm test
```

#### Chạy tests với coverage

```bash
npm test -- --coverage
```

#### Chạy tests cụ thể

```bash
# Test authentication
npm test -- auth.routes.test

# Test devices API
npm test -- devices.routes.test

# Test screen streaming
npm test -- screen-streaming.test
```

#### Watch mode (tự động chạy lại khi code thay đổi)

```bash
npm run test:watch
```

### Frontend Tests

```bash
cd client

# Run all tests
npm test

# Run with coverage
npm test -- --code-coverage

# Run specific test
ng test --include='**/login.component.spec.ts'

# Run in headless mode (CI)
ng test --watch=false --browsers=ChromeHeadless
```

## 📊 Test Coverage

### Xem Coverage Report

Sau khi chạy tests với coverage:

```bash
# Backend coverage
open coverage/lcov-report/index.html

# Frontend coverage
cd client
open coverage/index.html
```

### Coverage Thresholds

Dự án yêu cầu:

- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%

## 🔄 Integration Tests

### Test API Endpoints với Database thực

```bash
# Các tests này tự động:
# 1. Kết nối PostgreSQL test database
# 2. Chạy migrations
# 3. Seed admin user
# 4. Thực hiện API calls
# 5. Verify kết quả từ database

npm test -- integration
```

### Test Flow cụ thể

#### 1. Authentication Flow

```bash
npm test -- auth.routes.test

# Tests:
# ✓ Register user
# ✓ Login with credentials
# ✓ Verify JWT token
# ✓ Access protected endpoints
# ✓ Token expiration
```

#### 2. Device Management Flow

```bash
npm test -- devices.routes.test

# Tests:
# ✓ List devices
# ✓ Get device details
# ✓ Send commands to device
# ✓ Device status updates
# ✓ Delete device
```

#### 3. Screen Streaming Flow

```bash
npm test -- screen-streaming.test

# Tests:
# ✓ Start screen stream
# ✓ Receive frames
# ✓ Stop stream
# ✓ Handle errors
```

## 🌐 E2E Tests

### Setup Playwright

```bash
# Install Playwright
npm install -D @playwright/test
npx playwright install

# Create test directory
mkdir -p e2e
```

### Run E2E Tests

```bash
# Start backend and frontend
docker-compose up -d

# Run E2E tests
npx playwright test

# Run with UI
npx playwright test --ui

# Run specific test
npx playwright test e2e/login.spec.ts
```

### Example E2E Test

```typescript
// e2e/login-to-dashboard.spec.ts
import { test, expect } from "@playwright/test";

test("login and view dashboard", async ({ page }) => {
  // Navigate to login
  await page.goto("http://localhost:4200/login");

  // Fill credentials
  await page.fill('input[name="username"]', "admin");
  await page.fill('input[name="password"]', "Admin@123456");

  // Click login
  await page.click('button[type="submit"]');

  // Verify redirect to dashboard
  await expect(page).toHaveURL(/.*dashboard/);

  // Verify dashboard content
  await expect(page.locator("h1")).toContainText("Dashboard");
  await expect(page.locator(".device-stats")).toBeVisible();
});
```

## 📱 Testing với Android Device Thực

### Setup

1. **Cài đặt Android App** trên thiết bị
2. **Configure connection** đến server
3. **Run integration tests**

### Test Commands

```bash
# Các lệnh test với device thật:

# 1. Kết nối device
# Device sẽ tự động kết nối khi app khởi động

# 2. Test các commands
curl -X POST http://localhost:5000/api/devices/DEVICE_ID/command \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"command": "toast", "params": {"message": "Test"}}'

# 3. Test screen streaming
curl -X POST http://localhost:5000/api/devices/DEVICE_ID/start-screen-stream \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"quality": "medium", "fps": 10}'

# 4. Test remote control
curl -X POST http://localhost:5000/api/devices/DEVICE_ID/inject-touch \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action": "down", "x": 500, "y": 1000}'
```

## 🔍 Manual Testing Checklist

### Backend APIs

- [ ] **Authentication**
  - [ ] Login với credentials đúng
  - [ ] Login với credentials sai
  - [ ] JWT token validation
  - [ ] Token expiration
  - [ ] Logout

- [ ] **Device Management**
  - [ ] List all devices
  - [ ] Filter by status (online/offline)
  - [ ] Get device details
  - [ ] Send command to device
  - [ ] Delete device
  - [ ] Device auto-reconnection

- [ ] **User Management** (Admin only)
  - [ ] Create new user
  - [ ] Update user
  - [ ] Delete user
  - [ ] Change user role
  - [ ] List users with pagination

- [ ] **Audit Trail**
  - [ ] View audit logs
  - [ ] Filter by date range
  - [ ] Filter by user
  - [ ] Filter by action
  - [ ] Export to CSV

- [ ] **File Upload**
  - [ ] Upload file
  - [ ] Download file
  - [ ] Delete file
  - [ ] Size limit validation

### Frontend UI

- [ ] **Login Page**
  - [ ] Form validation
  - [ ] Error messages
  - [ ] Remember me
  - [ ] Redirect after login

- [ ] **Dashboard**
  - [ ] Display statistics
  - [ ] Recent devices list
  - [ ] Real-time updates
  - [ ] Refresh data

- [ ] **Device List**
  - [ ] Display all devices
  - [ ] Status indicators
  - [ ] Search/filter
  - [ ] Pagination
  - [ ] Sorting

- [ ] **Device Detail**
  - [ ] Display device info
  - [ ] Send commands
  - [ ] View command history
  - [ ] View device logs
  - [ ] Real-time status updates

- [ ] **User Management**
  - [ ] Create user (modal)
  - [ ] Edit user
  - [ ] Delete user (confirmation)
  - [ ] Role-based visibility

- [ ] **Audit Trail**
  - [ ] Display logs
  - [ ] Date picker
  - [ ] Export functionality
  - [ ] Pagination

### Real-time Features

- [ ] **Socket.IO Connection**
  - [ ] Auto-connect after login
  - [ ] Auto-reconnect on disconnect
  - [ ] Event handling

- [ ] **Device Status Updates**
  - [ ] Device connected notification
  - [ ] Device disconnected notification
  - [ ] Status change in UI

- [ ] **Command Responses**
  - [ ] Receive command results
  - [ ] Display in UI
  - [ ] Error handling

### Security

- [ ] **Authentication**
  - [ ] Protected routes
  - [ ] Token expiration handling
  - [ ] Unauthorized access denied

- [ ] **Authorization**
  - [ ] Admin-only features hidden from others
  - [ ] API endpoints check roles
  - [ ] Proper error messages

- [ ] **Input Validation**
  - [ ] XSS prevention
  - [ ] SQL injection prevention
  - [ ] File upload validation

- [ ] **Rate Limiting**
  - [ ] API rate limits enforced
  - [ ] 429 status code returned
  - [ ] Proper error messages

## 🐛 Debugging Tests

### Backend Tests

```bash
# Run with verbose logging
npm test -- --verbose

# Run single test with debugging
node --inspect-brk node_modules/.bin/jest --runInBand auth.routes.test

# Check database state during tests
psql -U dogerat dogerat_test -c "SELECT * FROM users;"
```

### Frontend Tests

```bash
# Run with debugging
ng test --browsers=Chrome

# Use browser DevTools
# Tests will pause at `debugger;` statements
```

## 📈 Continuous Integration

### GitHub Actions

Workflow tự động chạy khi:

- Push code lên main/develop
- Tạo Pull Request

Steps:

1. **Lint & Type Check**: Kiểm tra code style và types
2. **Backend Tests**: Chạy Jest tests với PostgreSQL
3. **Frontend Tests**: Chạy Karma tests
4. **Build Docker**: Build images nếu tests pass
5. **Security Scan**: Scan vulnerabilities
6. **Deploy**: Deploy nếu ở main branch

### Xem CI Results

```bash
# Visit GitHub Actions tab
https://github.com/hoanganh-hue/rat-androi/actions

# Check status badge
# Add to README.md:
# ![CI Status](https://github.com/hoanganh-hue/rat-androi/workflows/CI/badge.svg)
```

## 🚀 Testing trong Production

### Health Checks

```bash
# Backend health
curl http://localhost:5000/api/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2024-10-21T05:35:52.925Z",
  "database": "connected",
  "uptime": 123456
}
```

### Monitoring

```bash
# View logs
docker-compose logs -f server

# View database connections
docker-compose exec postgres psql -U dogerat -c "SELECT * FROM pg_stat_activity;"

# View resource usage
docker stats
```

### Performance Testing

```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test API endpoint
ab -n 1000 -c 10 -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/devices

# Test with different payloads
ab -n 100 -c 5 -p data.json -T application/json \
  http://localhost:5000/api/auth/login
```

## 📝 Best Practices

1. **Sử dụng test database riêng**: Không test trên production/development DB
2. **Clean up sau mỗi test**: Xóa test data để tránh conflicts
3. **Test với dữ liệu thực**: Không mock database queries
4. **Test edge cases**: Test các trường hợp đặc biệt và errors
5. **Maintain test data**: Giữ test data nhỏ gọn và relevant
6. **Document tests**: Thêm comments giải thích test scenarios
7. **Run tests locally trước khi push**: Đảm bảo CI sẽ pass
8. **Review coverage reports**: Tìm và test code chưa được cover

## 🆘 Troubleshooting

### Test Database Connection Failed

```bash
# Check PostgreSQL is running
pg_isready -U dogerat -d dogerat_test

# Reset test database
dropdb dogerat_test
createdb dogerat_test
npm run db:migrate
```

### Tests Timeout

```bash
# Increase timeout in jest.config.js
testTimeout: 30000

# Or per test:
it('should work', async () => {
  // test code
}, 30000);
```

### Port Already in Use

```bash
# Kill process using port
lsof -ti:5000 | xargs kill -9

# Or use different port in .env.test
PORT=5001
```

## 📚 Tài liệu tham khảo

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Guide](https://github.com/visionmedia/supertest)
- [Angular Testing Guide](https://angular.io/guide/testing)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [PostgreSQL Testing Best Practices](https://www.postgresql.org/docs/current/regress.html)

---

**Lưu ý**: Tài liệu này được cập nhật liên tục. Vui lòng báo cáo issues hoặc suggest improvements!
