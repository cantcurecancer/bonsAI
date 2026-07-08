#!/bin/sh
# Session-only SSH_ASKPASS helper — do not commit
set -a
. /home/deck/bonsAI/.env
set +a
printf '%s' "${deck_pass}"
