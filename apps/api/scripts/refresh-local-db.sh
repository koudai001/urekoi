#!/bin/sh
set -e

REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"

docker compose -f "$REPO_ROOT/docker-compose.yml" exec -T db \
  psql -v ON_ERROR_STOP=1 -U urekoi -d urekoi \
  -c 'DROP SCHEMA public CASCADE; CREATE SCHEMA public;'

(cd "$REPO_ROOT/apps/api" && go run ./cmd/migrate)
