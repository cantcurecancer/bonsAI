# Decky JS realms — why every `document` lookup in `src/` was a no-op (2026-08-04)

Answers a question three shipped focus fixes failed to answer by guessing:
*why does `element.focus()` "not work" on Deck, and why does `document.querySelector`
never find bonsAI markup?*

**Short answer:** the plugin's JavaScript and the plugin's UI live in **two different
documents**. Decky runs plugin code in SteamOS's `SharedJSContext`, whose `document` is a
14-element shell. The QAM UI is rendered into a *separate* popup document. So inside plugin
code the global `document` describes a page that contains none of our markup.

`element.focus()` was never the broken part. It works, and Steam's gamepad ring follows it.
What was broken is everything the code did *around* the focus call: finding the element,
and checking whether the move landed.

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

## Remaining call sites

Fixed here: `answerBubbleElRegistry`, `answerBubbleNavigation`, `buildAnswerBubbleElement`,
`liveTurnFocusGraph`, `spoilerFenceRegistry`.

Still asking the global `document`, same root cause, not yet swept — tracked in
`docs/roadmap.md`:

| File | Line | Shape |
|---|---|---|
| `src/utils/chatPanelScroll.ts` | 80 | `document.activeElement` as scroll anchor |
| `src/utils/focusNavigation.ts` | 71 | `getFocusableWithin` root query |
| `src/utils/settingsPanelScroll.ts` | 21 | `.bonsai-scope` fallback query |
| `src/components/MainTabChatTranscript.tsx` | 203, 214, 215 | header query + `activeElement` |
| `src/components/MainTabUnifiedAskBar.tsx` | 737 | `activeElement` |
| `src/components/MainTabPresetAnimatedChips.tsx` | 157 | `contains(document.activeElement)` |
| `src/components/AboutTab.tsx` | 99 | dropdown query |
| `src/hooks/useBonsaiAskOrchestration.ts` | 730 | `instanceof HTMLElement` + `blur()` |

The `CharacterPickerModal` focus graph (roadmap ★★★) is the same bug in a modal: it drives
D-pad focus with `shell.querySelector(...)`. Modals portal to yet another root, so confirm
which document they land in before assuming this fix covers them.
