import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { z } from "zod";

export const Route = createFileRoute("/tributes")({
  head: () => ({
    meta: [
      { title: "Tributes — F. Niyi Akinnaso" },
      { name: "description", content: "Memories, gratitude and reflections from students, colleagues, family and readers of F. Niyi Akinnaso." },
      { property: "og:title", content: "Tributes — F. Niyi Akinnaso" },
      { property: "og:description", content: "A growing wall of memories from those whose lives he touched." },
    ],
  }),
  component: TributesPage,
});

type Tribute = {
  id: string;
  name: string;
  relationship: string | null;
  location: string | null;
  message: string;
  created_at: string;
};

const Schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(254).optional().or(z.literal("")),
  relationship: z.string().trim().max(100).optional().or(z.literal("")),
  location: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().min(20, "Please share at least a sentence or two").max(2000),
});

function TributesPage() {
  const [tributes, setTributes] = useState<Tribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", relationship: "", location: "", message: "" });
  const [state, setState] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [msg, setMsg] = useState("");

  const load = async () => {
    const { data } = await supabase
      .from("tributes")
      .select("id, name, relationship, location, message, created_at")
      .order("created_at", { ascending: false });
    setTributes((data as Tribute[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Schema.safeParse(form);
    if (!parsed.success) {
      setState("err");
      setMsg(parsed.error.errors[0].message);
      return;
    }
    setState("loading");
    const { error } = await supabase.from("tributes").insert({
      name: parsed.data.name,
      email: parsed.data.email || null,
      relationship: parsed.data.relationship || null,
      location: parsed.data.location || null,
      message: parsed.data.message,
      status: "pending",
    });
    if (error) {
      setState("err");
      setMsg(error.message);
      return;
    }
    setState("ok");
    setMsg("Thank you. Your tribute will appear here once approved.");
    setForm({ name: "", email: "", relationship: "", location: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="bg-hero pt-36 pb-16">
        <div className="mx-auto max-w-3xl px-6">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Tributes</p>
          <h1 className="mt-4 font-display text-5xl leading-tight md:text-6xl">
            For those whose lives he <span className="text-gradient">touched.</span>
          </h1>
          <p className="mt-6 text-muted-foreground">
            Share a memory, a thank-you, or a story. With your permission it will be added
            here for family, friends, students and readers to see.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16">
        <form onSubmit={submit} className="glass rounded-2xl p-6 md:p-8">
          <h2 className="font-display text-2xl">Leave a tribute</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Name</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={100} required className="mt-1 bg-white/5 border-white/10" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Email (private)</label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={254} className="mt-1 bg-white/5 border-white/10" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Relationship</label>
              <Input value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })} placeholder="Student, colleague, reader…" maxLength={100} className="mt-1 bg-white/5 border-white/10" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Location</label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City, country" maxLength={120} className="mt-1 bg-white/5 border-white/10" />
            </div>
          </div>
          <div className="mt-4">
            <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Your tribute</label>
            <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={6} maxLength={2000} required className="mt-1 bg-white/5 border-white/10" />
            <p className="mt-1 text-xs text-muted-foreground">{form.message.length}/2000</p>
          </div>
          <Button type="submit" className="mt-6" disabled={state === "loading"}>
            {state === "loading" ? "Submitting…" : "Submit tribute"}
          </Button>
          {msg && <p className={`mt-3 text-sm ${state === "err" ? "text-destructive" : "text-primary"}`}>{msg}</p>}
        </form>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-24">
        <h2 className="font-display text-3xl">Recent tributes</h2>
        {loading ? (
          <p className="mt-6 text-muted-foreground">Loading…</p>
        ) : tributes.length === 0 ? (
          <p className="mt-6 text-muted-foreground">Be the first to leave a tribute.</p>
        ) : (
          <ul className="mt-8 space-y-6">
            {tributes.map((t) => (
              <li key={t.id} className="glass rounded-2xl p-6">
                <p className="whitespace-pre-line text-foreground/90">{t.message}</p>
                <p className="mt-4 text-sm text-muted-foreground">
                  — <span className="text-foreground">{t.name}</span>
                  {t.relationship && <>, {t.relationship}</>}
                  {t.location && <> · {t.location}</>}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
