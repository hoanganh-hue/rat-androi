#!/bin/bash
# DogeRat Create Admin User Script (Interactive)

set -e

echo "👤 DogeRat Admin User Creation"
echo "==============================="
echo ""

read -p "Enter admin username: " username
read -p "Enter admin email: " email
read -sp "Enter admin password: " password
echo ""
read -sp "Confirm password: " password2
echo ""

if [ "$password" != "$password2" ]; then
  echo "❌ Passwords do not match"
  exit 1
fi

export ADMIN_USERNAME="$username"
export ADMIN_EMAIL="$email"
export ADMIN_PASSWORD="$password"

echo ""
echo "Creating admin user..."

npm run db:seed

echo ""
echo "✅ Admin user created successfully!"
echo ""
echo "Credentials:"
echo "  Username: $username"
echo "  Email: $email"
echo ""
echo "⚠️  Please save these credentials securely!"

