import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/subscribers")({
  component: AdminSubscribers,
});

type Sub = {
  id: string;
  email: string;
  name: string | null;
  confirmed: boolean;
  unsubscribed_at: string | null;
  created_at: string;
};

function AdminSubscribers() {
  const [items, setItems] = useState<Sub[]>([]);

  const load = async () => {
    const { data } = await supabase.from("subscribers").select("*").order("created_at", { ascending: false });
    setItems((data as Sub[]) || []);
  };
  useEffect(() => { load(); }, []);

  const exportCsv = () => {
    const rows = [["email", "name", "confirmed", "unsubscribed_at", "created_at"], ...items.map((s) => [s.email, s.name || "", String(s.confirmed), s.unsubscribed_at || "", s.created_at])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url; a.download = "subscribers.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Subscribers <span className="text-base text-muted-foreground">({items.length})</span></h1>
        <Button variant="outline" onClick={exportCsv}>Export CSV</Button>
      </div>
      <div className="mt-6 overflow-hidden rounded-2xl border border-white/5">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.03] text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Subscribed</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-3">{s.email}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.name || "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {s.unsubscribed_at ? "unsubscribed" : s.confirmed ? "confirmed" : "pending"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
