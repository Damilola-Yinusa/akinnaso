// Ingest Akinnaso essays from external outlets (Premium Times, Punch, Vanguard, Sahara Reporters)
import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const FC = process.env.FIRECRAWL_API_KEY;
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const urls = JSON.parse(fs.readFileSync("/tmp/external_urls.json", "utf8"));
console.log("Candidate URLs:", urls.length);

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 140);
}

function sourceFor(url) {
  if (url.includes("premiumtimesng.com")) return "premiumtimes";
  if (url.includes("punchng.com")) return "punch";
  if (url.includes("vanguardngr.com")) return "vanguard";
  if (url.includes("saharareporters.com")) return "sahara";
  return "external";
}

async function fc(path, body) {
  const r = await fetch(`https://api.firecrawl.dev/v2/${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${FC}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`FC ${r.status}: ${await r.text()}`);
  return r.json();
}

async function processUrl(url) {
  const { data: existing } = await supabase
    .from("articles").select("id").eq("source_url", url).maybeSingle();
  if (existing) return "skip";

  const res = await fc("scrape", { url, formats: ["markdown"], onlyMainContent: true });
  const d = res.data || res;
  const md = d.markdown || "";
  const meta = d.metadata || {};

  // Verify Akinnaso authorship - must mention his name in title, byline, or first 600 chars
  const hay = `${meta.title || ""} ${meta.author || ""} ${md.slice(0, 800)}`.toLowerCase();
  if (!hay.includes("akinnaso")) return "not-author";

  const title = (meta.title || meta.ogTitle || "Untitled")
    .replace(/\s*[-|]\s*(Premium Times|Punch Newspapers|Vanguard News|Sahara Reporters).*$/i, "")
    .replace(/\s*[-|]\s*The Nation.*$/i, "")
    .trim();

  // build slug from URL path tail
  const m = url.replace(/\/$/, "").match(/\/([a-z0-9-]+)$/i);
  const slug = (m ? m[1] : slugify(title)).toLowerCase();

  const published =
    meta.publishedTime || meta["article:published_time"] || meta.datePublished || null;
  const excerpt = (meta.description || meta.ogDescription || md.slice(0, 280).replace(/\s+/g, " "))
    .trim().slice(0, 320);
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

let ok = 0, skip = 0, fail = 0, notAuthor = 0, done = 0;
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
