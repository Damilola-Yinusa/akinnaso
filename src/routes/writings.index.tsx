import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/writings/")({
  head: () => ({
    meta: [
      { title: "Writings — F. Niyi Akinnaso" },
      { name: "description", content: "The complete searchable archive of F. Niyi Akinnaso's columns in The Nation — over a decade of commentary on Nigerian politics, education and society." },
      { property: "og:title", content: "Writings — F. Niyi Akinnaso" },
      { property: "og:description", content: "The complete searchable archive of his weekly columns." },
    ],
  }),
  component: WritingsPage,
});

type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  published_at: string | null;
  hero_image: string | null;
  source_url: string;
  source: string;
  word_count: number | null;
};

const SOURCE_LABEL: Record<string, string> = {
  thenation: "The Nation",
  punch: "The Punch",
  premiumtimes: "Premium Times",
  vanguard: "Vanguard",
  sahara: "Sahara Reporters",
};

const PAGE_SIZE = 12;

function WritingsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [year, setYear] = useState<string>("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    supabase
      .from("articles")
      .select("id, slug, title, excerpt, published_at, hero_image, source_url, word_count")
      .order("published_at", { ascending: false, nullsFirst: false })
      .then(({ data }) => {
        setArticles((data as Article[]) || []);
        setLoading(false);
      });
  }, []);

  useEffect(() => { setPage(1); }, [q, year]);

  const years = useMemo(() => {
    const ys = new Set<string>();
    articles.forEach((a) => a.published_at && ys.add(new Date(a.published_at).getFullYear().toString()));
    return [...ys].sort().reverse();
  }, [articles]);

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      if (year !== "all" && (!a.published_at || new Date(a.published_at).getFullYear().toString() !== year)) return false;
      if (q && !a.title.toLowerCase().includes(q.toLowerCase()) && !(a.excerpt || "").toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [articles, q, year]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const goTo = (p: number) => {
    setPage(p);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="bg-hero pt-36 pb-16">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Writings</p>
          <h1 className="mt-4 font-display text-5xl leading-tight md:text-6xl">
            The complete <span className="text-gradient">archive.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-muted-foreground">
            Every column Professor Akinnaso has published in <em>The Nation</em> — preserved, searchable, and freely accessible.
            {!loading && (
              <span className="ml-1 text-foreground">{articles.length} essays in the archive.</span>
            )}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search titles and excerpts…"
              className="sm:max-w-md bg-white/5 border-white/10"
            />
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setYear("all")}
                className={`rounded-full px-4 py-2 text-sm transition ${year === "all" ? "bg-primary text-primary-foreground" : "glass hover:bg-white/10"}`}
              >
                All years
              </button>
              {years.map((y) => (
                <button
                  key={y}
                  onClick={() => setYear(y)}
                  className={`rounded-full px-4 py-2 text-sm transition ${year === y ? "bg-primary text-primary-foreground" : "glass hover:bg-white/10"}`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        {loading ? (
          <p className="text-center text-muted-foreground">Loading archive…</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground">No essays match your search.</p>
        ) : (
          <>
            <p className="mb-6 text-sm text-muted-foreground">
              Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} essays
            </p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {paged.map((a) => (
                <Link
                  key={a.id}
                  to="/writings/$slug"
                  params={{ slug: a.slug }}
                  className="group glass flex flex-col overflow-hidden rounded-2xl transition-all hover:border-primary/40 hover:bg-white/[0.06]"
                >
                  {a.hero_image && (
                    <div className="aspect-[16/9] overflow-hidden bg-white/5">
                      <img src={a.hero_image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-6">
                    <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                      {a.published_at ? new Date(a.published_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "The Nation"}
                    </p>
                    <h2 className="mt-3 font-display text-xl leading-snug transition-colors group-hover:text-primary">
                      {a.title}
                    </h2>
                    {a.excerpt && (
                      <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{a.excerpt}</p>
                    )}
                    <span className="mt-auto pt-5 inline-flex items-center gap-2 text-sm text-primary">
                      Read essay →
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <nav className="mt-12 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
                <button
                  onClick={() => goTo(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="rounded-full px-4 py-2 text-sm glass hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .map((p, idx, arr) => (
                    <span key={p} className="flex items-center gap-2">
                      {idx > 0 && p - arr[idx - 1] > 1 && <span className="text-muted-foreground">…</span>}
                      <button
                        onClick={() => goTo(p)}
                        className={`min-w-10 rounded-full px-3 py-2 text-sm transition ${p === currentPage ? "bg-primary text-primary-foreground" : "glass hover:bg-white/10"}`}
                      >
                        {p}
                      </button>
                    </span>
                  ))}
                <button
                  onClick={() => goTo(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-full px-4 py-2 text-sm glass hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </nav>
            )}
          </>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
