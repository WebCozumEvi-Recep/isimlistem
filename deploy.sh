#!/usr/bin/env bash
# isimlistem deploy scripti — kullanım: ./deploy.sh
# Kodu çeker, bağımlılıkları kurar, build eder (build içinde `prisma db push` ile
# DB şeması otomatik senkronlanır) ve servisi sıfır kesintiyle yeniden yükler.
set -euo pipefail
# Forced-command SSH (GitHub Actions) altında minimal PATH gelebilir; garantiye al.
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:${PATH:-}"
cd "$(dirname "$0")"

echo "==> git pull"
git pull origin main

echo "==> npm install"
npm install --no-audit --no-fund

echo "==> build (prisma db push + next build)"
npm run build

echo "==> pm2 reload"
pm2 reload isimlistem --update-env \
  || pm2 start node_modules/next/dist/bin/next --name isimlistem -i max -- start -p 3000

echo "==> tamam ✅  $(git rev-parse --short HEAD)"
