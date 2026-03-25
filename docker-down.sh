#!/usr/bin/env bash
set -euo pipefail

echo "Stopping backend and frontend..."
docker compose down

echo "Stopping Supabase..."
( cd supabase && docker compose down )

echo "Done."
