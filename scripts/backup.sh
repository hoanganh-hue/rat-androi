#!/bin/bash
# DogeRat Database Backup Script

set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="dogerat_backup_$TIMESTAMP.sql"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

echo "📦 Starting database backup..."
echo "Backup file: $BACKUP_FILE"

# Backup database
docker-compose exec -T postgres pg_dump -U ${DB_USER:-dogerat} ${DB_NAME:-dogerat} > "$BACKUP_DIR/$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_DIR/$BACKUP_FILE"

echo "✅ Backup completed: $BACKUP_DIR/$BACKUP_FILE.gz"

# Keep only last 7 backups
echo "🧹 Cleaning old backups (keeping last 7)..."
cd $BACKUP_DIR
ls -t dogerat_backup_*.sql.gz | tail -n +8 | xargs -r rm
cd ..

echo "✨ Backup process completed!"

