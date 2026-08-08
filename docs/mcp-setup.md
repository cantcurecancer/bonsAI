# bonsAI MCP setup

bonsAI uses **two complementary MCP servers**:

| Server | Package | Role |
|--------|---------|------|
| **bonsai** | In-repo [`packages/bonsai-mcp/`](../packages/bonsai-mcp/) | Policies, workflows, personas, architecture index, doc search |
| **decky-plugin-studio** | [Decky Plugin Studio](https://github.com/qd313/decky-plugin-studio) extension | Build, deploy, preview, tunnel, screenshots |

## Decky Plugin Studio (source of truth)

[Decky Plugin Studio](https://github.com/qd313/decky-plugin-studio) (DPS) is a **separate project**. That repo is the source of truth for the extension, MCP `deck.*` / `preview.*` / `plugin.*` tools, capture/record helpers, and Init Pack templates. bonsAI only **consumes** the published VSIX (see [upstream consumer sync](https://github.com/qd313/decky-plugin-studio/blob/main/docs/MCP_CONSUMER_SYNC.md)).

| Situation | What to do |
|-----------|------------|
| Bug, gap, or confusing DPS behavior while working in bonsAI | Document it here (this file and/or [troubleshooting.md](troubleshooting.md) § Decky Plugin Studio) **and** open or update an issue/PR on [qd313/decky-plugin-studio](https://github.com/qd313/decky-plugin-studio) |
| Need to add / delete / change DPS tooling, MCP surface, pack skills, or capture scripts | Change **upstream first** (or in the same effort), then bump the consumer VSIX / `mcp.json` pin in bonsAI |
| Temporary workaround only in bonsAI | Still document the workaround **and** the intended upstream fix so it is not forgotten |

Do **not** permanently fork DPS behavior into bonsAI. Product-specific MCP (`bonsai`) and app code stay here; studio ops stay in DPS.

**Installed version:** pin `mcp.json` / `.cursor/mcp.json` to the installed VSIX path under `~/.cursor/extensions/decky-plugin-studio.decky-plugin-studio-extension-<version>/`. After upgrading the VSIX, update those paths and **Developer: Reload Window**.

### DPS findings log (bonsAI)

Record consumer-facing notes below so maintainers can sync upstream. Newest first.

| Date | Finding | Documented in bonsAI | Upstream (issue/PR) | Status |
|------|---------|----------------------|---------------------|--------|
| 2026-08-08 | **D1 — `snapshotDom` truncates at 8183 bytes with no marker.** The cap is silent: the stored HTML has no ellipsis, no `truncated` flag, and ends mid-declaration. Because a plugin's injected `<style>` block can be the first child of the snapshotted node, the entire snapshot can be CSS and never reach rendered markup — which is exactly what happened to every bonsAI DOM assert. Ask: a configurable cap, a `truncated: true` field on the result, and an option to skip `<style>`/`<script>` nodes. | [testing.md](testing.md#preview-suite-evidence-invalidated-2026-08-08) | *pending* | Open |
| 2026-08-08 | **D4 — `final.png` is a placeholder, not a capture.** Byte-identical within a batch (11202 B / 10220 B); the image is a flat dark rectangle reading `Decky preview snapshot` and the viewport size. It is stored under the name of a screenshot, so consumers archive it as evidence. Ask: real capture, or `ok: false` so callers stop storing fiction. | same | *pending* | Open |
| 2026-08-08 | **D3 — `focusPath` echoes the injected inputs.** Every run records `["onMove(Down)","onMove(Down)"]` and `active-element.txt` reads `document.body`, so any assert over it is a tautology. Ask: a per-input trace with node identity, or document explicitly that it is an input echo and not a focus oracle. | same | *pending* | Open |
| 2026-08-08 | **D2 — `callTestHook` IPC times out.** 8/8 scenarios fail with `Error: IPC timeout for callTestHook`. **Cause not yet established** — bonsAI's own registration gate (`src/preview/previewTestHooks.ts`) depends on `import.meta.env`, which Rollup does not provide, so this may be ours. File upstream only if E1 shows the hooks are defined in the page. | same | *not filed — pending E1* | Investigating |
| 2026-08-08 | **No way to reset preview backend state between scenarios.** Settings written by one scenario persist into the next in the same batch. Worked example: `tests/preview-suite/tier2-deep.json` sent partial `capabilities` blocks, and because the backend merge is shallow, an omitted key silently disabled that capability for the rest of the batch. Ask: a per-scenario state reset, or a documented teardown hook. | same | *pending* | Open |

## Prerequisites

```bash
cd packages/bonsai-mcp
npm install
npm run build
```

From repo root you can also run:

```bash
pnpm run mcp:build
```

## Cursor

Primary config: [`.cursor/mcp.json`](../.cursor/mcp.json) (Cursor loads this on project open).

Root [`mcp.json`](../mcp.json) mirrors the same servers for other MCP clients.

Add to project MCP settings (if not using `.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "bonsai": {
      "command": "node",
      "args": ["packages/bonsai-mcp/dist/index.js"],
      "env": {
        "BONSAI_REPO_ROOT": "${workspaceFolder}"
      }
    }
  }
}
```

Keep **decky-plugin-studio** configured in the same file (see [AGENTS.md](../AGENTS.md)).

**After first clone or MCP changes:** run `pnpm run mcp:install && pnpm run mcp:build`, then **Developer: Reload Window** (or restart Cursor). Confirm **bonsai** shows green in **Cursor Settings → MCP**.

**Session start:** a `sessionStart` hook auto-injects a **slim** bootstrap (always-on policy ids + when to fetch). Agents may also call `bonsai.session.bootstrap`. Full policy bodies: `bonsai.policy.get` only when the task needs them (avoids triple-injecting focus/layout walls every chat).

## Claude Desktop

Edit `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "bonsai": {
      "command": "node",
      "args": ["/absolute/path/to/bonsAI/packages/bonsai-mcp/dist/index.js"],
      "env": {
        "BONSAI_REPO_ROOT": "/absolute/path/to/bonsAI"
      }
    }
  }
}
```

## Generic MCP clients

- Transport: **stdio**
- Entry: `node packages/bonsai-mcp/dist/index.js`
- Required env: `BONSAI_REPO_ROOT` → git repo root (must contain `plugin.json`, `main.py`, `packages/bonsai-mcp/`)

## Key tools

| Tool | When |
|------|------|
| `bonsai.session.bootstrap` | Start of session — policy ids + fetch hints (not full bodies) |
| `bonsai.workflow.get` | Deck dev loop, tier QA, preview, screenshots |
| `bonsai.policy.get` / `bonsai.policy.list` | Specific policy slices |
| `bonsai.docs.search` / `bonsai.docs.get` | Search or read `docs/` |
| `bonsai.arch.rpcMap` / `bonsai.arch.hotspots` | Codebase context |
| `bonsai.arch.previewTiers` | Preview-suite tiers and the scenarios in each |
| `bonsai.report.archive` | Append subagent findings |

## Key prompts

| Prompt | When |
|--------|------|
| `bonsai/persona/master-debugger` | Focus, layout, log capture |
| `bonsai/persona/security-auditor` | RPC, logging, permissions review |
| `bonsai/triage/focus-bug` | Short focus triage (screenshots → graph → one fix; debugger on second loop) |
| `bonsai/triage/empty-ai-reply` | Silent/truncated AI replies |

**Archived:** Red/Blue ship counsel and `bonsai/plan/ship-review` → [docs/archive/red-blue-counsel/](../docs/archive/red-blue-counsel/README.md).

## Knowledge without MCP

All knowledge files are plain markdown under `packages/bonsai-mcp/knowledge/` and remain readable in git without MCP.

Regenerate architecture JSON after RPC or structure changes (`main.py`, `src/`, `tests/preview-suite/`, `.env.example`):

```bash
pnpm run mcp:generate
pnpm run mcp:validate
```

Commit any changes under `packages/bonsai-mcp/knowledge/architecture/` in the **same** change set. CI workflow `validate-mcp.yml` fails the push/PR when those snapshots are stale.

### Prevent stale CI failures locally

1. **Git hooks (recommended):** `pnpm run mcp:install-hooks` (also runs via `pnpm install` / `prepare`).  
   - **pre-commit** regenerates and stages `packages/bonsai-mcp/knowledge/architecture/*.json` automatically.  
   - **pre-push** runs `mcp:validate` and blocks the push if snapshots are still stale.
2. **Cursor:** editing `main.py` / `src/` / preview suite / `.env.example` auto-runs `mcp:generate`; `git push` is denied while snapshots are stale.

Manual check:

```bash
pnpm run mcp:generate
pnpm run mcp:validate
```
