#!/usr/bin/env bash
# Build a static export for GitHub Pages (API routes are Node-only, so stash them).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
API_DIR="$ROOT/src/app/api"
STASH="$ROOT/.api-stash"

cleanup() {
  if [[ -d "$STASH/api" ]]; then
    mv "$STASH/api" "$API_DIR"
    rmdir "$STASH" 2>/dev/null || true
  fi
}
trap cleanup EXIT

if [[ -d "$API_DIR" ]]; then
  mkdir -p "$STASH"
  mv "$API_DIR" "$STASH/api"
fi

cd "$ROOT"
GITHUB_PAGES=1 npx next build
