import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — F. Niyi Akinnaso" },
      { name: "description", content: "Biography of Professor F. Niyi Akinnaso, retired Professor of Anthropology and Linguistics at Temple University." },
      { property: "og:title", content: "About F. Niyi Akinnaso" },
      { property: "og:description", content: "A scholar's life across linguistics, anthropology and public commentary." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="bg-hero pt-36 pb-20">
        <div className="mx-auto max-w-4xl px-6">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Biography</p>
          <h1 className="mt-4 font-display text-5xl leading-tight md:text-6xl">
            The scholar who taught Nigeria to <span className="text-gradient">listen to itself.</span>
          </h1>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-6 py-20 text-lg leading-relaxed text-foreground/90">
        <p className="text-xl text-muted-foreground">
          F. Niyi Akinnaso is a retired Professor of Anthropology and Linguistics whose
          scholarship has, for more than four decades, examined the deep relationship between
          language, literacy, education and the modern nation-state — with Nigeria at the
          centre of much of that inquiry.
        </p>

        <h2 className="mt-12 font-display text-3xl">Early career & training</h2>
        <p className="mt-4">
          Trained as a linguist and anthropologist, Akinnaso built an international career
          that spans Nigerian and American universities. He served as a long-time faculty
          member at Temple University in Philadelphia, and was a Fulbright Visiting Scholar
          hosted by Professor Charles Fillmore at the University of California, Berkeley, with
          subsequent work in Germany.
        </p>

        <h2 className="mt-10 font-display text-3xl">A defining body of scholarship</h2>
        <p className="mt-4">
          His foundational papers on the differences and similarities between spoken and
          written language — published in <em>Language and Speech</em> in the early 1980s —
          remain widely cited. Across journals such as <em>Applied Linguistics</em>,{" "}
          <em>Anthropological Linguistics</em>, <em>Comparative Studies in Society and
          History</em>, <em>International Review of Education</em>, and <em>Names</em>, he has
          produced the most influential work to date on Yoruba personal names, mother-tongue
          literacy in Nigeria, multilingual language policy, and the politics of education.
        </p>
        <p className="mt-4">
          Google Scholar records more than 2,100 citations of his work, an h-index of 19, and
          an i10-index of 23 — a footprint that places him among the most cited scholars of
          African sociolinguistics of his generation.
        </p>

        <h2 className="mt-10 font-display text-3xl">A public intellectual</h2>
        <p className="mt-4">
          For more than a decade Professor Akinnaso has written a weekly column in <em>The
          Nation</em>, one of Nigeria's leading newspapers. His subjects range from democracy,
          electoral politics and federalism to the structure of polytechnic and university
          education, the future of the Nigerian economy, the diaspora experience, and
          tributes to the nation's elders.
        </p>

        <h2 className="mt-10 font-display text-3xl">Legacy</h2>
        <p className="mt-4">
          Whether in the seminar room, the journal page or the op-ed column, his work has
          carried a single thread: that the way a society speaks, writes, names and educates
          itself is the way that society becomes itself. This archive gathers that work into
          one place, so that students, journalists, policymakers and family can continue to
          encounter it for years to come.
        </p>
      </article>

      <SiteFooter />
    </div>
  );
}
