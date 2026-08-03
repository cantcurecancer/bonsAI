#!/usr/bin/env python3
"""Title: Deployed RPC surface probe

Purpose: Call the read-only RPCs on a deployed plugin and report any that raise.
Used for: Post-deploy verification, and after any change to `class Plugin` plumbing.
Solves: Unit tests import services, and the frontend suite stubs RPCs via `fakeDeckyRpc.ts`,
        so a broken RPC method can pass every gate and still fail on device.
Does not: Exercise UI, focus order, or anything needing a real Ollama host. Not a QA substitute
          for the on-Deck passes in docs/testing-manual.md.

Run **on the Deck** against the deployed plugin:

    ssh deck@<ip> 'python3 -' < scripts/probe_deck_rpc_surface.py

Every writable path is redirected to a temp directory, so this cannot touch real settings,
logs, or runtime state. Only read-only RPCs are called; `clear_plugin_data` and the voice
start/stop pair are deliberately excluded.

Exit code is non-zero if any RPC raised.

Found `get_reply_language_snapshot` calling `load_settings()` without `await` -- broken since
the feature shipped, invisible to every gate. See tests/test_reply_language_snapshot_rpc.py.
"""

import asyncio
import inspect
import logging
import os
import sys
import tempfile
import types

DEFAULT_PLUGIN_DIR = os.path.expanduser("~/homebrew/plugins/bonsAI")


def _install_decky_stub(plugin_dir: str, tmp: str) -> None:
    """Stand in for the loader-provided ``decky`` module, with writes pointed at ``tmp``."""
    for sub in ("settings", "runtime", "log"):
        os.makedirs(os.path.join(tmp, sub), exist_ok=True)
    decky = types.ModuleType("decky")
    decky.DECKY_PLUGIN_SETTINGS_DIR = os.path.join(tmp, "settings")
    decky.DECKY_PLUGIN_RUNTIME_DIR = os.path.join(tmp, "runtime")
    decky.DECKY_PLUGIN_LOG_DIR = os.path.join(tmp, "log")
    decky.DECKY_PLUGIN_DIR = plugin_dir
    logging.basicConfig(level=logging.CRITICAL)
    decky.logger = logging.getLogger("bonsai-rpc-probe")
    sys.modules["decky"] = decky


async def _probe(plugin_dir: str) -> int:
    import main

    plugin = main.Plugin()
    results: list[tuple[str, str, str]] = []

    async def call(label: str, fn, *args) -> None:
        try:
            out = fn(*args)
            if inspect.isawaitable(out):
                out = await out
            results.append((label, "ok", ""))
        except Exception as exc:  # noqa: BLE001 - reporting, not handling
            results.append((label, type(exc).__name__, str(exc)))

    # Lifecycle.
    await call("_main", plugin._main)
    # Reads that used to rely on the _ensure_background_state backfill removed in D11.
    await call("_active_request_id", plugin._active_request_id)
    await call("load_settings", plugin.load_settings)
    await call("get_input_transparency", plugin.get_input_transparency)
    await call("get_background_game_ai_status", plugin.get_background_game_ai_status)
    await call("abort_background_game_ai", plugin.abort_background_game_ai)
    # Subsystem status reads.
    await call("get_voice_engine_status", plugin.get_voice_engine_status)
    await call("get_voice_install_status", plugin.get_voice_install_status)
    await call("get_voice_transcription_status", plugin.get_voice_transcription_status)
    await call("get_rag_corpus_status", plugin.get_rag_corpus_status)
    await call("get_session_rag_chip_candidates", plugin.get_session_rag_chip_candidates, "0", "", "")
    await call("get_intent_packs", plugin.get_intent_packs)
    await call("get_strategy_checklist_session", plugin.get_strategy_checklist_session, "")
    await call("get_reply_language_snapshot", plugin.get_reply_language_snapshot)
    await call("get_local_ollama_setup_status", plugin.get_local_ollama_setup_status)
    await call("get_deck_ip", plugin.get_deck_ip)
    await call("list_recent_screenshots", plugin.list_recent_screenshots, "", 1)
    # Ask admission control, without a reachable host: exercises parse, sanitizer lane, state
    # publication and the abort path. The background task fails on connect, which is the point.
    await call("start_background_game_ai", plugin.start_background_game_ai, "probe question", "127.0.0.1:1")
    await asyncio.sleep(1.0)
    await call("status_after_ask", plugin.get_background_game_ai_status)
    await call("abort_after_ask", plugin.abort_background_game_ai)
    await call("_unload", plugin._unload)

    width = max(len(label) for label, _, _ in results)
    print("%-*s  %-18s %s" % (width, "RPC", "RESULT", "DETAIL"))
    for label, status, detail in results:
        print("%-*s  %-18s %s" % (width, label, status, detail[:70]))

    failed = [r for r in results if r[1] != "ok"]
    print("\ncalls=%d  failed=%d" % (len(results), len(failed)))
    if failed:
        print("FAILED RPCs: %s" % ", ".join(r[0] for r in failed))
    return 1 if failed else 0


def main_entry() -> int:
    plugin_dir = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_PLUGIN_DIR
    if not os.path.isfile(os.path.join(plugin_dir, "main.py")):
        print("no main.py under %s" % plugin_dir)
        return 2
    tmp = tempfile.mkdtemp(prefix="bonsai-rpc-probe-")
    _install_decky_stub(plugin_dir, tmp)
    sys.path.insert(0, os.path.join(plugin_dir, "py_modules"))
    sys.path.insert(0, plugin_dir)
    os.chdir(plugin_dir)
    return asyncio.run(_probe(plugin_dir))


if __name__ == "__main__":
    raise SystemExit(main_entry())
