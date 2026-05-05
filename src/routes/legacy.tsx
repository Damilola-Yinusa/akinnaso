import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/legacy")({
  head: () => ({
    meta: [
      { title: "Legacy — F. Niyi Akinnaso" },
      { name: "description", content: "The teaching, mentorship and public service legacy of Professor F. Niyi Akinnaso." },
      { property: "og:title", content: "The Legacy of F. Niyi Akinnaso" },
      { property: "og:description", content: "A scholar, columnist and mentor — a continuing influence on language, education and Nigerian public life." },
    ],
  }),
  component: LegacyPage,
});

function LegacyPage() {
  const pillars = [
    {
      title: "Teaching",
      body: "Decades of mentoring undergraduate and graduate students at Temple University and visiting institutions, training a generation of linguists and anthropologists.",
    },
    {
      title: "Scholarship",
      body: "A peer-reviewed body of work cited 2,100+ times, foundational in sociolinguistics, language policy, literacy studies and Yoruba onomastics.",
    },
    {
      title: "Public commentary",
      body: "Over 200 weekly columns in The Nation, shaping public debate on democracy, education reform, federalism and national identity.",
    },
    {
      title: "Service",
      body: "Fulbright Visiting Scholar; collaborator with international universities; trusted voice on Nigerian higher-education policy and reform.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="bg-hero pt-36 pb-20">
        <div className="mx-auto max-w-5xl px-6">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Legacy</p>
          <h1 className="mt-4 font-display text-5xl leading-tight md:text-6xl">
            What endures, beyond the <span className="text-gradient">page.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-muted-foreground">
            A life is more than a list of publications. Professor Akinnaso's legacy lives in
            the students he trained, the readers he provoked, the policy he influenced and
            the conversations he started — many of which are still going.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="grid gap-6 md:grid-cols-2">
          {pillars.map((p, i) => (
            <div key={p.title} className="glass rounded-2xl p-7">
              <p className="font-display text-sm text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h2 className="mt-2 font-display text-2xl">{p.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          <div className="glass rounded-2xl p-8">
            <h3 className="font-display text-xl">A note for family & friends</h3>
            <p className="mt-3 text-sm text-muted-foreground">
              This site is a living archive. If you have photographs, documents, recordings or
              memories you would like to add to the legacy collection, they are warmly
              welcomed.
            </p>
          </div>
          <div className="glass rounded-2xl p-8">
            <h3 className="font-display text-xl">For students & researchers</h3>
            <p className="mt-3 text-sm text-muted-foreground">
              Citations and full texts of his academic work are catalogued on Google Scholar.
              The full opinion archive — over a decade of weekly columns — lives on The
              Nation's website.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a className="rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground"
                 href="https://scholar.google.com/citations?user=LBwAuEUAAAAJ&hl=en" target="_blank" rel="noreferrer">
                Google Scholar
              </a>
              <a className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm"
                 href="https://thenationonlineng.net/author/niyi-akinnaso/" target="_blank" rel="noreferrer">
                The Nation
              </a>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
