# What is actually in these folders

Artifacts written by [scripts/run-preview-suite.mjs](../../scripts/run-preview-suite.mjs)
under `--evidence` / `--write`. Layout is `<batch>/<date>-<sha>/<scenario-id>/`.

This file exists because **two of these artifacts are not what their filenames
suggest**, and that was not obvious to anyone reading a folder. Retention rules
and the batch-summary caveat live in [testing.md](../testing.md#evidence-retention).

| File | What it is | Trust it? |
|------|------------|-----------|
| `manifest.json` | Per-scenario result — steps, asserts, pass/fail, coverage ids. **Correct even where the batch roll-up is not.** | **Yes** |
| `batch-summary.json` | Roll-up for the invocation. Check `ranThisInvocation` / `carriedFromEarlierRun`; two summaries written before 2026-08-05 under-report — see [testing.md](../testing.md#evidence-retention). | Read the caveat first |
| `dom-final.html` | The `snapshotDom` result. **Truncated at 8183 bytes with no marker.** Where a plugin `<style>` block is the first child of the snapshotted node, the whole file is CSS and never reaches rendered markup. | **No — see D1** |
| `focus-path.json` | An **echo of the inputs the scenario injected**, not a record of where focus went. Every stored copy reads `["onMove(Down)","onMove(Down)"]`. | **No — see D3** |
| `active-element.txt` | Reads `document.body` in every stored run, i.e. focus never landed on a plugin element. | Only as evidence that focus did *not* move |
| `final.png` | **Not a screenshot.** A generated placeholder — a flat dark rectangle reading `Decky preview snapshot` and the viewport size, byte-identical within a batch. | **No — see D4** |
| `console.log` / stdout captures | Real. | Yes |

D1, D3 and D4 are Decky Plugin Studio behaviour and are recorded in the
[DPS findings log](../mcp-setup.md) for upstream. The full statement of what this
means for recorded coverage is
[testing.md § Preview-suite evidence invalidated](../testing.md#preview-suite-evidence-invalidated-2026-08-08).

**Nothing here is deleted as part of that.** Archived docs link these folders by
path, and the pruner already exempts any run cited from `docs/**/*.md`.
