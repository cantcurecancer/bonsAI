# 14 — Kids master lock — implementation plan

**Status:** **Not started.** **Stage 0 (on-Deck spike) is blocking** — no code is
written until steps 3 and 5 return. Only the maintainer can run it.
**Research source (do not edit as ship plan):** [08-kids-master-lock-feasibility.md](08-kids-master-lock-feasibility.md)
**Roadmap:** [Planned § Near-term — Kids master lock](../roadmap.md#near-term) (★★★)

## What ships

When Steam reports parental controls **locked** on the signed-in account, bonsAI
forces every capability in `CAPABILITY_KEYS` to deny — file writes, screenshots
and game logs, Steam ban lookups, microphone — and greys the Permissions toggles
so they cannot be turned back on from inside the plugin. Ask, local/LAN Ollama and
the offline knowledge base keep working.

That is scope option **A** from the research (`08` § 2), which is behaviourally
identical to option **D** once Web joins the key set. Options **B** (kill Ask) and
**C** (force model policy Tier 1) were rejected there and are not revisited here.

## What this is not

- **Not a content filter.** bonsAI does not moderate, censor, or age-rate model
  output, and no copy may imply it does.
- **Not a security boundary.** The Python backend cannot verify the frontend's
  claim (there is no Steam IPC on the backend side). This is a guardrail against
  casual use; anyone who can edit `dist/index.js` can defeat it.
- **No bonsAI-side PIN or unlock.** Unlocking happens in Steam.
- **No persisted lock state.** Nothing new is written to `settings.json`.
- **No protobuf decode** in v1 — no `enabled_features` bitmask, no per-feature
  mapping to `EParentalFeature`.
- **No changes at the 12 existing `capability_enabled()` call sites.**

---

## Stage 0 — On-Deck spike (BLOCKING)

Run the seven CEF-console steps in [08 § 6](08-kids-master-lock-feasibility.md).
Append the results to `08` as a **Spike results** section — not to chat, not here.

**Never log `strPlaintextPassword`.** Log `{ever_enabled, locked, byteLength, hasPlaintext: !!strPlaintextPassword}`
and nothing more. It is a real credential and it is sitting in the payload.

### Decision gate

| Spike outcome | Action |
|---|---|
| Family View on a spare **adult** account reports `locked: true` (step 3) | Proceed to Stage 1 |
| **Child** account also reports `locked: true` (step 5) | v1 ships exactly as scoped below |
| Child account does **not** report `locked` | Add **Stage 6** — decode `is_enabled` from the `settings` `ArrayBuffer`. Re-star the roadmap item ★★★ → ★★★★ |
| Decky QAM unreachable under lock (step 4) | **Stop.** The feature protects a surface the user cannot reach. Record the finding and close the roadmap item |

Steps 3 and 5 are the two that gate code. Steps 1, 2, 6 and 7 are cheap and
inform the probe's timeout and the "no local cache" claim in the docs.

---

## Stage 1 — Probe utility

**New:** `src/utils/steamParental.ts` (+ `steamParental.test.ts`)

A pure, subscription-based reader over `SteamClient.Parental`. Opens with the
repo's `Title: / Purpose: / Used for: / Solves: / Does not:` header block
([docs/code-clarity.md](../code-clarity.md)).

Exports a subscribe function returning `{ everEnabled, locked } | undefined`,
where **`undefined` means UNKNOWN** — not "unlocked".

Four failure modes it must survive, all recorded in `08` § 1:

1. `SteamClient.Parental` absent (not SharedJSContext, or a Steam build without it).
2. **The callback fires synchronously inside `register()`, before it returns.**
   The naive `const reg = register(cb)` then `reg.unregister()` inside `cb`
   dereferences an unassigned variable. Defer the unregister behind a pending flag.
3. `register()` throws *after* firing — `reg` stays unset and the subscription leaks.
4. Never fires → bounded timeout, resolve UNKNOWN.

**Tests.** The `SteamClient` stub at [src/test-harness/setup.ts:37-45](../../src/test-harness/setup.ts)
today fakes only `URL.ExecuteSteamURL`; it gains a configurable `Parental` fake.
Cases: sync fire, async fire, never fires, `register()` throws, API absent,
`locked` true→false→true, and no leaked subscription in any path.

## Stage 2 — Lock hook and latch

**New:** `src/hooks/useKidsLock.ts` (+ test)

A **long-lived subscription**, not a one-shot read. A parent unlocking mid-session
must lift the lock without a plugin reload — which is the whole reason the Steam
API is a subscription rather than a getter.

Two latch rules, and they are the load-bearing decision in this plan:

- **UNKNOWN → unlocked.** Failing closed on a timeout would strip
  filesystem/mic/screenshots from every existing user who has no parental controls
  configured at all. That is a mass regression triggered by a slow callback.
  (This deliberately inverts the `booster-framework` prior art, whose threat model
  is not ours — see `08` § 1.)
- **Latch on observation.** Once `locked: true` has been seen this session, only an
  explicit `locked: false` callback clears it — never a timeout, error, or unregister.

Pushes state to the backend with
`callDeckyWithTimeout("set_kids_lock_state", [active])`
([src/utils/deckyCall.ts:17](../../src/utils/deckyCall.ts) — the wrapper takes args as an
**array**, unlike bare `call()`). Retry once on failure, then log and leave the
frontend gating in place.

## Stage 3 — Backend guard

**Edit:** [py_modules/backend/services/capabilities.py](../../py_modules/backend/services/capabilities.py),
[main.py](../../main.py), [tests/test_capabilities.py](../../tests/test_capabilities.py)

Module-level `_kids_lock_active` plus `set_kids_lock_active()` / `kids_lock_active()`,
checked as the **first** line of `capability_enabled()` (`capabilities.py:44`).

Two things this deliberately does not do:

- **Does not touch `sanitize_capabilities()`.** Sanitizing to `False` would rewrite
  the user's stored preferences to disk, so unlocking would not restore them.
- **Does not add a parameter to `capability_enabled()`.** A third argument touches
  all 12 call sites (`main.py:496, :654, :1714, :1750, :1778, :1818, :1847,
  :1986-1990, :2581, :2733`) and every future call site can forget to pass it —
  a failure mode that fails **open**, which is the wrong direction for a safety guard.

New RPC `set_kids_lock_state` on `class Plugin`, modelled on `set_intent_pack_enabled`
(`main.py:872`). Reset the flag to `False` in `_main` (`main.py:308`) so a backend
restart never leaves a stale lock. `rpc-map.json` regenerates via the pre-commit
hook — never hand-edit it.

**Free consequence, worth stating explicitly:** the guard is key-set based, so the
future **Web** capability is forced off the moment it joins `CAPABILITY_KEYS`. That
is the contract the Web roadmap entry already commits to, delivered with no extra code.

## Stage 4 — UI

**Edit:** [src/index.tsx](../../src/index.tsx),
[src/components/PermissionsTab.tsx](../../src/components/PermissionsTab.tsx),
[src/features/plugin-shell/tabs/usePermissionsTabPayload.tsx](../../src/features/plugin-shell/tabs/usePermissionsTabPayload.tsx)

The lock cannot be backend-only: `capabilities` is read in about ten places in
`index.tsx` to gate frontend affordances (`:302, :331, :397, :861, :870, :994-997`),
so a locked Deck would still show enabled screenshot/note/mic controls that then
fail at the RPC. Derive `effectiveCapabilities` **once** from `capabilities` +
`kidsLockActive` and pass it to those consumers.

`PermissionsTab` gains a `kidsLockActive` prop:

- A banner row above the existing intro block (`PermissionsTab.tsx:50-56`).
- Every `ToggleField` rendered **off and disabled**.
- **Never mutate `capabilities` state** — the stored values must survive the lock
  so unlocking restores exactly what the user had.

`usePermissionsTabPayload` threads the prop.

**Focus.** Per `.cursor/rules/decky-focus-graph.mdc`, a plain `ToggleField` inside
an existing `PanelSection` needs no focus wiring of its own — so nothing new is
being added to the graph. The risk is the opposite: **disabling all four toggles
may leave the Permissions tab with no focusable stop at all**, the same class of
D-pad dead end the KB-download Cancel fix addressed. That is an on-Deck check
(**KIDS-FOCUS-01**), not something to conclude from the code.

### Draft banner copy

Needs a maintainer copy pass before shipping. Constraints from `08` § 4: attribute
the signal to Steam, never claim child-safety, never promise output filtering, and
give no PIN instructions (Steam Families child accounts have no local PIN unlock).

> **Parental controls active.** Steam reports that parental controls are locked on
> this account, so bonsAI keeps every high-impact permission off — no file writes,
> no screenshots or game logs, no microphone, no Steam ban lookups. Ask still works
> with your local AI. These switches turn back on by themselves when Steam's
> parental controls are unlocked. bonsAI does not filter what the AI says.

The last sentence is the important one and should not be cut for length.

## Stage 5 — Docs

- **README** — beta caveat line, plus the seven-item *cannot promise* list from
  `08`. The load-bearing one: *we do not filter what the AI says.*
- **[docs/troubleshooting.md](../troubleshooting.md)** — a section for "bonsAI's
  permissions are all greyed out and I can't turn them on".
- **[docs/testing.md](../testing.md)** — on-Deck rows:
  - **KIDS-LOCK-01** — Family View locked on a spare adult account: all toggles
    grey, banner shows, privileged actions deny; unlock restores prior values.
  - **KIDS-LOCK-02** — Steam Families child account (may stay Open if no account).
  - **KIDS-FOCUS-01** — D-pad through the Permissions tab while locked; no dead end.
  - **KIDS-REGRESS-01** — Deck with no parental controls configured: behaviour
    identical to today.
- **[docs/roadmap.md](../roadmap.md)** — move the item to In Progress, then Completed.
- **[CHANGELOG.md](../../CHANGELOG.md)** — `[Unreleased] → Added`.

---

## Commit sequence

One coherent change per commit, all four gates green between each:

1. **Stage 1 + 2** — probe and hook, no consumers. Inert; nothing changes for users.
2. **Stage 3** — backend guard and RPC.
3. **Stage 4** — UI wiring; the feature becomes live here.
4. **Stage 5** — docs.

## Verification

```bash
npm test && npm run test:py && npx tsc --noEmit && npm run build
```

Then deploy (`scripts/build.ps1`, or `./scripts/build.sh dev`) and run
**KIDS-LOCK-01**, **KIDS-FOCUS-01** and **KIDS-REGRESS-01** on-Deck.
**KIDS-REGRESS-01 is the one that must not be skipped** — the failure mode this
design is most exposed to is breaking Decks that have no parental controls at all.
