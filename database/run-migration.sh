#!/bin/bash

# Database migration script for ZeYang
# This script applies the new project fields migration

echo "Starting database migration..."

# Check if MySQL is accessible
if ! command -v mysql &> /dev/null; then
    echo "Error: MySQL client is not installed or not in PATH"
    exit 1
fi

# Database credentials (update these with your actual credentials)
DB_HOST="127.0.0.1"
DB_USER="root"
DB_PASS="123456"
DB_NAME="ZeYang_db"

# Prompt for password if not set
if [ -z "$DB_PASS" ]; then
    read -sp "Enter MySQL password for user $DB_USER: " DB_PASS
    echo
fi

# Run the migration
echo "Applying migration: add_project_fields.sql"
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < migrations/add_project_fields.sql

if [ $? -eq 0 ]; then
    echo "Migration completed successfully!"
else
    echo "Error: Migration failed"
    exit 1
fi

echo "Database migration finished."