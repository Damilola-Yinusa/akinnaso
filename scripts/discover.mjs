const FC = process.env.FIRECRAWL_API_KEY;
const AUTHOR_BASE = "https://thenationonlineng.net/author/niyi-akinnaso";

async function fc(path, body) {
  const r = await fetch(`https://api.firecrawl.dev/v2/${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${FC}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`FC ${path} ${r.status}: ${await r.text()}`);
  return r.json();
}

const all = new Set();
for (let p = 1; p <= 15; p++) {
  const url = p === 1 ? `${AUTHOR_BASE}/` : `${AUTHOR_BASE}/page/${p}/`;
  const res = await fc("scrape", { url, formats: ["markdown"], onlyMainContent: true });
  const md = (res.data || res).markdown || "";
  // Only article links — exclude listing/author/page/category links
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

import fs from "fs";
fs.writeFileSync("/tmp/his_slugs.json", JSON.stringify([...all], null, 2));
console.log(`\nFinal: ${all.size} unique slugs`);
