"""Download, verify, and install the on-Deck knowledge base corpus."""

from __future__ import annotations

import asyncio
import hashlib
import json
import os
import shutil
import sqlite3
import threading
import urllib.request
import zlib
from pathlib import Path
from typing import Any, Callable, Optional

from backend.services.knowledge_base_schema import (
    CORPUS_ATTRIBUTIONS_FILENAME,
    CORPUS_DB_FILENAME,
    CORPUS_MANIFEST_FILENAME,
    DEFAULT_MANIFEST_GITHUB_URL,
    DEFAULT_MANIFEST_HF_URL,
    corpus_install_root,
    is_allowed_corpus_install_path,
    load_manifest_from_path,
    parse_manifest_json,
    sanitize_corpus_install_dir,
    write_manifest,
)
from backend.services.knowledge_base_service import close_connection

MAX_LOG_TAIL_LINES = 80


def new_rag_corpus_download_state() -> dict[str, Any]:
    return {
        "phase": "idle",
        "stage": "",
        "done": True,
        "error": "",
        "accepted": False,
        "cancel_requested": False,
        "progress_pct": 0,
        "bytes_downloaded": 0,
        "bytes_total": 0,
        "log_tail": [],
        "manifest_version": "",
        "install_path": "",
    }


def _append_log(lines: list[str], msg: str) -> None:
    for part in (msg or "").splitlines() or ["(empty)"]:
        lines.append(part)
        if len(lines) > MAX_LOG_TAIL_LINES:
            del lines[:-MAX_LOG_TAIL_LINES]


