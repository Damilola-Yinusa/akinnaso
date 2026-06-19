import { firecrawl, writeCache } from "./lib.mjs";

const AUTHOR_BASE = "https://thenationonlineng.net/author/niyi-akinnaso";

const all = new Set();
for (let p = 1; p <= 15; p++) {
  const url = p === 1 ? `${AUTHOR_BASE}/` : `${AUTHOR_BASE}/page/${p}/`;
  const res = await firecrawl("scrape", { url, formats: ["markdown"], onlyMainContent: true });
  const md = (res.data || res).markdown || "";
  const re = /https?:\/\/thenationonlineng\.net\/([a-z0-9-]+)\/?(?=[)\s"'])/gi;
  let m;
  let pageCount = 0;
  while ((m = re.exec(md))) {
    const slug = m[1];
    if (["author", "page", "category", "tag", "wp-content", "feed"].includes(slug)) continue;
    if (slug.length < 8) continue;
    if (!all.has(slug)) pageCount++;
    all.add(slug);
  }
  console.log(`page ${p}: +${pageCount}, total=${all.size}`);
}

const slugs = [...all];
writeCache("his_slugs.json", slugs);
console.log(`\nWrote ${slugs.length} slugs to scripts/.cache/his_slugs.json`);
