#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../backend"
# shellcheck source=/dev/null
source .venv/bin/activate
exec python manage.py runserver 0.0.0.0:8001
