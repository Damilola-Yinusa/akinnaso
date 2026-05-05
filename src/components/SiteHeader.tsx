import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  const links = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/scholarship", label: "Scholarship" },
    { to: "/themes", label: "Themes" },
    { to: "/writings", label: "Writings" },
    { to: "/ask", label: "Ask AI" },
    { to: "/legacy", label: "Legacy" },
  ] as const;

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto mt-4 max-w-6xl px-4">
        <div className="glass flex items-center justify-between rounded-full px-5 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 font-display text-sm font-semibold text-primary">
              FN
            </span>
            <span className="hidden font-display text-base font-medium tracking-tight sm:inline">
              F. Niyi Akinnaso
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: l.to === "/" }}
                className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "rounded-full px-3 py-1.5 text-sm text-foreground bg-white/5" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <a
            href="https://scholar.google.com/citations?user=LBwAuEUAAAAJ&hl=en"
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Google Scholar
          </a>
        </div>
      </div>
    </header>
  );
}
