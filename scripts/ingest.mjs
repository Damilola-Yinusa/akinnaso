import { createClient } from "@supabase/supabase-js";

const FC = process.env.FIRECRAWL_API_KEY;
const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SB_URL, SB_KEY, { auth: { persistSession: false } });

const AUTHOR_BASE = "https://thenationonlineng.net/author/niyi-akinnaso";
const TOTAL_PAGES = 15;

async function fc(path, body) {
  const r = await fetch(`https://api.firecrawl.dev/v2/${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${FC}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`FC ${path} ${r.status}: ${await r.text()}`);
  return r.json();
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 120);
}

function extractArticleLinks(markdown, html) {
  const urls = new Set();
  const text = (markdown || "") + "\n" + (html || "");
  // Article URLs look like https://thenationonlineng.net/<slug>/ (slug has hyphens, no /author/, no /page/, no /category/)
  const re = /https?:\/\/thenationonlineng\.net\/([a-z0-9-]+)\/?(?=["')\s])/gi;
  let m;
  while ((m = re.exec(text))) {
    const slug = m[1];
    if (["author", "page", "category", "tag", "wp-content", "wp-json", "feed", "about-us", "contact-us", "privacy-policy", "advert-rate"].includes(slug)) continue;
    if (slug.length < 8) continue;
    urls.add(`https://thenationonlineng.net/${slug}/`);
  }
  return [...urls];
}

async function getAllArticleUrls() {
  const all = new Set();
  for (let p = 1; p <= TOTAL_PAGES; p++) {
    const url = p === 1 ? `${AUTHOR_BASE}/` : `${AUTHOR_BASE}/page/${p}/`;
    try {
      const res = await fc("scrape", { url, formats: ["markdown", "links"], onlyMainContent: false });
      const data = res.data || res;
      const links = (data.links || []).map(l => typeof l === "string" ? l : l.url).filter(Boolean);
      const fromMd = extractArticleLinks(data.markdown, "");
      const fromLinks = extractArticleLinks(links.join(" "), "");
      [...fromMd, ...fromLinks].forEach(u => all.add(u));
      console.log(`page ${p}: total=${all.size}`);
    } catch (e) {
      console.error(`page ${p} failed:`, e.message);
    }
  }
  return [...all];
}

async function scrapeAndStore(url) {
  // skip if exists
  const { data: existing } = await supabase.from("articles").select("id").eq("source_url", url).maybeSingle();
  if (existing) return "skip";

  const res = await fc("scrape", { url, formats: ["markdown", "html"], onlyMainContent: true });
  const d = res.data || res;
  const md = d.markdown || "";
  const meta = d.metadata || {};
  const title = (meta.title || meta.ogTitle || "").replace(/\s*[-|]\s*The Nation.*$/i, "").trim() || "Untitled";
  const slugBase = (url.match(/thenationonlineng\.net\/([a-z0-9-]+)/i) || [])[1] || slugify(title);
  const published = meta.publishedTime || meta["article:published_time"] || meta.datePublished || null;
  const excerpt = (meta.description || meta.ogDescription || md.slice(0, 280).replace(/\s+/g, " ")).trim().slice(0, 320);
  const heroImage = meta.ogImage || meta.image || null;
  const wordCount = md.split(/\s+/).filter(Boolean).length;

  const row = {
    source: "thenation",
    source_url: url,
    slug: slugBase,
    title,
    published_at: published,
    excerpt,
    content: md,
    html: d.html || null,
    hero_image: heroImage,
    word_count: wordCount,
    tags: [],
  };
  const { error } = await supabase.from("articles").upsert(row, { onConflict: "source_url" });
  if (error) throw error;
  return "ok";
}

const articleUrls = await getAllArticleUrls();
console.log(`\nDiscovered ${articleUrls.length} unique article URLs`);

// Save list for inspection
import fs from "fs";
fs.writeFileSync("/tmp/article_urls.json", JSON.stringify(articleUrls, null, 2));

// Scrape with concurrency 4
const CONCURRENCY = 4;
let done = 0, ok = 0, skip = 0, fail = 0;
async function worker(queue) {
  while (queue.length) {
    const url = queue.shift();
    try {
      const r = await scrapeAndStore(url);
      if (r === "ok") ok++; else skip++;
    } catch (e) {
      fail++;
      console.error("FAIL", url, e.message.slice(0, 200));
    }
    done++;
    if (done % 10 === 0) console.log(`progress ${done}/${articleUrls.length} ok=${ok} skip=${skip} fail=${fail}`);
  }
}
const queue = [...articleUrls];
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker(queue)));
console.log(`DONE total=${articleUrls.length} ok=${ok} skip=${skip} fail=${fail}`);
