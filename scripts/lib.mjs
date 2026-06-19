import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(__dir, "..");
export const CACHE = join(__dir, ".cache");

export function loadEnv() {
  const envPath = join(ROOT, ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

export function requireEnv(...keys) {
  loadEnv();
  const missing = keys.filter((k) => !process.env[k]);
  if (missing.length) {
    throw new Error(`Missing env: ${missing.join(", ")}`);
  }
}

export function cachePath(name) {
  mkdirSync(CACHE, { recursive: true });
  return join(CACHE, name);
}

export function readCache(name, fallback = null) {
  const path = cachePath(name);
  if (!existsSync(path)) return fallback;
  return JSON.parse(readFileSync(path, "utf8"));
}

export function writeCache(name, data) {
  const path = cachePath(name);
  writeFileSync(path, JSON.stringify(data, null, 2));
  return path;
}

export async function firecrawl(path, body) {
  requireEnv("FIRECRAWL_API_KEY");
  const r = await fetch(`https://api.firecrawl.dev/v2/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`Firecrawl ${path} ${r.status}: ${await r.text()}`);
  return r.json();
}

export function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 140);
}
