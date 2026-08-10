"""Title: Corpus ATTRIBUTIONS.md generation

Purpose: Pin ATTR-2/3 — ATTRIBUTIONS.md is derived from the corpus DB with a redistribution header.
Used for: scripts/build_rag_db.py format_attributions_markdown / write_attributions.
Solves: The old literal drifted (11 titles, missing Portal/HL2 licences, no source URLs).
Does not: Cover NOTICE or zip guards (ATTR-4…5).
"""

from __future__ import annotations

import importlib.util
import sqlite3
import tempfile
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]


def _load_build_rag_db():
    path = REPO_ROOT / "scripts" / "build_rag_db.py"
    spec = importlib.util.spec_from_file_location("build_rag_db", path)
    assert spec and spec.loader
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


build_rag_db = _load_build_rag_db()


class BuildRagAttributionsTests(unittest.TestCase):
    def _seed_mini(self, conn: sqlite3.Connection) -> None:
        build_rag_db.apply_schema(conn)
        conn.execute(
            "INSERT INTO games(game_id, app_id, igdb_id, canonical_title, edition, platform, genres) "
            "VALUES (12, '620', NULL, 'Portal 2', NULL, 'Steam', '[]')"
        )
        conn.execute(
            "INSERT INTO games(game_id, app_id, igdb_id, canonical_title, edition, platform, genres) "
            "VALUES (2, '2321470', NULL, 'Deep Rock Galactic: Survivor', NULL, 'Steam', '[]')"
        )
        conn.execute(
            "INSERT INTO sections(section_id, game_id, section_type, name, card, source_url, "
            "source_license, source_version, crawled_at) VALUES "
            "(23, 12, 'mechanic', 'Gels', 'Three paints.', "
            "'https://theportalwiki.com/wiki/Gel', 'CC-BY-4.0', NULL, '2026-08-09')"
        )
        conn.execute(
            "INSERT INTO sections(section_id, game_id, section_type, name, card, source_url, "
            "source_license, source_version, crawled_at) VALUES "
            "(3, 2, 'boss', 'Glyphid Dreadnought', 'Kite between waves.', "
            "'', 'bonsAI-maintainer', 'seed-1.0', '2026-08-09')"
        )
        conn.execute(
            "INSERT INTO compat_patterns(pattern_id, topic, platforms, card, source_url, source_license) "
            "VALUES (1, 'proton', '[]', 'Use Proton Experimental.', '', 'bonsAI-maintainer')"
        )
        conn.commit()

    def test_markdown_lists_wiki_source_with_deed_and_card(self):
        conn = sqlite3.connect(":memory:")
        try:
            self._seed_mini(conn)
            text = build_rag_db.format_attributions_markdown(conn)
        finally:
            conn.close()

        self.assertIn("### theportalwiki.com · CC-BY-4.0", text)
        self.assertIn("https://creativecommons.org/licenses/by/4.0/", text)
        self.assertIn("Portal 2 — Gels", text)
        self.assertIn("https://theportalwiki.com/wiki/Gel", text)
        self.assertIn("Deep Rock Galactic: Survivor — Glyphid Dreadnought", text)
        self.assertIn("Shared troubleshooting tips: 1", text)
        self.assertNotIn("interim 11-title", text)
        # ATTR-3.1 / 3.2 — redistribution + accuracy without opening the DB
        self.assertIn("## May I redistribute this corpus?", text)
        self.assertIn("is **not**", text)
        self.assertIn("Apache-2.0", text)
        self.assertIn("source_license", text)
        self.assertIn("ShareAlike", text)
        self.assertIn("## Accuracy", text)
        self.assertIn("distilled, not authoritative", text)
        self.assertIn("fix forward", text)

    def test_removing_wiki_card_removes_its_section(self):
        conn = sqlite3.connect(":memory:")
        try:
            self._seed_mini(conn)
            before = build_rag_db.format_attributions_markdown(conn)
            self.assertIn("theportalwiki.com", before)
            conn.execute("DELETE FROM sections WHERE section_id = 23")
            conn.commit()
            after = build_rag_db.format_attributions_markdown(conn)
        finally:
            conn.close()

        self.assertNotIn("theportalwiki.com", after)
        self.assertIn("Glyphid Dreadnought", after)

    def test_write_attributions_matches_returned_text(self):
        with tempfile.TemporaryDirectory() as tmp:
            out = Path(tmp)
            conn = sqlite3.connect(":memory:")
            try:
                self._seed_mini(conn)
                text = build_rag_db.write_attributions(conn, out)
            finally:
                conn.close()
            on_disk = (out / "ATTRIBUTIONS.md").read_text(encoding="utf-8")
            self.assertEqual(text, on_disk)

    def test_licence_deed_url_maps_known_strings(self):
        self.assertEqual(
            build_rag_db.licence_deed_url("CC-BY-4.0"),
            "https://creativecommons.org/licenses/by/4.0/",
        )
        self.assertEqual(
            build_rag_db.licence_deed_url("GFDL"),
            "https://www.gnu.org/licenses/fdl-1.3.html",
        )
        self.assertEqual(build_rag_db.licence_deed_url("bonsAI-maintainer"), "")


class SeedCorpusAttributionsIntegrationTests(unittest.TestCase):
    """Optional: full --seed build when the script is cheap enough (no Ollama required)."""

    def test_seed_build_attributions_match_manifest(self):
        with tempfile.TemporaryDirectory() as tmp:
            out = Path(tmp) / "kb"
            manifest = build_rag_db.build_corpus(out, seed=True)
            path = out / "ATTRIBUTIONS.md"
            self.assertTrue(path.is_file())
            on_disk = path.read_text(encoding="utf-8")
            self.assertEqual(manifest.get("attributions_markdown"), on_disk)
            self.assertIn("theportalwiki.com", on_disk)
            self.assertIn("zelda.fandom.com", on_disk)
            self.assertIn("GFDL", on_disk)
            # Adding a card would change the file — prove the generator read the DB.
            conn = sqlite3.connect(str(out / "corpus.db"))
            try:
                hosts = {
                    r[0]
                    for r in conn.execute(
                        "SELECT DISTINCT source_url FROM sections "
                        "WHERE TRIM(COALESCE(source_url, '')) != ''"
                    )
                }
            finally:
                conn.close()
            for url in hosts:
                host = url.split("/")[2] if "://" in url else url
                self.assertIn(host, on_disk, f"missing host for {url}")


if __name__ == "__main__":
    unittest.main()
