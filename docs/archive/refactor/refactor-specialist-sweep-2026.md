> **Archived** — see [archive README](README.md). Active hotspots: [development.md](../development.md#change-risk-hotspots)

# Refactor-specialist sweep — 2026 LOC reduction

Report format follows [refactor-specialist persona](../../packages/bonsai-mcp/knowledge/personas/refactor-specialist.md) (Deep Refactor Review).

## Changes made

### Remove / dedupe
- Removed dead `Plugin._find_amdgpu_hwmon` / `_write_sysfs` from `main.py`
- Removed `llama_cpp_provider.py` POC (spike doc retained in [spikes/llama-cpp-provider.md](../spikes/llama-cpp-provider.md))
- Unified Ollama loopback/CLI helpers → `py_modules/backend/ollama_connectivity.py`
- Unified async install job scaffold → `async_background_job.py`
- Unified ask command normalization → `ask_local_commands.py`
- Shared transparency snapshot builders → `transparency_service.py`

### Extract / split
- **Backend:** `ask_ollama` → `ollama_ask_service.py`; `get_deck_ip` → `network_service.py`; `main.py` ~2960 → ~2450 LOC
- **Frontend:** `MainTab` region components; `index.tsx` shell hooks; stylesheet → `styles/sections/*.ts`
- **Settings:** schema/normalizers/payload split under `src/data/` + `src/utils/settingsPayload.ts`
- **Deck UI:** `DeckFocusSlider` + `deckSliderMath.ts`; shared `DECK_MENU_*` tokens
- **Helpers:** `refactor_helpers.py` → re-export shim; logic in `ollama_routing.py`, `ollama_urls.py`, `tdp_intent.py`

### Docs / runtime strings
- Ollama/Developer tab paths in `testing.md`, `troubleshooting.md`, `development.md`, `ollama_prompts.py`, `vac_check_commands.py`, `main.py`
- Offline intent packs moved from Planned → [roadmap-completed.md](../archive/roadmap-completed.md)
- Updated [DOCUMENTATION_INDEX.md](../DOCUMENTATION_INDEX.md)

## Regression risk checks

| Check | Result |
|-------|--------|
| `pnpm test` | 154 passed |
| `pnpm run build` | Pass |
| `tests/test_refactor_helpers.py` | 22 passed |
| `tests/test_ollama_ask_service.py` | Model fallback mock passed |
| Full `pnpm run test:py` on Windows | 4 expected `pwd` import errors (Deck-only modules); unrelated prompt test may fail without Linux paths |

**Remaining risks:** Deck focus graph on refactored sliders/popovers — verify Tier 0 **SMOKE-A** on device.

## Tests and docs status

- Golden settings round-trip test added in `settingsAndResponse.test.ts`
- Ask routing fallback test added in `test_refactor_helpers.py`
- `INTENT-PACKS` and `REFACTOR-4DEF` rows in [testing.md](../testing.md) (Open until on-Deck QA)

## Trade-offs

- Kept `refactor_helpers.py` shim at repo root for Decky packaging and existing tests rather than breaking imports in one release.
- Stylesheet split increased file count but reduced per-file cognitive load; total CSS LOC unchanged.
- Full RPC integration tests deferred; mocked unit tests cover model fallback only.

## Intentionally not changed

- Product features in roadmap Planned (text model chains, reply micro-actions, etc.)
- `packages/bonsai-mcp/` agent server structure
- Pixel-perfect Steam CEF styling
