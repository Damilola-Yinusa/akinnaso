
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS theme text,
  ADD COLUMN IF NOT EXISTS theme_confidence real;

CREATE INDEX IF NOT EXISTS articles_theme_idx ON public.articles(theme);

CREATE TABLE IF NOT EXISTS public.themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  blurb text NOT NULL,
  narrative text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Themes are publicly readable" ON public.themes;
CREATE POLICY "Themes are publicly readable"
  ON public.themes FOR SELECT
  USING (true);

CREATE TRIGGER themes_updated_at
  BEFORE UPDATE ON public.themes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.themes (slug, title, blurb, narrative, sort_order) VALUES
  ('democracy-governance', 'Democracy & Governance',
   'Restructuring, federalism, elections, and the long Nigerian search for a workable state.',
   'Across two decades of columns, Akinnaso returns again and again to one question: can Nigeria''s federation be made to work for ordinary citizens? These essays trace his arguments for restructuring, his critiques of executive overreach, and his careful, often impatient, reading of every election cycle.', 1),
  ('education-knowledge', 'Education & Knowledge',
   'Schools, universities, literacy, and the politics of who gets to learn.',
   'As an educator and anthropologist of literacy, Akinnaso treats education as the deepest infrastructure of any nation. These pieces move between policy critique, classroom realities, and the universities he has spent his life inside.', 2),
  ('language-culture', 'Language & Culture',
   'Mother tongues, multilingualism, and Yoruba intellectual life.',
   'Language is never neutral in Akinnaso''s writing. Whether arguing for the place of Nigerian languages in schooling or recovering Yoruba thought, he insists culture is the ground on which every other reform stands.', 3),
  ('religion-society', 'Religion & Society',
   'Faith, secularism, and the public square.',
   'These essays examine how religion shapes Nigerian public life — from the politics of pilgrimage to the rise of pentecostal power — and what a genuinely plural society would require of its believers.', 4),
  ('security-conflict', 'Security & Conflict',
   'Insurgency, banditry, policing, and the cost of insecurity.',
   'Akinnaso''s security writing refuses easy framing. He tracks Boko Haram, herder-farmer violence, and state response with a steady eye on the human toll and the institutional failures behind it.', 5),
  ('economy-development', 'Economy & Development',
   'Poverty, oil, infrastructure, and the unfinished work of development.',
   'Behind every policy debate, Akinnaso looks for the household: who pays, who benefits, and what kind of country these choices are quietly building.', 6),
  ('leadership-corruption', 'Leadership & Corruption',
   'Public ethics, accountability, and the persistent problem of bad leadership.',
   'A recurring motif: Nigeria''s problems are less of resources than of leadership. These essays profile leaders, dissect scandals, and argue for an ethic of public service the country still struggles to build.', 7),
  ('memory-biography', 'Memory & Biography',
   'Tributes, obituaries, and the lives that shaped a generation.',
   'Akinnaso writes the dead well. These remembrances of teachers, colleagues, and public figures double as a moral history of post-independence Nigeria.', 8),
  ('global-affairs', 'Global Affairs',
   'Africa in the world, diaspora, and lessons from elsewhere.',
   'When Akinnaso looks abroad, he is usually looking back at Nigeria — comparing, borrowing, warning. These essays place the country in a wider conversation about democracy, race, and development.', 9),
  ('other', 'Other Reflections',
   'Essays that resist easy thematic grouping.',
   'A miscellany of columns that range across the everyday — humor, personal reflection, and the small observations that keep a long writing life honest.', 99)
ON CONFLICT (slug) DO NOTHING;
