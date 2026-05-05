import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/articles")({
  component: AdminArticles,
});

type Article = {
  id: string;
  slug: string;
  title: string;
  source: string;
  published_at: string | null;
  hero_image: string | null;
  summary: string | null;
  excerpt: string | null;
  featured: boolean;
};

function AdminArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Article | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const load = async () => {
    const { data } = await supabase
      .from("articles")
      .select("id, slug, title, source, published_at, hero_image, summary, excerpt, featured")
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(500);
    setArticles((data as Article[]) || []);
  };

  useEffect(() => { load(); }, []);

  const filtered = articles.filter((a) => !q || a.title.toLowerCase().includes(q.toLowerCase()));

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    setMsg("");
    const { error } = await supabase
      .from("articles")
      .update({
        title: editing.title,
        summary: editing.summary,
        excerpt: editing.excerpt,
        hero_image: editing.hero_image,
        featured: editing.featured,
      })
      .eq("id", editing.id);
    setSaving(false);
    if (error) {
      setMsg(error.message);
      return;
    }
    setEditing(null);
    load();
  };

  const uploadImage = async (file: File) => {
    if (!editing) return;
    const ext = file.name.split(".").pop();
    const path = `articles/${editing.id}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("media").upload(path, file, { upsert: true });
    if (error) { setMsg(error.message); return; }
    const { data: pub } = supabase.storage.from("media").getPublicUrl(path);
    setEditing({ ...editing, hero_image: pub.publicUrl });
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl">Articles</h1>
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search…"
          className="max-w-xs bg-white/5 border-white/10"
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/5">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.03] text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Featured</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.slice(0, 200).map((a) => (
              <tr key={a.id} className="hover:bg-white/[0.02]">
                <td className="px-4 py-3 max-w-md truncate">{a.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{a.source}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {a.published_at ? new Date(a.published_at).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-3">{a.featured ? "★" : ""}</td>
                <td className="px-4 py-3 text-right">
                  <Link to="/writings/$slug" params={{ slug: a.slug }} target="_blank" className="text-primary mr-3">View</Link>
                  <button onClick={() => setEditing(a)} className="text-primary">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Showing {Math.min(200, filtered.length)} of {filtered.length}.
      </p>

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={() => setEditing(null)}>
          <div className="glass max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-2xl">Edit article</h2>
            <div className="mt-5 space-y-4">
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Title</label>
                <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="mt-1 bg-white/5 border-white/10" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Summary (overrides excerpt on the article page)</label>
                <Textarea rows={3} value={editing.summary || ""} onChange={(e) => setEditing({ ...editing, summary: e.target.value })} className="mt-1 bg-white/5 border-white/10" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Excerpt (used on cards)</label>
                <Textarea rows={2} value={editing.excerpt || ""} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} className="mt-1 bg-white/5 border-white/10" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Hero image</label>
                {editing.hero_image && <img src={editing.hero_image} alt="" className="mt-2 h-32 rounded-md object-cover" />}
                <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} className="mt-2 bg-white/5 border-white/10" />
                <Input
                  value={editing.hero_image || ""}
                  onChange={(e) => setEditing({ ...editing, hero_image: e.target.value })}
                  placeholder="…or paste an image URL"
                  className="mt-2 bg-white/5 border-white/10"
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} />
                Feature this article
              </label>
              {msg && <p className="text-sm text-destructive">{msg}</p>}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
