#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../frontend"
export NVM_DIR="$HOME/.nvm"
# shellcheck source=/dev/null
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 20 >/dev/null 2>&1 || true
exec npm run dev
