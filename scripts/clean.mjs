import { createClient } from "@supabase/supabase-js";
import { readCache, writeCache, requireEnv } from "./lib.mjs";

requireEnv("SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const slugs = readCache("his_slugs.json");
if (!slugs?.length) {
  throw new Error("No slug list found. Run ingest:nation or discover first.");
}
const validUrls = slugs.map((s) => `https://thenationonlineng.net/${s}/`);

const { data: existing } = await supabase.from("articles").select("source_url");
const toDelete = existing.filter((r) => !validUrls.includes(r.source_url)).map((r) => r.source_url);
console.log(`Existing: ${existing.length}, to delete: ${toDelete.length}, valid in list: ${validUrls.length}`);

for (let i = 0; i < toDelete.length; i += 50) {
  const chunk = toDelete.slice(i, i + 50);
  const { error } = await supabase.from("articles").delete().in("source_url", chunk);
  if (error) console.error(error);
}
console.log("Deleted noise");

const { data: stillThere } = await supabase.from("articles").select("source_url");
const haveSet = new Set(stillThere.map((r) => r.source_url));
const missing = validUrls.filter((u) => !haveSet.has(u));
console.log(`Missing: ${missing.length}`);
writeCache("missing.json", missing);
