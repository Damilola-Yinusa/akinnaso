/**
 * Seed academic publications from src/data/articles.ts into Supabase.
 * Run once after migrations on a fresh project.
 */
import { createClient } from "@supabase/supabase-js";
import { loadEnv, requireEnv } from "./lib.mjs";

// Mirrors src/data/articles.ts — scholarship page still reads the TS file,
// but admin/publications uses the database.
const PUBLICATIONS = [
  { title: "On the differences between spoken and written language", authors: "F. N. Akinnaso", venue: "Language and Speech 25(2), 97–125", year: 1982, citation_count: 432 },
  { title: "Policy and experiment in mother tongue literacy in Nigeria", authors: "F. N. Akinnaso", venue: "International Review of Education 39(4), 255–285", year: 1993, citation_count: 217 },
  { title: "The sociolinguistic basis of Yoruba personal names", authors: "F. N. Akinnaso", venue: "Anthropological Linguistics 22(7), 275–304", year: 1980, citation_count: 216 },
  { title: "Performance and ethnic style in job interviews", authors: "F. N. Akinnaso & C. S. Ajirotutu", venue: "Language and Social Identity, 119–144", year: 1982, citation_count: 198 },
  { title: "Schooling, language, and knowledge in literate and nonliterate societies", authors: "F. N. Akinnaso", venue: "Comparative Studies in Society and History 34(1), 68–109", year: 1992, citation_count: 139 },
  { title: "Toward the development of a multilingual language policy in Nigeria", authors: "F. N. Akinnaso", venue: "Applied Linguistics 12(1), 29–61", year: 1991, citation_count: 124 },
  { title: "On the similarities between spoken and written language", authors: "F. N. Akinnaso", venue: "Language and Speech 28(4), 323–359", year: 1985, citation_count: 117 },
  { title: "The consequences of literacy in pragmatic and theoretical perspectives", authors: "F. N. Akinnaso", venue: "Anthropology & Education Quarterly 12(3), 163–200", year: 1981, citation_count: 114 },
  { title: "Linguistic unification and language rights", authors: "F. Niyi Akinnaso", venue: "Applied Linguistics 15(2), 139–168", year: 1994, citation_count: 79 },
  { title: "One nation, four hundred languages: Unity and diversity in Nigeria's language policy", authors: "F. N. Akinnaso", venue: "Language Problems and Language Planning 13(2), 133–146", year: 1989, citation_count: 75 },
  { title: "Names and naming principles in cross-cultural perspective", authors: "F. N. Akinnaso", venue: "Names 29(1), 37–63", year: 1981, citation_count: 53 },
  { title: "Bourdieu and the diviner: Knowledge and symbolic power in Yoruba divination", authors: "F. N. Akinnaso & W. James", venue: "The Pursuit of Certainty, 234–257", year: 1995, citation_count: 36 },
  { title: "On the mother tongue education policy in Nigeria", authors: "F. N. Akinnaso", venue: "Educational Review 43(1), 89–106", year: 1991, citation_count: 33 },
  { title: "Yoruba traditional names and the transmission of cultural knowledge", authors: "F. N. Akinnaso", venue: "Names 31(3), 139–158", year: 1983, citation_count: 30 },
];

loadEnv();
requireEnv("SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const rows = PUBLICATIONS.map((p, i) => ({
  title: p.title,
  authors: p.authors,
  venue: p.venue,
  year: p.year,
  citation_count: p.citation_count,
  sort_order: i,
  featured: i < 3,
}));

const { error } = await supabase.from("publications").insert(rows);
if (error?.code === "23505" || error) {
  let inserted = 0;
  for (const row of rows) {
    const { data: existing } = await supabase.from("publications").select("id").eq("title", row.title).maybeSingle();
    if (existing) continue;
    const { error: ierr } = await supabase.from("publications").insert(row);
    if (ierr) throw ierr;
    inserted++;
  }
  console.log(`Inserted ${inserted} publications (${rows.length - inserted} already existed).`);
} else {
  console.log(`Inserted ${rows.length} publications.`);
}
