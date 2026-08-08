# 02 — Decky Plugin Studio: upstream findings draft

Draft notes for [qd313/decky-plugin-studio](https://github.com/qd313/decky-plugin-studio),
written from the DPS source at `e7af320` (v0.3.6) plus live IPC probing against a running
preview on 2026-08-08.

**Why this file exists.** Per [AGENTS.md](../../AGENTS.md) § DPS, bonsAI must not fork or
locally patch DPS. These are consumer-facing defects found while repairing bonsAI's preview
suite; each is stated so it can be pasted into an upstream issue with no bonsAI context.
Index row for each: [mcp-setup.md](../mcp-setup.md) § DPS findings log.

Severity is from a consumer's point of view: **P1** silently reports success for work that
did not happen, **P2** blocks automation, **P3** friction.

---

## P0-1 — The `@decky/api` shim is missing `useQuickAccessVisible`, and one missing export kills the entire preview silently

`preview-server/src/shim/api.ts` (mapped from `@decky/api` by
`vite-plugin-decky-shim.ts:13`)

**This is the finding that blocks everything else.** The shim exports 10 names.
`useQuickAccessVisible` — a documented Decky Loader hook — is not among them. bonsAI imports
it at `src/index.tsx:9`, so the sandbox module throws while evaluating its imports:

```
SyntaxError: The requested module '/@fs/.../shim/api.ts'
             does not provide an export named 'useQuickAccessVisible'
```

**The failure mode is what makes this P0, not the missing export itself.** The throw happens
at module scope in `sandbox-host.tsx`, *before* `mount()` is reached — and `mount()` is where
the `window.addEventListener("message", …)` handler is registered (`:99`). So the sandbox
never listens for `snapshotDom`, `runSequence`, `captureScreenshot` or `callTestHook`. Every
IPC command is accepted by the bridge, dispatched into a webview that will never answer, and
times out after 120 s (P2-2), serially.

Nothing surfaces the cause. The error appears only in the *iframe's* console, which no
harness reads and which the VS Code panel does not display. From the outside it is
indistinguishable from a hung preview, a dead backend, or a broken plugin — I attributed it
to all three in turn before loading the page in a browser and reading the console.

bonsAI has imported this hook since **2026-07-17** (`ebd9ca7`), so **the preview has been
unable to mount this plugin for three weeks** while continuing to accept commands and report
timeouts.

**Requested, in priority order:**
1. **Add the missing export.** A stub matching the real signature is enough for preview
   purposes — the hook returns whether the QAM panel is visible, and `() => true` is the
   correct preview default since the panel is always on screen:
   ```ts
   export function useQuickAccessVisible(): boolean {
     return true;
   }
   ```
2. **Fail loudly when the sandbox module throws.** Wrap the entry evaluation so a module-level
   error is posted to the parent (`decky-log` already exists for this) *and* rendered into the
   panel. A blank iframe with a console error is the worst possible presentation of a
   one-line fix.
3. **Answer IPC commands with an error while the sandbox is not listening.** If the host knows
   the iframe failed to initialise, every command should return
   `{ ok: false, error: "sandbox failed to load: …" }` immediately rather than timing out at
   120 s. This is the same principle as P2-3.
4. **Audit the shim against the real `@decky/api` surface.** A checked-in list of exports with
   a test that the shim provides all of them would have caught this at DPS build time rather
   than in a consumer three weeks later.

**Checked for siblings so this is fixed once:** bonsAI imports 6 names from `@decky/api` and
14 from `@decky/ui`. `@decky/ui` is complete. The only other two absent from the API shim are
`ToastData` and `ToastNotification`, both imported by bonsAI as `import { type … }`
(`src/utils/bonsaiPhaseToast.ts:8`) and therefore erased at build time — harmless, though
adding them as exported types would let plugins import them either way.

---

## P1-1 — `snapshotDom` truncates at 8000 characters with no marker

`preview-server/src/sandbox-host.tsx:35-39`

```ts
function captureDomSnapshot(selector?: string): { html: string; activeElement: string } {
  const target = selector ? document.querySelector(selector) : document.getElementById("root");
  const html = (target ?? document.body).innerHTML.slice(0, 8000);
  return { html, activeElement: getActiveFocusSelector() };
}
```

The `.slice(0, 8000)` is silent. The result carries no `truncated` flag, no ellipsis, and no
original length, so a consumer cannot tell a complete snapshot from a clipped one. Our stored
artifacts end mid-CSS-declaration at `background-color: transparent !i`.

**Why this is P1 rather than a limit to document.** A plugin that injects a `<style>` block
as an early child of the snapshotted node gets a snapshot that is *entirely CSS* and never
reaches rendered markup. Every `domContains` assert then matches selector text inside that
stylesheet rather than anything the user would see, and every `domNotContains` passes
unconditionally. bonsAI's shell injects ~110 KB of scoped CSS, so this consumed the whole
budget with 8000 characters to spare — the assertions passed for two months while checking
nothing.

**Requested:**
1. Return `{ html, truncated: boolean, originalLength: number }`. The flag alone fixes the
   silent half; a consumer can then fail loudly.
2. Make the cap configurable per command (`maxChars`), with the current 8000 as default.
3. Offer `skipNodes: ["style", "script"]` (or strip them by default). Style content is never
   what a DOM assertion is looking for and it is the single biggest consumer of the budget.

**Also worth considering:** `innerHTML` excludes the selected element's own tag and
attributes. Selecting `[data-my-panel="x"]` returns the panel's *contents*, so the attribute
you selected on is not in the snapshot and cannot be asserted. `outerHTML`, or an added
`matchedOuter` field, would remove a surprising footgun.

---

## P1-2 — `runSequence`'s no-op fallback is byte-identical to a successful trace

`preview-server/src/sandbox-host.tsx:107-113`

```ts
const result = {
  focusPath: getFocusEventLog().length ? getFocusEventLog() : inputs.map((d) => `onMove(${d})`),
  ...
};
```

When the focus log is empty — nothing focusable found, no handler matched, plugin not
mounted — `focusPath` is synthesized from the inputs that were *requested*. The real log
entries are pushed as `` `${handlerKey}(${direction})` `` (`shim/focusManager.ts:137,147`),
which for a `Down` input produces exactly `onMove(Down)`.

So the success value and the failure value are the same string. A consumer asserting on
`focusPath` gets a pass whether navigation worked or nothing happened at all, and there is
no field that distinguishes them.

This is worse than returning an empty array. An empty `focusPath` is honest and a consumer
can fail on it; a fabricated one cannot be detected.

**Requested:**
1. Drop the fallback — return the real log, empty if empty.
2. If a fallback must stay for compatibility, mark it: `focusPathSynthesized: true`.
3. Consider a richer per-input trace (`{input, handlerKey, matchedSelector, moved}`) so
   consumers can assert *which element* handled each press. Today `focusPath` cannot express
   "Down moved from A to B", which is the assertion focus-graph QA actually needs.

bonsAI has deleted its only assertion over this field rather than keep a check that could
not fail.

---

## P1-3 — `captureScreenshot` returns a drawn placeholder that looks like a capture

`preview-server/src/sandbox-host.tsx:60-76`

When `html2canvas` throws, the fallback path draws a rectangle and returns it as
`pngBase64`:

```ts
ctx.fillText("Decky preview snapshot (placeholder)", 12, 24);
ctx.fillText(`${canvas.width}x${canvas.height}`, 12, 44);
```

The consumer receives the same `{ pngBase64 }` shape as a real capture and has no way to
tell them apart without decoding the image and reading the text. Ours were stored as
evidence for months; they are byte-identical within a batch, which is the only reason it
was noticed.

**Requested:** set a discriminator on the result — `{ placeholder: true, reason }` — or
return `{ ok: false, error }` and let the consumer decide. Drawing a fake image into the
field named for the real one is the part worth changing; the fallback itself is reasonable.

---

## P2-1 — The IPC bridge stops permanently the first time the preview is not open, and never restarts

`extension/src/preview/ipcBridge.ts:144-151`

```ts
const interval = setInterval(() => {
  if (!preview.isOpen()) {
    stopPreviewIpcBridge();
    return;
  }
  void drainCommands(preview);
}, 250);
```

`startPreviewIpcBridge` is called from exactly one place — `PreviewManager.start()`
(`manager.ts:78`). So once this tick fires with the panel closed, the watcher and the
interval are both torn down and nothing re-arms them until the preview is started again.
Reopening the panel through a path that does not call `start()` leaves a live preview with a
dead bridge, and every queued command sits in `~/.decky-plugin-studio/preview-ipc/`
unconsumed until its client times out.

**Requested:** keep the interval running and make it idempotent — skip draining while
closed rather than tearing down — or re-arm the bridge from wherever the panel is restored.

---

## P2-2 — One unresponsive command stalls every later command for 120 s, including ones that never touch the webview

`extension/src/preview/ipcBridge.ts:121-131` and `manager.ts:320-336`

`drainCommands` holds a `processing` mutex and awaits each command in turn. Every
webview-bound command resolves through `waitForWebviewMessage`, whose timeout is **120
seconds**. So a single command the webview cannot answer blocks the entire queue for two
minutes per command, serially.

Measured today: a `callTestHook` sent at 13:51:5x wrote its result at 13:53:40, and the six
commands behind it were still unconsumed minutes later. `callRpc` is affected too even
though it talks to the HTTP sidecar and not the webview — it simply waits its turn.

**Requested:**
1. A per-command `timeoutMs` in the command file, defaulting far below 120 s.
2. Do not serialize commands that do not need the webview (`callRpc`).
3. Fail fast when the webview is known-unreachable rather than waiting out the full timeout.

---

## P2-3 — A dead Vite child leaves `isOpen()` true and `preview-state.json` advertising a port nothing is listening on

`extension/src/preview/manager.ts:82-84`, `:70-75`, `:339-347`

```ts
isOpen(): boolean {
  return this.panel !== undefined;
}
```

`isOpen()` reports on the *VS Code panel object*, not on whether the preview is actually
serving. `stop()` does correctly unlink `preview-state.json` (`:346`) — but only when the
panel is disposed. If the Vite child process dies on its own, the panel stays open,
`isOpen()` stays `true`, `preview-state.json` keeps advertising the old URL, the IPC bridge
keeps accepting commands, and every one of them times out at 120 s.

That is the state we hit today: `preview-state.json` named `http://127.0.0.1:5290` while
that port refused connections and the sidecar on `8766` answered nothing, yet commands were
still being consumed from the queue.

**Requested:** watch the Vite child's exit, and on exit either restart it or mark the
preview down — clear `preview-state.json` and answer commands with a clear
`preview backend not running` instead of a timeout. A health field in `preview-state.json`
(pid, or a `/healthz` the consumer can poll) would let harnesses fail in seconds with an
accurate message rather than in minutes with a misleading one.

---

## P1-4 — Two workspaces with the extension installed silently share one preview, and the symptoms point nowhere near the cause

Every coordination surface is a **single global path or a fixed port**, with no workspace
discriminator:

| Resource | Path / port | Keyed by workspace? |
|---|---|---|
| Preview state | `~/.decky-plugin-studio/preview-state.json` | **No** — one file, last writer wins |
| IPC queue | `~/.decky-plugin-studio/preview-ipc/` | **No** — one directory, shared queue |
| Sidecar HTTP | `8766` (`ipcBridge.ts:7`) | **No** — fixed |
| Sidecar WS | `8765` | **No** — fixed |
| RPC allowlist | `~/.decky-plugin-studio/sandbox/<basename>/preview-rpc.json` | **Yes** — the one thing that is |

So opening a second workspace and starting its preview takes over the first one's automation
without any warning, and the allowlist — the only workspace-keyed piece — then disagrees with
the sidecar that is actually listening.

**Worked example, observed today.** Both `Documents\BonsAI` and a checkout of DPS itself were
open in Cursor with previews started. The sidecar holding `8766` was:

```
sidecar.py c:\Users\still\decky-plugin-studio
```

That workspace has no `main.py`, so `discoverMethods()` returned nothing and its
`preview-rpc.json` recorded `allowed: 0`. Meanwhile `sandbox/BonsAI/preview-rpc.json`
correctly listed all 52 methods. The result:

- every `callRpc` from the bonsAI harness returned
  `RPC method not allowlisted for preview: load_settings` — while the allowlist on disk for
  that workspace plainly contained it;
- every `snapshotDom` / `runSequence` was consumed from the shared queue by the *other*
  workspace's bridge, whose webview has no bonsAI plugin mounted, so nothing ever answered
  and each command burned the full 120 s (P2-2);
- `preview-state.json` advertised whichever port was written last, so consumers connected to
  a Vite instance belonging to neither run — four `vite` processes were alive across three
  ports.

None of those messages mentions a second workspace. Diagnosing it took reading the DPS source
and enumerating processes; a harness author with only the error text would conclude their
allowlist sync or their plugin was broken.

This is **P1** rather than P2 because it does not merely block automation — a shared IPC queue
means one workspace can silently consume and answer another workspace's commands, so a run can
report results produced against the wrong plugin entirely.

**Requested (any one of these fixes the sharp edge; the first is the real fix):**
1. Key every path and port on the workspace: `preview-ipc/<workspaceHash>/`,
   `preview-state-<workspaceHash>.json`, and dynamic ports recorded in that state file.
   `sandbox/<basename>/` already establishes the convention, and `basename` alone is not
   enough — two checkouts of the same repo name collide.
2. Failing that, **detect and refuse**: on `start()`, if a live preview for a *different*
   `workspaceRoot` holds the ports, show an error naming the other workspace rather than
   silently attaching.
3. Include `workspaceRoot` in every IPC command and result, and have the bridge ignore
   commands addressed to another workspace. Cheap, and it removes the cross-talk even if the
   ports stay shared.

**Closing the intruding preview does not restore the other one — it breaks it further.**
Observed immediately after the above: closing the DPS-repo preview ran `PreviewManager.stop()`,
which unlinks `preview-state.json` (`manager.ts:346`). That file is global, so workspace B's
consumers lost their state file because workspace A's panel closed. At the same moment
workspace B's IPC bridge had already torn itself down under P2-1 and does not re-arm, and the
sidecar on `8766` — which belonged to A — exited, leaving B with no RPC transport either.
Net effect: closing the offending preview leaves the *innocent* workspace with no state file,
no bridge and no sidecar, and its panel still looking open. The only recovery is to restart
the surviving workspace's preview.

This makes the isolation defect worse than "two previews conflict": the lifecycle of one
workspace's panel mutates global state other workspaces are actively depending on. Whatever
form the fix takes, `stop()` must only tear down resources its own workspace owns.

**Consumer workaround until then:** only one workspace may have a preview open at a time, and
after closing a second one, **restart the preview in the workspace you actually want** — it is
not still running, whatever the panel looks like.

---

## P3-1 — Unknown commands are read, deleted, and silently dropped

`extension/src/preview/ipcBridge.ts:41-110`

`processCommand` is a chain of `if (command.cmd === ...)` blocks with no final `else`. An
unrecognised or misspelled `cmd` is read, `unlinkSync`'d, and then nothing is written — so
the client waits out its full timeout and reports a transport failure for what is actually
a typo. There is no log line either.

**Requested:** `writeResult(command.id, { ok: false, error: \`Unknown command: ${cmd}\` })`.

*(bonsAI hit the same class of bug in its own runner — `assertStep` had no default branch,
so a misspelled assert type passed silently. Fixed on our side 2026-08-08; mentioning it
only because the shape is identical and the fix is one line in both.)*

---

## P3-2 — Result files accumulate forever

`~/.decky-plugin-studio/preview-ipc/` currently holds **57** `result-*.json` files, the
oldest from 2026-05-26. Consumers unlink results they successfully read, so every timed-out
command leaves an orphan behind permanently. Nothing GCs the directory, and there is no
stale-result check — a `result-<id>.json` left from a previous run is indistinguishable
from a fresh one if an id ever repeated.

**Requested:** delete results older than some age on bridge start, and delete `cmd-*.json`
older than the max command timeout so a crashed client cannot poison the next run.

---

## P3-3 — Test-hook discovery is fine; the failure mode is a timeout rather than the error it already computes

`preview-server/src/sandbox-host.tsx:20-26`, `:129-138`

Credit where due: `getPreviewTestHooks()` reads
`window.__deckyPreviewTestHooks ?? window.__bonsaiTestHooks`, so the legacy bonsAI name is
still honoured, and `window.__DECKY_PREVIEW__ = true` is set at `:29` before the plugin
renders — a plugin registering hooks from a mount effect sees the flag correctly.

When a hook is missing, `:132-137` already posts a precise
`Unknown preview hook: ${method}` result. That is the right behaviour. The problem is that
consumers rarely see it: if the sandbox host itself is not running (P2-3), the message never
comes back and the client reports `callTestHookResult timeout` instead — an infrastructure
message for what may be a plugin-side registration bug, or vice versa. Fixing P2-3 and P2-2
makes this error reachable, at which point it is genuinely useful.

**No change requested to the hook lookup itself.**

---

## Suggested priority

| Order | Item | Why first |
|-------|------|-----------|
| 0 | **P0-1** missing `useQuickAccessVisible` | Blocks everything. One line of shim restores a preview that has been unable to mount bonsAI since 2026-07-17. Items 2–4 of that entry matter almost as much as the export: a module-level throw currently presents as an unexplained 120 s timeout |
| 1 | **P1-4** workspace isolation | The only finding that can attribute one workspace's results to another. Also the one whose symptoms are actively misleading — option 3 (stamp `workspaceRoot` on commands) is cheap and removes the cross-talk on its own |
| 2 | **P2-3** dead-backend detection | Everything else is unobservable while a dead preview reports healthy. Turns a 120 s mystery into an instant, accurate error |
| 3 | **P2-1** bridge restart | Cheap, and without it a harness silently stops working mid-session |
| 4 | **P1-1** truncation flag | One added field retroactively makes every consumer's DOM assertions honest |
| 5 | **P1-2** / **P1-3** fabricated success values | Same class as P1-1: a synthesized value in the field that means success |
| 6 | **P2-2**, **P3-1**, **P3-2** | Ergonomics — real, but nothing depends on them |

The common thread in every P1 is worth stating on its own: **when DPS cannot do the thing,
it returns something shaped like success.** Truncated HTML looks like HTML, a synthesized
`focusPath` looks like a trace, a drawn placeholder looks like a screenshot. Each one
individually is a small fallback; together they let a test suite report green for two months
while asserting nothing. A single convention — *never populate a success field with
substitute data; add a flag instead* — would prevent all three.
