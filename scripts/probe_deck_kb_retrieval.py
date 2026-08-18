#!/usr/bin/env python3
"""Title: Deck knowledge-base retrieval probe

Purpose: Report how many corpus cards actually attach to an Ask, per Ask mode, against the
         corpus installed on this Deck — the number the Show details ladder never prints.
Used for: docs/testing.md rows KB-ASKMODE-01 (card count per mode) and KB-RRF-01 (whether the
          vector half changes which cards are found, not merely their order). Named in the
          KB-ASKMODE-01 row as the way that row is run.
Solves: The transparency ladder shows retrieval method, trust tier, notes and timings, but no
        card count (transparency_service.py, the `kb` chip). So "Speed 1 / Strategy 3 /
        Expert 5" cannot be checked from the screen at all, and the 2026-08-17 QA pass read as
        a pass until the counts were measured here — all three modes attach 1 card for a
        typical boss question, and Expert attaches FEWER than Strategy for some questions
        because it carries the implicit-route relevance floor. Both are open roadmap bugs.
Does not: Ask anything of Ollama's chat model, write to settings, or touch the corpus. Read-only
          apart from the embedding call retrieval itself makes (nomic-embed-text), which is the
          same call a real Ask makes.

Run from the maintainer PC with the Deck online:

    ssh deck@$DECK_IP 'python3 -' < scripts/probe_deck_kb_retrieval.py
    ssh deck@$DECK_IP 'python3 - --app-id 620 --app-name "Portal 2" --question "how do gels work"' \
        < scripts/probe_deck_kb_retrieval.py

`--pool` additionally prints the FTS candidate pool at floor 0.0, which is what distinguishes
"the corpus has nothing to say" from "BM25 could not find what is sitting right there".
"""
import argparse
import json
import os
import re
import sys

PLUGIN_DIR = "/home/deck/homebrew/plugins/bonsAI"
SETTINGS_PATH = "/home/deck/homebrew/settings/bonsAI/settings.json"

# Mirrors main.py's own sys.path setup, which is why backend imports are `backend.services.X`.
sys.path.insert(0, PLUGIN_DIR)
sys.path.insert(0, os.path.join(PLUGIN_DIR, "py_modules"))

from backend.services import knowledge_base_service as kb  # noqa: E402

# Card headers rendered by `_card_lines`: "[Game / type: Name] (trust: tier)".
CARD_HEADER_RE = re.compile(r"^\[.*\(trust: [^)]+\)\s*$", re.M)


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--question", default="how do i beat the glyphid dreadnought")
    p.add_argument("--app-id", default="2321470")
    p.add_argument("--app-name", default="Deep Rock Galactic: Survivor")
    p.add_argument("--shortcut-name", default="")
    p.add_argument(
        "--pc-ip",
        default="127.0.0.1",
        help="Ollama host for embeddings. The frontend supplies this at Ask time, so it is not "
             "in settings.json; 127.0.0.1 is right when Ollama runs on the Deck.",
    )
    p.add_argument("--modes", default="speed,strategy,expert")
    p.add_argument("--pool", action="store_true", help="also dump the FTS candidate pool")
    return p.parse_args()


def card_names(text_block: str) -> list[str]:
    return [h.strip() for h in CARD_HEADER_RE.findall(text_block or "")]


def main() -> int:
    args = parse_args()
    with open(SETTINGS_PATH, "r", encoding="utf-8") as fh:
        settings = json.load(fh)

    db_path = kb.resolve_corpus_db_path(settings)
    if not db_path:
        print("no corpus installed — `rag_corpus_path` is unset or corpus.db is missing")
        return 2

    print("corpus     :", db_path)
    print("kb enabled :", settings.get("use_local_knowledge_base"))
    print("hybrid     :", settings.get("rag_hybrid_retrieval_enabled") is not False)
    print("question   :", repr(args.question))
    print("game       : %s / %s" % (args.app_id or "(none)", args.app_name or "(none)"))
    print()

    conn = kb._get_connection(db_path)
    game_id, resolution = kb._resolve_game_id(
        conn,
        app_id=args.app_id,
        app_name=args.app_name,
        shortcut_name=args.shortcut_name,
    )
    print("resolved   : game_id=%s via %s" % (game_id, resolution or "(unresolved)"))
    if game_id is not None:
        rows = conn.execute(
            "SELECT section_type, name FROM sections WHERE game_id=? ORDER BY section_type, name",
            (game_id,),
        ).fetchall()
        print("corpus has : %d section(s) for this title" % len(rows))
        for r in rows:
            print("               [%s] %s" % (r["section_type"], r["name"]))
    print()

    if args.pool and game_id is not None:
        expanded = kb._expand_query(args.question, args.app_name, game_resolved=True)
        print("FTS candidate pool (floor 0.0, shortlist %d) — the ceiling on every mode below:"
              % kb.HYBRID_FTS_SHORTLIST_K)
        print("  expanded query: %r" % expanded)
        pool = kb._search_sections(
            conn, game_id=game_id, query=expanded,
            top_k=kb.HYBRID_FTS_SHORTLIST_K, min_relevance=0.0,
        )
        if not pool:
            print("  EMPTY — no card is reachable for this phrasing, whatever the mode budget is.")
        for c in pool:
            print("  bm25=%6.2f  %s" % (c.bm25_score, c.name))
        print()

    print("%-9s %-7s %-9s %-8s %s" % ("MODE", "BUDGET", "FLOOR", "ATTACHED", "CARDS"))
    for mode in [m.strip() for m in args.modes.split(",") if m.strip()]:
        top_k, _max_bytes = kb._budget_for_mode(mode)
        # `implicit_route` in retrieve_knowledge_context tests for Strategy by name, so every
        # other mode — Expert included — gets the stricter floor. That asymmetry is the point.
        floor = "1.0 expl" if mode == "strategy" else "4.0 impl"
        gate, domain = kb.should_retrieve_knowledge(
            use_local_knowledge_base=bool(settings.get("use_local_knowledge_base")),
            ask_mode=mode,
            question=args.question,
            app_id=args.app_id,
            app_name=args.app_name,
        )
        if not gate:
            print("%-9s %-7d %-9s %-8s gate=False (domain routing declined)"
                  % (mode, top_k, floor, "-"))
            continue
        res = kb.retrieve_knowledge_context(
            settings,
            ask_mode=mode,
            question=args.question,
            app_id=args.app_id,
            app_name=args.app_name,
            shortcut_name=args.shortcut_name,
            domain=domain,
            pc_ip=args.pc_ip,
        )
        names = card_names(res.text_block)
        # Greedy up to the LAST ": " — game titles contain colons ("Deep Rock Galactic: Survivor"),
        # so a lazy match keeps half the title and drops the section type.
        short = [re.sub(r"^\[.*: (.*?)\].*$", r"\1", n) for n in names]
        print("%-9s %-7d %-9s %-8d %s" % (mode, top_k, floor, len(names), ", ".join(short) or "-"))
        print("            method=%s trust=%s notes=%s sources=%d%s"
              % (res.retrieval_method, res.trust_tier, res.notes or "-", len(res.sources),
                 "  [budget-truncated]" if "omitted to fit budget" in (res.text_block or "") else ""))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
