import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/themes/")({
  head: () => ({
    meta: [
      { title: "Themes — F. Niyi Akinnaso" },
      { name: "description", content: "A thematic reading of two decades of essays by F. Niyi Akinnaso — democracy, education, language, religion, security and the long argument about Nigeria." },
      { property: "og:title", content: "Themes — F. Niyi Akinnaso" },
      { property: "og:description", content: "Read the archive as a single, cohering argument about Nigeria." },
    ],
  }),
  component: ThemesPage,
});

type Theme = {
  id: string;
  slug: string;
  title: string;
  blurb: string;
  narrative: string;
  sort_order: number;
};

type Article = {
  id: string;
  slug: string;
  title: string;
  published_at: string | null;
  theme: string | null;
};

function ThemesPage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [byTheme, setByTheme] = useState<Record<string, Article[]>>({});
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: t }, { data: a }] = await Promise.all([
        supabase.from("themes").select("*").order("sort_order"),
        supabase
          .from("articles")
          .select("id, slug, title, published_at, theme")
          .order("published_at", { ascending: false, nullsFirst: false }),
      ]);
      const arts = (a as Article[]) || [];
      const grouped: Record<string, Article[]> = {};
      const c: Record<string, number> = {};
      for (const art of arts) {
        const k = art.theme || "other";
        (grouped[k] ||= []).push(art);
        c[k] = (c[k] || 0) + 1;
      }
      setThemes((t as Theme[]) || []);
      setByTheme(grouped);
      setCounts(c);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="bg-hero pt-36 pb-20">
        <div className="mx-auto max-w-4xl px-6">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">A reading guide</p>
          <h1 className="mt-4 font-display text-5xl leading-tight md:text-6xl">
            Twenty years, <span className="text-gradient">one argument.</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Read end to end, Professor Akinnaso's essays form a single, patient argument about
            Nigeria — about who it could become if it took its languages, its schools, its
            elections and its dead seriously. These are the threads that hold the archive
            together.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16">
        {loading ? (
          <p className="text-center text-muted-foreground">Loading…</p>
        ) : (
          <div className="space-y-20">
            {themes
              .filter((t) => (counts[t.slug] || 0) > 0)
              .map((theme, i) => {
                const featured = (byTheme[theme.slug] || []).slice(0, 4);
                const count = counts[theme.slug] || 0;
                return (
                  <article key={theme.id} className="grid gap-8 md:grid-cols-[auto_1fr]">
                    <div className="md:w-32">
                      <span className="font-display text-5xl text-primary/40">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <div>
                      <Link
                        to="/themes/$slug"
                        params={{ slug: theme.slug }}
                        className="group block"
                      >
                        <h2 className="font-display text-3xl leading-tight transition-colors group-hover:text-primary md:text-4xl">
                          {theme.title}
                        </h2>
                        <p className="mt-2 text-sm uppercase tracking-[0.2em] text-muted-foreground">
                          {count} essay{count === 1 ? "" : "s"}
                        </p>
                      </Link>
                      <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                        {theme.narrative}
                      </p>

                      {featured.length > 0 && (
                        <ul className="mt-6 space-y-2 border-l border-white/10 pl-5">
                          {featured.map((a) => (
                            <li key={a.id}>
                              <Link
                                to="/writings/$slug"
                                params={{ slug: a.slug }}
                                className="group flex items-baseline gap-3 text-sm"
                              >
                                <span className="shrink-0 text-xs text-muted-foreground">
                                  {a.published_at ? new Date(a.published_at).getFullYear() : ""}
                                </span>
                                <span className="text-foreground/90 transition-colors group-hover:text-primary">
                                  {a.title}
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}

                      <Link
                        to="/themes/$slug"
                        params={{ slug: theme.slug }}
                        className="mt-6 inline-flex items-center gap-2 text-sm text-primary"
                      >
                        Explore all {count} →
                      </Link>
                    </div>
                  </article>
                );
              })}
          </div>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
