/**
 * Emit a SQL batch INSERT for articles.jsonl rows [offset, offset+limit).
 * Usage: node scripts/upload-batch.mjs 0 10 | used with Supabase SQL editor / MCP
 */
import { readFileSync, existsSync } from "fs";
import { cachePath } from "./lib.mjs";

const offset = Number(process.argv[2] || 0);
const limit = Number(process.argv[3] || 10);
const path = cachePath("articles.jsonl");

if (!existsSync(path)) {
  console.error(`Missing ${path}`);
  process.exit(1);
}

const rows = [];
for (const line of readFileSync(path, "utf8").split("\n")) {
  if (!line.trim()) continue;
  rows.push(JSON.parse(line));
}

const batch = rows.slice(offset, offset + limit);
if (!batch.length) {
  console.error(`No rows at offset ${offset}`);
  process.exit(0);
}

const json = JSON.stringify(batch);
const sql = `
INSERT INTO public.articles (
  source, source_url, slug, title, published_at, excerpt, content, html, hero_image, word_count, tags
)
SELECT
  r->>'source',
  r->>'source_url',
  r->>'slug',
  r->>'title',
  NULLIF(r->>'published_at', '')::timestamptz,
  r->>'excerpt',
  r->>'content',
  r->>'html',
  r->>'hero_image',
  NULLIF(r->>'word_count', '')::integer,
  '{}'::text[]
FROM jsonb_array_elements($json$${json}$json$::jsonb) AS r
ON CONFLICT (source_url) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  html = EXCLUDED.html,
  hero_image = EXCLUDED.hero_image,
  word_count = EXCLUDED.word_count,
  updated_at = now();
`;

process.stdout.write(sql);
console.error(`-- batch offset=${offset} count=${batch.length} total=${rows.length}`);
