#!/bin/bash
set -e

# ===== CONFIGURATION =====
DB_NAME="db_name"
DB_USER="db_user"
DB_PASS="db_password"
DB_HOST="db_host"
DB_PORT="db_post"

MIGRATE_SCRIPT="./migrate-db.sh"
IMPORT_SCRIPT="./import-movielens"

# ===== RESET DATABASE =====
echo "Dropping and recreating database: $DB_NAME"

mysql -u"$DB_USER" -p"$DB_PASS" -h"$DB_HOST" -P"$DB_PORT" -e "DROP DATABASE IF EXISTS $DB_NAME; CREATE DATABASE $DB_NAME; USE $DB_NAME;"

# ===== RUN MIGRATIONS =====
echo "Running migrations..."
$MIGRATE_SCRIPT

# ===== IMPORT DATA =====
echo "Importing MovieLens dataset..."
node $IMPORT_SCRIPT

echo "All done!"
