
ALTER TABLE public.articles
ADD COLUMN IF NOT EXISTS search_vector tsvector
GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(excerpt, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(content, '')), 'C')
) STORED;

CREATE INDEX IF NOT EXISTS idx_articles_search_vector
  ON public.articles USING GIN (search_vector);

CREATE OR REPLACE FUNCTION public.search_articles(q text, max_results int DEFAULT 6)
RETURNS TABLE (
  id uuid,
  slug text,
  title text,
  source text,
  source_url text,
  published_at timestamptz,
  snippet text,
  rank real
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH query AS (
    SELECT websearch_to_tsquery('english', q) AS tsq
  )
  SELECT
    a.id,
    a.slug,
    a.title,
    a.source,
    a.source_url,
    a.published_at,
    ts_headline(
      'english',
      coalesce(a.content, a.excerpt, ''),
      query.tsq,
      'MaxWords=60, MinWords=25, ShortWord=3, MaxFragments=2, FragmentDelimiter=" … "'
    ) AS snippet,
    ts_rank(a.search_vector, query.tsq) AS rank
  FROM public.articles a, query
  WHERE a.search_vector @@ query.tsq
  ORDER BY rank DESC, a.published_at DESC NULLS LAST
  LIMIT greatest(1, least(max_results, 12));
$$;

GRANT EXECUTE ON FUNCTION public.search_articles(text, int) TO anon, authenticated;