def _sha256_file(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as fp:
        for chunk in iter(lambda: fp.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def _fetch_json_url(url: str, timeout: float = 60.0) -> dict[str, Any]:
    req = urllib.request.Request(url, headers={"User-Agent": "bonsAI/1.0"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return parse_manifest_json(json.loads(resp.read().decode("utf-8")))


def _agent_debug_log(location: str, message: str, data: dict[str, Any], hypothesis_id: str) -> None:
    # #region agent log
    try:
        import time

        log_path = os.path.join(os.path.expanduser("~"), ".bonsai", "debug-a3646d.log")
        os.makedirs(os.path.dirname(log_path), exist_ok=True)
        payload = {
            "sessionId": "a3646d",
            "hypothesisId": hypothesis_id,
            "location": location,
            "message": message,
            "data": data,
            "timestamp": int(time.time() * 1000),
        }
        with open(log_path, "a", encoding="utf-8") as fp:
            fp.write(json.dumps(payload, ensure_ascii=False) + "\n")
    except OSError:
        pass
    # #endregion


def fetch_remote_manifest(
    *,
    hf_url: str = DEFAULT_MANIFEST_HF_URL,
    github_url: str = DEFAULT_MANIFEST_GITHUB_URL,
) -> dict[str, Any]:
    failures: list[str] = []
    for label, url in (("huggingface", hf_url), ("github", github_url)):
        if not url:
            continue
        try:
            manifest = _fetch_json_url(url)
            _agent_debug_log(
                "rag_corpus_download_service.py:fetch_remote_manifest",
                "manifest_fetch_ok",
                {"mirror": label, "url": url[:120]},
                "H1",
            )
            return manifest
        except Exception as exc:
            detail = f"{label}: {type(exc).__name__}: {exc}"
            failures.append(detail)
            _agent_debug_log(
                "rag_corpus_download_service.py:fetch_remote_manifest",
                "manifest_fetch_failed",
                {"mirror": label, "url": url[:120], "error": detail},
                "H1",
            )
            continue
    summary = "; ".join(failures) if failures else "no mirrors configured"
    raise RuntimeError(
        "Could not fetch the knowledge base manifest (Hugging Face and GitHub mirror unreachable). "
        f"Details: {summary}. "
        "The offline corpus may not be published yet — see docs/troubleshooting.md § Knowledge base."
    )


def _download_file(
    url: str,
    dest: str,
    *,
    cancel_event: threading.Event,
    on_progress: Optional[Callable[[int, int], None]] = None,
) -> None:
    import shutil as _shutil

    req = urllib.request.Request(url, headers={"User-Agent": "bonsAI/1.0"})
    with urllib.request.urlopen(req, timeout=120) as resp:
        total = int(resp.headers.get("Content-Length") or 0)
        done = 0
        os.makedirs(os.path.dirname(dest) or ".", exist_ok=True)
        tmp = f"{dest}.part"
        with open(tmp, "wb") as out:
            while True:
                if cancel_event.is_set():
                    raise RuntimeError("Cancelled.")
                chunk = resp.read(1024 * 256)
                if not chunk:
                    break
                out.write(chunk)
                done += len(chunk)
                if on_progress:
                    on_progress(done, total)
        os.replace(tmp, dest)
    _ = _shutil


def _free_bytes(path: str) -> int:
    try:
        st = os.statvfs(path)
        return int(st.f_bavail * st.f_frsize)
    except OSError:
        return 0


def _verify_sqlite(path: str) -> None:
    conn = sqlite3.connect(f"file:{path}?mode=ro", uri=True)
    try:
        conn.execute("SELECT count(*) FROM sqlite_master").fetchone()
    finally:
        conn.close()


def install_corpus_from_manifest(
    manifest: dict[str, Any],
    install_dir: str,
    *,
    cancel_event: threading.Event,
    log: Callable[[str], None],
    on_progress: Optional[Callable[[int, int], None]] = None,
) -> str:
    """Download compressed chunk(s), decompress to corpus.db, verify checksums."""
    root = corpus_install_root(install_dir)
    if not root:
        raise RuntimeError("Install path is required.")
    root = sanitize_corpus_install_dir(root)
    os.makedirs(root, exist_ok=True)

    chunks = manifest.get("chunks")
    if not isinstance(chunks, list) or not chunks:
        raise RuntimeError("Manifest has no chunks.")

    uncompressed = int(manifest.get("uncompressed_bytes") or 0)
    compressed_total = sum(int(c.get("bytes") or 0) for c in chunks if isinstance(c, dict))
    peak_need = uncompressed + compressed_total + (8 * 1024 * 1024)
    free = _free_bytes(root)
    if free and free < peak_need:
        raise RuntimeError(
            f"Not enough free space at {root}: need ~{peak_need // (1024*1024)} MB, have ~{free // (1024*1024)} MB."
        )

    urls = manifest.get("urls") if isinstance(manifest.get("urls"), dict) else {}
    hf_base = str(urls.get("huggingface") or "").rsplit("/", 1)[0]
    gh_base = str(urls.get("github_release") or "").rsplit("/", 1)[0]

    part_paths: list[str] = []
    for idx, chunk in enumerate(chunks):
        if not isinstance(chunk, dict):
            continue
        if cancel_event.is_set():
            raise RuntimeError("Cancelled.")
        fname = os.path.basename(str(chunk.get("filename") or "").strip())
        if not fname or fname != str(chunk.get("filename") or "").strip():
            raise RuntimeError("Invalid chunk filename.")
        dest = os.path.join(root, fname)
        expected_sha = str(chunk.get("sha256") or "").strip().lower()
        if expected_sha and os.path.isfile(dest) and _sha256_file(dest) == expected_sha:
            log(f"[bonsAI] Using existing {fname} (checksum OK).")
            part_paths.append(dest)
            continue
        url_hf = f"{hf_base}/{fname}" if hf_base else ""
        url_gh = f"{gh_base}/{fname}" if gh_base else ""
        last_err = ""
        for url in (url_hf, url_gh):
            if not url:
                continue
            try:
                log(f"[bonsAI] Downloading {fname} from {url[:80]}…")

                def _prog(done: int, total: int) -> None:
                    if on_progress and total > 0:
                        on_progress(done, total)

                _download_file(url, dest, cancel_event=cancel_event, on_progress=_prog)
                if expected_sha and _sha256_file(dest) != expected_sha:
                    raise RuntimeError(f"Checksum mismatch for {fname}")
                part_paths.append(dest)
                last_err = ""
                break
            except Exception as exc:
                last_err = str(exc)
                if os.path.isfile(dest):
                    try:
                        os.remove(dest)
                    except OSError:
                        pass
        if last_err:
            raise RuntimeError(last_err or f"Failed to download {fname}")

    if cancel_event.is_set():
        raise RuntimeError("Cancelled.")

    # Single zlib chunk -> corpus.db
    db_path = os.path.join(root, CORPUS_DB_FILENAME)
    if len(part_paths) == 1 and part_paths[0].endswith(".zlib"):
        log("[bonsAI] Decompressing corpus…")
        raw = zlib.decompress(Path(part_paths[0]).read_bytes())
        db_sha = str(manifest.get("db_sha256") or "").strip().lower()
        if db_sha and hashlib.sha256(raw).hexdigest() != db_sha:
            raise RuntimeError("Decompressed corpus.db checksum mismatch.")
        with open(db_path, "wb") as fp:
            fp.write(raw)
        try:
            os.remove(part_paths[0])
        except OSError:
            pass
    else:
        raise RuntimeError("Unsupported chunk layout (expected single .zlib file).")

    _verify_sqlite(db_path)
    write_manifest(os.path.join(root, CORPUS_MANIFEST_FILENAME), manifest)
    attributions = manifest.get("attributions_markdown")
    if isinstance(attributions, str) and attributions.strip():
        (Path(root) / CORPUS_ATTRIBUTIONS_FILENAME).write_text(attributions.strip() + "\n", encoding="utf-8")
    close_connection(db_path)
    log(f"[bonsAI] Knowledge base installed at {root} (version {manifest.get('version')}).")
    return root


def remove_corpus_at_path(install_path: str, logger: Any) -> bool:
    root = corpus_install_root(install_path)
    if not root or not os.path.isdir(root):
        return False
    try:
        target = Path(root).resolve()
        if not is_allowed_corpus_install_path(target):
            logger.warning("remove_corpus: refusing disallowed path: %s", root)
            return False
        db = str(target / CORPUS_DB_FILENAME)
        close_connection(db)
        shutil.rmtree(target, ignore_errors=True)
        return True
    except OSError as exc:
        logger.warning("remove_corpus failed: %s", exc)
        return False


async def run_rag_corpus_download(
    *,
    install_dir: str,
    state: dict[str, Any],
    logger: Any,
    cancel_event: asyncio.Event,
    manifest_url_hf: str = DEFAULT_MANIFEST_HF_URL,
    manifest_url_github: str = DEFAULT_MANIFEST_GITHUB_URL,
) -> None:
    """Populate state while downloading corpus (async wrapper)."""

    def log(msg: str) -> None:
        _append_log(list(state.setdefault("log_tail", [])), msg)
        try:
            logger.info("rag_corpus_download: %s", msg[:400])
        except Exception:
            pass

    def cancelled() -> bool:
        return cancel_event.is_set()

    thread_cancel = threading.Event()

    async def _watch_cancel() -> None:
        while not cancel_event.is_set():
            await asyncio.sleep(0.25)
        thread_cancel.set()

    watcher = asyncio.create_task(_watch_cancel())

    try:
        state["phase"] = "running"
        state["done"] = False
        state["error"] = ""
        state["stage"] = "manifest"
        state["install_path"] = install_dir

        if cancelled():
            raise RuntimeError("Cancelled.")

        manifest = await asyncio.to_thread(
            fetch_remote_manifest,
            hf_url=manifest_url_hf,
            github_url=manifest_url_github,
        )
        state["manifest_version"] = str(manifest.get("version") or "")
        state["stage"] = "download"

        def on_progress(done: int, total: int) -> None:
            state["bytes_downloaded"] = done
            state["bytes_total"] = total
            if total > 0:
                state["progress_pct"] = min(99, int(done * 100 / total))

        root = await asyncio.to_thread(
            lambda: install_corpus_from_manifest(
                manifest,
                install_dir,
                cancel_event=thread_cancel,
                log=log,
                on_progress=on_progress,
            )
        )
        state["progress_pct"] = 100
        state["install_path"] = root
        state["phase"] = "done"
        state["stage"] = "complete"
        state["done"] = True
    except Exception as exc:
        msg = str(exc)
        log(f"[bonsAI] Knowledge base download stopped: {msg}")
        state["phase"] = "cancelled" if cancel_event.is_set() else "failed"
        state["error"] = msg
        state["done"] = True
        if not cancel_event.is_set():
            try:
                logger.exception("rag_corpus_download failed")
            except Exception:
                pass
    finally:
        watcher.cancel()
        try:
            await watcher
        except asyncio.CancelledError:
            pass
