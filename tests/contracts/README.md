# Cross-language contracts

Fixtures that **both** the TypeScript and Python sides assert against, so a shape that is
currently kept in sync by hand cannot drift silently.

Each fixture is checked by one test per language, each in its own runner. There is no
cross-runtime plumbing: neither test shells out to the other toolchain.

| Fixture | Python assertion | TypeScript assertion |
|---|---|---|
| `settings-defaults.json` | `tests/test_settings_contract.py` | `src/data/bonsaiSettingsContract.test.ts` |

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
