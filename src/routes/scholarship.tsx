import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { publications } from "@/data/articles";

export const Route = createFileRoute("/scholarship")({
  head: () => ({
    meta: [
      { title: "Scholarship — F. Niyi Akinnaso" },
      { name: "description", content: "Selected academic publications by F. Niyi Akinnaso, drawn from his Google Scholar profile." },
      { property: "og:title", content: "Scholarship — F. Niyi Akinnaso" },
      { property: "og:description", content: "Four decades of research on language, literacy and the politics of education." },
    ],
  }),
  component: ScholarshipPage,
});

function ScholarshipPage() {
  const themes = [
    "Political Economy of Language",
    "Language Policy",
    "Bureaucratic Communication",
    "Orality and Literacy",
    "Naming Practices",
  ];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="bg-hero pt-36 pb-16">
        <div className="mx-auto max-w-5xl px-6">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Scholarship</p>
          <h1 className="mt-4 font-display text-5xl leading-tight md:text-6xl">
            Four decades of <span className="text-gradient">peer-reviewed work.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-muted-foreground">
            A selection of Professor Akinnaso's most-cited articles and chapters. The full,
            continually-updated record is hosted on Google Scholar.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <Stat value="2,134" label="Total citations" />
            <Stat value="19" label="h-index" />
            <Stat value="23" label="i10-index" />
          </div>

          <div className="mt-10 flex flex-wrap gap-2">
            {themes.map((t) => (
              <span key={t} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-muted-foreground">
                {t}
              </span>
            ))}
          </div>

          <a
            href="https://scholar.google.com/citations?user=LBwAuEUAAAAJ&hl=en"
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
          >
            Open full Google Scholar profile →
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="font-display text-3xl md:text-4xl">Selected publications</h2>
        <div className="mt-8 divide-y divide-border/60">
          {publications.map((p, i) => (
            <div key={p.title} className="grid gap-3 py-7 md:grid-cols-[3rem_1fr_auto] md:items-baseline">
              <span className="font-display text-sm text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-display text-xl leading-snug">{p.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {p.authors} · <em>{p.venue}</em> · {p.year}
                </p>
              </div>
              <div className="md:text-right">
                <p className="font-display text-lg text-gold">{p.citations.toLocaleString()}</p>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">citations</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <p className="font-display text-3xl text-primary">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
