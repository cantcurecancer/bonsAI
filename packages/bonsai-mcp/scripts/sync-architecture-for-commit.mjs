#!/usr/bin/env node
/**
 * pre-commit helper: regenerate MCP architecture snapshots and stage them.
 * Keeps validate-mcp.yml green without relying on developers to remember mcp:generate.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..", "..", "..");
const ARCH_FILES = [
  "packages/bonsai-mcp/knowledge/architecture/rpc-map.json",
  "packages/bonsai-mcp/knowledge/architecture/hotspots.json",
  "packages/bonsai-mcp/knowledge/architecture/import-graph.json",
  "packages/bonsai-mcp/knowledge/architecture/test-inventory.json",
  "packages/bonsai-mcp/knowledge/architecture/preview-tiers.json",
  "packages/bonsai-mcp/knowledge/architecture/env-vars.json",
];

function run(cmd, args, opts = {}) {
  const result = spawnSync(cmd, args, {
    cwd: REPO_ROOT,
    encoding: "utf8",
    stdio: opts.stdio ?? "pipe",
    shell: false,
  });
  if (result.status !== 0) {
    const detail = (result.stderr || result.stdout || `${cmd} failed`).trim();
    console.error(detail);
    process.exit(result.status ?? 1);
  }
  return result;
}

run(process.execPath, [
  path.join(REPO_ROOT, "packages", "bonsai-mcp", "scripts", "generate-architecture.mjs"),
], { stdio: "inherit" });

run("git", [
  "add",
  "--",
  "packages/bonsai-mcp/knowledge/architecture/rpc-map.json",
  "packages/bonsai-mcp/knowledge/architecture/hotspots.json",
  "packages/bonsai-mcp/knowledge/architecture/import-graph.json",
  "packages/bonsai-mcp/knowledge/architecture/test-inventory.json",
  "packages/bonsai-mcp/knowledge/architecture/preview-tiers.json",
  "packages/bonsai-mcp/knowledge/architecture/env-vars.json",
]);

console.log("mcp architecture snapshots regenerated and staged");
