import { Link } from "@tanstack/react-router";
import { NewsletterSignup } from "@/components/NewsletterSignup";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background/60 py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12">
          <NewsletterSignup />
        </div>
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <h3 className="font-display text-xl">F. Niyi Akinnaso</h3>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              A digital legacy preserving the scholarship, columns, and public service of a
              retired Professor of Anthropology and Linguistics.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Explore
            </h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-primary">Biography</Link></li>
              <li><Link to="/scholarship" className="hover:text-primary">Scholarship</Link></li>
              <li><Link to="/writings" className="hover:text-primary">Newspaper Columns</Link></li>
              <li><Link to="/themes" className="hover:text-primary">Themes</Link></li>
              <li><Link to="/tributes" className="hover:text-primary">Tributes</Link></li>
              <li><Link to="/legacy" className="hover:text-primary">Legacy & Service</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              External
            </h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a className="hover:text-primary" target="_blank" rel="noreferrer"
                  href="https://scholar.google.com/citations?user=LBwAuEUAAAAJ&hl=en">
                  Google Scholar Profile
                </a>
              </li>
              <li>
                <a className="hover:text-primary" target="_blank" rel="noreferrer"
                  href="https://thenationonlineng.net/author/niyi-akinnaso/">
                  The Nation — Full Archive
                </a>
              </li>
              <li>
                <a className="hover:text-primary" target="_blank" rel="noreferrer"
                  href="https://fulbrightscholars.org/grantee/f-akinnaso">
                  Fulbright Scholar Record
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-border/60 pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} F. Niyi Akinnaso Legacy Archive. All writings remain the
          property of their respective publishers.
        </div>
      </div>
    </footer>
  );
}
