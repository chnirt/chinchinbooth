#!/usr/bin/env sh
set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ ! -f ".env.local" ] && [ ! -f ".env.production" ]; then
  echo "Missing .env.local (or .env.production)."
  echo "Copy Cloudinary vars so Next can inline NEXT_PUBLIC_* at build time."
  exit 1
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm is required."
  exit 1
fi

if ! pnpm exec wrangler whoami >/dev/null 2>&1; then
  echo "Not logged in to Cloudflare. Opening login..."
  pnpm exec wrangler login
fi

echo "Building + deploying to Cloudflare Workers..."
pnpm cf:deploy
