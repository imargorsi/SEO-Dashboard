/**
 * Load a dotenv-style file into process.env, then spawn a command.
 * Avoids `node --env-file` (blocked when npm/Node puts it in NODE_OPTIONS).
 *
 * Usage: node scripts/with-env.mjs <env-file> <command> [...args]
 * Example: node scripts/with-env.mjs .env.production.local next dev
 */
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const [envFile, command, ...args] = process.argv.slice(2);

if (!envFile || !command) {
  console.error("Usage: node scripts/with-env.mjs <env-file> <command> [...args]");
  process.exit(1);
}

function parseEnvFile(filePath) {
  const absolute = resolve(process.cwd(), filePath);
  const raw = readFileSync(absolute, "utf8");
  const vars = {};

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    vars[key] = value.replace(/\\n/g, "\n");
  }

  return vars;
}

const loaded = parseEnvFile(envFile);
const env = { ...process.env, ...loaded };
// Prevent Node from rejecting nested --env-file via NODE_OPTIONS.
if (env.NODE_OPTIONS) {
  env.NODE_OPTIONS = env.NODE_OPTIONS.replace(/(^|\s)--env-file(?:=|\s)\S*/g, " ").trim();
}

const child = spawn(command, args, {
  env,
  stdio: "inherit",
  shell: true,
  windowsHide: true,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
