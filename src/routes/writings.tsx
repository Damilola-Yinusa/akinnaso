import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { articles } from "@/data/articles";

export const Route = createFileRoute("/writings")({
  head: () => ({
    meta: [
      { title: "Writings — F. Niyi Akinnaso" },
      { name: "description", content: "Newspaper columns and public essays by F. Niyi Akinnaso, published in The Nation." },
      { property: "og:title", content: "Writings — F. Niyi Akinnaso" },
      { property: "og:description", content: "Over a decade of weekly commentary on Nigerian politics, education and society." },
    ],
  }),
  component: WritingsPage,
});

function WritingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="bg-hero pt-36 pb-16">
        <div className="mx-auto max-w-5xl px-6">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Writings</p>
          <h1 className="mt-4 font-display text-5xl leading-tight md:text-6xl">
            A weekly conversation with the <span className="text-gradient">nation.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-muted-foreground">
            For more than a decade, Professor Akinnaso has written a weekly column in
            <em> The Nation</em> — Nigeria's largest opinion platform. The selection below is
            curated from the most recent essays. The full archive lives on the publisher's
            site.
          </p>
          <a
            href="https://thenationonlineng.net/author/niyi-akinnaso/"
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
          >
            Open full archive on The Nation →
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="grid gap-6 md:grid-cols-2">
          {articles.map((a) => (
            <a
              key={a.url}
              href={a.url}
              target="_blank"
              rel="noreferrer"
              className="group glass rounded-2xl p-7 transition-all hover:border-primary/40 hover:bg-white/[0.06]"
            >
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                The Nation · Opinion
              </p>
              <h2 className="mt-3 font-display text-2xl leading-snug transition-colors group-hover:text-primary">
                {a.title}
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">{a.excerpt}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm text-primary">
                Read on The Nation →
              </span>
            </a>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
