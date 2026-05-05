import { createClient } from "@supabase/supabase-js";
import fs from "fs";
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const slugs = JSON.parse(fs.readFileSync("/tmp/his_slugs.json", "utf8"));
const validUrls = slugs.map(s => `https://thenationonlineng.net/${s}/`);

// Delete anything not in his list
const { data: existing } = await supabase.from("articles").select("source_url");
const toDelete = existing.filter(r => !validUrls.includes(r.source_url)).map(r => r.source_url);
console.log(`Existing: ${existing.length}, to delete: ${toDelete.length}, valid in list: ${validUrls.length}`);

// chunk delete
for (let i = 0; i < toDelete.length; i += 50) {
  const chunk = toDelete.slice(i, i + 50);
  const { error } = await supabase.from("articles").delete().in("source_url", chunk);
  if (error) console.error(error);
}
console.log("Deleted noise");

// Find missing
const { data: stillThere } = await supabase.from("articles").select("source_url");
const haveSet = new Set(stillThere.map(r => r.source_url));
const missing = validUrls.filter(u => !haveSet.has(u));
console.log(`Missing: ${missing.length}`);
fs.writeFileSync("/tmp/missing.json", JSON.stringify(missing, null, 2));
