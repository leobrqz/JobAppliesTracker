#!/usr/bin/env bash
set -euo pipefail

case "${1:-app}" in
  supabase)
    ( cd supabase && docker compose logs -f )
    ;;
  app|*)
    docker compose logs -f backend frontend
    ;;
esac
