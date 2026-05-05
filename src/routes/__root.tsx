import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

const personLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Person",
  name: "F. Niyi Akinnaso",
  alternateName: "Femi Niyi Akinnaso",
  jobTitle: "Professor Emeritus of Anthropology and Linguistics",
  affiliation: { "@type": "CollegeOrUniversity", name: "Temple University" },
  sameAs: [
    "https://scholar.google.com/citations?user=LBwAuEUAAAAJ&hl=en",
    "https://thenationonlineng.net/author/niyi-akinnaso/",
  ],
  knowsAbout: [
    "Sociolinguistics",
    "Language Policy",
    "Yoruba Onomastics",
    "Literacy Studies",
    "Anthropology of Education",
    "Nigerian Politics",
  ],
});

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "F. Niyi Akinnaso — Legacy Archive" },
      { name: "description", content: "The digital legacy of Professor F. Niyi Akinnaso — retired Professor of Anthropology and Linguistics, scholar, columnist and public intellectual." },
      { name: "author", content: "F. Niyi Akinnaso" },
      { property: "og:site_name", content: "F. Niyi Akinnaso Legacy Archive" },
      { property: "og:title", content: "F. Niyi Akinnaso — Legacy Archive" },
      { property: "og:description", content: "The digital legacy of Professor F. Niyi Akinnaso — retired Professor of Anthropology and Linguistics, scholar, columnist and public intellectual." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "F. Niyi Akinnaso — Legacy Archive" },
      { name: "twitter:description", content: "The digital legacy of Professor F. Niyi Akinnaso — retired Professor of Anthropology and Linguistics, scholar, columnist and public intellectual." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/e677a239-307b-479c-b3b4-89af961ed4d1" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/e677a239-307b-479c-b3b4-89af961ed4d1" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
      { rel: "sitemap", type: "application/xml", href: "/api/sitemap.xml" },
      { rel: "canonical", href: typeof window !== "undefined" ? window.location.origin + window.location.pathname : "" },
    ],
    scripts: [
      { type: "application/ld+json", children: personLd },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return <Outlet />;
}
