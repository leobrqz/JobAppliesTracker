#!/bin/bash
set -euo pipefail

# Extended backend smoke test.
# Hits a broader set of endpoints to catch regressions across resources.

BASE_URL="${BASE_URL:-http://localhost:8001}"

echo "Running extended backend smoke test against ${BASE_URL}"

check() {
  local path="$1"
  echo "  - GET ${path}"
  curl -fsS "${BASE_URL}${path}" >/dev/null
}

# Core health
check "/api/dashboard/summary"
check "/api/applications"

# Dashboard widgets
check "/api/dashboard/status-distribution"
check "/api/dashboard/recent-applications"
check "/api/dashboard/platform-ranking"
check "/api/dashboard/heatmap"

# Reference data
check "/api/job-platforms"
check "/api/platform-templates"

# Companies and profile data
check "/api/companies"
check "/api/profile-data"

# Resumes (list endpoints only; download requires a specific id)
check "/api/resumes"

# Appointments over a wide range (should return 200 with empty or populated list)
START="1970-01-01T00:00:00"
END="2100-01-01T00:00:00"
check "/api/appointments?start=${START}&end=${END}"

echo "Extended backend smoke test OK."

