#!/usr/bin/env bash
set -euo pipefail
BASE="http://localhost:8001"
ALLAUTH="$BASE/_allauth/browser/v1"
JAR="/tmp/pintora_test_cookies.txt"
rm -f "$JAR"

EMAIL="test_$(date +%s)@example.com"
PASS="TestPass123!"

curl -s -o /dev/null -c "$JAR" "$ALLAUTH/auth/session"
CSRF=$(grep csrftoken "$JAR" | awk '{print $7}')

echo "signup: $(curl -s -o /dev/null -w '%{http_code}' -b "$JAR" -c "$JAR" \
  -H "Content-Type: application/json" -H "X-CSRFToken: $CSRF" \
  -X POST "$ALLAUTH/auth/signup" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}")"

echo "me: $(curl -s -o /dev/null -w '%{http_code}' -b "$JAR" "$BASE/api/me/")"

CSRF=$(grep csrftoken "$JAR" | awk '{print $7}')
echo "logout: $(curl -s -o /dev/null -w '%{http_code}' -b "$JAR" -c "$JAR" \
  -H "X-CSRFToken: $CSRF" -X DELETE "$ALLAUTH/auth/session")"

echo "me_after_logout: $(curl -s -o /dev/null -w '%{http_code}' -b "$JAR" "$BASE/api/me/")"
