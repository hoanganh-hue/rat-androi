#!/bin/bash

# DogeRat Web Admin - Comprehensive Test Runner
# This script runs all tests: Backend, Frontend, E2E, and generates reports

set -e  # Exit on error

echo "🧪 DogeRat Web Admin - Comprehensive Test Suite"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if in CI environment
CI=${CI:-false}

# Function to print colored output
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 1. Check Prerequisites
echo "1️⃣  Checking Prerequisites..."
echo ""

if ! command_exists node; then
    print_error "Node.js is not installed"
    exit 1
fi
print_status "Node.js: $(node --version)"

if ! command_exists npm; then
    print_error "npm is not installed"
    exit 1
fi
print_status "npm: $(npm --version)"

if ! command_exists psql && [ "$CI" != "true" ]; then
    print_warning "PostgreSQL client not found. Tests may fail without database."
fi

echo ""

# 2. Setup Test Environment
echo "2️⃣  Setting up Test Environment..."
echo ""

# Create test database if not in CI
if [ "$CI" != "true" ]; then
    print_status "Setting up test database..."
    
    # Check if database exists
    if psql -U dogerat -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw dogerat_test; then
        print_status "Test database already exists"
    else
        print_warning "Creating test database..."
        createdb -U dogerat dogerat_test 2>/dev/null || true
    fi
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm ci
fi

echo ""

# 3. Run Type Checking
echo "3️⃣  Running Type Check..."
echo ""
npm run check || {
    print_error "Type check failed"
    exit 1
}
print_status "Type check passed"
echo ""

# 4. Run Backend Tests
echo "4️⃣  Running Backend Tests..."
echo ""
npm test -- --coverage || {
    print_error "Backend tests failed"
    exit 1
}
print_status "Backend tests passed"
echo ""

# 5. Run Frontend Tests
echo "5️⃣  Running Frontend Tests..."
echo ""
if [ -f "client/package.json" ]; then
    cd client
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_status "Installing frontend dependencies..."
        npm ci
    fi
    
    # Run tests
    if [ "$CI" = "true" ]; then
        npm test -- --watch=false --browsers=ChromeHeadless || {
            print_error "Frontend tests failed"
            cd ..
            exit 1
        }
    else
        npm test -- --watch=false --browsers=ChromeHeadless || {
            print_warning "Frontend tests failed, but continuing..."
        }
    fi
    
    cd ..
    print_status "Frontend tests completed"
else
    print_warning "Frontend tests skipped (client directory not found)"
fi
echo ""

# 6. Generate Coverage Report
echo "6️⃣  Generating Coverage Reports..."
echo ""
print_status "Backend coverage report: coverage/lcov-report/index.html"
if [ -f "client/coverage/index.html" ]; then
    print_status "Frontend coverage report: client/coverage/index.html"
fi
echo ""

# 7. Run E2E Tests (if Playwright is installed)
echo "7️⃣  Running E2E Tests..."
echo ""
if command_exists playwright && [ -f "playwright.config.ts" ]; then
    # Check if we should run E2E tests
    if [ "$SKIP_E2E" = "true" ]; then
        print_warning "E2E tests skipped (SKIP_E2E=true)"
    else
        # Install browsers if needed
        if [ ! -d "$HOME/.cache/ms-playwright" ] && [ "$CI" != "true" ]; then
            print_status "Installing Playwright browsers..."
            npx playwright install chromium
        fi
        
        # Run E2E tests
        print_status "Starting E2E tests..."
        npx playwright test || {
            print_warning "E2E tests failed or incomplete"
        }
        print_status "E2E test report: playwright-report/index.html"
    fi
else
    print_warning "E2E tests skipped (Playwright not installed)"
    print_warning "Install with: npm install -D @playwright/test && npx playwright install"
fi
echo ""

# 8. Security Scan (if available)
echo "8️⃣  Running Security Scan..."
echo ""
if command_exists npm; then
    print_status "Running npm audit..."
    npm audit --audit-level=high || {
        print_warning "Security vulnerabilities found. Review with: npm audit"
    }
else
    print_warning "Security scan skipped"
fi
echo ""

# 9. Generate Summary
echo "9️⃣  Test Summary"
echo "=============================================="
echo ""

# Count test results
BACKEND_TESTS=$(grep -r "Tests:" coverage/lcov-report/index.html 2>/dev/null | head -1 || echo "N/A")
print_status "Backend Tests: $BACKEND_TESTS"

if [ -f "coverage/coverage-summary.json" ]; then
    BACKEND_COV=$(cat coverage/coverage-summary.json | grep -o '"lines":{"total":[0-9]*,"covered":[0-9]*,"skipped":[0-9]*,"pct":[0-9.]*}' | grep -o '"pct":[0-9.]*' | cut -d':' -f2 | head -1)
    print_status "Backend Coverage: ${BACKEND_COV}%"
fi

if [ -f "client/coverage/index.html" ]; then
    print_status "Frontend Tests: Completed"
fi

if [ -f "playwright-report/index.html" ]; then
    print_status "E2E Tests: Completed"
fi

echo ""
echo "✨ All tests completed!"
echo ""
echo "📊 View Reports:"
echo "   Backend Coverage: open coverage/lcov-report/index.html"
if [ -f "client/coverage/index.html" ]; then
    echo "   Frontend Coverage: open client/coverage/index.html"
fi
if [ -f "playwright-report/index.html" ]; then
    echo "   E2E Report: open playwright-report/index.html"
fi
echo ""

# Open reports in browser (macOS/Linux)
if [ "$CI" != "true" ] && [ "$OPEN_REPORTS" = "true" ]; then
    if command_exists open; then
        open coverage/lcov-report/index.html
    elif command_exists xdg-open; then
        xdg-open coverage/lcov-report/index.html
    fi
fi

exit 0
