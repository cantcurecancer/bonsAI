# bonsAI documentation index

Short guide to markdown under `docs/`. Repo root **[README.md](../README.md)** stays the primary install entry; **[CHANGELOG.md](../CHANGELOG.md)** is release history.

| Doc | Audience | What it is |
|-----|----------|------------|
| [mcp-setup.md](mcp-setup.md) | Contributors / agents | MCP servers — bonsai knowledge + Decky Plugin Studio |
| [development.md](development.md) | Contributors | Deck-first setup, build/deploy, architecture, hotspots |
| [troubleshooting.md](troubleshooting.md) | Power users | GPU, network, vision, permissions, QAM, deploy edge cases |
| [roadmap.md](roadmap.md) | Planning | Bugs, QA backlog, planned backlog |
| [testing.md](testing.md) | QA / contributors | Testing hub + slim coverage |
| [testing-automated.md](testing-automated.md) | Agents / CI | Commands runnable without a human on Deck |
| [testing-manual.md](testing-manual.md) | Maintainers | On-Deck smokes and Tier 0–4 runbook |
| [knowledge-base.md](knowledge-base.md) | Maintainers | Offline RAG / corpus phases |
| [archive/reports/](archive/reports/) | Maintainers | Security / FOSS review snapshots |
| [archive/](archive/) | — | Historical research, plans, completed features, old testing dumps |

## MCP knowledge (agents)

Policies, workflows, and specialist personas live in [`packages/bonsai-mcp/knowledge/`](../packages/bonsai-mcp/knowledge/). Call **`bonsai.session.bootstrap`** at session start. See [mcp-setup.md](mcp-setup.md).

**Start here:** install → [README.md](../README.md); contributor setup → [development.md](development.md); agent MCP → [mcp-setup.md](mcp-setup.md); on-Deck QA → [testing-manual.md](testing-manual.md); planning → [roadmap.md](roadmap.md).
