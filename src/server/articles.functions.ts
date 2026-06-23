import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabasePublicEnv } from "@/lib/supabase-env";

function publicSupabase() {
  const { url, key } = requireSupabasePublicEnv();
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

const articleListCols =
  "id, slug, title, excerpt, published_at, hero_image, source_url, source, word_count, theme" as const;

const articleDetailCols =
  "id, slug, title, content, excerpt, summary, published_at, hero_image, source, source_url, word_count, theme" as const;

export const listPublicArticles = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicSupabase()
    .from("articles")
    .select(articleListCols)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(1000);
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getPublicArticleBySlug = createServerFn({ method: "GET" })
  .inputValidator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const { data, error } = await publicSupabase()
      .from("articles")
      .select(articleDetailCols)
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

export const listPublicThemes = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicSupabase()
    .from("themes")
    .select("*")
    .order("sort_order");
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getPublicThemeArticles = createServerFn({ method: "GET" })
  .inputValidator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const supabase = publicSupabase();
    const [{ data: theme, error: themeErr }, { data: articles, error: articlesErr }] = await Promise.all([
      supabase.from("themes").select("*").eq("slug", slug).maybeSingle(),
      supabase
        .from("articles")
        .select(articleListCols)
        .eq("theme", slug)
        .order("published_at", { ascending: false, nullsFirst: false })
        .limit(500),
    ]);
    if (themeErr) throw new Error(themeErr.message);
    if (articlesErr) throw new Error(articlesErr.message);
    return { theme, articles: articles ?? [] };
  });
