#!/bin/bash
# DogeRat Health Check Script

set -e

echo "🏥 DogeRat Health Check"
echo "======================="

# Check backend health
echo -n "Backend API: "
if curl -f -s http://localhost:5000/api/health > /dev/null 2>&1; then
  echo "✅ Healthy"
else
  echo "❌ Not responding"
  exit 1
fi

# Check frontend
echo -n "Frontend: "
if curl -f -s http://localhost > /dev/null 2>&1; then
  echo "✅ Healthy"
else
  echo "❌ Not responding"
fi

# Check database connection
echo -n "Database: "
if docker-compose exec -T postgres pg_isready > /dev/null 2>&1; then
  echo "✅ Connected"
else
  echo "❌ Not connected"
  exit 1
fi

echo ""
echo "✨ All systems operational!"

