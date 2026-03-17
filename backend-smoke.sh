#!/bin/bash
set -euo pipefail

# Simple backend smoke test.
# Hits a few key endpoints and fails fast on any error.

BASE_URL="${BASE_URL:-http://localhost:8000}"

echo "Running backend smoke test against ${BASE_URL}"

echo "  - GET /api/dashboard/summary"
curl -fsS "${BASE_URL}/api/dashboard/summary" >/dev/null

echo "  - GET /api/applications"
curl -fsS "${BASE_URL}/api/applications" >/dev/null

START="1970-01-01T00:00:00"
END="2100-01-01T00:00:00"
echo "  - GET /api/appointments?start=${START}&end=${END}"
curl -fsS "${BASE_URL}/api/appointments?start=${START}&end=${END}" >/dev/null

echo "Backend smoke test OK."

