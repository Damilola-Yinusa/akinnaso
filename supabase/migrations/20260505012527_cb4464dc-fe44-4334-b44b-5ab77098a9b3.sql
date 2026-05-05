
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL DEFAULT 'thenation',
  source_url TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  published_at TIMESTAMPTZ,
  excerpt TEXT,
  content TEXT,
  html TEXT,
  hero_image TEXT,
  tags TEXT[] DEFAULT '{}',
  word_count INTEGER,
  scraped_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_articles_published_at ON public.articles (published_at DESC NULLS LAST);
CREATE INDEX idx_articles_source ON public.articles (source);
CREATE INDEX idx_articles_tags ON public.articles USING GIN (tags);
CREATE INDEX idx_articles_title_trgm ON public.articles USING GIN (title gin_trgm_ops);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Articles are publicly readable"
  ON public.articles FOR SELECT
  USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
