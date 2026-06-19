/**
 * Full archive restore for a fresh Supabase project.
 *
 * Requires in .env:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   FIRECRAWL_API_KEY
 */
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, "..");

function run(script) {
  return new Promise((resolve, reject) => {
    console.log(`\n=== ${script} ===\n`);
    const child = spawn("node", [join(__dir, script)], {
      cwd: root,
      stdio: "inherit",
      env: process.env,
    });
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${script} exited ${code}`))));
  });
}

const steps = process.argv.includes("--external")
  ? [
      "seed-publications.mjs",
      "discover_external.mjs",
      "ingest_external.mjs",
      "ingest.mjs",
      "clean.mjs",
      "classify_themes.mjs",
    ]
  : ["seed-publications.mjs", "ingest.mjs", "clean.mjs", "classify_themes.mjs"];

for (const step of steps) {
  await run(step);
}
console.log("\nRestore complete. Check /writings on the site.");
