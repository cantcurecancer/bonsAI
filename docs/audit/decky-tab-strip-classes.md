# Decky tab strip: `.Active` does not exist on device

**Measured 2026-08-04 over CEF against a running Deck.** Not inferred.

The whole tab-strip section of `src/styles/sections/section-1.ts` is keyed on `.Active` /
`.active`. **SteamOS never applies either class to these buttons.** Every rule that depends on
it — the dim ring, the bright ring, the active icon colour and both icon drop-shadow blocks —
has been dead for as long as it has existed.

This is the root cause of roadmap item *"No persistent indicator of which tab you are on"*, and
it is why a first fix attempt that added another `.Active` rule changed nothing on device.

---

## How this was measured

Same approach as [decky-realms.md](decky-realms.md), but simpler: the QuickAccess CEF target
owns the markup, so `Runtime.evaluate` against it needs no realm trick. The probe walked every
`.bonsai-tab-title-icon` up to `.bonsai-decky-tabs-root`, printing each ancestor's class list
plus the icon's computed `color`.

Run from the repo with the QAM open on the Deck:

```bash
ssh deck@$DECK_IP 'python3 -' < scripts/probe_deck_tab_strip.py
```

The probe is stdlib-only — it implements the RFC6455 handshake and framing by hand, because the
Deck's Python has no websocket package.

---

## What came back

Ollama tab active, focus in the tab body. Six glyphs found, ancestor chains trimmed to the
classes that matter:

| Glyph | Computed `color` | `.Active` on any ancestor |
|---|---|---|
| `--main` | `rgb(252, 252, 252)` | **false** |
| `--ollama` (active) | `rgb(252, 252, 252)` | **false** |
| `--settings` | `rgb(252, 252, 252)` | **false** |
| `--permissions` | `rgb(252, 252, 252)` | **false** |
| `--developer` | `rgb(252, 252, 252)` | **false** |
| `--about` | `rgb(252, 252, 252)` | **false** |

Three things follow.

**1. There is no active/inactive distinction at all.** All six compute to the same white. A
screenshot suggested the gear was dimmer; that was anti-aliasing on a thin 26px stroke, and the
computed style says otherwise. Do not settle this kind of question from pixels again — measure.

**2. `#fcfcfc` is ours, and it lands on everything.** It is the literal in the
`:focus-visible:not(.Active)` / `.gpfocuswithin:not(.Active)` block. The strip container

```
div._3IBLc81yyL08OJ7rfKtF00.Panel.Focusable.gpfocuswithin
```

is an ancestor of **every** glyph and carries no `.Active`, so `:not(.Active)` is satisfied for
all of them. A rule written to highlight *the tab you are pointing at* paints *all six*.

**3. Steam marks the active tab with a build-hashed class.** The active button's chain differs
from its siblings by exactly one token:

```
active   div._3eEbSktrstBdLk0dVpnKVI._3Gp1bACHx__POxmy6Gd3kG.KFGEkx9yKpW3Mu7w_6vzn.Panel.Focusable
others   div._3eEbSktrstBdLk0dVpnKVI.KFGEkx9yKpW3Mu7w_6vzn.Panel.Focusable
```

`_3Gp1bACHx__POxmy6Gd3kG` is a CSS-module hash from Steam's own build. **It is not usable** — it
changes whenever Valve ships a client update, and a selector built on it would fail silently,
which is the exact failure mode being fixed here.

---

## Consequence for any future strip work

**Key strip styling on state bonsAI owns, never on Steam's classes.** The plugin already knows
the active tab: `currentTab` drives `<Tabs activeTab={currentTab}>`. The marker now hangs off
`data-bonsai-active-tab` on `.bonsai-decky-tabs-root`, with one rule per tab id matching the
existing `--<id>` class on the glyph. That also keeps the strip from re-rendering on a shoulder
press: the attribute changes, the title elements do not.

**Still dead, deliberately left alone:** the dim ring, bright ring and both drop-shadow blocks.
Removing them is a behaviour change that cannot be verified without another device pass, so it
is filed under roadmap rather than bundled into the marker fix. Worth knowing while reading that
CSS: **the tab strip currently has no working focus ring of its own**, and what looks like one in
those rules never fires.
