import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/publications")({
  component: AdminPublications,
});

type Pub = {
  id: string;
  title: string;
  authors: string;
  venue: string | null;
  year: number | null;
  citation_count: number | null;
  url: string | null;
  doi: string | null;
  abstract: string | null;
  hero_image: string | null;
  theme: string | null;
  sort_order: number;
  featured: boolean;
};

const blank = (): Pub => ({
  id: "",
  title: "",
  authors: "F. Niyi Akinnaso",
  venue: "",
  year: new Date().getFullYear(),
  citation_count: 0,
  url: "",
  doi: "",
  abstract: "",
  hero_image: "",
  theme: "",
  sort_order: 0,
  featured: false,
});

function AdminPublications() {
  const [items, setItems] = useState<Pub[]>([]);
  const [editing, setEditing] = useState<Pub | null>(null);
  const [msg, setMsg] = useState("");

  const load = async () => {
    const { data } = await supabase.from("publications").select("*").order("year", { ascending: false });
    setItems((data as Pub[]) || []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    const payload: any = { ...editing };
    delete payload.id;
    const { error } = editing.id
      ? await supabase.from("publications").update(payload).eq("id", editing.id)
      : await supabase.from("publications").insert(payload);
    if (error) { setMsg(error.message); return; }
    setEditing(null);
    setMsg("");
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this publication?")) return;
    await supabase.from("publications").delete().eq("id", id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Publications</h1>
        <Button onClick={() => setEditing(blank())}>+ Add publication</Button>
      </div>

      <ul className="mt-6 space-y-3">
        {items.length === 0 && <p className="text-muted-foreground">No publications yet — add the first one.</p>}
        {items.map((p) => (
          <li key={p.id} className="glass flex flex-wrap items-baseline justify-between gap-3 rounded-xl p-5">
            <div className="min-w-0 flex-1">
              <p className="font-display text-lg leading-snug">{p.title}</p>
              <p className="text-xs text-muted-foreground">
                {p.authors} {p.year && `· ${p.year}`} {p.venue && `· ${p.venue}`} {p.citation_count != null && `· ${p.citation_count} citations`}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditing(p)}>Edit</Button>
              <Button size="sm" variant="outline" onClick={() => remove(p.id)}>Delete</Button>
            </div>
          </li>
        ))}
      </ul>

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={() => setEditing(null)}>
          <div className="glass max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-2xl">{editing.id ? "Edit" : "Add"} publication</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Title" full>
                <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              </Field>
              <Field label="Authors">
                <Input value={editing.authors} onChange={(e) => setEditing({ ...editing, authors: e.target.value })} />
              </Field>
              <Field label="Venue (journal/book)">
                <Input value={editing.venue || ""} onChange={(e) => setEditing({ ...editing, venue: e.target.value })} />
              </Field>
              <Field label="Year">
                <Input type="number" value={editing.year ?? ""} onChange={(e) => setEditing({ ...editing, year: e.target.value ? Number(e.target.value) : null })} />
              </Field>
              <Field label="Citations">
                <Input type="number" value={editing.citation_count ?? 0} onChange={(e) => setEditing({ ...editing, citation_count: Number(e.target.value) })} />
              </Field>
              <Field label="URL">
                <Input value={editing.url || ""} onChange={(e) => setEditing({ ...editing, url: e.target.value })} />
              </Field>
              <Field label="DOI">
                <Input value={editing.doi || ""} onChange={(e) => setEditing({ ...editing, doi: e.target.value })} />
              </Field>
              <Field label="Abstract" full>
                <Textarea rows={4} value={editing.abstract || ""} onChange={(e) => setEditing({ ...editing, abstract: e.target.value })} />
              </Field>
              <Field label="Sort order">
                <Input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} />
              </Field>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} />
                Featured
              </label>
            </div>
            {msg && <p className="mt-4 text-sm text-destructive">{msg}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={save}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</label>
      <div className="mt-1 [&_input]:bg-white/5 [&_input]:border-white/10 [&_textarea]:bg-white/5 [&_textarea]:border-white/10">{children}</div>
    </div>
  );
}
