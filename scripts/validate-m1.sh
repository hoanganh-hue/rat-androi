#!/bin/bash
# Quick validation script for M1 transformation
# Checks Docker configs, API specs, and security settings

set -e  # Exit on error

echo "🔍 DogeRat M1 Transformation Validation"
echo "========================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check functions
check_pass() {
    echo -e "${GREEN}✓${NC} $1"
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# 1. Check Docker files exist
echo "📦 Checking Docker configurations..."
if [ -f "server/Dockerfile" ]; then
    # Check for non-root user
    if grep -q "USER nodejs" server/Dockerfile; then
        check_pass "Server Dockerfile uses non-root user"
    else
        check_fail "Server Dockerfile missing non-root user"
    fi
    
    # Check for multi-stage build
    if grep -q "FROM.*AS builder" server/Dockerfile; then
        check_pass "Server Dockerfile uses multi-stage build"
    else
        check_warn "Server Dockerfile should use multi-stage build"
    fi
else
    check_fail "server/Dockerfile not found"
fi

if [ -f "client/Dockerfile" ]; then
    if grep -q "USER nginx" client/Dockerfile; then
        check_pass "Client Dockerfile uses non-root user"
    else
        check_fail "Client Dockerfile missing non-root user"
    fi
else
    check_fail "client/Dockerfile not found"
fi

echo ""

# 2. Check nginx security headers
echo "🔒 Checking nginx security headers..."
if [ -f "client/nginx.conf" ]; then
    headers=(
        "X-Frame-Options"
        "X-Content-Type-Options"
        "X-XSS-Protection"
        "Content-Security-Policy"
        "Referrer-Policy"
    )
    
    for header in "${headers[@]}"; do
        if grep -q "$header" client/nginx.conf; then
            check_pass "nginx.conf has $header"
        else
            check_fail "nginx.conf missing $header"
        fi
    done
else
    check_fail "client/nginx.conf not found"
fi

echo ""

# 3. Check Zero-Trust configurations
echo "🔐 Checking Zero-Trust configurations..."
if [ -f "cloudflared.yml" ]; then
    check_pass "Cloudflare Tunnel config exists"
else
    check_warn "cloudflared.yml not found (optional)"
fi

if [ -f "docker-compose.tailscale.yml" ]; then
    check_pass "Tailscale config exists"
else
    check_warn "docker-compose.tailscale.yml not found (optional)"
fi

# Check that ngrok is removed from main docker-compose
if [ -f "docker-compose.yml" ]; then
    if grep -q "ngrok:" docker-compose.yml && ! grep -q "# ngrok:" docker-compose.yml; then
        check_fail "ngrok still active in docker-compose.yml (should be removed/commented)"
    else
        check_pass "ngrok removed from docker-compose.yml"
    fi
else
    check_fail "docker-compose.yml not found"
fi

echo ""

# 4. Check OpenAPI specification
echo "📖 Checking OpenAPI specification..."
if [ -f "docs/openapi-v3.1.yaml" ]; then
    check_pass "OpenAPI 3.1 spec exists"
    
    # Check for idempotency support
    if grep -q "request_id" docs/openapi-v3.1.yaml || grep -q "X-Request-ID" docs/openapi-v3.1.yaml; then
        check_pass "OpenAPI spec includes idempotency support"
    else
        check_warn "OpenAPI spec should include idempotency patterns"
    fi
    
    # Check for security schemes
    if grep -q "bearerAuth" docs/openapi-v3.1.yaml; then
        check_pass "OpenAPI spec has security schemes"
    else
        check_fail "OpenAPI spec missing security schemes"
    fi
else
    check_fail "docs/openapi-v3.1.yaml not found"
fi

echo ""

# 5. Check CI/CD pipeline
echo "🔄 Checking CI/CD pipeline..."
if [ -f ".github/workflows/ci-cd-security.yml" ]; then
    check_pass "Security CI/CD pipeline exists"
    
    # Check for security scanning jobs
    scans=(
        "sca-scan"
        "secret-scan"
        "sast-codeql"
        "docker-build-scan"
    )
    
    for scan in "${scans[@]}"; do
        if grep -q "$scan" .github/workflows/ci-cd-security.yml; then
            check_pass "Pipeline includes $scan"
        else
            check_fail "Pipeline missing $scan"
        fi
    done
else
    check_fail ".github/workflows/ci-cd-security.yml not found"
fi

echo ""

# 6. Check Command model enhancements
echo "💾 Checking Command model..."
if [ -f "server/models/Command.ts" ]; then
    if grep -q "request_id" server/models/Command.ts; then
        check_pass "Command model has request_id field"
    else
        check_fail "Command model missing request_id field"
    fi
    
    if grep -q "retry_count" server/models/Command.ts; then
        check_pass "Command model has retry_count field"
    else
        check_fail "Command model missing retry_count field"
    fi
    
    if grep -q "QUEUED\|RUNNING\|SUCCEEDED\|FAILED" server/models/Command.ts; then
        check_pass "Command model has enhanced status enum"
    else
        check_warn "Command model should have enhanced status values"
    fi
else
    check_fail "server/models/Command.ts not found"
fi

echo ""

# 7. Check documentation
echo "📚 Checking documentation..."
docs=(
    "TRANSFORMATION_PLAN.md"
    "SECURITY_TRANSFORMATION.md"
    "ZERO_TRUST_DEPLOYMENT.md"
)

for doc in "${docs[@]}"; do
    if [ -f "$doc" ]; then
        check_pass "$doc exists"
    else
        check_fail "$doc not found"
    fi
done

echo ""

# 8. Security checks
echo "🛡️  Running security checks..."

# Check for exposed secrets
if [ -f ".env" ]; then
    check_warn ".env file exists (ensure it's in .gitignore)"
fi

# Check .gitignore
if [ -f ".gitignore" ]; then
    if grep -q ".env" .gitignore; then
        check_pass ".gitignore excludes .env files"
    else
        check_warn ".gitignore should exclude .env files"
    fi
else
    check_warn ".gitignore not found"
fi

# Check for hardcoded secrets in docker-compose
if [ -f "docker-compose.yml" ]; then
    if grep -qi "changeme\|change-this" docker-compose.yml; then
        check_warn "docker-compose.yml contains placeholder secrets (remember to change in production)"
    fi
fi

echo ""

# Summary
echo "========================================="
echo "✅ M1 Transformation Validation Complete"
echo ""
echo "Next steps:"
echo "1. Review any failed checks above"
echo "2. Test Zero-Trust deployment (see ZERO_TRUST_DEPLOYMENT.md)"
echo "3. Run security scans: npm audit"
echo "4. Test Docker build: docker-compose build"
echo "5. Proceed to M2: Command Model & Testing"
echo ""
