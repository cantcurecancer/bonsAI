# 15 — Corpus licensing and attribution — executable plan

**Status:** `NOT STARTED` — **blocks first public corpus publish, nothing else.**
**Roadmap:** [Planned § Near-term — RAG Deck query — public publish (Phase 6)](../roadmap.md#near-term) (★★★★)
**Already shipped and out of scope here:** per-reply credit on the knowledge chip and the
per-card `source_url` rule — landed 2026-08-09, see
[knowledge-base.md § Source attribution](../knowledge-base.md).

## How to use this file

Every task has an id (`ATTR-n.n`), an exact file, an acceptance criterion, and a verify
command. Work top to bottom.

**Line numbers were derived 2026-08-09 against `663d234`. Re-run each `grep` before editing
rather than trusting the number.**

**Stage 1 is a gate.** If a source turns out to be unusable, the cards from it do not get
written — and that is cheaper to discover before 181 cards exist than after.

## Progress

| Task | Title | State |
|---|---|---|
| ATTR-1.1…1.4 | Confirm each source's licence, at the source | ☐ Not started |
| ATTR-2.1…2.3 | Generate `ATTRIBUTIONS.md` from the corpus | ☐ Not started |
| ATTR-3.1…3.2 | State the corpus licence and the ShareAlike obligation | ☐ Not started |
| ATTR-4.1…4.2 | Repo-side `NOTICE` and the Apache/CC separation | ☐ Not started |
| ATTR-5.1…5.3 | Tests and docs | ☐ Not started |

States: `☐ Not started` · `▶ In progress` · `✅ Done` · `⛔ Blocked` · `✖ Dropped`

---

## 0. Why this exists

The reply a user reads now credits its sources. **Distribution does not.** Publishing a
~5 GB corpus of adaptations of CC BY-SA material is a redistribution, and it carries
obligations the plugin UI cannot discharge on its own.

Three specific problems, all verified rather than assumed:

**1. `ATTRIBUTIONS.md` is a hardcoded string, not a description of the corpus.**
[`write_attributions`](../../scripts/build_rag_db.py) at `:292` takes `out_dir`, ignores the
database entirely, and writes a fixed literal. It is therefore already wrong:

| It says | Actually |
|---|---|
| "interim 11-title QA mix" | 13 titles since 2026-08-09 |
| names only OoT and DRG Survivor | 13 games, and Portal 2 / Half-Life 2 will carry different licences from each other |
| no source URLs anywhere | CC BY-SA asks for a link to the material and to the licence |
| no licence URL | ditto |
| "Per-reply attribution also appears in Input transparency" | **was false until `663d234`** — the chip discarded every source |

A file that discharges a legal obligation must be **derived from the data it describes**, or
it drifts silently and nobody notices. It already did.

**2. Nothing states the corpus's own licence.** Cards are adaptations. Under ShareAlike the
adaptation inherits the source's licence — per work, not per database. A downstream user
currently cannot tell what they may do with the corpus, and *we* have not said.

**3. The plugin is Apache-2.0 ([LICENSE](../../LICENSE), `package.json:41`) and the corpus
will not be.** Apache-2.0 and CC BY-SA-3.0 cannot be combined into one work. What makes this
workable is that **the corpus is distributed separately** and downloaded at runtime — a
decision already recorded in the current attributions header and in Phase 6's shape. That
separation is load-bearing, not incidental, and needs writing down as such so a future change
does not casually bundle the corpus into the plugin zip and collapse the distinction.

---

## Stage 1 — Confirm each source's licence, at the source (gate)

Do this **before** writing cards from a source, not after. A source that turns out to be
unusable costs nothing today and costs a rewrite later.

- [ ] **ATTR-1.1** — For every source that will contribute cards, record: exact licence name
      **and version**, the licence URL, where the statement was read, and the date.
      Machine-readable `rightsinfo` from the wiki's own `api.php` beats a page footer; a
      footer beats an assumption. Current state, measured 2026-08-09:

      | Source | Licence | How it was read |
      |---|---|---|
      | `theportalwiki.com` | CC BY 4.0 | `api.php` `rightsinfo` |
      | `combineoverwiki.net` | CC BY-SA, version from the footer badge (4.0) | `api.php` gave no version — **confirm the version** |
      | `zelda.fandom.com` | CC-BY-SA-3.0 | already in the seed, recorded per card |
      | `left4dead.fandom.com` | CC BY-SA 3.0 | WikiTeam dump `licenseurl` at snapshot date |
      | `liquipedia.net` | CC-BY-SA | `api.php` `rightsinfo` |
      | `wiki.teamfortress.com` | **none published** | **excluded** — Valve ToU grants other users personal use only |
      | `developer.valvesoftware.com` | CC BY-NC-SA | **excluded** — NonCommercial is non-free |

      *Acceptance:* every row that will produce a card has a version and a URL. No row says
      "assumed" or inherits a version from a different wiki.

- [ ] **ATTR-1.2** — For a source ingested from an **archive.org WikiTeam dump**, record the
      snapshot identifier and its date, and re-read `dumpMeta/siteinfo.json` from *that*
      snapshot rather than carrying a licence forward from this document. A licence is a fact
      as of a date.
      *Acceptance:* the recorded licence for a dump-sourced card matches that dump's own
      `siteinfo`.

- [ ] **ATTR-1.3** — Decide and write down whether **CC BY 4.0** and **CC BY-SA 3.0/4.0**
      cards may coexist in one corpus file. They can — ShareAlike binds each work, and
      `source_license` is already per card — but the decision must be explicit so nobody
      later "simplifies" it into one corpus-wide licence field.
      *Acceptance:* recorded in [maintainer-decisions-locked.md](../audit/maintainer-decisions-locked.md).

- [ ] **ATTR-1.4** — Confirm no card text is a **verbatim copy** of source prose. Cards are
      distilled and maintainer-authored; that is what makes them adaptations rather than
      reproductions. Spot-check at least one card per source against its page.
      *Acceptance:* no card is a paste. Any that is gets rewritten or dropped.

---

## Stage 2 — Generate `ATTRIBUTIONS.md` from the corpus

- [ ] **ATTR-2.1** — Rewrite `write_attributions` to take the **connection**, not just
      `out_dir`, and build the file from `SELECT DISTINCT source_url, source_license` across
      `sections` and `compat_patterns`, joined to game titles.
      `scripts/build_rag_db.py:292`, called at `:502`.
      *Acceptance:* adding a card from a new wiki changes `ATTRIBUTIONS.md` with no edit to
      the script. Removing every card from a source removes its section.
      *Verify:* `python scripts/build_rag_db.py --seed --out build/kb-attrib && cat build/kb-attrib/ATTRIBUTIONS.md`

- [ ] **ATTR-2.2** — Each entry names: the **source site**, the **licence with version**, a
      **link to the licence**, and the **cards taken from it**. Group by (source, licence),
      matching what the chip already does — `build_attribution_entries` in
      `transparency_service.py` is the same grouping and its shape is the one to mirror.
      Maintainer-authored cards get their own section and credit nobody.
      *Acceptance:* a reader can go from any card in the corpus to its source and licence.

- [ ] **ATTR-2.3** — Keep `manifest["attributions_markdown"]` in step
      (`scripts/build_rag_db.py:503`) so the manifest and the file cannot disagree.
      *Acceptance:* they are byte-identical; a test asserts it.

---

## Stage 3 — State the corpus licence and the ShareAlike obligation

- [ ] **ATTR-3.1** — Add a header to the generated file stating **what a downstream user may
      do with the corpus**: that cards are adaptations, that each card carries the licence of
      its source, that ShareAlike sources bind adaptations of their cards, and where the
      per-card licence lives (`source_license`, queryable). Say plainly that the corpus is
      **not** under the plugin's Apache-2.0 licence.
      *Acceptance:* the header answers "may I redistribute this?" without the reader opening
      the database.

- [ ] **ATTR-3.2** — Keep the existing *"sources can err → fix forward"* note from the Phase 6
      discovery lock, and add that cards are **distilled, not authoritative** — a wiki can be
      wrong and so can our distillation of it.
      *Acceptance:* present in the generated file, not only in this plan.

---

## Stage 4 — Repo-side `NOTICE` and the Apache/CC separation

- [ ] **ATTR-4.1** — Extend [NOTICE](../../NOTICE) to record that the plugin ships **no**
      corpus content, that the corpus is a separate download under separate terms, and where
      its attributions live. Today `NOTICE` covers only the decky-plugin-template BSD
      derivation.
      *Acceptance:* someone auditing the *plugin* zip can see that no CC BY-SA material is in
      it, and where to look for the material that is.

- [ ] **ATTR-4.2** — Add a guard that the release zip contains no corpus file. The separation
      is what keeps Apache-2.0 and CC BY-SA from colliding; it should fail a build rather than
      rely on nobody bundling it by accident. The zip verifier in `scripts/` is the place.
      *Acceptance:* a deliberately planted `corpus.db` in the staging dir fails the release
      build.

---

## Stage 5 — Tests and docs

- [ ] **ATTR-5.1** — Extend `tests/test_source_attribution.py`: every distinct
      `(source_url, source_license)` in a built corpus appears in the generated
      `ATTRIBUTIONS.md`. This is the drift guard that the hardcoded file never had.
      *Verify:* `npm run test:py`

- [ ] **ATTR-5.2** — Assert the generated file names a licence **version** for every
      third-party source. "CC BY-SA" with no version is the gap Combine OverWiki's API left,
      and it must not reach a published corpus.

- [ ] **ATTR-5.3** — Update [knowledge-base.md § Source attribution](../knowledge-base.md) to
      cover distribution as well as the reply, and add an on-Deck row **KB-ATTRIB-02** to
      [testing.md](../testing.md) for the published-corpus path (install a published corpus,
      confirm `ATTRIBUTIONS.md` ships beside it and names every source in the database).

---

## Not in scope

- Per-sentence citation in replies, or linking out to a wiki from the Deck (no browser).
- Relicensing the plugin. Apache-2.0 stays; the separation is the mechanism.
- Ingestion tooling itself — see the sourcing notes on
  [KB online / versus strategy content](../roadmap.md#near-term).
- User-submitted content, which has its own moderation and licensing problem — see
  **Community tip contribution** in the roadmap.

## Open questions for the maintainer

1. **Publishing target.** Phase 6 says HuggingFace primary, GitHub Releases mirror. HF dataset
   cards carry their own licence dropdown, and a mixed-licence corpus does not fit one value.
   Preference: pick the most restrictive (`CC BY-SA 4.0`), or use `other` and point at
   `ATTRIBUTIONS.md`?
2. **Attribution for the L4D2 dump.** Credit the wiki, or the wiki *and* the WikiTeam snapshot
   it was read from? The snapshot is how we got the text but is not the author.
