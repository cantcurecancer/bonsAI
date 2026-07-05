"""Shared runtime constants for the bonsAI Decky backend."""

DEFAULT_OLLAMA_HOST = "127.0.0.1"
DEFAULT_OLLAMA_PORT = 11434
DEFAULT_OLLAMA_PCIP = f"{DEFAULT_OLLAMA_HOST}:{DEFAULT_OLLAMA_PORT}"
DEFAULT_OLLAMA_BASE_URL = f"http://{DEFAULT_OLLAMA_PCIP}"

LOOPBACK_HOSTNAMES = frozenset({"127.0.0.1", "localhost", "::1", "[::1]"})

DECK_HOME = "/home/deck"
DECK_OLLAMA_CLI_PATH = f"{DECK_HOME}/.local/bin/ollama"

# UI navigation paths (keep aligned with src/ tab labels)
OLLAMA_TAB_WHERE_AI_RUNS = "Ollama → Where AI runs"
DEVELOPER_TAB_INTEGRATIONS = "Developer → Integrations"
