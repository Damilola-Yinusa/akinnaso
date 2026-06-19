import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

function publicSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error("Missing Supabase environment variables.");
  }
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

const TributeSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254).optional().or(z.literal("")),
  relationship: z.string().trim().max(100).optional().or(z.literal("")),
  location: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().min(20).max(2000),
});

const SubscribeSchema = z.object({
  email: z.string().trim().email().max(254),
  name: z.string().trim().max(100).optional().or(z.literal("")),
});

export const submitTribute = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => TributeSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = publicSupabase();
    const { error } = await supabase.from("tributes").insert({
      name: data.name,
      email: data.email || null,
      relationship: data.relationship || null,
      location: data.location || null,
      message: data.message,
      status: "pending",
    });
    if (error) {
      throw new Error(error.message);
    }
    return { ok: true as const };
  });

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => SubscribeSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = publicSupabase();
    const { error } = await supabase.from("subscribers").insert({
      email: data.email.trim().toLowerCase(),
      name: data.name?.trim() || null,
      confirmed: false,
    });
    if (error) {
      if (error.code === "23505") {
        return { ok: true as const, alreadySubscribed: true as const };
      }
      throw new Error(error.message);
    }
    return { ok: true as const, alreadySubscribed: false as const };
  });
