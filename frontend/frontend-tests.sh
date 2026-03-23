#!/bin/bash
set -euo pipefail

# Run frontend tests located under apps/web/__tests__.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="${ROOT_DIR}"

if [[ ! -f "${FRONTEND_DIR}/package.json" ]]; then
  echo "Error: frontend package.json not found at ${FRONTEND_DIR}" >&2
  exit 1
fi

echo "Running frontend tests from ${FRONTEND_DIR}"
cd "${FRONTEND_DIR}"
pnpm test
