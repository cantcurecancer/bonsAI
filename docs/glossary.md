# bonsAI glossary

Short definitions for terms used in file headers and maintainer docs. Expand on first use in a file when the audience may be new.

| Term | Meaning |
|------|---------|
| **Ask** | User question submitted from the Main tab; may run locally (sanitizer/shortcut) or via Ollama. |
| **CEF** | Chromium Embedded Framework — Steam Deck UI runtime; preview mocks approximate it. |
| **D-pad** | Directional pad / gamepad navigation (Up, Down, Left, Right, A). |
| **Deck** | Steam Deck handheld; primary deployment target. |
| **Decky** | [Decky Loader](https://github.com/SteamDeckHomebrew/decky-loader) plugin host for QAM plugins. |
| **DPS** | Decky Plugin Studio — VSIX/MCP for preview, deploy, and Deck screenshots. |
| **KB** | Knowledge base — offline RAG corpus for game/strategy context. |
| **NDJSON** | Newline-delimited JSON — debug ingest log format from Deck. |
| **Ollama** | Local LLM server (`127.0.0.1:11434` by default on Deck). |
| **QAM** | Quick Access Menu — Steam overlay where bonsAI lives. |
| **RAG** | Retrieval-augmented generation — KB chunks injected into prompts. |
| **RPC** | Remote procedure call — React `call()` → Python `Plugin` methods in `main.py`. |
| **Strategy** | Ask mode for level/boss coaching with branches and checklist UI. |
| **TDP** | Thermal Design Power — Deck wattage cap. bonsAI reads it and suggests values; it does not change it. |
| **VAC** | Valve Anti-Cheat — `bonsai:vac-check` local command for game safety hints. |
