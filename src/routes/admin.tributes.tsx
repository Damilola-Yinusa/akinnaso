import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/tributes")({
  component: AdminTributes,
});

type Tribute = {
  id: string;
  name: string;
  email: string | null;
  relationship: string | null;
  location: string | null;
  message: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

function AdminTributes() {
  const [tributes, setTributes] = useState<Tribute[]>([]);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");

  const load = async () => {
    let q = supabase.from("tributes").select("*").order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter);
    const { data } = await q;
    setTributes((data as Tribute[]) || []);
  };

  useEffect(() => { load(); }, [filter]);

  const setStatus = async (id: string, status: Tribute["status"]) => {
    await supabase.from("tributes").update({ status, approved_at: status === "approved" ? new Date().toISOString() : null }).eq("id", id);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this tribute?")) return;
    await supabase.from("tributes").delete().eq("id", id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl">Tributes</h1>
        <div className="flex gap-1">
          {(["pending", "approved", "rejected", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 text-sm capitalize ${filter === f ? "bg-primary text-primary-foreground" : "glass hover:bg-white/10"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <ul className="mt-6 space-y-4">
        {tributes.length === 0 && <p className="text-muted-foreground">No tributes.</p>}
        {tributes.map((t) => (
          <li key={t.id} className="glass rounded-2xl p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <p className="font-display text-lg">{t.name}{t.relationship && <span className="ml-2 text-sm text-muted-foreground">· {t.relationship}</span>}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(t.created_at).toLocaleString()}
                  {t.email && <span> · {t.email}</span>}
                  {t.location && <span> · {t.location}</span>}
                </p>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs uppercase tracking-[0.2em] ${
                t.status === "approved" ? "bg-emerald-500/20 text-emerald-300" :
                t.status === "rejected" ? "bg-destructive/20 text-destructive" :
                "bg-amber-500/20 text-amber-300"
              }`}>{t.status}</span>
            </div>
            <p className="mt-4 whitespace-pre-line text-sm text-foreground/90">{t.message}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {t.status !== "approved" && <Button size="sm" onClick={() => setStatus(t.id, "approved")}>Approve</Button>}
              {t.status !== "rejected" && <Button size="sm" variant="outline" onClick={() => setStatus(t.id, "rejected")}>Reject</Button>}
              {t.status !== "pending" && <Button size="sm" variant="outline" onClick={() => setStatus(t.id, "pending")}>Re-queue</Button>}
              <Button size="sm" variant="outline" onClick={() => remove(t.id)}>Delete</Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
