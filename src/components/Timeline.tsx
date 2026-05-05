import { useState } from "react";

export type TimelineEra = {
  id: string;
  range: string;
  title: string;
  blurb: string;
  events: TimelineEvent[];
};

export type TimelineEvent = {
  year: string;
  title: string;
  detail: string;
  tag?: "scholarship" | "teaching" | "public" | "honor" | "life";
};

const ERAS: TimelineEra[] = [
  {
    id: "formation",
    range: "1960s–1970s",
    title: "Formation",
    blurb: "From a Yoruba childhood to the foundations of a linguistic mind.",
    events: [
      { year: "1960s", title: "A Yoruba upbringing", detail: "Grows up immersed in the rich oral and naming traditions of Yorubaland — material he would return to as a scholar for the rest of his career.", tag: "life" },
      { year: "1970s", title: "Undergraduate training in linguistics", detail: "Begins formal study of language structure and society at the University of Ibadan, the cradle of modern Nigerian humanities.", tag: "scholarship" },
      { year: "Late 1970s", title: "Doctoral work begins", detail: "Moves toward the questions that would define his career: how literacy, schooling, and language policy shape modern African societies.", tag: "scholarship" },
    ],
  },
  {
    id: "berkeley",
    range: "1980s",
    title: "Berkeley & a foundational paper",
    blurb: "A Fulbright year with Charles Fillmore and the spoken-vs-written argument that travelled the world.",
    events: [
      { year: "Early 1980s", title: "Fulbright Visiting Scholar at UC Berkeley", detail: "Hosted by the great cognitive linguist Charles Fillmore. The collaboration sharpens his comparative work on speech and writing.", tag: "honor" },
      { year: "1982", title: "“On the Differences Between Spoken and Written Language”", detail: "Published in Language and Speech, the paper becomes one of his most cited works and a touchstone in the field of literacy studies.", tag: "scholarship" },
      { year: "1980s", title: "Research stays in Germany", detail: "Continues comparative work on multilingualism and education across European and African contexts.", tag: "scholarship" },
    ],
  },
  {
    id: "temple",
    range: "1980s–2010s",
    title: "Temple University",
    blurb: "Decades of teaching, mentorship, and a defining scholarly footprint on Yoruba names, literacy, and policy.",
    events: [
      { year: "1980s", title: "Joins Temple University", detail: "Begins a long career as Professor of Anthropology and Linguistics in Philadelphia, training generations of students.", tag: "teaching" },
      { year: "1980s–90s", title: "Yoruba personal names studies", detail: "Publishes a series of pieces in Names and Anthropological Linguistics that re-frame personal naming as serious sociolinguistic data.", tag: "scholarship" },
      { year: "1990s", title: "Comparative Studies in Society and History", detail: "Major essays on schooling, literacy and the African state extend his readership beyond linguistics into history and sociology.", tag: "scholarship" },
      { year: "2000s", title: "Mother-tongue literacy & policy", detail: "Becomes one of the leading voices arguing for Nigerian-language instruction in early schooling, in journals such as the International Review of Education.", tag: "scholarship" },
      { year: "2010s", title: "Retires as Professor Emeritus", detail: "Closes his Temple chapter with more than 2,100 citations, an h-index of 19, and an i10-index of 23 on Google Scholar.", tag: "honor" },
    ],
  },
  {
    id: "columnist",
    range: "2012–present",
    title: "The columnist years",
    blurb: "A weekly conversation with Nigeria across The Nation, The Punch, and Premium Times.",
    events: [
      { year: "2012", title: "Begins weekly column in The Nation", detail: "Brings the discipline of an anthropologist to the Nigerian op-ed page. Restructuring, education, language and leadership become recurring threads.", tag: "public" },
      { year: "2015–2023", title: "Election-cycle commentary", detail: "Becomes one of the steadiest analytic voices through three presidential cycles — measured, comparative, impatient with bad faith.", tag: "public" },
      { year: "2018–", title: "Cross-paper presence", detail: "Pieces also appear in The Punch, Premium Times, Vanguard and Sahara Reporters, broadening the audience for the same long argument.", tag: "public" },
      { year: "2026", title: "199 essays archived", detail: "This site brings together the full corpus of his public writing — searchable, themed, and now in conversation with itself through Ask AI.", tag: "life" },
    ],
  },
];

const TAG_STYLES: Record<NonNullable<TimelineEvent["tag"]>, string> = {
  scholarship: "bg-primary/15 text-primary border-primary/30",
  teaching: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  public: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  honor: "bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/30",
  life: "bg-white/10 text-foreground/80 border-white/20",
};

export function Timeline() {
  const [activeId, setActiveId] = useState<string>(ERAS[0].id);
  const active = ERAS.find((e) => e.id === activeId)!;

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-12 max-w-2xl">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">A life in motion</p>
        <h2 className="mt-3 font-display text-4xl leading-tight md:text-5xl">
          Six decades, one <span className="text-gradient">long argument.</span>
        </h2>
        <p className="mt-4 text-muted-foreground">
          Click any era to follow the through-line — from a Yoruba childhood to a global
          career in linguistics, and from the seminar room to the Nigerian op-ed page.
        </p>
      </div>

      {/* Era selector */}
      <div className="relative">
        <div className="absolute left-0 right-0 top-5 hidden h-px bg-white/10 md:block" />
        <div className="grid gap-3 md:grid-cols-4">
          {ERAS.map((era) => {
            const isActive = era.id === activeId;
            return (
              <button
                key={era.id}
                onClick={() => setActiveId(era.id)}
                className="group relative flex flex-col items-start text-left"
              >
                <span
                  className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border transition-all ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground shadow-[0_0_0_6px_color-mix(in_oklab,var(--primary)_15%,transparent)]"
                      : "border-white/15 bg-background text-muted-foreground group-hover:border-white/40"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-current" />
                </span>
                <span
                  className={`mt-3 text-xs uppercase tracking-[0.2em] transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  }`}
                >
                  {era.range}
                </span>
                <span
                  className={`mt-1 font-display text-lg leading-tight transition-colors ${
                    isActive ? "text-foreground" : "text-foreground/70 group-hover:text-foreground"
                  }`}
                >
                  {era.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active era detail */}
      <div className="mt-12 grid gap-10 md:grid-cols-[1fr_2fr]">
        <div className="md:sticky md:top-28 md:self-start">
          <p className="text-xs uppercase tracking-[0.3em] text-primary/80">{active.range}</p>
          <h3 className="mt-3 font-display text-3xl leading-tight">{active.title}</h3>
          <p className="mt-4 text-muted-foreground">{active.blurb}</p>
        </div>

        <ol className="relative border-l border-white/10 pl-8">
          {active.events.map((ev, idx) => (
            <li
              key={`${active.id}-${idx}`}
              className="relative pb-8 last:pb-0 animate-in fade-in slide-in-from-bottom-2 duration-500"
              style={{ animationDelay: `${idx * 60}ms`, animationFillMode: "both" }}
            >
              <span className="absolute -left-[37px] top-1.5 flex h-4 w-4 items-center justify-center">
                <span className="h-2 w-2 rounded-full bg-primary ring-4 ring-background" />
              </span>
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="font-display text-lg text-foreground">{ev.year}</span>
                {ev.tag && (
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.18em] ${TAG_STYLES[ev.tag]}`}
                  >
                    {ev.tag}
                  </span>
                )}
              </div>
              <p className="mt-2 font-display text-xl leading-snug">{ev.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{ev.detail}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
