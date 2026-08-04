# Decky JS realms — why every `document` lookup in `src/` was a no-op (2026-08-04)

Answers a question three shipped focus fixes failed to answer by guessing:
*why does `element.focus()` "not work" on Deck, and why does `document.querySelector`
never find bonsAI markup?*

**Short answer:** the plugin's JavaScript and the plugin's UI live in **two different
documents**. Decky runs plugin code in SteamOS's `SharedJSContext`, whose `document` is a
14-element shell. The QAM UI is rendered into a *separate* popup document. So inside plugin
code the global `document` describes a page that contains none of our markup.

The document split is the first of two findings here. What was broken around every focus call
was finding the element and checking whether the move landed — both asked the wrong document.

**Read the second finding below before concluding anything about `focus()`.** A plain
`element.focus()` works *within* one navigation container and Steam's ring follows it; it does
**not** transfer gamepad focus to a different container. Treating the first half of that sentence
as the whole truth is what sent three further attempts down the wrong path.

---

## How this was measured

Steam's CEF remote-debugging port is open on the Deck (Decky requires it). Over an SSH
tunnel, `Runtime.evaluate` was run against each CEF target.

```bash
ssh -N -L 18080:127.0.0.1:8080 deck@$DECK_IP    # then: curl http://127.0.0.1:18080/json/list
```

| CEF target | `document.querySelectorAll('*').length` | Decky globals | bonsAI markup |
|---|---|---|---|
| `SharedJSContext` (`/routes/library/home`) | **14** | `DeckyPluginLoader`, `DeckyBackend`, `SP_REACT` | none |
| `QuickAccess_uid2` (`/routes/login`) | 347–373 | none | all of it |

The decisive test ran code **inside the plugin's own realm**, not next to it. A function
object created by plugin code carries that realm's `Function` constructor, so
`pluginFn.constructor(body)()` executes with the plugin's globals:

```js
const props = /* React fiber props of .bonsai-chat-ai-bubble */;
props.onMoveDown.constructor("return document.querySelectorAll('*').length")()   // → 14
```

Same trick, handing our element across the boundary, gives the before/after table below.

---

## What each shape answers, from the plugin's realm

Measured against the live masked spoiler fence, 2026-08-04:

| Expression | Result | Meaning |
|---|---|---|
| `document.querySelectorAll('.bonsai-chat-ai-bubble').length` | `0` | every document-wide query misses |
| `document.contains(bubble)` | `false` | the registry guard rejected every element it was given |
| `document.activeElement` | shell `<body>` | focus-derived lookup always resolves to nothing |
| `bubble.isConnected` | `true` | the node knows its own tree — works across realms |
| `bubble.ownerDocument === document` | `false` | the two documents, stated plainly |
| `bubble.querySelector('.bonsai-spoiler-reveal-target')` | found | **element-scoped queries are fine** |
| `fence.contains(document.activeElement)` | `false` | the old "did focus land?" check, wrong every time |
| `fence.ownerDocument.activeElement === fence` | `true` | the same check asked of the right document |

After focusing the fence from the plugin realm, the fence carried `gpfocus gpfocuswithin`
one tick later: **Steam's own gamepad ring follows a plain DOM `focus()`**.

---

## Why the spoiler D-pad fix failed twice

Both attempts were written against the wrong model — that Decky's virtual focus ignores DOM
focus. The real chain, in `handleAnswerBubbleMoveDown`:

1. `captureBubble()` → `resolveFocusedAnswerBubble()` → `document.activeElement` → the shell's
   `<body>` → `null`.
2. The fallback registry was empty, because `registerAnswerBubbleEl` guarded on
   `document.contains(el)` — false for every bubble ever passed to it.
3. `handleAnswerBubbleMoveDown` returned at `if (!bubble)`, its first line.

Everything after that line — the fence registry, the in-view test, the visited flag, and the
`dbg_fe_log` probe added to diagnose it — was unreachable. That is why the probe logged
**nothing at all** rather than logging a failure: absence of a log line was the finding.

A third failure mode sat underneath: `focusPanelEl` and `focusDeckOwner` end with
`target.contains(document.activeElement)`. Even when handed a valid element they report
`false` for a focus move that succeeded, so callers treat working focus as failure and fall
through to scrolling.

---

## The rule

**Never ask the global `document` about the plugin's own UI.** In order of preference:

1. **A ref.** `registerSpoilerFence`, `replyStopRegistry`, `registerAnswerBubbleEl` — a node
   captured at mount is the only lookup that cannot miss.
2. **Element-scoped queries.** `bubble.querySelector('.bonsai-…')` traverses that element's
   own subtree, in its own document. Safe.
3. **`getUiDocument()`** ([src/utils/uiDocument.ts](../../src/utils/uiDocument.ts)) when a
   document-wide query is genuinely unavoidable. It learns the right document from the first
   element any registry sees.

And two shapes to avoid on sight:

- `document.contains(el)` / `document.activeElement` → use `el.isConnected` and
  `elementHasFocus(el)`, which ask the node about its own document.
