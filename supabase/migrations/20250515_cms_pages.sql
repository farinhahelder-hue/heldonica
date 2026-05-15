CREATE TABLE IF NOT EXISTS cms_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text UNIQUE NOT NULL,
  label text,
  hero_image text,
  hero_video text,
  hero_title text,
  hero_subtitle text,
  hero_cta_label text,
  hero_cta_url text,
  section_data jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

INSERT INTO cms_pages (page_key, label)
VALUES
  ('homepage', 'Page d''accueil'),
  ('about', 'À propos'),
  ('destinations', 'Destinations'),
  ('travel-planning', 'Travel Planning')
ON CONFLICT (page_key) DO NOTHING;
