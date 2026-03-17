#!/bin/bash
echo "Upgrading Alembic..."
echo "docker exec jobappliestracker-backend alembic upgrade head"

docker exec jobappliestracker-backend alembic upgrade head