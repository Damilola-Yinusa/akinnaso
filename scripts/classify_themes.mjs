import { createClient } from "@supabase/supabase-js";
import { requireEnv } from "./lib.mjs";

requireEnv("SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// Ordered: first match wins for ties; specific themes before catch-alls.
const THEMES = [
  {
    slug: "memory-biography",
    keywords: ["obituary", "tribute", "in memoriam", "passing of", "remembering", "rest in peace",
      "elegy", "eulogy", "memorial", " late ", "passed away", "passed on"],
    weight: 3,
  },
  {
    slug: "language-culture",
    keywords: ["yoruba", "igbo", "hausa", "mother tongue", "indigenous language", "multilingual",
      "language policy", "linguist", "bilingual", "ifa", "orisha", "culture", "festival",
      "literacy", "ebonics", "translation"],
    weight: 2,
  },
  {
    slug: "education-knowledge",
    keywords: ["school", "university", "universities", "education", "asuu", "lecturer", "professor",
      "student", "curriculum", "academic", "scholarship", "research", "phd", "tertiary",
      "primary education", "secondary education", "vice-chancellor", "vice chancellor",
      "jamb", "waec", "neco", "polytechnic"],
    weight: 2,
  },
  {
    slug: "religion-society",
    keywords: ["church", "mosque", "muslim", "christian", "pentecostal", "pastor", "imam",
      "religion", "religious", "pilgrimage", "hajj", "secular", "faith", "bishop",
      "catholic", "islam", "shariah", "sharia"],
    weight: 2,
  },
  {
    slug: "security-conflict",
    keywords: ["boko haram", "insurgency", "insurgent", "bandit", "banditry", "kidnap",
      "terror", "terrorist", "herder", "herdsmen", "fulani", "biafra", "ipob", "esn",
      "police", "military", "army", "armed forces", "violence", "killing", "massacre",
      "abduction", "security", "amnesty", "war"],
    weight: 2,
  },
  {
    slug: "economy-development",
    keywords: ["economy", "economic", "inflation", "naira", "subsidy", "fuel", "petrol",
      "oil", "budget", "poverty", "unemployment", "infrastructure", "electricity",
      "power supply", "gdp", "world bank", "imf", "trade", "industry", "agriculture",
      "manufacturing", "investment", "debt"],
    weight: 2,
  },
  {
    slug: "leadership-corruption",
    keywords: ["corruption", "corrupt", "efcc", "icpc", "looting", "embezzle",
      "transparency", "accountability", "bribery", "graft", "stolen funds",
      "leadership", "good governance"],
    weight: 2,
  },
  {
    slug: "global-affairs",
    keywords: ["united states", "america", "trump", "biden", "obama", "britain", "uk",
      "european union", "china", "russia", "diaspora", "africa union", "ecowas",
      "south africa", "ghana", "kenya", "global"],
    weight: 1,
  },
  {
    slug: "democracy-governance",
    keywords: ["democracy", "democratic", "election", "ballot", "inec", "vote", "voter",
      "restructuring", "federalism", "federal", "constitution", "national assembly",
      "senate", "house of representatives", "governor", "president", "buhari",
      "tinubu", "jonathan", "obasanjo", "apc", "pdp", "labour party", "lp",
      "rule of law", "judiciary", "supreme court", "state of the nation",
      "amendment", "referendum"],
    weight: 1,
  },
];

function scoreText(text) {
  const t = text.toLowerCase();
  const scores = new Map();
  for (const theme of THEMES) {
    let s = 0;
    for (const kw of theme.keywords) {
      // count occurrences (cap to 5 per keyword to avoid runaway)
      let count = 0;
      let idx = 0;
      while ((idx = t.indexOf(kw, idx)) !== -1 && count < 5) {
        count++;
        idx += kw.length;
      }
      s += count * theme.weight;
    }
    if (s > 0) scores.set(theme.slug, s);
  }
  return scores;
}

async function main() {
  const { data: articles, error } = await supabase
    .from("articles")
    .select("id, title, excerpt, content")
    .limit(2000);
  if (error) throw error;

  const counts = {};
  let updated = 0;
  for (const a of articles) {
    const text = `${a.title}\n${a.title}\n${a.excerpt || ""}\n${(a.content || "").slice(0, 6000)}`;
    const scores = scoreText(text);
    let theme = "other";
    let confidence = 0;
    if (scores.size > 0) {
      const sorted = [...scores.entries()].sort((a, b) => b[1] - a[1]);
      const [topSlug, topScore] = sorted[0];
      const total = sorted.reduce((s, [, v]) => s + v, 0);
      theme = topSlug;
      confidence = Math.round((topScore / total) * 100) / 100;
    }
    counts[theme] = (counts[theme] || 0) + 1;
    const { error: uerr } = await supabase
      .from("articles")
      .update({ theme, theme_confidence: confidence })
      .eq("id", a.id);
    if (uerr) { console.error(uerr); continue; }
    updated++;
  }
  console.log("Updated:", updated);
  console.log("Distribution:", counts);
}

main().catch((e) => { console.error(e); process.exit(1); });
