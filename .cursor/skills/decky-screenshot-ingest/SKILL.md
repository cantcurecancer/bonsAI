---
name: decky-screenshot-ingest
description: >-
  Ingest Steam Deck UI captures from repo screenshots/ (DeckCapture_*.png from
  screenshot-deck.ps1/sh). Use when the user mentions a screenshot, capture,
  DeckCapture, "see screenshot", "in screenshots/", pasted paths under
  screenshots/, or a visual/focus/layout/QAM UI issue that likely has a local
  capture — do not wait for them to paste the image into chat.
---

# Decky screenshot ingest

`screenshots/` is **gitignored**. **Do not use Glob** (it returns empty). List with **Shell**, then **Read** the PNGs.

## Steps

1. **List newest captures** (repo root):

```powershell
Get-ChildItem screenshots -File -ErrorAction SilentlyContinue |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 8 Name, LastWriteTime, Length
```

```bash
ls -lt screenshots/*.{png,jpg,jpeg} 2>/dev/null | head -8
```

2. Prefer `DeckCapture_*.png` from `scripts/screenshot-deck.ps1` / `.sh`. Read the **newest 1–3** with the image **Read** tool (full path under `screenshots/`).
3. Tie what you see to code (clipping, focus ring, labels, QAM vs game). Skip re-reading a path already analyzed in this thread unless mtime changed or the user asks.
4. If empty/missing: say so; suggest `.\scripts\screenshot-deck.ps1` (or `.sh`) with QAM/bonsAI open (`-Mode game` in Gaming Mode). Do **not** ask the user to paste images if files exist.

Full workflow also: `bonsai.workflow.get` id=`screenshot-ingest`.
