"""Reset Decky-persisted plugin data to sanitized defaults (new-install behavior)."""

from __future__ import annotations

import os
import shutil
import sys
from pathlib import Path
from typing import Any, Callable

LoadSettingsFn = Callable[[str, Any, Any], dict]
SaveSettingsFn = Callable[..., dict]
SanitizeFn = Callable[[Any], dict]


def _path_within_home(path: Path, home: Path) -> bool:
    try:
        path.resolve().relative_to(home.resolve())
        return True
    except ValueError:
        return False


def wipe_settings_dir_contents(settings_dir: str, logger: Any) -> int:
    """Remove every file and subdirectory under settings_dir; recreate empty dir."""
    removed = 0
    if os.path.isdir(settings_dir):
        for name in os.listdir(settings_dir):
            fp = os.path.join(settings_dir, name)
            try:
                if os.path.isdir(fp):
                    shutil.rmtree(fp)
                else:
                    os.remove(fp)
                removed += 1
            except OSError:
                logger.warning("wipe_settings_dir: could not remove %s", fp)
    os.makedirs(settings_dir, exist_ok=True)
    return removed


def wipe_bonsai_cache_dir(logger: Any) -> bool:
    """Remove ~/.bonsai/cache when it lives under the user home directory."""
    if sys.platform.startswith("win"):
        return False
    try:
        home = Path.home()
        cache_dir = home / ".bonsai" / "cache"
        if cache_dir.exists() and _path_within_home(cache_dir, home):
            shutil.rmtree(cache_dir, ignore_errors=True)
            return True
    except OSError as exc:
        logger.warning("wipe_bonsai_cache_dir: %s", exc)
    return False


def wipe_proton_experiment_journal(logger: Any) -> bool:
    """Remove ~/.bonsai/proton_experiment_journal.json when under user home."""
    from backend.services.proton_experiment_journal_service import wipe_journal_file

    return wipe_journal_file(logger=logger)


def wipe_rag_corpus_dir(corpus_path: str, logger: Any) -> bool:
    """Remove installed knowledge base directory when under user home."""
    from backend.services.rag_corpus_download_service import remove_corpus_at_path

    path = str(corpus_path or "").strip()
    if not path:
        return False
    return remove_corpus_at_path(path, logger)


def reset_plugin_disk_and_defaults(
    *,
    settings_path: str,
    settings_dir: str,
    runtime_dir: str,
    log_dir: str,
    sanitize_func: SanitizeFn,
    load_settings: LoadSettingsFn,
    save_settings: SaveSettingsFn,
    logger: Any,
    rag_corpus_path: str = "",
) -> tuple[dict, int]:
    """Wipe settings/runtime/log dirs and write fresh defaults.

    Does not touch Desktop notes or other paths outside Decky's plugin dirs. RPC callers should reload
    sanitized settings into memory after this returns so UI and backend state match disk.

    Returns (defaults, settings_dir_removed_count).
    """
    if rag_corpus_path:
        wipe_rag_corpus_dir(rag_corpus_path, logger)

    settings_removed = wipe_settings_dir_contents(settings_dir, logger)

    if os.path.isdir(runtime_dir):
        shutil.rmtree(runtime_dir)
    os.makedirs(runtime_dir, exist_ok=True)

    if os.path.isdir(log_dir):
        for name in os.listdir(log_dir):
            fp = os.path.join(log_dir, name)
            try:
                if os.path.isfile(fp) or os.path.islink(fp):
                    os.remove(fp)
            except OSError:
                logger.warning("reset_plugin_disk: could not remove %s", fp)

    defaults = load_settings(settings_path, sanitize_func, logger)
    saved = save_settings(
        path=settings_path,
        settings_dir=settings_dir,
        incoming={},
        current=defaults,
        sanitize_func=sanitize_func,
        logger=logger,
    )
    return saved, settings_removed
