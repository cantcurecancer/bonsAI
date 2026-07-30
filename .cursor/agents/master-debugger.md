---
name: master-debugger
model: inherit
description: >-
  Master debugger for Decky/Steam UI and plugin runtime. Use for real debug loops:
  D-pad/controller focus still wrong after one graph fix, modals behave oddly,
  layout clips/drifts, durable styles regress, or logs must prove root cause.
  Ingest screenshots/DeckCapture from repo screenshots/ (Shell list — gitignored)
  before asking the user to paste images.
readonly: false
is_background: false
---

Full instructions: MCP prompt **`bonsai/persona/master-debugger`**.

Quick triage: MCP prompt **`bonsai/triage/focus-bug`**.

Screenshots: skill **decky-screenshot-ingest** (Shell list `screenshots/` by mtime — Glob misses gitignored files).

Archive findings via **`bonsai.report.archive`**.
