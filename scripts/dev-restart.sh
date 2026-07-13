#!/usr/bin/env bash
# Clean restart of the Pintora frontend dev server (kills stray instances,
# clears the Turbopack cache, and starts a single server on Node 20).
set -u

echo "==> Freeing port 3001"
fuser -k 3001/tcp 2>/dev/null || true
sleep 1

echo "==> Killing any 'next' processes running under pintora"
for p in $(pgrep -f next 2>/dev/null); do
  cwd=$(readlink -f "/proc/$p/cwd" 2>/dev/null || true)
  case "$cwd" in
    *pintora*) echo "  killing $p ($cwd)"; kill -9 "$p" 2>/dev/null || true ;;
  esac
done
sleep 2

cd ~/pintora/frontend || exit 1

echo "==> Clearing .next cache"
rm -rf .next

export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
. "$NVM_DIR/nvm.sh"
nvm use 20.20.2 >/dev/null 2>&1 || nvm use 20 >/dev/null 2>&1
echo "==> Node $(node -v)"

echo "==> Starting dev server (foreground)"
exec npm run dev
