import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Admin" }, { name: "robots", content: "noindex" }] }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: "/admin" });
  },
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setErr(error.message);
      return;
    }
    nav({ to: "/admin" });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link to="/" className="text-sm text-muted-foreground hover:text-primary">← Back to site</Link>
        <h1 className="mt-6 font-display text-3xl">Admin sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">For Professor Akinnaso, family, and approved editors.</p>
        <form onSubmit={submit} className="mt-8 space-y-4 glass rounded-2xl p-6">
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Email</label>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 bg-white/5 border-white/10" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Password</label>
            <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 bg-white/5 border-white/10" />
          </div>
          {err && <p className="text-sm text-destructive">{err}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
