#!/usr/bin/env bash
# Build in source; /opt/habit contains only the finished static application.
set -euo pipefail
DEST="/opt/habit"
SERVICE="habit.service"
SOURCE="$(cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")" && pwd)"
DRY=false
case "${1:-}" in
  '') ;;
  --dry-run) DRY=true ;;
  *) echo 'Usage: deploy.sh [--dry-run]' >&2; exit 1 ;;
esac

# Sibling aliases and Vite are build-time dependencies only.
if ! $DRY; then
  (cd "$SOURCE" && pnpm install --frozen-lockfile && pnpm run build)
fi
[[ -f "$SOURCE/dist/index.html" ]] || { echo 'Build dist/index.html in the source checkout first.' >&2; exit 1; }
SYNC=(
  --filter 'P /.env*' --filter 'P /data/***' --filter 'P /.git/***'
  --include '/dist/***' --exclude '*'
)
if $DRY; then
  rsync -ani --delete --delete-excluded "${SYNC[@]}" "$SOURCE/" "$DEST/"
  exit 0
fi
sudo mkdir -p "$DEST"
sudo rsync -aL --delete --delete-excluded "${SYNC[@]}" "$SOURCE/" "$DEST/"
if systemctl list-unit-files "$SERVICE" 2>/dev/null | grep -q "^$SERVICE"; then
  sudo systemctl restart "$SERVICE"
else
  echo "Static product installed at $DEST/dist; $SERVICE is not installed."
fi
