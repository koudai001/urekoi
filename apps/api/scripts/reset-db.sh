#!/bin/sh
set -e

# ローカルDBの全テーブルを空にして、マイグレーション+シードを再実行する(schema_migrationsは対象外)
REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"

docker compose -f "$REPO_ROOT/docker-compose.yml" exec -T db psql -U urekoi -d urekoi -c "
DO \$\$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename != 'schema_migrations'
  LOOP
    EXECUTE format('TRUNCATE TABLE %I RESTART IDENTITY CASCADE', tbl);
  END LOOP;
END \$\$;
"

(cd "$REPO_ROOT/apps/api" && go run ./migrations)
