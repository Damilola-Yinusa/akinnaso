/** Resolve Supabase URL/key on server (Vercel may only define VITE_* or non-VITE names). */
export function getSupabasePublicEnv() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  return { url, key };
}

export function requireSupabasePublicEnv() {
  const { url, key } = getSupabasePublicEnv();
  if (!url || !key) {
    throw new Error(
      "Missing Supabase environment variables. Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY) on Vercel.",
    );
  }
  return { url, key };
}
