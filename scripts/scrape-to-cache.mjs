/**
 * Scrape articles via Firecrawl and save to scripts/.cache/articles.jsonl
 * (no Supabase credentials required — run upload-cache.mjs after)
 */
import { createWriteStream, existsSync, readFileSync } from "fs";
import {
  firecrawl,
  requireEnv,
  slugify,
  cachePath,
  writeCache,
  readCache,
} from "./lib.mjs";

requireEnv("FIRECRAWL_API_KEY");

const AUTHOR_BASE = "https://thenationonlineng.net/author/niyi-akinnaso";
const TOTAL_PAGES = 15;
const OUT = cachePath("articles.jsonl");
const CONCURRENCY = 4;

function extractArticleLinks(markdown, html) {
  const urls = new Set();
  const text = (markdown || "") + "\n" + (html || "");
  const re = /https?:\/\/thenationonlineng\.net\/([a-z0-9-]+)\/?(?=["')\s])/gi;
  let m;
  while ((m = re.exec(text))) {
    const slug = m[1];
    if (
      ["author", "page", "category", "tag", "wp-content", "wp-json", "feed", "about-us", "contact-us", "privacy-policy", "advert-rate"].includes(slug)
    )
      continue;
    if (slug.length < 8) continue;
    urls.add(`https://thenationonlineng.net/${slug}/`);
  }
  return [...urls];
}

async function getAllArticleUrls() {
  const cached = readCache("article_urls.json");
  if (cached?.length) {
    console.log(`Using cached URL list (${cached.length} URLs)`);
    return cached;
  }
  const all = new Set();
  for (let p = 1; p <= TOTAL_PAGES; p++) {
    const url = p === 1 ? `${AUTHOR_BASE}/` : `${AUTHOR_BASE}/page/${p}/`;
    try {
      const res = await firecrawl("scrape", { url, formats: ["markdown", "links"], onlyMainContent: false });
      const data = res.data || res;
      const links = (data.links || []).map((l) => (typeof l === "string" ? l : l.url)).filter(Boolean);
      [...extractArticleLinks(data.markdown, ""), ...extractArticleLinks(links.join(" "), "")].forEach((u) =>
        all.add(u),
      );
      console.log(`page ${p}: total=${all.size}`);
    } catch (e) {
      console.error(`page ${p} failed:`, e.message);
    }
  }
  const list = [...all];
  writeCache("article_urls.json", list);
  writeCache(
    "his_slugs.json",
    list.map((u) => u.match(/thenationonlineng\.net\/([a-z0-9-]+)/i)?.[1]).filter(Boolean),
  );
  return list;
}

function loadDone() {
  if (!existsSync(OUT)) return new Set();
  const done = new Set();
  for (const line of readFileSync(OUT, "utf8").split("\n")) {
    if (!line.trim()) continue;
    try {
      done.add(JSON.parse(line).source_url);
    } catch {
      /* skip bad line */
    }
  }
  return done;
}

async function scrapeOne(url) {
  const res = await firecrawl("scrape", { url, formats: ["markdown", "html"], onlyMainContent: true });
  const d = res.data || res;
  const md = d.markdown || "";
  const meta = d.metadata || {};
  const title =
    (meta.title || meta.ogTitle || "").replace(/\s*[-|]\s*The Nation.*$/i, "").trim() || "Untitled";
  const slugBase = (url.match(/thenationonlineng\.net\/([a-z0-9-]+)/i) || [])[1] || slugify(title);
  const published = meta.publishedTime || meta["article:published_time"] || meta.datePublished || null;
  const excerpt = (meta.description || meta.ogDescription || md.slice(0, 280).replace(/\s+/g, " "))
    .trim()
    .slice(0, 320);
  return {
    source: "thenation",
    source_url: url,
    slug: slugBase,
    title,
    published_at: published,
    excerpt,
    content: md,
    html: d.html || null,
    hero_image: meta.ogImage || meta.image || null,
    word_count: md.split(/\s+/).filter(Boolean).length,
    tags: [],
  };
}

const urls = await getAllArticleUrls();
console.log(`\nDiscovered ${urls.length} URLs`);

const done = loadDone();
const pending = urls.filter((u) => !done.has(u));
console.log(`Already scraped: ${done.size}, pending: ${pending.length}`);

const stream = createWriteStream(OUT, { flags: "a" });
let ok = 0,
  fail = 0,
  n = 0;
async function worker(queue) {
  while (queue.length) {
    const url = queue.shift();
    try {
      const row = await scrapeOne(url);
      stream.write(JSON.stringify(row) + "\n");
      ok++;
    } catch (e) {
      fail++;
      console.error("FAIL", url, e.message.slice(0, 160));
    }
    n++;
    if (n % 5 === 0) console.log(`progress ${n}/${pending.length} ok=${ok} fail=${fail}`);
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker([...pending])));
stream.end();
console.log(`\nSaved to ${OUT} — ok=${ok} fail=${fail}`);
