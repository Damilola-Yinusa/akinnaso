import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import type { SupabaseClient } from "@supabase/supabase-js";

type TributeStatus = Database["public"]["Enums"]["tribute_status"];

async function assertAdmin(supabase: SupabaseClient<Database>, userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error || !data) {
    throw new Response("Forbidden: admin access required", { status: 403 });
  }
}

export const checkAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    if (error) return { isAdmin: false };
    const isAdmin = (data || []).some((r) => r.role === "admin");
    return { isAdmin, userId };
  });

export const listAdminTributes = createServerFn({ method: "GET" })
  .inputValidator((data: { filter?: TributeStatus | "all" }) => data ?? { filter: "pending" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const filter = data.filter ?? "pending";
    let q = supabase.from("tributes").select("*").order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const setAdminTributeStatus = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string; status: TributeStatus }) => data)
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { id, status } = data;
    const { error } = await supabase
      .from("tributes")
      .update({
        status,
        approved_at: status === "approved" ? new Date().toISOString() : null,
      })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const deleteAdminTribute = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { id } = data;
    const { error } = await supabase.from("tributes").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const listAdminSubscribers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { data: rows, error } = await supabase
      .from("subscribers")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });
