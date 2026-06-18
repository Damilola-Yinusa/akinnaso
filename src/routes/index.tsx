import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { articles, publications } from "@/data/articles";

const heroPortrait = "/hero-portrait.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden bg-hero pt-32 pb-24 md:pt-40 md:pb-32">
        <div className="starfield absolute inset-0 opacity-60" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-[1.2fr_1fr] md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              A Living Legacy Archive
            </div>
            <h1 className="mt-6 font-display text-5xl leading-[1.05] tracking-tight md:text-7xl">
              <span className="text-gradient">F. Niyi Akinnaso</span>
              <span className="block text-foreground/90">
                a life of language,<br />
                scholarship & nation.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Retired Professor of Anthropology and Linguistics. Columnist. Public
              intellectual. Across four decades of scholarship and over a decade of weekly
              writing in The Nation, his work has shaped how we understand language, literacy,
              and democracy in Nigeria.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/writings"
                className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-[var(--shadow-elegant)] transition-transform hover:-translate-y-0.5"
              >
                Read his writings
              </Link>
              <Link
                to="/about"
                className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-white/10"
              >
                The story
              </Link>
            </div>
            <p className="mt-8 text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Scroll to explore the archive ↓
            </p>
          </div>
          <div className="relative">
            <div className="glow absolute -inset-10 -z-10 opacity-70" aria-hidden />
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-card shadow-[var(--shadow-card)]">
              <img
                src={heroPortrait}
                alt="Portrait of Professor F. Niyi Akinnaso"
                width={1280}
                height={1600}
                className="aspect-[4/5] w-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/95 to-transparent p-6">
                <p className="font-display text-lg">F. Niyi Akinnaso, Ph.D.</p>
                <p className="text-sm text-muted-foreground">
                  Retired Professor — Anthropology & Linguistics
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CREDIBILITY STRIP */}
      <section className="border-y border-border/60 bg-card/40 py-10">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-center text-xs uppercase tracking-[0.3em] text-muted-foreground">
            A career across institutions and continents
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-4 font-display text-lg text-foreground/70">
            <span>Temple University</span>
            <span className="text-muted-foreground">·</span>
            <span>UC Berkeley</span>
            <span className="text-muted-foreground">·</span>
            <span>Fulbright Scholar</span>
            <span className="text-muted-foreground">·</span>
            <span>Obafemi Awolowo University</span>
            <span className="text-muted-foreground">·</span>
            <span>The Nation</span>
          </div>
        </div>
      </section>

      {/* GET TO KNOW */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-16 md:grid-cols-[auto_1fr] md:gap-24">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
            01 — Get to know
          </p>
          <div>
            <h2 className="font-display text-4xl leading-tight md:text-5xl">
              Over four decades of expertise in language, literacy and the
              <span className="text-primary"> politics of education.</span>
            </h2>
            <p className="mt-6 max-w-2xl text-muted-foreground">
              Professor Akinnaso's scholarship — cited more than 2,100 times — examines the
              relationship between spoken and written language, mother-tongue education,
              naming practices, and the political economy of language in multilingual
              nations. As a columnist, he brings the same rigor to questions of governance,
              democracy, and higher-education reform in Nigeria.
            </p>

            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              <Stat value="2,134+" label="Scholarly citations" />
              <Stat value="19" label="h-index" />
              <Stat value="200+" label="Newspaper columns" />
            </div>
          </div>
        </div>
      </section>

      {/* EXPERIENCE TIMELINE */}
      <section className="border-t border-border/60 bg-card/30 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-end justify-between gap-8">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
                02 — Experience
              </p>
              <h2 className="mt-3 font-display text-4xl md:text-5xl">
                A career that shaped meaning.
              </h2>
            </div>
            <Link to="/about" className="hidden text-sm text-primary hover:underline md:inline">
              Full biography →
            </Link>
          </div>

          <div className="mt-12 divide-y divide-border/60">
            {experience.map((e) => (
              <div key={e.role + e.years} className="grid gap-2 py-6 md:grid-cols-[1fr_auto] md:items-baseline">
                <div>
                  <h3 className="font-display text-xl">{e.role}</h3>
                  <p className="text-sm text-muted-foreground">{e.org}</p>
                </div>
                <p className="text-sm text-muted-foreground md:text-right">{e.years}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED WRITINGS */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="flex items-end justify-between gap-8">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
              03 — Recent writings
            </p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">
              From the column inches.
            </h2>
          </div>
          <Link to="/writings" className="text-sm text-primary hover:underline">
            All writings →
          </Link>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {articles.slice(0, 4).map((a) => (
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
              <h3 className="mt-3 font-display text-2xl leading-snug text-foreground transition-colors group-hover:text-primary">
                {a.title}
              </h3>
              <p className="mt-3 text-sm text-muted-foreground">{a.excerpt}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm text-primary">
                Read article →
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* SCHOLARSHIP HIGHLIGHTS */}
      <section className="border-t border-border/60 bg-card/30 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-end justify-between gap-8">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
                04 — Scholarship
              </p>
              <h2 className="mt-3 font-display text-4xl md:text-5xl">
                Most-cited works.
              </h2>
            </div>
            <Link to="/scholarship" className="text-sm text-primary hover:underline">
              All publications →
            </Link>
          </div>
          <div className="mt-12 divide-y divide-border/60">
            {publications.slice(0, 5).map((p) => (
              <div key={p.title} className="grid gap-2 py-6 md:grid-cols-[1fr_auto] md:items-baseline">
                <div>
                  <h3 className="font-display text-lg leading-snug">{p.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {p.authors} · {p.venue} · {p.year}
                  </p>
                </div>
                <span className="text-sm text-gold md:text-right">
                  {p.citations.toLocaleString()} citations
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-6 py-28 text-center">
        <h2 className="font-display text-4xl md:text-6xl">
          A legacy worth <span className="text-gradient">remembering.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-muted-foreground">
          Explore decades of writing, teaching and public commentary — one continuous
          conversation about language, knowledge and nationhood.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/legacy" className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground">
            Explore the legacy
          </Link>
          <a
            href="https://scholar.google.com/citations?user=LBwAuEUAAAAJ&hl=en"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm"
          >
            View Google Scholar
          </a>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <p className="font-display text-3xl text-primary">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

const experience = [
  { role: "Retired Professor of Anthropology & Linguistics", org: "Temple University, Philadelphia", years: "until retirement" },
  { role: "Weekly Columnist", org: "The Nation Newspaper, Nigeria", years: "2010s — present" },
  { role: "Fulbright Visiting Scholar", org: "Hosted at UC Berkeley · Germany program", years: "1988" },
  { role: "Researcher & Lecturer", org: "Obafemi Awolowo University & international universities", years: "1980s — 2000s" },
  { role: "Editor & Public Intellectual", org: "Books, journals & national policy debates", years: "Throughout career" },
];
