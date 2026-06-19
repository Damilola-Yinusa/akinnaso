/**
 * Upload articles from scripts/.cache/articles.jsonl into Supabase.
 */
import { createClient } from "@supabase/supabase-js";
import { createReadStream, existsSync } from "fs";
import { createInterface } from "readline";
import { requireEnv, cachePath } from "./lib.mjs";

requireEnv("SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const path = cachePath("articles.jsonl");
if (!existsSync(path)) {
  throw new Error(`No cache at ${path}. Run: npm run ingest:scrape`);
}

let ok = 0,
  skip = 0,
  fail = 0,
  n = 0;

const rl = createInterface({ input: createReadStream(path), crlfDelay: Infinity });
for await (const line of rl) {
  if (!line.trim()) continue;
  n++;
  const row = JSON.parse(line);
  const { data: existing } = await supabase.from("articles").select("id").eq("source_url", row.source_url).maybeSingle();
  if (existing) {
    skip++;
    continue;
  }
  const { error } = await supabase.from("articles").upsert(row, { onConflict: "source_url" });
  if (error) {
    fail++;
    console.error("FAIL", row.source_url, error.message);
  } else {
    ok++;
  }
  if (n % 20 === 0) console.log(`uploaded ${n} lines — ok=${ok} skip=${skip} fail=${fail}`);
}
console.log(`DONE lines=${n} ok=${ok} skip=${skip} fail=${fail}`);
