import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
  component: Overview,
});

function Overview() {
  const [stats, setStats] = useState({ articles: 0, tributesPending: 0, tributesApproved: 0, pubs: 0, subs: 0 });
  useEffect(() => {
    (async () => {
      const [a, tp, ta, p, s] = await Promise.all([
        supabase.from("articles").select("*", { count: "exact", head: true }),
        supabase.from("tributes").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("tributes").select("*", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("publications").select("*", { count: "exact", head: true }),
        supabase.from("subscribers").select("*", { count: "exact", head: true }),
      ]);
      setStats({
        articles: a.count || 0,
        tributesPending: tp.count || 0,
        tributesApproved: ta.count || 0,
        pubs: p.count || 0,
        subs: s.count || 0,
      });
    })();
  }, []);

  const cards = [
    { label: "Articles", value: stats.articles, to: "/admin/articles" as const },
    { label: "Tributes pending", value: stats.tributesPending, to: "/admin/tributes" as const, highlight: stats.tributesPending > 0 },
    { label: "Tributes approved", value: stats.tributesApproved, to: "/admin/tributes" as const },
    { label: "Publications", value: stats.pubs, to: "/admin/publications" as const },
    { label: "Subscribers", value: stats.subs, to: "/admin/subscribers" as const },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl">Overview</h1>
      <p className="mt-2 text-sm text-muted-foreground">Manage everything readers see across the legacy site.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.to}
            className={`glass rounded-2xl p-6 transition hover:bg-white/[0.06] ${c.highlight ? "border-primary/40" : ""}`}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{c.label}</p>
            <p className="mt-2 font-display text-4xl">{c.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
