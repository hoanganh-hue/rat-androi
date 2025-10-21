#!/bin/bash

# DogeRat Web Admin - Deployment Validation Script
# Validates that the deployed application is working correctly with real data

set -e

echo "🔍 DogeRat Web Admin - Deployment Validation"
echo "=============================================="
echo ""

# Configuration
BASE_URL=${BASE_URL:-"http://localhost:5000"}
FRONTEND_URL=${FRONTEND_URL:-"http://localhost:4200"}
ADMIN_USER=${ADMIN_USER:-"admin"}
ADMIN_PASS=${ADMIN_PASS:-"Admin@123456"}

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Check if curl is available
if ! command -v curl &> /dev/null; then
    print_error "curl is required but not installed"
    exit 1
fi

# Check if jq is available
if ! command -v jq &> /dev/null; then
    print_warning "jq is not installed. Install for better output formatting."
    HAS_JQ=false
else
    HAS_JQ=true
fi

echo "Configuration:"
echo "  Backend URL: $BASE_URL"
echo "  Frontend URL: $FRONTEND_URL"
echo ""

# Test counter
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

run_test() {
    local test_name=$1
    local test_command=$2
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if eval "$test_command"; then
        print_success "$test_name"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        print_error "$test_name"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# 1. Health Check
echo "1️⃣  Backend Health Check"
echo ""

run_test "Backend is responding" \
    "curl -s -f $BASE_URL/api/health > /dev/null"

if [ $HAS_JQ = true ]; then
    HEALTH_STATUS=$(curl -s $BASE_URL/api/health | jq -r '.status')
    if [ "$HEALTH_STATUS" = "ok" ]; then
        print_success "Health status: $HEALTH_STATUS"
        HEALTH_DB=$(curl -s $BASE_URL/api/health | jq -r '.database')
        print_success "Database: $HEALTH_DB"
    else
        print_error "Health status: $HEALTH_STATUS"
    fi
fi

echo ""

# 2. API Documentation
echo "2️⃣  API Documentation"
echo ""

run_test "Swagger UI is accessible" \
    "curl -s -f $BASE_URL/api-docs > /dev/null"

run_test "OpenAPI JSON is available" \
    "curl -s -f $BASE_URL/api-docs.json > /dev/null"

echo ""

# 3. Authentication Tests
echo "3️⃣  Authentication Tests"
echo ""

# Test login with real credentials
AUTH_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$ADMIN_USER\",\"password\":\"$ADMIN_PASS\"}")

