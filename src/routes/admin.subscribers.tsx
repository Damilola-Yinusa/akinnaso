import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { adminAuthHeaders } from "@/lib/server-auth";
import { listAdminSubscribers } from "@/server/admin.functions";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const headers = await adminAuthHeaders();
      const rows = await listAdminSubscribers({ headers });
      setItems(rows as Sub[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load subscribers.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const exportCsv = () => {
    const rows = [
      ["email", "name", "confirmed", "unsubscribed_at", "created_at"],
      ...items.map((s) => [s.email, s.name || "", String(s.confirmed), s.unsubscribed_at || "", s.created_at]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">
          Subscribers <span className="text-base text-muted-foreground">({items.length})</span>
        </h1>
        <Button variant="outline" onClick={exportCsv} disabled={items.length === 0}>
          Export CSV
        </Button>
      </div>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

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
            {loading && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-muted-foreground">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-muted-foreground">
                  No subscribers yet.
                </td>
              </tr>
            )}
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
