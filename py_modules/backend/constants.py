"""Title: Backend runtime constants

Purpose: Centralize shared defaults and path literals for the Decky plugin backend.
Used for: Ollama host/port defaults, loopback detection, and UI navigation path strings.
Solves: One source of truth so services and RPC handlers agree on baseline values.
Does not: Load settings, perform I/O, or encode business logic beyond fixed literals.
"""

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
