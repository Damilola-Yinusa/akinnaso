import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/writings/$slug")({
  component: ArticlePage,
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-6 pt-36 pb-24 text-center">
        <h1 className="font-display text-4xl">Essay not found</h1>
        <p className="mt-4 text-muted-foreground">This piece may have been moved or unpublished.</p>
        <Link to="/writings" className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground">Back to archive</Link>
      </div>
      <SiteFooter />
    </div>
  ),
});

type Article = {
  id: string;
  slug: string;
  title: string;
  content: string | null;
  excerpt: string | null;
  published_at: string | null;
  hero_image: string | null;
  source_url: string;
  word_count: number | null;
};

function ArticlePage() {
  const { slug } = Route.useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    supabase
      .from("articles")
      .select("*")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data }) => {
        setArticle(data as Article | null);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-6 pt-36 text-center text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (!article) throw notFound();

  // Strip the leading "The Nation Newspaper" preamble that Firecrawl pulls from header
  const cleaned = (article.content || "").replace(/^.*?The Nation Newspaper[\s\S]*?\n\n/, "").trim();

  const date = article.published_at
    ? new Date(article.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : null;
  const readMin = article.word_count ? Math.max(1, Math.round(article.word_count / 220)) : null;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <article className="mx-auto max-w-3xl px-6 pt-36 pb-24">
        <Link to="/writings" className="text-sm text-muted-foreground hover:text-primary">
          ← Back to archive
        </Link>

        <header className="mt-8">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {date}{readMin ? ` · ${readMin} min read` : ""} · The Nation
          </p>
          <h1 className="mt-4 font-display text-4xl leading-tight md:text-5xl">{article.title}</h1>
          {article.excerpt && (
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{article.excerpt}</p>
          )}
        </header>

        {article.hero_image && (
          <img src={article.hero_image} alt="" className="mt-10 w-full rounded-2xl" />
        )}

        <div className="prose prose-invert prose-lg mt-12 max-w-none prose-headings:font-display prose-a:text-primary prose-img:rounded-xl">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{cleaned}</ReactMarkdown>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-8">
          <p className="text-sm text-muted-foreground">
            Originally published in The Nation. Preserved here as part of his legacy archive.
          </p>
          <a
            href={article.source_url}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-primary hover:underline"
          >
            View original →
          </a>
        </div>
      </article>

      <SiteFooter />
    </div>
  );
}
