"""Title: Ollama embed client

Purpose: Call Ollama /api/embed for knowledge-base hybrid retrieval vectors.
Used for: knowledge_base_service when nomic-embed-text or configured embed model is needed.
Solves: Model availability checks, HTTP embed requests, and structured OllamaEmbedError raises.
Does not: Store vectors or query SQLite — only produces embedding arrays for callers.
"""

from __future__ import annotations

import json
import urllib.error
import urllib.request
from typing import Any

from backend.ollama_connectivity import ollama_http_base_from_pc_ip_field
from backend.ollama_urls import build_ollama_embed_url
from backend.services.knowledge_base_schema import DEFAULT_EMBEDDING_MODEL
from backend.services.local_ollama_setup_service import list_installed_ollama_tags


class OllamaEmbedError(Exception):
    """Raised when Ollama embedding fails or returns an invalid payload."""


def _model_tag_matches(tags: list[str], model: str) -> bool:
    model_l = str(model or "").strip().lower()
    if not model_l:
        return False
    for tag in tags:
        t = str(tag or "").strip().lower()
        if t == model_l or t.startswith(f"{model_l}:"):
            return True
    return False


def nomic_embed_available(
    pc_ip: str,
    *,
    model: str = DEFAULT_EMBEDDING_MODEL,
    timeout_seconds: float = 3.0,
) -> bool:
    """Return True when ``model`` is installed on the Ask Ollama host (no pull)."""
    base = ollama_http_base_from_pc_ip_field(pc_ip)
    tags = list_installed_ollama_tags(base, timeout_seconds=timeout_seconds)
    return _model_tag_matches(tags, model)


def embed_texts(
    pc_ip: str,
    texts: list[str],
    *,
    model: str = DEFAULT_EMBEDDING_MODEL,
    timeout_s: float = 3.0,
    base_http: str = "",
) -> list[list[float]]:
    """Embed one or more strings via ``POST /api/embed``. Raises ``OllamaEmbedError`` on failure."""
    inputs = [str(t or "") for t in texts]
    if not inputs:
        return []
    url = build_ollama_embed_url(base_http or ollama_http_base_from_pc_ip_field(pc_ip))
    payload: dict[str, Any] = {"model": model, "input": inputs[0] if len(inputs) == 1 else inputs}
    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout_s) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = ""
        try:
            detail = exc.read().decode("utf-8", errors="replace")[:200]
        except Exception:
            pass
        raise OllamaEmbedError(f"HTTP {exc.code}: {detail or exc.reason}") from exc
    except Exception as exc:
        raise OllamaEmbedError(str(exc)) from exc

    if not isinstance(data, dict):
        raise OllamaEmbedError("embed response is not a JSON object")
    embeddings = data.get("embeddings")
    if not isinstance(embeddings, list) or len(embeddings) != len(inputs):
        raise OllamaEmbedError("embed response missing embeddings array")
    out: list[list[float]] = []
    for item in embeddings:
        if not isinstance(item, list) or not item:
            raise OllamaEmbedError("embed response contains invalid vector")
        out.append([float(x) for x in item])
    return out
