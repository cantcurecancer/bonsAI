# Plan 30 — The tab bar collapses when it is not in use

**Status:** decided 2026-09-01, build not started. Twelve discovery decisions answered by the maintainer
(§ 3). Reopens locked decision **R5** as **D44** (open, answered in discovery, to be locked when the spike
in § 5 passes). Written against branch `experimental` at `06b2d02`.
**Fixes:** roadmap → Backlog → *Vertical space for the chat bubbles* → **The tab icon bar collapses when it
is not in use** (★★★★, [roadmap.md:453-461](../roadmap.md)).
**Folds in:** *Tab-strip micro labels + wide active cell* (★★, [roadmap.md:563-573](../roadmap.md)) — the
labels ship here, the wide cell is dropped.
**Settles:** the bug *The tab names never appear* ([roadmap.md:247-254](../roadmap.md)).
**Open questions it replaces:** [roadmap-details.md:181-205](../roadmap-details.md).

**Numbering note:** two other plans took number 29 on the same day (`29-preset-row-three-thirds-plan.md`,
`29-kb-answer-quality-plan.md`), which is why this one is 30.

---

## 1. Executive summary

The row of tab icons at the top of the panel costs about 85 of the column's 752 pixels, and it is only
used for a second or two per session. This plan replaces it with a thin bar, about 20 pixels tall. The
bar shows six small dashes, with the current tab's dash lit, and the current tab's name next to them.
Tiny LB and RB marks at its ends keep the one on-screen reminder that the shoulder buttons switch tabs.

When the D-pad ring lands on the bar, it opens into a full strip: six icons with a name under each. The
open strip floats over the top of the panel, so nothing below it moves. Moving Left or Right switches
tabs at once, the same as the shoulder buttons do. Moving Down closes the strip and drops the ring into
the panel. Steam keeps doing the tab switching underneath. Only Steam's bar is hidden.

Expected gain is about 60 pixels for the chat, to be measured on the Deck after deploy, not predicted.

The first step is a spike on the device that proves the shoulder buttons still switch tabs once Steam's
bar is hidden. If they do not, work stops and the finding goes back to the maintainer. That was the
maintainer's call in discovery, and it is the only gate that can end the plan.

What this plan deliberately does not do: no setting to turn it off, no idle timer, no layout that pushes
the panel down, no wide active cell, no change to the Python side, no replacement of Steam's tab
component.

---

## 2. What exists today

Every claim below carries a `file:line` checked 2026-09-01. Where the code cannot answer, the word is
**UNKNOWN** and § 7 says how it gets answered.

### 2.1 The strip is Steam's

- `Tabs` is Steam's own component, located at runtime by sniffing Steam's bundle
  ([Tabs.js:2-3](../../node_modules/@decky/ui/dist/components/Tabs.js)). There is no Decky-side
  implementation to read or patch.
- bonsAI mounts it once, inside `.bonsai-decky-tabs-root`, with `activeTab={currentTab}` and
  `onShowTab={onTabsShowTab}` ([index.tsx:1498-1509](../../src/index.tsx)). The only thing the plugin
  contributes to the bar is one icon element per tab
  ([tabTitles.tsx:57-74](../../src/features/plugin-shell/tabTitles.tsx)).
- Steam draws the bar, the LB and RB pills, the padding, the sliding carousel, and it handles the shoulder
  presses. The bar's own classes are build-hashed and change with Steam updates
  ([audit/decky-tab-strip-classes.md](../audit/decky-tab-strip-classes.md)).
- The carousel window is about 188px wide against 362px of content
  ([03-lbrb-tab-flicker.md § 10.2](03-lbrb-tab-flicker.md)), so roughly three of the six icons show at
  once and the active tab can scroll out of sight entirely (noted on **TAB-MARKER-01**,
  [testing.md:275](../testing.md)).

### 2.2 Tab state is ours

- `currentTab` and `setCurrentTab` live in
  [useBonsaiPluginShell.ts:58](../../src/hooks/useBonsaiPluginShell.ts). Steam reports a shoulder switch
  through `onTabsShowTab` ([:146-165](../../src/hooks/useBonsaiPluginShell.ts)), which also holds the
  750ms post-picker lock that blocks a spurious jump to Main after a modal closes
  ([:79-85](../../src/hooks/useBonsaiPluginShell.ts)).
- The last tab is saved to `localStorage` on every change
  ([useBonsaiPluginShell.ts:75-77](../../src/hooks/useBonsaiPluginShell.ts),
  [pluginStorage.ts:73](../../src/features/plugin-shell/pluginStorage.ts)). No RPC is involved anywhere
  in tab switching, which is why this plan touches no Python.
- The active-tab marker is keyed on `data-bonsai-active-tab` on the tabs root, because Steam never puts
  `.Active` on its buttons ([index.tsx:1491-1502](../../src/index.tsx),
  [section-1.ts:265-290](../../src/styles/sections/section-1.ts)).

### 2.3 Geometry and the two height hooks

