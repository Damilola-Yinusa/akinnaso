import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const origin = `${url.protocol}//${url.host}`;
        const staticPaths = ["/", "/about", "/scholarship", "/writings", "/themes", "/legacy", "/tributes"];

        const { data: arts } = await supabaseAdmin
          .from("articles")
          .select("slug, updated_at, published_at")
          .order("published_at", { ascending: false });
        const { data: themes } = await supabaseAdmin.from("themes").select("slug, updated_at");

        const urls: { loc: string; lastmod?: string }[] = [
          ...staticPaths.map((p) => ({ loc: `${origin}${p}` })),
          ...((arts as any[]) || []).map((a) => ({
            loc: `${origin}/writings/${a.slug}`,
            lastmod: (a.updated_at || a.published_at || "").slice(0, 10) || undefined,
          })),
          ...((themes as any[]) || []).map((t) => ({
            loc: `${origin}/themes/${t.slug}`,
            lastmod: (t.updated_at || "").slice(0, 10) || undefined,
          })),
        ];

        const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
          .map(
            (u) =>
              `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}</url>`
          )
          .join("\n")}\n</urlset>`;

        return new Response(body, {
          status: 200,
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
