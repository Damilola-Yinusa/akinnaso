import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "fs";
import { firecrawl, requireEnv, slugify, readCache } from "./lib.mjs";

requireEnv("SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "FIRECRAWL_API_KEY");

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const urls = readCache("external_urls.json");
if (!urls?.length) {
  throw new Error("No external URLs found. Run: npm run ingest:discover-external");
}
console.log("Candidate URLs:", urls.length);

function sourceFor(url) {
  if (url.includes("premiumtimesng.com")) return "premiumtimes";
  if (url.includes("punchng.com")) return "punch";
  if (url.includes("vanguardngr.com")) return "vanguard";
  if (url.includes("saharareporters.com")) return "sahara";
  return "external";
}

async function processUrl(url) {
  const { data: existing } = await supabase.from("articles").select("id").eq("source_url", url).maybeSingle();
  if (existing) return "skip";

  const res = await firecrawl("scrape", { url, formats: ["markdown"], onlyMainContent: true });
  const d = res.data || res;
  const md = d.markdown || "";
  const meta = d.metadata || {};

  const hay = `${meta.title || ""} ${meta.author || ""} ${md.slice(0, 1500)}`.toLowerCase();
  const trustedColumnist = url.includes("punchng.com/");
  if (!trustedColumnist && !hay.includes("akinnaso")) return "not-author";

  const title = (meta.title || meta.ogTitle || "Untitled")
    .replace(/\s*[-|]\s*(Premium Times|Punch Newspapers|Vanguard News|Sahara Reporters).*$/i, "")
    .replace(/\s*[-|]\s*The Nation.*$/i, "")
    .trim();

  const m = url.replace(/\/$/, "").match(/\/([a-z0-9-]+)$/i);
  const slug = (m ? m[1] : slugify(title)).toLowerCase();

  const published = meta.publishedTime || meta["article:published_time"] || meta.datePublished || null;
  const excerpt = (meta.description || meta.ogDescription || md.slice(0, 280).replace(/\s+/g, " "))
    .trim()
    .slice(0, 320);
  const heroImage = meta.ogImage || meta.image || null;
  const wordCount = md.split(/\s+/).filter(Boolean).length;

  const row = {
    source: sourceFor(url),
    source_url: url,
    slug,
    title,
    published_at: published,
    excerpt,
    content: md,
    hero_image: heroImage,
    word_count: wordCount,
    tags: [],
  };
  const { error } = await supabase.from("articles").upsert(row, { onConflict: "source_url" });
  if (error) throw error;
  return "ok";
}

let ok = 0,
  skip = 0,
  fail = 0,
  notAuthor = 0,
  done = 0;
const CONCURRENCY = 4;
async function worker(q) {
  while (q.length) {
    const u = q.shift();
    try {
      const r = await processUrl(u);
      if (r === "ok") ok++;
      else if (r === "skip") skip++;
      else if (r === "not-author") notAuthor++;
    } catch (e) {
      fail++;
      console.error("FAIL", u, e.message.slice(0, 200));
    }
    done++;
    if (done % 5 === 0)
      console.log(`progress ${done}/${urls.length} ok=${ok} skip=${skip} notAuthor=${notAuthor} fail=${fail}`);
  }
}
const queue = [...urls];
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker(queue)));
console.log(`DONE total=${urls.length} ok=${ok} skip=${skip} notAuthor=${notAuthor} fail=${fail}`);
