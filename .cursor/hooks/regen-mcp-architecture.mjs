#!/usr/bin/env node
/**
 * afterFileEdit: regenerate bonsai-mcp architecture JSON when RPC/src/preview/.env change.
 * Matcher excludes architecture/*.json so this does not loop on its own writes.
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

// Consume stdin (file path available for future filtering)
await readStdin();

const result = spawnSync(
  process.execPath,
  [path.join(REPO_ROOT, "packages", "bonsai-mcp", "scripts", "generate-architecture.mjs")],
  { cwd: REPO_ROOT, encoding: "utf8" },
);

if (result.status !== 0) {
  const err = (result.stderr || result.stdout || "mcp:generate failed").trim();
  process.stdout.write(
    JSON.stringify({
      additional_context: `bonsAI mcp:generate after edit failed: ${err}`,
    }),
  );
  process.exit(0);
}

process.stdout.write(
  JSON.stringify({
    additional_context:
      "Regenerated packages/bonsai-mcp/knowledge/architecture/*.json — include them in the same commit as RPC/src changes.",
  }),
);
process.exit(0);