| Piece | Value | Where |
|---|---|---|
| Plugin column | 300 × 752 CSS px, docked 1080p | [design-language.md:26](../design-language.md) |
| Scrolling body | 300 × 667 | same table |
| Strip plus gap | the other ~85px | [design-language.md:198](../design-language.md) (Rule 7) |
| Our icon cell | 40 × 44, gap −6 | [section-1.ts:156-171](../../src/styles/sections/section-1.ts), [constants.ts:97](../../src/features/unified-input/constants.ts) |
| Gap under the strip | 4px `TAB_STRIP_BODY_GAP_PX` | [constants.ts:65](../../src/features/unified-input/constants.ts) |

So about 40px of the 85 is Steam's padding and pills around a 44px cell. That split has never been
measured on its own. § 5 W0 measures it.

Two hooks and one helper size the body from the strip:

- `useTabStripBodyOffset` measures the bottom of the icon leaves against the tabs root, treats 48–56px as
  the only "stable" strip, retries up to 16 frames otherwise, and writes `--bonsai-tab-strip-reserve`
  ([useTabStripBodyOffset.ts:12-15, 37-61](../../src/hooks/useTabStripBodyOffset.ts)). The reserve is
  consumed as `margin-top` on `TabContentsScroll`
  ([section-3.ts:43-44](../../src/styles/sections/section-3.ts)).
- `syncTabBodyViewportHeight` pins `--bonsai-tab-body-height` to the scope height minus the content's top
  offset ([tabBodyViewport.ts:15-29](../../src/utils/tabBodyViewport.ts)); consumed at
  [section-3.ts:36-41](../../src/styles/sections/section-3.ts).
- `useQamPanelHeightGuard` re-runs that sync on resize and re-finds `TabContentsScroll` after every tab
  switch, because Steam replaces the node ([useQamPanelHeightGuard.ts:161-190](../../src/hooks/useQamPanelHeightGuard.ts)).
- `useMainTabColumnFill` measures the scroll viewport, not the strip
  ([useMainTabColumnFill.ts:1-15](../../src/hooks/useMainTabColumnFill.ts)).

The scope is a flex column with `overflow: hidden` ([scopeBase.ts:13-29](../../src/styles/sections/scopeBase.ts));
the tabs root is `overflow: clip` on both axes, which is the LB/RB flicker fix and must not change
([section-1.ts:19-34](../../src/styles/sections/section-1.ts)).

### 2.4 Focus facts the design leans on

- Opening the plugin leaves the ring unowned. The first Down lands on Decky's Back button, the second
  reaches the tab bar or whatever the plugin's first element is
  ([.cursor/rules/decky-focus-graph.mdc](../../.cursor/rules/decky-focus-graph.mdc), *Nothing owns the ring
  when a plugin opens*).
- The chat-slot row is a `Focusable` marked `focusable: true` with `onMoveDown: () => false` and **no**
  `onMoveUp` ([ChatSlotRow.tsx:203-256](../../src/features/chat-slots/ChatSlotRow.tsx)). Up from it
  reaches the strip today through Steam's spatial navigation, not through any wiring of ours. Settings
  behaves the same way ("settings Up at scroll top → tab strip", **DOC-SWEEP-01**,
  [testing.md:176](../testing.md)).
- Moving the ring between navigation containers needs `navRef.current.TakeFocus(true)`, never a DOM
  `focus()` ([navFocusRegistry.ts:1-34](../../src/utils/navFocusRegistry.ts)).
- While the slot row holds the ring the bumpers cycle slots, so Steam's own LB/RB hints are hidden by
  matching the only `img[aria-label]` inside the tabs root
  ([section-6.ts:662-677](../../src/styles/sections/section-6.ts)).
- A picker that closes on a non-Main tab can land the ring on the tab strip (**PICKER-FOCUS-01**,
  [roadmap-details.md:269](../roadmap-details.md)).

### 2.5 Prior decisions this plan touches

- **R5** ([major-redesign.md:340](../major-redesign.md), re-confirmed at [:357-358](../major-redesign.md)):
  filled active glyph only, no micro labels, no width change, no height cost. Its consequences are at
  [:360-368](../major-redesign.md). Reopened here as **D44**.
- **Track D** of the flicker recon ([03-lbrb-tab-flicker.md § 5](03-lbrb-tab-flicker.md)) rejected
  replacing Steam's `Tabs` with a custom strip as high risk. **This plan is not Track D.** Steam's `Tabs`
  stays mounted and keeps owning LB/RB and the tab bodies. Only its bar is hidden.

---

## 3. Decisions taken in discovery (2026-09-01)

All twelve went the recommended way. Each row is a maintainer call, not a build choice.

| # | Question | Call |
|---|---|---|
| 1 | Foundation | Our own bar. Steam's `Tabs` stays underneath for LB/RB and the tab bodies; its bar is hidden. |
| 2 | At rest | One thin row: six dashes, the active one lit, the active tab's name beside them. |
| 3 | Opens when | Only while the D-pad ring is on it. Collapses the moment focus moves into the panel. No timer. |
| 4 | D-pad stop | Yes. Up from the panel lands on the bar and opens it, ring on the active tab. |
| 5 | Open strip | Floats over the top of the panel. Nothing below moves. |
| 6 | Shoulder hints | Tiny LB and RB marks on the thin bar, hidden while the chat-slot row holds the ring. Present on the open strip too. |
| 7 | Open look | Six cells, a small name under every icon, the active one lit. |
| 8 | Left and Right | Switch the tab at once, the same as LB and RB. |
| 9 | Down | Lands on the first control of the current tab, as today. |
| 10 | Off switch | None. |
| 11 | Old backlog item | Folded in. The wide active cell is dropped. |
| 12 | If the spike fails | Stop, write up what was found, come back to the maintainer. |