- `el instanceof HTMLElement` → **false** for a node from the other realm, which has its own
  `HTMLElement` constructor. Cast instead of brand-checking.

Also load-bearing: do not overwrite an existing `tabindex`. Decky sets `0` on the nodes it
navigates; forcing `-1` removes them from Steam's graph for later presses.

---

## Second finding: DOM focus does not cross navigation containers

The realm fix above made focus helpers *reach* their targets. It did not make every focus move
land, and the difference cost three more attempts on one bug — nothing below the reply row was
reachable by D-pad.

`element.focus()` sets `document.activeElement`. It does **not** transfer Steam's gamepad focus
ownership when the target is in a different navigation container. Measured 2026-08-04 with the
reply row focused, running exactly what `focusSessionContextStrip` ran:

| after focusing the session context strip | |
|---|---|
| `document.activeElement` | the strip |
| `gpfocus` (Steam's ring) | still on **Retry** |
| `gpfocus` 250 ms later | **gone entirely** |

Steam kept routing every press to the reply row, and `elementHasFocus` — correct about the
document — reported success, because `activeElement` really had moved. Instrumentation confirmed
the loop: `onButtonDown` arrived with `button: 10` (`DIR_DOWN`), the handler ran, it reported
`moved: true`, and the next press was delivered to the same row again.

**This is why the spoiler fence worked and this did not**, and taking the fence as proof that a DOM
focus is sufficient is what sent the next three attempts down the wrong path. The fence sits inside
the container that already held focus, so Steam's focus-within tracking follows a plain `focus()`.
A container's sibling does not.

The transfer Steam uses on itself is `navRef.current.TakeFocus()` → `BTakeFocus` — 166 uses of
`TakeFocus` and 200 of `navRef` in SteamUI's bundle. `navRef` is a real prop that Decky's types
omit (it is declared only on `Toggle`), so it needs the same cast as `onMoveDown`.
See `src/utils/navFocusRegistry.ts`.

## Which handler actually fires

Three separate bugs came from wiring a handler that is never called, or one that is called far more
often than intended:

| Prop | On a Decky `Focusable` | On a Decky `Button` | Argument |
|---|---|---|---|
| `onMoveUp` / `onMoveDown` | fires (answer bubble) | **never fires** — not forwarded | — |
| `onButtonDown` | fires for **every** button | fires for **every** button | `GamepadEvent`, id at `evt.detail.button` |
| `onActivate` | A only | A only | `CustomEvent` |

`onMove*` is absent from Decky's `FooterLegendProps` and `DialogButtonProps` but real in SteamUI —
the types are incomplete, not the API. Button ids: `OK = 1`, `CANCEL = 2`, `DIR_UP = 9`,
`DIR_DOWN = 10`.

Because `onButtonDown` fires for everything, a state-changing handler **must** whitelist its button.
Three controls — the masked spoiler fence, its collapse control, and the session context header —
toggled themselves on any press, including the D-pad press meant to move past them.

## The tabindex rule

`tabindex="-1"` removes an element from Steam's navigation graph. Four copies of the same focus
ladder in this repo stamped it on every element they touched. For the reply row that meant
navigating *onto* Retry is what stopped Retry responding to the next press. Never overwrite an
existing `tabindex` — Decky sets `0` on the nodes it navigates — and never add one to an element
that is natively focusable.

## Remaining call sites

Fixed here: `answerBubbleElRegistry`, `answerBubbleNavigation`, `buildAnswerBubbleElement`,
`liveTurnFocusGraph`, `spoilerFenceRegistry`.

Still asking the global `document`, same root cause, not yet swept — tracked in
[roadmap.md § Bugs](../roadmap.md#bugs) (document-sweep row):

| File | Line | Shape |
|---|---|---|
| `src/utils/chatPanelScroll.ts` | 80 | `document.activeElement` as scroll anchor |
| `src/utils/focusNavigation.ts` | 130 | `getFocusableWithin` root query |
| `src/utils/settingsPanelScroll.ts` | 21 | `.bonsai-scope` fallback query |
| `src/components/MainTabChatTranscript.tsx` | 211, 222, 223 | header query + `activeElement` |
| `src/components/MainTabUnifiedAskBar.tsx` | 737 | `activeElement` |
| `src/components/MainTabPresetAnimatedChips.tsx` | 157 | `contains(document.activeElement)` |
| `src/components/AboutTab.tsx` | 99 | dropdown query |
| `src/hooks/useBonsaiAskOrchestration.ts` | 730 | `instanceof HTMLElement` + `blur()` |

Line numbers re-derived 2026-08-04 after the fixes landed. Tracked in `docs/roadmap.md`, together
with a second sweep for `onButtonDown` handlers that act on every button or test a direction with a
string predicate.

The `CharacterPickerModal` focus graph (roadmap ★★★) is the same bug in a modal: it drives
D-pad focus with `shell.querySelector(...)`. Modals portal to yet another root, so confirm
which document they land in before assuming this fix covers them.
