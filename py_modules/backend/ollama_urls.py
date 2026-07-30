"""Title: Ollama URL builders

Purpose: Normalize user host/port input and build Ollama API endpoint URLs.
Used for: Chat and embed URL construction from settings pc_ip or raw host strings.
Solves: Consistent parsing of bare host:port vs full http URLs across the backend.
Does not: Probe connectivity or validate that Ollama is running at the resolved base.
"""

from typing import Tuple
from urllib.parse import urlparse

from backend.constants import DEFAULT_OLLAMA_HOST, DEFAULT_OLLAMA_PORT


def normalize_ollama_base(raw: str) -> Tuple[str, int, str]:
    """Normalize user-provided host input into host/port/base-url tuple values."""
    candidate = (raw or "").strip()
    if not candidate:
        return DEFAULT_OLLAMA_HOST, DEFAULT_OLLAMA_PORT, f"http://{DEFAULT_OLLAMA_HOST}:{DEFAULT_OLLAMA_PORT}"

    if "//" not in candidate:
        candidate = f"http://{candidate}"
    parsed = urlparse(candidate)
    host = parsed.hostname or DEFAULT_OLLAMA_HOST
    port = parsed.port or DEFAULT_OLLAMA_PORT
    return host, port, f"http://{host}:{port}"


def build_ollama_chat_url(raw: str) -> str:
    """Build the /api/chat endpoint URL from a normalized Ollama base value."""
    _, _, base = normalize_ollama_base(raw)
    return f"{base}/api/chat"


def build_ollama_embed_url(raw: str) -> str:
    """Build the /api/embed endpoint URL from a normalized Ollama base value."""
    _, _, base = normalize_ollama_base(raw)
    return f"{base}/api/embed"
