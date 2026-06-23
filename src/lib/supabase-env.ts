import {
  SUPABASE_PUBLISHABLE_KEY as DEFAULT_KEY,
  SUPABASE_PROJECT_ID,
  SUPABASE_URL as DEFAULT_URL,
} from "@/lib/supabase-config";

function envTargetsAkinnasoProject(url: string | undefined) {
  return Boolean(url?.includes(SUPABASE_PROJECT_ID));
}

function readEnvUrl(): string | undefined {
  const viteUrl =
    typeof import.meta !== "undefined" ? import.meta.env?.VITE_SUPABASE_URL : undefined;
  return viteUrl || process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
}

function readEnvKey(): string | undefined {
  const viteKey =
    typeof import.meta !== "undefined"
      ? import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY
      : undefined;
  return (
    viteKey ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  );
}

/** Resolve public Supabase URL/key for browser and server (env overrides when correct). */
export function getSupabasePublicEnv() {
  const envUrl = readEnvUrl();
  if (envTargetsAkinnasoProject(envUrl)) {
    return {
      url: envUrl!,
      key: readEnvKey() || DEFAULT_KEY,
    };
  }
  return { url: DEFAULT_URL, key: DEFAULT_KEY };
}

export function requireSupabasePublicEnv() {
  return getSupabasePublicEnv();
}
