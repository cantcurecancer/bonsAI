#!/usr/bin/env bash
# Remove bonsAI Decky data directories (settings, runtime, logs).
# Does NOT remove ~/Desktop/bonsAI_logs/ or ~/.ollama unless you run Clear all data in-app first.
set -euo pipefail

PLUGIN_NAME="${BONSAI_PLUGIN_NAME:-bonsAI}"
HOME_DIR="${HOME:-/home/deck}"
DECKY_HOME="${DECKY_HOME:-$HOME_DIR/homebrew}"

SETTINGS_DIR="$DECKY_HOME/settings/$PLUGIN_NAME"
DATA_DIR="$DECKY_HOME/data/$PLUGIN_NAME"
LOGS_DIR="$DECKY_HOME/logs/$PLUGIN_NAME"
CACHE_DIR="$HOME_DIR/.bonsai/cache"

echo "This removes bonsAI plugin data under Decky homebrew:"
echo "  $SETTINGS_DIR"
echo "  $DATA_DIR"
echo "  $LOGS_DIR"
echo "  $CACHE_DIR (if present)"
echo ""
read -r -p "Continue? [y/N] " ans
case "${ans,,}" in
  y|yes) ;;
  *) echo "Aborted."; exit 0 ;;
esac

rm -rf "$SETTINGS_DIR" "$DATA_DIR" "$LOGS_DIR"
rm -rf "$CACHE_DIR"
echo "Done. Reinstall or open bonsAI for a fresh install state."