Assumptions stated in discovery and not objected to:

- Names: **Main, Ollama, Settings, Permissions, Developer, About.** Dash count follows the mounted tabs,
  so five without Developer.
- LB or RB from inside the panel: the lit dash slides and the name changes. The bar does not pop open.
- Touch: a tap on the thin bar opens the strip, a tap on a tab switches and closes it, a tap anywhere
  else closes it. Hover does nothing on desktop and in the preview.
- Every tab gets the same bar. One component, one behaviour.
- Closing and reopening the QAM always comes back thin, showing the restored tab.
- B on the open strip keeps doing whatever Steam does today.
- Open and close use a short fade, never an animated height. Steam's own transitions stay untouched.
- The lit dash and the name use the same character accent the active icon uses today
  (`--bonsai-ui-tab-focus-1`, [characterUiAccent.ts:165](../../src/data/characterUiAccent.ts)).
- Left at the first tab and Right at the last do nothing, matching LB and RB.
- A picker that lands the ring on the strip today will open our bar instead. Acceptable and consistent.

---

## 4. The design

### 4.1 At rest — the thin bar

Drawn at the real 300px width. Heights are CSS px before `--bonsai-ui-scale`.

```
 ┌────────────────────────────────────────────────────────────────┐
 │ LB   ▬  ▬  ━  ▬  ▬  ▬   SETTINGS                            RB │  20px
 └────────────────────────────────────────────────────────────────┘
   4px gap (TAB_STRIP_BODY_GAP_PX, unchanged)
 ┌────────────────────────────────────────────────────────────────┐
 │ chat-slot row / tab body …                                     │
```

- **Dashes:** six (or five), each 14 × 3px with a 4px gap, so the block is about 104px. The active dash is
  the accent colour at full alpha and 2px taller; the others are `rgba(168,182,198,.35)`. The lit dash
  moves with `currentTab`; nothing else in the bar re-renders on a shoulder press.
- **Name:** the active tab's short name, 11px small caps, accent colour, 10px after the dash block.
  11px is the same size the chat-slot bumper pills use ([section-6.ts:703-715](../../src/styles/sections/section-6.ts)),
  and it is readable at rest, which is the whole requirement.
- **LB and RB marks:** 9px caps at the far ends, `rgba(168,182,198,.62)`, the slot-row pill colour.
  Hidden with `visibility: hidden` while `.bonsai-chat-slot-row--focused` is present, the same idea as
  the existing rule for Steam's hints ([section-6.ts:675-677](../../src/styles/sections/section-6.ts)),
  so the layout never shifts when they go.
- **Full bleed** (design-language Rule 1): the bar spans the column with 8px inner padding, the same edges
  as the slot row (Rule 3).
- **Height budget:** 20px bar + 4px gap = 24px, against about 85px today. Target reclaimed: **about 60px**.
  Filled in from device measurement in § 8, never from this paragraph.

### 4.2 Open — the full strip, floating

```
 ┌────────────────────────────────────────────────────────────────┐
 │ LB  ┌────┐ ┌──────┐ ┌────────┐ ┌───────────┐ ┌─────────┐ ┌─────┐ RB │
 │     │ 🌳 │ │  🦙  │ │   ⚙    │ │     🔒    │ │   🐞    │ │  ⓘ  │    │  54px, floats over
 │     │MAIN│ │OLLAMA│ │SETTINGS│ │PERMISSIONS│ │DEVELOPER│ │ABOUT│    │  the panel below
 │     └────┘ └──────┘ └────────┘ └───────────┘ └─────────┘ └─────┘    │
 └────────────────────────────────────────────────────────────────┘
        ▲ lit cell = active tab; the ring is drawn on it by our CSS
```

- The open strip is an absolutely positioned child of the bar's wrapper, `top: 0`, full width, height
  54px, `z-index: 3`. The wrapper itself stays `position: relative` and **20px tall in both states**, so
  neither height hook ever sees a change. `TabContentsScroll` carries `z-index: 1`
  ([section-1.ts:64-66](../../src/styles/sections/section-1.ts)), so 3 is enough.
- The strip covers the top 30px of the panel, which on Main is the chat-slot row. That is acceptable
  while the ring is on the strip, because the row is not in use then.
- **Cells are sized to their label, not equal.** Six equal cells would be 40–50px wide, and PERMISSIONS
  does not fit in 50px at any legible size. Sized-to-content the six labels plus padding and the two
  shoulder marks come to roughly 280px at 7px caps and roughly 305px at 8px caps (estimates from the
  6.45px-per-character figure D43 took from PHASE4-CHIPS-01, scaled for caps; **measure on device**).
- **Label size is settled on the Deck, not here** (row **TAB-BAR-07**). Start at 8px caps. If six tabs
  overflow 300px at 8px, the rule is: with the Developer tab mounted, PERMISSIONS and DEVELOPER use their
  short forms PERMS and DEV; without it, full names. That is a static rule on the tab list, not a
  runtime measurement (design-language Rule 4).
