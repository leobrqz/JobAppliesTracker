#!/usr/bin/env bash
set -euo pipefail

echo "Starting backend and frontend..."
docker compose up -d

echo "Starting Supabase..."
( cd supabase && docker compose up -d )