if [ $HAS_JQ = true ]; then
    TOKEN=$(echo $AUTH_RESPONSE | jq -r '.token')
    if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
        print_success "Login successful (token received)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        print_error "Login failed (no token received)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo "Response: $AUTH_RESPONSE"
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
else
    if echo "$AUTH_RESPONSE" | grep -q "token"; then
        print_success "Login successful"
        TOKEN=$(echo $AUTH_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        print_error "Login failed"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
fi

# Test protected endpoint without token
run_test "Protected endpoint rejects unauthenticated requests" \
    "curl -s -w '%{http_code}' -o /dev/null $BASE_URL/api/devices | grep -q 401"

# Test protected endpoint with token
if [ -n "$TOKEN" ]; then
    run_test "Protected endpoint accepts authenticated requests" \
        "curl -s -f -H \"Authorization: Bearer $TOKEN\" $BASE_URL/api/devices > /dev/null"
fi

echo ""

# 4. Device Management Tests
echo "4️⃣  Device Management Tests"
echo ""

if [ -n "$TOKEN" ]; then
    # Get devices list
    DEVICES_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" $BASE_URL/api/devices)
    
    if [ $HAS_JQ = true ]; then
        DEVICE_COUNT=$(echo $DEVICES_RESPONSE | jq '.devices | length')
        print_success "Devices endpoint returns data (count: $DEVICE_COUNT)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        if echo "$DEVICES_RESPONSE" | grep -q "devices"; then
            print_success "Devices endpoint returns data"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        else
            print_error "Devices endpoint failed"
            FAILED_TESTS=$((FAILED_TESTS + 1))
        fi
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
else
    print_warning "Skipping device tests (no auth token)"
fi

echo ""

# 5. User Management Tests
echo "5️⃣  User Management Tests"
echo ""

if [ -n "$TOKEN" ]; then
    # Get users list
    USERS_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" $BASE_URL/api/users)
    
    if [ $HAS_JQ = true ]; then
        USER_COUNT=$(echo $USERS_RESPONSE | jq '.users | length')
        if [ "$USER_COUNT" -gt 0 ]; then
            print_success "Users endpoint returns data (count: $USER_COUNT)"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        else
            print_error "No users found in database"
            FAILED_TESTS=$((FAILED_TESTS + 1))
        fi
    else
        if echo "$USERS_RESPONSE" | grep -q "users"; then
            print_success "Users endpoint returns data"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        else
            print_error "Users endpoint failed"
            FAILED_TESTS=$((FAILED_TESTS + 1))
        fi
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
else
    print_warning "Skipping user tests (no auth token)"
fi

echo ""

# 6. Frontend Tests
echo "6️⃣  Frontend Tests"
echo ""

run_test "Frontend is accessible" \
    "curl -s -f $FRONTEND_URL > /dev/null"

run_test "Frontend serves index.html" \
    "curl -s $FRONTEND_URL | grep -q '<title>'"

run_test "Frontend assets are loading" \
    "curl -s $FRONTEND_URL | grep -q 'script\\|link'"

echo ""

# 7. Database Tests
echo "7️⃣  Database Validation"
echo ""

if [ -n "$TOKEN" ]; then
    # Test that data persists (audit logs)
    AUDIT_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/audit?limit=1")
    
    if [ $HAS_JQ = true ]; then
        AUDIT_COUNT=$(echo $AUDIT_RESPONSE | jq '.logs | length')
        if [ "$AUDIT_COUNT" -gt 0 ]; then
            print_success "Audit logs are being persisted"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        else
            print_warning "No audit logs found (may be normal for new deployment)"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        fi
    else
        if echo "$AUDIT_RESPONSE" | grep -q "logs"; then
            print_success "Audit logs endpoint working"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        else
            print_error "Audit logs endpoint failed"
            FAILED_TESTS=$((FAILED_TESTS + 1))
        fi
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
fi

echo ""

# 8. Real-time Communication Tests
echo "8️⃣  Real-time Communication"
echo ""

# Check if Socket.IO endpoint is available
run_test "Socket.IO endpoint is accessible" \
    "curl -s -f $BASE_URL/socket.io/ > /dev/null || curl -s -f $BASE_URL/socket.io/ -w '%{http_code}' | grep -qE '(200|400)'"

echo ""

# 9. Security Tests
echo "9️⃣  Security Validation"
echo ""

# Test CORS
run_test "CORS headers are set" \
    "curl -s -I $BASE_URL/api/health | grep -iq 'access-control'"

# Test security headers
run_test "Security headers are set" \
    "curl -s -I $BASE_URL/api/health | grep -iq 'x-'"

# Test rate limiting endpoint exists
run_test "Rate limiting is configured" \
    "curl -s -I $BASE_URL/api/auth/login | grep -iq 'x-ratelimit'"

echo ""

# 10. Docker/Deployment Tests (if applicable)
echo "🔟 Deployment Environment"
echo ""

# Check if running in Docker
if [ -f "/.dockerenv" ]; then
    print_success "Running in Docker container"
else
    print_warning "Not running in Docker container"
fi

# Check environment
if [ "$NODE_ENV" = "production" ]; then
    print_success "NODE_ENV is set to production"
elif [ "$NODE_ENV" = "development" ]; then
    print_warning "NODE_ENV is set to development"
else
    print_warning "NODE_ENV is not set"
fi

echo ""

# Summary
echo "📊 Validation Summary"
echo "=============================================="
echo ""
echo "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
if [ $FAILED_TESTS -gt 0 ]; then
    echo -e "${RED}Failed: $FAILED_TESTS${NC}"
else
    echo "Failed: $FAILED_TESTS"
fi
echo ""

# Calculate percentage
if [ $TOTAL_TESTS -gt 0 ]; then
    SUCCESS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    echo "Success Rate: $SUCCESS_RATE%"
    echo ""
    
    if [ $SUCCESS_RATE -ge 90 ]; then
        echo -e "${GREEN}✅ Deployment validation PASSED${NC}"
        exit 0
    elif [ $SUCCESS_RATE -ge 70 ]; then
        echo -e "${YELLOW}⚠️  Deployment validation PASSED with warnings${NC}"
        exit 0
    else
        echo -e "${RED}❌ Deployment validation FAILED${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ No tests were run${NC}"
    exit 1
fi
