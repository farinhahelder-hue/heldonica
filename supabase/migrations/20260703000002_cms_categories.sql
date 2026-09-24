-- Table pour le gestionnaire de catégories
CREATE TABLE IF NOT EXISTS cms_blog_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  db_value TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insertion des catégories initiales
INSERT INTO cms_blog_categories (slug, label, db_value, display_order) VALUES
  ('carnets', 'Carnets', 'Carnets Voyage', 1),
  ('pepites', 'Pépites locales', 'Découvertes Locales', 2),
  ('guides', 'Guides', 'Guides Pratiques', 3)
ON CONFLICT (slug) DO NOTHING;

-- Normaliser les catégories dans les articles existants en DB
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'articles') THEN
    UPDATE articles 
    SET category = 'Carnets Voyage' 
    WHERE category IN ('Carnets de voyage', 'Carnets de Voyage', 'carnets de voyage');
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cms_blog_posts') THEN
    UPDATE cms_blog_posts 
    SET category = 'Carnets Voyage' 
    WHERE category IN ('Carnets de voyage', 'Carnets de Voyage', 'carnets de voyage');
  END IF;
END $$;

-- RLS (Row Level Security)
ALTER TABLE cms_blog_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read categories" ON cms_blog_categories 
  FOR SELECT USING (true);

CREATE POLICY "Admin write categories" ON cms_blog_categories 
  FOR ALL USING (auth.role() = 'service_role');
