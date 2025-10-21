#!/bin/bash
# DogeRat Rollback Script

set -e

if [ -z "$1" ]; then
  echo "Usage: ./rollback.sh <backup_file>"
  echo ""
  echo "Available backups:"
  ls -lh ./backups/dogerat_backup_*.sql.gz 2>/dev/null || echo "No backups found"
  exit 1
fi

BACKUP_FILE=$1

if [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "⚠️  WARNING: This will restore the database from backup!"
echo "Backup file: $BACKUP_FILE"
echo ""
read -p "Are you sure? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "Rollback cancelled"
  exit 0
fi

echo "📥 Restoring database from backup..."

# Decompress if gzipped
if [[ $BACKUP_FILE == *.gz ]]; then
  gunzip -c $BACKUP_FILE | docker-compose exec -T postgres psql -U ${DB_USER:-dogerat} ${DB_NAME:-dogerat}
else
  docker-compose exec -T postgres psql -U ${DB_USER:-dogerat} ${DB_NAME:-dogerat} < $BACKUP_FILE
fi

echo "✅ Database restored successfully!"
echo "🔄 Restarting services..."

docker-compose restart server

echo "✨ Rollback completed!"

