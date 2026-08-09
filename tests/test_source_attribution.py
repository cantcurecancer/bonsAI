"""Title: Source attribution

Purpose: Pin the corpus licensing rule and the path that carries a credit to the user.
Used for: data/kb seed files, transparency_service attribution entries.
Solves: Attribution was computed per surviving card and then dropped by a type filter, so no
        card was ever credited in the UI -- including the two that carry a CC BY-SA URL.
Does not: Cover ATTRIBUTIONS.md generation in build_rag_db.py, or chip styling.

The rule, in one line: **a card that claims a third-party licence must name its source.**
Maintainer-authored cards have no third party to name and carry neither field. Both seed files
already satisfied this when the rule was written; the test is here so 181 new cards cannot
quietly break it.
"""

import json
import unittest
from pathlib import Path

from backend.services.transparency_service import (
    build_attribution_entries,
    build_context_chips_manifest,
    build_knowledge_base_transparency,
    source_display_name,
)

DATA = Path(__file__).resolve().parent.parent / "data" / "kb"
MAINTAINER_LICENSE = "bonsAI-maintainer"


def _rows(path: Path, key: str) -> list[dict]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    return payload[key] if isinstance(payload, dict) else payload


class CorpusLicensingRuleTests(unittest.TestCase):
    def _assert_third_party_cards_cite_a_source(self, rows, label):
        offenders = [
            row.get("name") or row.get("topic") or repr(row)[:60]
            for row in rows
            if str(row.get("source_license") or "").strip()
            and str(row.get("source_license")).strip() != MAINTAINER_LICENSE
            and not str(row.get("source_url") or "").strip()
        ]
        self.assertEqual(
            offenders,
            [],
            f"{label}: cards claim a third-party licence with no source_url -- the licence "
            f"requires naming the source: {offenders}",
        )

    def _assert_cited_cards_declare_a_licence(self, rows, label):
        offenders = [
            row.get("name") or row.get("topic") or repr(row)[:60]
            for row in rows
            if str(row.get("source_url") or "").strip()
            and not str(row.get("source_license") or "").strip()
        ]
        self.assertEqual(
            offenders,
            [],
            f"{label}: cards cite a source with no licence recorded -- we cannot honour terms "
            f"we did not write down: {offenders}",
        )

    def test_strategy_seed_obeys_the_rule(self):
        rows = _rows(DATA / "strategy_seed.json", "sections")
        self._assert_third_party_cards_cite_a_source(rows, "strategy_seed.json")
        self._assert_cited_cards_declare_a_licence(rows, "strategy_seed.json")

    def test_compat_patterns_obey_the_rule(self):
        rows = _rows(DATA / "compat_patterns.json", "patterns")
        self._assert_third_party_cards_cite_a_source(rows, "compat_patterns.json")
        self._assert_cited_cards_declare_a_licence(rows, "compat_patterns.json")

    def test_maintainer_cards_are_not_required_to_cite_anything(self):
        """The rule must not push a fake URL onto cards we wrote ourselves."""
        rows = [{"name": "x", "source_license": MAINTAINER_LICENSE, "source_url": ""}]
        self._assert_third_party_cards_cite_a_source(rows, "synthetic")


class SourceDisplayNameTests(unittest.TestCase):
    def test_host_is_the_credit(self):
        self.assertEqual(
            source_display_name("https://zelda.fandom.com/wiki/King_Dodongo"), "zelda.fandom.com"
        )

    def test_www_is_dropped(self):
        self.assertEqual(source_display_name("https://www.example.org/a/b"), "example.org")

    def test_port_and_userinfo_are_dropped(self):
        self.assertEqual(source_display_name("https://u@host.example:8443/x"), "host.example")

    def test_missing_scheme_still_yields_a_host(self):
        self.assertEqual(source_display_name("theportalwiki.com/wiki/Portal_2"), "theportalwiki.com")

    def test_empty_input(self):
        self.assertEqual(source_display_name(""), "")
        self.assertEqual(source_display_name(None), "")


class AttributionEntryTests(unittest.TestCase):
    def test_cards_from_one_source_collapse_into_one_credit(self):
        """Three cards from one wiki is one credit line, not three. Repetition gets skipped."""
        entries = build_attribution_entries(
            [
                {"title": "OoT — King Dodongo", "url": "https://zelda.fandom.com/wiki/A", "license": "CC-BY-SA-3.0"},
                {"title": "OoT — Water Temple", "url": "https://zelda.fandom.com/wiki/B", "license": "CC-BY-SA-3.0"},
            ]
        )
        self.assertEqual(len(entries), 1)
        self.assertEqual(entries[0]["source"], "zelda.fandom.com")
        self.assertEqual(entries[0]["license"], "CC-BY-SA-3.0")
        self.assertEqual(entries[0]["cards"], ["OoT — King Dodongo", "OoT — Water Temple"])

    def test_different_licences_stay_separate(self):
        """CC BY 4.0 and CC BY-SA 3.0 carry different obligations and cannot share a line."""
        entries = build_attribution_entries(
            [
                {"title": "Portal 2 — Chamber 21", "url": "https://theportalwiki.com/wiki/A", "license": "CC-BY-4.0"},
                {"title": "OoT — Dodongo", "url": "https://zelda.fandom.com/wiki/B", "license": "CC-BY-SA-3.0"},
            ]
        )
        self.assertEqual(
            sorted((e["source"], e["license"]) for e in entries),
            [("theportalwiki.com", "CC-BY-4.0"), ("zelda.fandom.com", "CC-BY-SA-3.0")],
        )

    def test_cards_without_a_url_credit_nobody(self):
        self.assertEqual(
            build_attribution_entries([{"title": "seed card", "url": "", "license": MAINTAINER_LICENSE}]),
            [],
        )

    def test_junk_input_is_ignored(self):
        self.assertEqual(build_attribution_entries(None), [])
        self.assertEqual(build_attribution_entries(["a string", 7, {}]), [])


class AttributionReachesTheChipTests(unittest.TestCase):
    """The regression that made this work necessary."""

    def _kb_chip(self, sources):
        snapshot = build_knowledge_base_transparency(
            attached=True,
            trust_tier="wiki_verified",
            sources=sources,
            notes="",
            timing_ms={},
            unavailable_reason="",
            retrieval_method="hybrid",
            kb_domain="strategy",
        )
        chips = build_context_chips_manifest(snapshot=snapshot)["context_chips"]
        return next(c for c in chips if c["id"] == "kb")

    def test_dict_sources_survive_to_the_chip(self):
        """`paths` filtered on isinstance(str) while retrieval emitted dicts, so every source
        was dropped between the corpus and the screen."""
        chip = self._kb_chip(
            [{"title": "OoT — King Dodongo", "url": "https://zelda.fandom.com/wiki/K", "license": "CC-BY-SA-3.0"}]
        )
        self.assertEqual(len(chip["body"]["attribution"]), 1)
        self.assertEqual(chip["body"]["attribution"][0]["source"], "zelda.fandom.com")

    def test_no_licensed_source_means_no_attribution_key(self):
        """Most turns are all-maintainer. The field is absent rather than an empty ornament."""
        chip = self._kb_chip([{"title": "seed", "url": "", "license": MAINTAINER_LICENSE}])
        self.assertNotIn("attribution", chip["body"])

    def test_string_sources_still_render_as_paths(self):
        chip = self._kb_chip(["/some/legacy/path"])
        self.assertEqual(chip["body"]["paths"], ["/some/legacy/path"])
        self.assertNotIn("attribution", chip["body"])


if __name__ == "__main__":
    unittest.main()