- **Icons** reuse the exact components and sizes the Steam titles use today, 26px for four tabs and 36px
  for Main and Developer ([tabTitles.tsx:67-74](../../src/features/plugin-shell/tabTitles.tsx),
  [constants.ts:61, 89, 94](../../src/features/unified-input/constants.ts)), in a 36px box, so the
  glyphs look the same as they do now.
- **Active cell:** `rgba(255,255,255,.10)` fill plus a 2px accent ring, the fill R5's own board 2b
  specified ([major-redesign.md:66-80](../major-redesign.md)). Inactive glyphs `rgba(168,182,198,.62)`,
  inactive labels `rgba(168,182,198,.5)`, from the same table.

### 4.3 Behaviour, state by state

Two states: **rest** and **open**. `open` is true when the bar's `Focusable` has focus, or when a touch
opened it. Nothing else opens it, and no timer closes it.

| Trigger | From | To | What happens |
|---|---|---|---|
| Ring lands on the bar (Up from the panel, Down from Decky's header) | rest | open | Strip draws; our ring on the active cell |
| Left / Right | open | open | Switch to the neighbour tab **at once**; at the ends do nothing; the press is always claimed (`return true`) so the ring never leaves sideways |
| LB / RB, ring anywhere | either | same | Steam switches; `currentTab` updates; the lit dash and name follow; if open, the lit cell follows |
| Down | open | rest | `onMoveDown` returns `false`, so Steam's spatial navigation descends into the panel's first stop, exactly as the slot row does at [ChatSlotRow.tsx:252](../../src/features/chat-slots/ChatSlotRow.tsx) |
| Up | open | leaves | `onMoveUp` returns `false`; Steam goes to Decky's Back button, as it does from the strip today |
| Blur for any other reason (modal opens, QAM closes) | open | rest | `onBlur` clears the state |
| A | open | open | No-op. Left/Right already switched. Not claimed |
| B | open | Steam's | Not handled |
| Tap on the thin bar | rest | open | `touchOpen` flag; no ring involved |
| Tap on a cell | open | rest | Switch, then close |
| Tap outside | open | rest | One `pointerdown` listener on the UI document, registered through `getUiDocument()` ([uiDocument.ts](../../src/utils/uiDocument.ts)), removed on close |

**Switching from our bar** calls a new `selectTab(id)` exported from `useBonsaiPluginShell`, which sets
`currentTab` and clears the post-picker lock. It does **not** go through `onTabsShowTab`, because that
lock exists to block Steam's spurious switch after a modal closes, and a press on our bar is never
spurious. `onTabsShowTab` keeps handling Steam's shoulder switches unchanged.

### 4.4 Hiding Steam's bar

- Steam's `Tabs` stays mounted with the same six title elements. `DECKY_TAB_TITLES` and the
  `aria-label` names stay exactly as they are; the tests at
  [tabTitles.test.tsx](../../src/features/plugin-shell/tabTitles.test.tsx) keep passing.
- The header row is hidden by **one structural rule** scoped under `.bonsai-decky-tabs-root`. The exact
  selector is **UNKNOWN until W0 runs the probe**, because the row's own class is hashed. The probe
  prints the full ancestor chain of every icon
  ([probe_deck_tab_strip.py](../../scripts/probe_deck_tab_strip.py)); the rule targets the shallowest
  ancestor that contains all six leaves and both `img[aria-label]` hints and does not contain
  `TabContentsScroll`, written as `:has()` on our own leaf class, never as a hash. Prior art for that
  shape is the shoulder-hint rule at [section-6.ts:675-677](../../src/styles/sections/section-6.ts).
- Preferred property is `display: none`, so Steam's hidden buttons leave Steam's focus graph and the
  ring can never land on something invisible. If the spike shows `display: none` kills the shoulder
  handling but `height: 0; overflow: clip; visibility: hidden` does not, use the latter and add the
  ghost-stop check (**TAB-BAR-05**) to every device pass.
- **Fail-safe by construction.** If a future Steam update stops the rule from matching, Steam's bar
  simply reappears above ours. The plugin loses 60px and gains nothing broken. The old marker and ring
  rules should be deleted by then (§ 5 W6), so there is no second bar fighting for styling.

### 4.5 The focus-graph entry (written before the control, Rule 8)

One new focus owner, one stop. The six cells are **not** separate stops; which cell is lit is component
state, so Steam's spatial navigation never has to pick between them.

- **Owner:** the `Focusable` root of `TabIndicatorBar`, with `focusable: true` (the lesson from
  [ChatSlotRow.tsx:219-234](../../src/features/chat-slots/ChatSlotRow.tsx): a `Focusable` with no
  focusable children is skipped unless marked), a `navRef` registered as `"tab-bar"` in
  `navFocusRegistry` (extend the `NavFocusId` union at
  [navFocusRegistry.ts:16](../../src/utils/navFocusRegistry.ts)), and a `ref` registered with
  `registerModalReturnFocusOwner("tab-bar", el)` on the element itself, not a wrapper (the
  `closest(".Panel.Focusable")` trap at [ChatSlotRow.tsx:205-213](../../src/features/chat-slots/ChatSlotRow.tsx)).
- **Handlers:** `onFocus` / `onBlur` drive `open`; `onMoveLeft` / `onMoveRight` switch and return `true`;
  `onMoveDown` returns `false`; `onMoveUp` returns `false`; `onButtonDown` claims nothing. Button ids go
  through the predicates in [focusNavigation.ts:107-163](../../src/utils/focusNavigation.ts), never
  stringified.
- **Entry from above:** Decky's Back button → Down. Measured, not assumed (W1c).
- **Entry from below:** the slot row and each tab's first control rely on Steam's spatial navigation to
  reach the strip today. If W1b shows that navigation does not reach a `Focusable` that sits outside
  Steam's `Tabs` container, the fallback is explicit: `onMoveUp` on those first stops calls
  `takeNavFocus("tab-bar")`, mirroring the existing `"chat-slot-row"` hop. Fallback cost: one handler per
  first stop, six tabs.
- **Exit down:** Steam's spatial navigation, per tab. Measured for all six tabs (**TAB-BAR-04**).
- **Modal return:** `finalizeShowModalAndRestoreActiveTab` runs the return-focus ladder
  ([useBonsaiPluginShell.ts:87-120](../../src/hooks/useBonsaiPluginShell.ts)). Where an opener misses
  today and the ring lands on Steam's strip, it must land on our bar instead. **PICKER-FOCUS-01** is
  re-run, not re-litigated.
- **Steam's own ring:** suppressed on the bar's `Focusable` with `outline: none`, and drawn by us on the
  lit cell. No catch-all `gpfocus` rule (design-tokens.md, *Two standing prohibitions*).

### 4.6 The height hooks after the change

- `useTabStripBodyOffset`: once Steam's header is `display: none`, the leaves measure 0, the "stable"
  test fails, the hook retries 16 frames and then writes a 4px reserve. Harmless but wasteful, and it
  also fires on every pointer move ([useTabStripBodyOffset.ts:73-91](../../src/hooks/useTabStripBodyOffset.ts)).
  Change: when the scope carries `.bonsai-tab-bar` (our bar mounted), write
  `--bonsai-tab-strip-reserve: ${TAB_STRIP_BODY_GAP_PX}px` once and return. The measuring path stays as
  the fallback for a scope without our bar. It is not deleted, because the Bazzite overlap it was
  written for is **UNKNOWN** on this hardware and there is no Bazzite device to measure.
- `syncTabBodyViewportHeight`: unchanged. It measures the content's top, which now sits under a
  constant 24px, so the body height is right by construction and never needs a re-pin on open or close.
- `useQamPanelHeightGuard`, `useMainTabColumnFill`: unchanged.
- After deploy, W3's probe reads `--bonsai-tab-strip-reserve`, `--bonsai-tab-body-height` and the
  `TabContentsScroll` top and writes them into § 8.

### 4.7 Names

- New `BONSAI_TAB_SHORT_NAMES` beside the accessible names in
  [tabTitles.tsx:48-55](../../src/features/plugin-shell/tabTitles.tsx): Main, Ollama, Settings,
  Permissions, Developer, About. Plus `BONSAI_TAB_STRIP_LABELS` for the open strip in caps, with the two
  short forms from § 4.2.
- The accessible names stay as they are. They are for screen readers and probes, and
  [tabTitles.test.tsx](../../src/features/plugin-shell/tabTitles.test.tsx) pins them.
- **Not translated.** The UI catalog holds 36 keys, all toasts ([catalog.ts](../../src/i18n/catalog.ts)).
  Every label on this surface is an English literal today. Whether the reply-language picker should one
  day translate chrome is a separate question; noted, not built.

### 4.8 Tokens

Added to [constants.ts](../../src/features/unified-input/constants.ts) and the table in
[design-tokens.md](../design-tokens.md). Every value goes through `uiScalePx()`, which already returns
a complete CSS length ([uiScalePx.ts:2-4](../../src/styles/sections/uiScalePx.ts)); never write
`${uiScalePx(n)}px` (plan 28 rule 3, 21 occurrences fixed there).

| Token | Value | Used for |
|---|---|---|
| `TAB_BAR_REST_HEIGHT_PX` | 20 | the thin bar |
| `TAB_BAR_OPEN_HEIGHT_PX` | 54 | the floating strip |
| `TAB_BAR_DASH_W_PX` / `TAB_BAR_DASH_H_PX` | 14 / 3 | dashes; the active one +2 tall |
| `TAB_BAR_DASH_GAP_PX` | 4 | between dashes |
| `TAB_BAR_NAME_PX` | 11 | active name at rest |
| `TAB_BAR_LABEL_PX` | 8, device-settled | names under icons when open |
| `TAB_BAR_SHOULDER_MARK_PX` | 9 | LB / RB marks |

Existing `TAB_TITLE_*` tokens stay; Steam's hidden titles still use them.

### 4.9 Files

| File | Change |
|---|---|
| `src/features/plugin-shell/TabIndicatorBar.tsx` (new) | the bar, both states, module header per [code-clarity.md](../code-clarity.md) |
| `src/features/plugin-shell/TabIndicatorBar.test.tsx` (new) | see § 5 W3–W5 |
| `src/features/plugin-shell/tabTitles.tsx` | the two name maps |
| `src/styles/sections/tabIndicatorBar.ts` (new) | the bar's CSS, registered in [bonsaiScopeStylesheet.ts:9-17](../../src/styles/bonsaiScopeStylesheet.ts) |
| `src/styles/sections/section-1.ts` | the one hiding rule (W3); dead strip rules deleted (W6) |
| `src/styles/sections/section-6.ts` | the `img[aria-label]` rule retargeted to our marks (W3) |
| `src/hooks/useBonsaiPluginShell.ts` | `selectTab(id)` |
| `src/hooks/useTabStripBodyOffset.ts` | the short-circuit |
| `src/utils/navFocusRegistry.ts` | `"tab-bar"` in the union |
| `src/index.tsx` | mount the bar above `.bonsai-decky-tabs-root`, inside the scope, inside the same `key`ed subtree so a UI-scale Apply remounts both together ([index.tsx:1498-1499](../../src/index.tsx)) |
| `src/features/unified-input/constants.ts`, `docs/design-tokens.md` | tokens |
| `docs/roadmap.md`, `docs/testing.md`, `docs/testing-manual.md`, `docs/major-redesign.md § 7`, `docs/roadmap-details.md` | bookkeeping (W7) |

`import-graph.json` and `hotspots.json` under `packages/bonsai-mcp/knowledge/architecture/` are
regenerated by the pre-commit hook; do not hand-edit them. No RPC is added, so `rpc-map.json` does not
change.

---

## 5. Work items, in commit order

Rules, the same as plan 28: one work item is one commit; after every commit run

```bash
npx tsc --noEmit
```

```bash
npm test
```

```bash
npm run build
```

and do not proceed on a failure. `npm run test:py` is unaffected; nothing here touches `main.py` or
`py_modules/`. Deploy with `scripts/build.ps1` (Windows) or `./scripts/build.sh dev`.

### W0 — Measure the baseline. No code.

1. With the QAM open on the Deck, run the strip probe and keep the full ancestor chain:
   ```bash
   ssh deck@$DECK_IP 'python3 -' < scripts/probe_deck_tab_strip.py
   ```
2. Extend the same probe (or write `scripts/probe_deck_tab_bar.py` beside it) to print: the header row's
   height, each leaf's bottom relative to the tabs root, the `TabContentsScroll` top, and the current
   values of `--bonsai-tab-strip-reserve` and `--bonsai-tab-body-height`. Read-only.
3. Record one D-pad walk through the rig: plugin open → Down → Down → Down, reading `gpfocus` after each
   press (`deck_readFocus`). That is the "first two Downs" baseline.
4. Write all of it into § 8 and name the header-row selector for W1.

**Gate:** § 8 has numbers, and the selector is written down.

### W1 — The spike. Throwaway; nothing from it merges as-is.

A single CSS rule behind a temporary scope class hides the header row found in W0. Deploy, then measure
five things, all through the rig with real presses and the `gpfocus` oracle, evidence under `runs/`:

| | Check | Pass looks like |
|---|---|---|
| a | LB and RB from inside the body still switch tabs, both directions, with a game running and without (the **CHAT-SLOTS-V2-05** matrix) | six switches, `currentTab` follows each |
| b | Up from the chat-slot row, and Up at the top of Settings | the ring lands on the first element above the tabs root; note **which** element |
| c | Down twice from a fresh open | first the Back button, then the same element as b |
| d | A full free-play sweep top to bottom | `gpfocus` never names a hidden Steam tab button |
| e | The two height variables | reserve fell to the gap, body height grew by the header's height |

**Gate, decided by the maintainer in discovery:** **(a) must pass.** If it fails under `display: none`,
retry once with `height: 0; overflow: clip; visibility: hidden`. If it fails under both, **stop**: write
the result into § 8 and D44, and hand it back. Do not fall back to squashing Steam's bar or to
replacing `Tabs`; both were offered and declined.

(b) and (c) decide whether § 4.5's fallback wiring is needed. They do not gate.

### W2 — Names and tokens. Pure additions.

The two name maps, the tokens, the `NavFocusId` union entry, `selectTab`. Unit tests: every tab id has a
short name and a strip label; the short forms exist only for `permissions` and `developer`.

### W3 — The thin bar, and Steam's bar hidden. One behaviour change.

- `TabIndicatorBar` at rest only: dashes, name, shoulder marks. Not yet focusable.
- Mounted above the tabs root; the W1 selector hides Steam's row; `useTabStripBodyOffset` short-circuits;
  the `img[aria-label]` rule in section-6 is retargeted to hide **our** marks while the slot row is
  focused.
- Unit tests (jsdom, behaviour not shape): six dashes, five without Developer; the lit dash and the name
  follow `currentTab`; marks present; a stylesheet tripwire in the style of
  `presetChipFocusRing.test.ts` asserting the hiding rule is scoped under `.bonsai-decky-tabs-root` and
  contains no hashed token (no `_` followed by a mixed-case run).
- Preview: `npm run test:preview` screenshot of the thin state. The preview has no gamepad, so this is
  the only state it can show.
- **Device:** rows **TAB-BAR-01** and **TAB-BAR-06**. Numbers into § 8.

### W4 — The bar becomes a stop.

- `focusable: true`, `navRef`, the handlers of § 4.5, `open` driven by focus. Left/Right switch through
  `selectTab`. The open state can render a placeholder (the thin bar with the lit cell outlined) until
  W5, so this commit is judged on focus alone.
- If W1b/c said spatial navigation does not reach the bar, add the `onMoveUp` hops on the first stops
  here, in this commit, not later.
- Unit tests: Left/Right call `selectTab` with the neighbour and claim the press; at the ends they claim
  it and call nothing; Down and Up return `false`; blur closes.
- **Device:** rows **TAB-BAR-02**, **-03**, **-04**, **-05**, **-09**.

### W5 — The open strip.

- The floating strip of § 4.2, touch open/close, the fade. Label size and the short-form rule settled on
  device.
- Unit tests: cells follow the tab list; the lit cell follows `currentTab`; a tap on a cell calls
  `selectTab` and closes; the outside-tap listener is added on open and removed on close, on the
  document `getUiDocument()` returns.
- **Device:** rows **TAB-BAR-07**, **-08**, **-10**.

### W6 — Delete the dead strip CSS. Behaviour-preserving, its own commit.

With Steam's row hidden, everything in [section-1.ts:74-290](../../src/styles/sections/section-1.ts)
that styles leaves, rings, icon colours and the marker is dead; the audit already recorded the ring
blocks as dead before this plan ([decky-tab-strip-classes.md](../audit/decky-tab-strip-classes.md),
*Still dead, deliberately left alone*). Delete them, keep the tabs-root layout rules
([:19-71](../../src/styles/sections/section-1.ts)) and the hiding rule. Drop `data-bonsai-active-tab`
only if nothing else reads it (`grep` first; `snapshotDom` scoping uses `data-bonsai-tab-panel`, a
different attribute). Screenshot diff before and after must be empty.

### W7 — Bookkeeping.

- `roadmap.md`: the ★★★★ item moves to the completed record with the § 8 numbers; the ★★ micro-labels
  item is closed as folded; the *tab names never appear* bug closes.
- `testing.md` coverage row plus the ten `testing-manual.md` rows below, each ticked with evidence.
- `design-tokens.md` table; `major-redesign.md § 7` R5 row points at D44; the open-questions section in
  `roadmap-details.md` is replaced by a pointer here.
- D44 locked in [maintainer-decisions-locked.md](../audit/maintainer-decisions-locked.md) with the spike
  result.

---

## 6. QA rows

All on-Deck. jsdom has no layout engine and the preview has no gamepad, so every row here is the only
proof there is. Rows land in `testing-manual.md` under a new **TAB-BAR — Collapsing tab bar (P0)**
section next to the CHAT-SLOTS ones, and one summary row in `testing.md`'s coverage table.

| Row | Scenario | Pass |
|---|---|---|
| **TAB-BAR-01** | Height | Thin bar ≤ 24px including the gap; `TabContentsScroll` top at least 55px higher than the W0 baseline; reading area measured and written to § 8 |
| **TAB-BAR-02** | Reach | Fresh open: Down lands on Back, second Down lands on the bar and it opens, ring on the active cell. From the slot row and from the top of Settings, Up lands on the bar |
| **TAB-BAR-03** | Switch | On the open strip Left and Right switch at once and stop at both ends; LB and RB from inside the body switch, the dash and name follow, and the bar stays thin |
| **TAB-BAR-04** | Collapse | Down from the open strip closes it and lands on the first control of each of the six tabs |
| **TAB-BAR-05** | No ghost stops | A free-play sweep top to bottom, in the style of **QA-FREE-PLAY-01**: `gpfocus` never names a hidden Steam tab element, and every stop is visible above the dock (the visible-not-just-focused rule) |
| **TAB-BAR-06** | Slot-row takeover | While the slot row holds the ring the bar's LB and RB marks are hidden and the bar's layout does not shift; they return when the ring leaves |
| **TAB-BAR-07** | Legibility, by eye | Names on the open strip readable on the handheld screen at the chosen size; with Ali G or the TF2 Announcer the lit dash and name are gold, with Shadowheart purple, otherwise green; after a QAM close and reopen the bar shows the restored tab without touching the D-pad (the **TAB-MARKER-01** steps, on the new bar) |
| **TAB-BAR-08** | Touch | Tap opens, a tab tap switches and closes, an outside tap closes |
| **TAB-BAR-09** | Modal return | After the character picker closes on a non-Main tab, the ring lands on the opener or on the bar. Never nowhere. Re-runs **PICKER-FOCUS-01**'s three openers |
| **TAB-BAR-10** | UI scale Apply | Settings → UI scale → Apply remounts the tabs subtree; the bar comes back thin, on the right tab, at the new scale |

Also re-run, because their landing spot changes: **DOC-SWEEP-01** (Settings Up → strip),
**CHAT-SLOTS-V3-01** (the walk starts at "tab strip"), **TAB-SWITCH-01** (the flicker fix must still
hold with the header hidden).

---

## 7. Risks and unknowns

| Risk | How it is answered | If it goes wrong |
|---|---|---|
| Steam stops handling LB/RB once its header is hidden | W1a | Stop; the maintainer's call |
| Steam's spatial navigation does not reach a `Focusable` outside the `Tabs` container | W1b, W1c | Explicit `onMoveUp` hops through `navFocusRegistry`, six of them, in W4 |
| Hidden Steam buttons remain in Steam's focus graph | W1d, TAB-BAR-05 | Switch the hiding property; if both leave ghosts, stop |
| The header-row selector is not expressible without a hash | W0 chain | Stop; Rule 5 is not negotiable |
| Six labels do not fit 300px at a readable size | § 4.2 short-form rule, TAB-BAR-07 | Drop to 7px caps; abbreviate only the two long names |
| The 750ms post-picker lock redirects a deliberate press | avoided by `selectTab` bypassing the lock | none; Steam's path keeps the lock |
| Bazzite's overlap case, the hook's original reason | UNKNOWN, no device | The measuring path stays as fallback |
| The floating strip covers the slot row while open | by design | none |
| A Steam update breaks the hiding rule | fail-safe: Steam's bar reappears above ours | 60px lost, nothing broken; W6 removed the duplicate styling |
| Concurrent plans touch the same files | `29-preset-row-three-thirds-plan.md` edits the dock, not the strip; no shared files found | Rebase; both stay one-item-per-commit |

---

## 8. Measurements

Filled in as they land. Nothing here is predicted.

| What | Baseline (W0) | After W3 | After W5 |
|---|---|---|---|
| Header row height, Steam's | **80.66px** (Steam's header wrapper, 300px wide, the Tabs panel's first of two children; the hint-and-icons row inside it is 252px wide at x+24) — 2026-09-02, six tabs, Main active, ring on a chip, no game | n/a | n/a |
| Leaf bottom relative to tabs root | 61.99–62.33px (leaves 40×44 at y+18) | | |
| `TabContentsScroll` top relative to scope | 84.66px (`margin-top` 4px, `z-index` 1; 616px tall, `scrollHeight` 692 so Main overflows by 76px with the ring on a chip) | | |
| `--bonsai-tab-strip-reserve` | 4px (on the tabs root) | | |
| `--bonsai-tab-body-height` | 616px (on the scope) | | |
| Transcript reading area (Main, chips showing) | 455px on 2026-08-31 after `fc1b245` ([roadmap.md](../roadmap.md), preset chips); **412px** on 2026-09-02 at W0 (`.bonsai-chat-transcript` clientHeight, two turns, session-context strip and frozen TEST chips showing, dock 157px) | | |
| Thin bar height | n/a | | |
| Open strip height and label size | n/a | n/a | |
| Header-row selector | `.bonsai-scope .bonsai-decky-tabs-root > .Panel.Focusable > div:has(.bonsai-tab-title-leaf):has(img[aria-label]):not(:has([class*="TabContentsScroll"]))` — matches exactly the 300px header wrapper; no hashed token; `:has()` already relied on at section-6.ts:675 | | |
| First Downs from a fresh open | 1st → Decky's Back button (`<BUTTON>` in the "bonsAI v0.5.0" header); 2nd → Steam's strip, on the Main tab (`"Ask bonsAI"`); 3rd → the chat-slot row (unlabelled `Focusable`); 4th → the transcript's first turn. `runs/TAB-BAR-W0-first-downs.json`, 2026-09-02 | | |
| B from inside the body | 1st B: chip → Steam's strip (Main tab); 2nd B: strip → panel closed, ring unowned, Decky list. `runs/TAB-BAR-W0-back-to-list*.json` | | |
| W1 a–e results | | | |

How W0 was measured (2026-09-02): [scripts/probe_deck_tab_bar.py](../../scripts/probe_deck_tab_bar.py), new
in W0, run over SSH with the QAM open, cross-checked against `deck_readPage` on the same DOM. Scope and tabs
root both 300 × 701 at y=64. The chain from a leaf up to the tabs root is eleven levels: leaf → Steam's tab
button → the 188px carousel window (nine children) → two wrappers → the 252px header row (three children:
LB hint, carousel, RB hint) → the 300px header wrapper → the Tabs panel (two children: that wrapper and the
body) → `.bonsai-decky-tabs-root`. All of Steam's classes on that chain are hashed; the wrapper is addressed
by position and contents only. Nothing in the chain is `position: absolute`, so hiding the wrapper with
`display: none` should pull the body up by the full 80.66px plus the 4px gap, to be confirmed in W1e.

---

## 9. Out of scope, on purpose

- A setting or Developer toggle to hold the strip open (one boolean is ~18 files and ~30 edit points,
  [CLAUDE.md § Where settings live](../../CLAUDE.md)).
- An idle timer.
- A layout that pushes the panel down when the strip opens.
- The wide active cell (board 3a's 96px cell).
- Translating tab names.
- Replacing Steam's `Tabs` or taking over LB/RB routing (Track D).
- Returning the ring to the control it came from on Down. Noted as a later nicety; it needs the
  return-focus registry, which still has **PICKER-FOCUS-01** open.
- Anything on the Python side.
