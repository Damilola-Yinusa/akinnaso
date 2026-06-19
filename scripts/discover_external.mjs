/**
 * Discover Akinnaso essays on outlets beyond The Nation via Firecrawl search.
 * Writes scripts/.cache/external_urls.json for ingest_external.mjs
 */
import { firecrawl, writeCache } from "./lib.mjs";

const SEARCHES = [
  { query: "Niyi Akinnaso site:punchng.com", host: "punchng.com" },
  { query: "Niyi Akinnaso site:premiumtimesng.com", host: "premiumtimesng.com" },
  { query: "Niyi Akinnaso site:vanguardngr.com", host: "vanguardngr.com" },
  { query: "Niyi Akinnaso site:saharareporters.com", host: "saharareporters.com" },
];

const urls = new Set();

for (const { query, host } of SEARCHES) {
  console.log("Searching:", query);
  try {
    const res = await firecrawl("search", { query, limit: 100 });
    const items = res.data || res.results || [];
    for (const item of items) {
      const url = item.url || item.link;
      if (url && url.includes(host)) urls.add(url.split("?")[0].replace(/\/$/, "") + "/");
    }
    console.log(`  found ${items.length} hits, total unique=${urls.size}`);
  } catch (e) {
    console.error(`  search failed:`, e.message);
  }
}

const list = [...urls].sort();
const path = writeCache("external_urls.json", list);
console.log(`\nWrote ${list.length} URLs to ${path}`);
