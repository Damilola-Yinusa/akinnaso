import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/robots.txt")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const origin = `${url.protocol}//${url.host}`;
        const body = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /login\n\nSitemap: ${origin}/api/sitemap.xml\n`;
        return new Response(body, {
          status: 200,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      },
    },
  },
});
