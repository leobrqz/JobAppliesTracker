#!/bin/bash
set -e

echo "Rebuilding containers..."
docker compose down
docker compose up --build -d --force-recreate
