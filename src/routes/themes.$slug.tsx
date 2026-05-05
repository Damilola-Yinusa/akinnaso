import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/themes/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Theme: ${params.slug} — F. Niyi Akinnaso` },
    ],
  }),
  component: ThemePage,
  errorComponent: ({ error }) => (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-6 pt-40 text-center">
        <p className="text-muted-foreground">{error.message}</p>
        <Link to="/themes" className="mt-6 inline-block text-primary">← All themes</Link>
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-6 pt-40 text-center">
        <h1 className="font-display text-3xl">Theme not found</h1>
        <Link to="/themes" className="mt-6 inline-block text-primary">← All themes</Link>
      </div>
    </div>
  ),
});

type Theme = {
  id: string;
  slug: string;
  title: string;
  blurb: string;
  narrative: string;
};

type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  published_at: string | null;
  hero_image: string | null;
  source: string;
};

const SOURCE_LABEL: Record<string, string> = {
  thenation: "The Nation",
  punch: "The Punch",
  premiumtimes: "Premium Times",
  vanguard: "Vanguard",
  sahara: "Sahara Reporters",
};

function ThemePage() {
  const { slug } = Route.useParams();
  const [theme, setTheme] = useState<Theme | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: t } = await supabase
        .from("themes")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (!t) {
        setMissing(true);
        setLoading(false);
        return;
      }
      const { data: a } = await supabase
        .from("articles")
        .select("id, slug, title, excerpt, published_at, hero_image, source")
        .eq("theme", slug)
        .order("published_at", { ascending: false, nullsFirst: false });
      setTheme(t as Theme);
      setArticles((a as Article[]) || []);
      setLoading(false);
    })();
  }, [slug]);

  if (missing) {
    throw notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="bg-hero pt-36 pb-16">
        <div className="mx-auto max-w-4xl px-6">
          <Link to="/themes" className="text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground">
            ← All themes
          </Link>
          {theme && (
            <>
              <h1 className="mt-6 font-display text-5xl leading-tight md:text-6xl">
                {theme.title}
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                {theme.narrative}
              </p>
              <p className="mt-4 text-sm uppercase tracking-[0.2em] text-primary/80">
                {articles.length} essay{articles.length === 1 ? "" : "s"}
              </p>
            </>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16">
        {loading ? (
          <p className="text-center text-muted-foreground">Loading…</p>
        ) : articles.length === 0 ? (
          <p className="text-center text-muted-foreground">No essays in this theme yet.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {articles.map((a) => (
              <li key={a.id}>
                <Link
                  to="/writings/$slug"
                  params={{ slug: a.slug }}
                  className="group block py-6"
                >
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                    {a.published_at ? new Date(a.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : ""}
                    {a.source && <span className="ml-2 text-primary/70">· {SOURCE_LABEL[a.source] || a.source}</span>}
                  </p>
                  <h2 className="mt-2 font-display text-2xl leading-snug transition-colors group-hover:text-primary">
                    {a.title}
                  </h2>
                  {a.excerpt && (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{a.excerpt}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
