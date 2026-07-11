# bonsAI documentation index

Short guide to markdown under `docs/`. Repo root **[README.md](../README.md)** stays the primary install entry; **[CHANGELOG.md](../CHANGELOG.md)** is release history.

| Doc | Audience | What it is |
|-----|----------|------------|
| [mcp-setup.md](mcp-setup.md) | Contributors / agents | **MCP servers** — bonsai knowledge + Decky Plugin Studio ops; DPS upstream sync + findings log |
| [development.md](development.md) | Contributors | Deck-first setup, build/deploy, BPM test loop, architecture, change-risk hotspots |
| [troubleshooting.md](troubleshooting.md) | Power users | GPU, network, vision, permissions, QAM, deploy edge cases |
| [roadmap.md](roadmap.md) | Planning / contributors | In progress, planned backlog, and completed shipped work |
| [testing.md](testing.md) | QA / contributors | Regression gates, device QA runbook (Tier 0–4), shipped-feature coverage, Test Results log |
| [security-audit-report.md](security-audit-report.md) | Maintainers | RPC/log/UI disclosure review and status |
| [archive/refactor/refactor-specialist-sweep-2026.md](archive/refactor/refactor-specialist-sweep-2026.md) | Contributors | 2026 LOC reduction sweep report |
| [archive/refactor/refactor-specialist-sweep.md](archive/refactor/refactor-specialist-sweep.md) | Contributors | Historical doc/script reorg + unified-input refactor |

## MCP knowledge (agents)

Policies, workflows, and specialist personas live in [`packages/bonsai-mcp/knowledge/`](../packages/bonsai-mcp/knowledge/). IDE agents should call **`bonsai.session.bootstrap`** at session start. See [mcp-setup.md](mcp-setup.md).

**Start here:** install → [README.md](../README.md); first-time contributor setup → [development.md](development.md); agent MCP → [mcp-setup.md](mcp-setup.md); on-Deck QA → [testing.md#device-qa-runbook](testing.md#device-qa-runbook); planning → [roadmap.md](roadmap.md).
