# Cross-language contracts

Fixtures that **both** the TypeScript and Python sides assert against, so a shape that is
currently kept in sync by hand cannot drift silently.

Each fixture is checked by one test per language, each in its own runner. There is no
cross-runtime plumbing: neither test shells out to the other toolchain.

| Fixture | Python assertion | TypeScript assertion |
|---|---|---|
| `settings-defaults.json` | `tests/test_settings_contract.py` | `src/data/bonsaiSettingsContract.test.ts` |
| `settings-hostile-inputs.json` | `tests/test_settings_hostile_contract.py` | `src/data/bonsaiSettingsHostileContract.test.ts` |

## `settings-defaults.json`

The settings payload produced from **empty input** — what a fresh install gets before the
user saves anything. Python's `sanitize_settings({})` and TypeScript's
`normalizeSettings({})` must each equal it exactly, key for key and value for value.

Verified equal on 2026-08-03 (40 keys, zero differences) before the fixture was written, so
it records real behavior rather than an aspiration.

### When a test here fails

**You added or changed a setting.** That is the point. Update the fixture *and* confirm both
sides produce the new value — a failure on one side only means the two languages disagree,
which is the bug this exists to catch. Do not update the fixture to match whichever side you
happened to edit; work out which one is right first.

Adding a setting still touches both languages ([REFACTOR-PLAN.md](../../REFACTOR-PLAN.md)
§3.1 exists to reduce that). This fixture does not reduce the cost — it makes an incomplete
edit fail loudly instead of shipping a frontend and backend that disagree about a default.

## `settings-hostile-inputs.json`

Cases of `{name, input, expected}`, where `expected` holds only the keys the case is about, so
a failure names the rule that broke rather than dumping a 40-key diff. Both languages must
produce every expected value.

**Why it exists.** `settings-defaults.json` found nothing, because both languages agreed on
the fresh-install payload — and it could not have found anything else, since it exercises one
input. Reading the two rule sets side by side (**D13**) turned up **five settings that
disagreed once the value was not the default**. This fixture is those inputs, plus the
migrations and clamps most likely to drift next.

**Python is authoritative** where the two disagree, because `save_settings` decides what
reaches disk: a frontend that reads a value the backend will not store is the broken
combination. D13 resolved one setting the other way —
`preset_chip_fade_animation_enabled` is derived from `preset_chip_animation`, matching what
TypeScript already did on both its normalize and save paths, because reading the deprecated key
independently produces a self-contradictory payload.

### Known exception, deliberately not in the fixture

`ui_scale_manual_profile` with value `"immersive"`. TypeScript downgrades it to `handheld`
because `SHOW_IMMERSIVE_UI_SCALE` is `false` in
[uiScaleProfile.ts](../../src/data/uiScaleProfile.ts); Python accepts it. That is a feature
gate working as intended, not drift — the UI never offers the profile, so it cannot produce
the value. **Add a case for it when that flag flips to `true`**, at which point the two sides
should agree.

Related trap worth knowing: `ui_scale_manual_profile: " Handheld "` *does* match across both
languages, but only because each lands on `handheld` by a different route — one by trimming
and lowercasing, the other by falling back to the default. Agreement by coincidence is not
agreement, so do not read that case as evidence the rules match.
