import { createFileRoute, Link, Outlet, redirect, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — F. Niyi Akinnaso" }, { name: "robots", content: "noindex" }] }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/login" });
  },
  component: AdminLayout,
});

function AdminLayout() {
  const nav = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      setEmail(u.user?.email || "");
      if (!u.user) {
        setIsAdmin(false);
        return;
      }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", u.user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!data);
    })();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    nav({ to: "/login" });
  };

  if (isAdmin === null) {
    return <div className="min-h-screen bg-background grid place-items-center text-muted-foreground">Loading…</div>;
  }
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background grid place-items-center px-6 text-center">
        <div>
          <h1 className="font-display text-3xl">Not authorized</h1>
          <p className="mt-3 text-muted-foreground">
            Your account ({email}) does not yet have admin access. Ask the site owner to grant the
            <code className="mx-1 rounded bg-white/5 px-1">admin</code> role to your user.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="outline" onClick={signOut}>Sign out</Button>
            <Link to="/" className="rounded-md border border-white/15 px-4 py-2 text-sm">← Home</Link>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { to: "/admin", label: "Overview" },
    { to: "/admin/articles", label: "Articles" },
    { to: "/admin/tributes", label: "Tributes" },
    { to: "/admin/publications", label: "Publications" },
    { to: "/admin/subscribers", label: "Subscribers" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-white/5 bg-background/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="font-display">← Site</Link>
            <span className="text-sm text-muted-foreground">Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-xs text-muted-foreground">{email}</span>
            <Button variant="outline" size="sm" onClick={signOut}>Sign out</Button>
          </div>
        </div>
        <nav className="mx-auto max-w-6xl px-6 pb-3 flex flex-wrap gap-1">
          {tabs.map((t) => {
            const active = t.to === "/admin" ? path === "/admin" : path.startsWith(t.to);
            return (
              <Link
                key={t.to}
                to={t.to}
                className={`rounded-full px-4 py-1.5 text-sm transition ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"}`}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}
