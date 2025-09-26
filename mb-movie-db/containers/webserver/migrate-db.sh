#!/bin/bash
set -e

CONFIG="./config/config.js"
MIGRATIONS_PATH="../../../mb-common/migrations"

# List non-join migrations first
NON_JOIN_MIGRATIONS=(
  "user-migration.js"
  "apikey-migration.js"
  "movie-migration.js"
  "genre-migration.js"
  "person-migration.js"
  "user-preference-migration.js"
  "rating-migration.js"
  "tag-migration.js"
  "logentry-migration.js"
  "api-cache-migration.js"
)

# List join table migrations second
JOIN_MIGRATIONS=(
  "movie-genre-migration.js"
  "movie-person-migration.js"
)

echo "Running non-join migrations..."
for migration in "${NON_JOIN_MIGRATIONS[@]}"; do
  echo "Migrating: $migration"
  npx sequelize-cli db:migrate \
    --config "$CONFIG" \
    --migrations-path "$MIGRATIONS_PATH" \
    --name "$migration"
done

echo "Running join table migrations..."
for migration in "${JOIN_MIGRATIONS[@]}"; do
  echo "Migrating: $migration"
  npx sequelize-cli db:migrate \
    --config "$CONFIG" \
    --migrations-path "$MIGRATIONS_PATH" \
    --name "$migration"
done

echo "All migrations complete."

# To undo all the migrations:
# npx sequelize-cli db:migrate:undo:all --config ./config/config.js --migrations-path ../../../mb-common/migrations