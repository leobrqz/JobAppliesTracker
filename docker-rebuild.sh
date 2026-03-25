#!/usr/bin/env bash
set -euo pipefail

echo "Rebuilding JobAppliesTracker (backend + frontend)..."
docker compose down
docker compose up --build -d --force-recreate

echo "Done."
