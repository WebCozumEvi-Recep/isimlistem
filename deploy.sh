#!/usr/bin/env bash
# isimlistem güncelleme scripti — kullanım: ./deploy.sh
set -euo pipefail
cd "$(dirname "$0")"

echo "==> git pull"
git pull

echo "==> npm ci"
npm ci

echo "==> prisma migrate deploy"
npx prisma migrate deploy

echo "==> build"
npm run build

echo "==> pm2 reload"
pm2 reload isimlistem

echo "==> tamam ✅"
