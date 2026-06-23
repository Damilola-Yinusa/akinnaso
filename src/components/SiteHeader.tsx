import { Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronDown } from "lucide-react";

type NavItem =
  | { to: string; label: string }
  | { label: string; children: { to: string; label: string }[] };

const navItems: NavItem[] = [
  { to: "/", label: "Home" },
  {
    label: "Life",
    children: [
      { to: "/about", label: "About" },
      { to: "/scholarship", label: "Scholarship" },
      { to: "/legacy", label: "Legacy" },
    ],
  },
  {
    label: "Work",
    children: [
      { to: "/themes", label: "Themes" },
      { to: "/writings", label: "Writings" },
    ],
  },
  { to: "/tributes", label: "Tributes" },
];

function DesktopDropdown({ label, children }: { label: string; children: { to: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };
  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 120);
  };

  return (
    <div ref={ref} className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        {label}
        <ChevronDown className="h-3.5 w-3.5 opacity-70" />
      </button>
      {open && (
        <div className="absolute left-1/2 top-full z-50 mt-2 min-w-[180px] -translate-x-1/2 rounded-2xl border border-white/10 bg-background/95 p-2 shadow-xl backdrop-blur-xl">
          {children.map((c) => (
            <Link
              key={c.to}
              to={c.to}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
              activeProps={{ className: "block rounded-lg px-3 py-2 text-sm text-foreground bg-white/5" }}
            >
              {c.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

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
            {navItems.map((item) =>
              "children" in item ? (
                <DesktopDropdown key={item.label} label={item.label} children={item.children} />
              ) : (
                <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={{ exact: item.to === "/" }}
                  className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  activeProps={{ className: "rounded-full px-3 py-1.5 text-sm text-foreground bg-white/5" }}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="https://scholar.google.com/citations?user=LBwAuEUAAAAJ&hl=en"
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:inline-block"
            >
              Google Scholar
            </a>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] overflow-y-auto border-l border-white/10 bg-background p-6">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-display text-base">Menu</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-white/5 hover:text-foreground"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {navItems.map((item) =>
                "children" in item ? (
                  <div key={item.label} className="mt-3">
                    <div className="px-3 pb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
                      {item.label}
                    </div>
                    {item.children.map((c) => (
                      <Link
                        key={c.to}
                        to={c.to}
                        onClick={() => setMobileOpen(false)}
                        className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground"
                        activeProps={{ className: "block rounded-lg px-3 py-2 text-sm text-foreground bg-white/5" }}
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    activeOptions={{ exact: item.to === "/" }}
                    className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground"
                    activeProps={{ className: "rounded-lg px-3 py-2 text-sm text-foreground bg-white/5" }}
                  >
                    {item.label}
                  </Link>
                ),
              )}
              <a
                href="https://scholar.google.com/citations?user=LBwAuEUAAAAJ&hl=en"
                target="_blank"
                rel="noreferrer"
                className="mt-6 rounded-full bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground"
              >
                Google Scholar
              </a>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
