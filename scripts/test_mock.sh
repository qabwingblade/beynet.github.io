#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-4173}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cleanup() {
  if [[ -n "${SERVER_PID:-}" ]] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

cd "$ROOT_DIR"
python3 -m http.server "$PORT" >/tmp/beynet_test_server.log 2>&1 &
SERVER_PID=$!

# give the server a brief moment
sleep 1

HTML="$(curl -fsS "http://127.0.0.1:${PORT}/index.html")"

assert_contains() {
  local expected="$1"
  if [[ "$HTML" != *"$expected"* ]]; then
    echo "Missing expected content: $expected" >&2
    exit 1
  fi
}

assert_contains "BeyNet Combo Testing Tracker"
assert_contains "Session Setup"
assert_contains "Round Entry (Fast Input)"
assert_contains "Auto Summary (per candidate)"
assert_contains "Scoring rules in mock: X = 3, KO = 2, B = 2, S = 1."

echo "Smoke test passed."
