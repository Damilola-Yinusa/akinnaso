import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";

const SOURCE_LABEL: Record<string, string> = {
  thenation: "The Nation",
  punch: "The Punch",
  premiumtimes: "Premium Times",
  vanguard: "Vanguard",
  sahara: "Sahara Reporters",
};

function cleanContent(raw: string) {
  if (!raw) return "";
  const h1Match = raw.match(/^#\s+.+$/m);
  let body = h1Match ? raw.slice(h1Match.index! + h1Match[0].length) : raw;
  const cutMarkers = [
    /\n#{2,5}\s+\[/,
    /\n\s*Tags?:\s/i,
    /\n\s*Share this:/i,
    /\n\s*Related Posts?/i,
    /\n\s*Subscribe to our Newsletter/i,
    /\n\s*Trending/i,
    /\n\s*Most Read/i,
  ];
  let cutAt = body.length;
  for (const re of cutMarkers) {
    const m = body.match(re);
    if (m && m.index !== undefined && m.index < cutAt) cutAt = m.index;
  }
  return body.slice(0, cutAt).trim();
}

export const Route = createFileRoute("/writings/$slug")({
  loader: async ({ params }) => {
    const { data, error } = await supabase
      .from("articles")
      .select("id, slug, title, content, excerpt, summary, published_at, hero_image, source, source_url, word_count, theme")
      .eq("slug", params.slug)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw notFound();
    return { article: data };
  },
  head: ({ loaderData }) => {
    if (!loaderData?.article) return { meta: [{ title: "Essay — F. Niyi Akinnaso" }] };
    const a = loaderData.article;
    const desc = (a.summary || a.excerpt || "An essay by F. Niyi Akinnaso.").slice(0, 200);
    const url = typeof window !== "undefined" ? window.location.href : "";
    const meta = [
      { title: `${a.title} — F. Niyi Akinnaso` },
      { name: "description", content: desc },
      { property: "og:title", content: a.title },
      { property: "og:description", content: desc },
      { property: "og:type", content: "article" },
      { property: "article:author", content: "F. Niyi Akinnaso" },
      ...(a.published_at ? [{ property: "article:published_time", content: a.published_at }] : []),
      ...(a.hero_image ? [{ property: "og:image", content: a.hero_image }, { name: "twitter:image", content: a.hero_image }] : []),
      { name: "twitter:card", content: a.hero_image ? "summary_large_image" : "summary" },
    ];
    const ld = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: a.title,
      description: desc,
      author: { "@type": "Person", name: "F. Niyi Akinnaso" },
      datePublished: a.published_at,
      image: a.hero_image || undefined,
      mainEntityOfPage: url || undefined,
      publisher: { "@type": "Organization", name: "F. Niyi Akinnaso Legacy Archive" },
    };
    return {
      meta,
      scripts: [{ type: "application/ld+json", children: JSON.stringify(ld) }],
    };
  },
  component: ArticlePage,
  errorComponent: ({ error }) => (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-6 pt-40 text-center">
        <p className="text-muted-foreground">{error.message}</p>
        <Link to="/writings" className="mt-6 inline-block text-primary">← Back to archive</Link>
      </div>
    </div>
  ),
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

function ArticlePage() {
  const { article } = Route.useLoaderData();
  const cleaned = cleanContent(article.content || "");
  const date = article.published_at
    ? new Date(article.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : null;
  const readMin = article.word_count ? Math.max(1, Math.round(article.word_count / 220)) : null;
  const sourceLabel = SOURCE_LABEL[article.source] || "The Nation";

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <article className="mx-auto max-w-3xl px-6 pt-36 pb-24">
        <Link to="/writings" className="text-sm text-muted-foreground hover:text-primary">
          ← Back to archive
        </Link>

        <header className="mt-8">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {date}{readMin ? ` · ${readMin} min read` : ""} · {sourceLabel}
          </p>
          <h1 className="mt-4 font-display text-4xl leading-tight md:text-5xl">{article.title}</h1>
          {(article.summary || article.excerpt) && (
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{article.summary || article.excerpt}</p>
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
            Originally published in {sourceLabel}. Preserved here as part of his legacy archive.
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
