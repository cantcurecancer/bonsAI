#!/usr/bin/env node
/**
 * beforeShellExecution: deny `git push` when MCP architecture snapshots are stale.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..", "..");

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return {};
  }
}

function isGitPush(command) {
  if (!command || typeof command !== "string") return false;
  // Match `git push`, `git -C … push`, but not `git push --help` dry-runs we still want checked.
  return /\bgit(?:\s+-C\s+\S+)?\s+push\b/i.test(command);
}

const input = await readStdin();
const command = input.command ?? "";

if (!isGitPush(command)) {
  process.stdout.write(JSON.stringify({ permission: "allow" }));
  process.exit(0);
}

const result = spawnSync(
  process.execPath,
  [path.join(REPO_ROOT, "packages", "bonsai-mcp", "scripts", "validate-knowledge.mjs"), "--check-generated"],
  { cwd: REPO_ROOT, encoding: "utf8" },
);

if (result.status === 0) {
  process.stdout.write(JSON.stringify({ permission: "allow" }));
  process.exit(0);
}

const stderr = (result.stderr || result.stdout || "").trim();
const msg =
  "MCP architecture snapshots are stale (validate-mcp CI would fail). " +
  "Run: pnpm run mcp:generate && git add packages/bonsai-mcp/knowledge/architecture/ && commit, then push again." +
  (stderr ? `\n\n${stderr}` : "");

process.stdout.write(
  JSON.stringify({
    permission: "deny",
    user_message: msg,
    agent_message: msg,
  }),
);
process.exit(0);
