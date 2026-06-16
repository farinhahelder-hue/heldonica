-- Destination status system + seed 10 new destinations
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS status TEXT
  DEFAULT 'draft'
  CHECK (status IN ('draft', 'coming_soon', 'published', 'starred'));

ALTER TABLE destinations ADD COLUMN IF NOT EXISTS priority_score INTEGER DEFAULT 0;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS article_count INTEGER DEFAULT 0;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS continent TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS flag_emoji TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS hero_unsplash_url TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS teaser TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS coming_soon_date TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS travel_style TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS best_season TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS avg_budget_couple_week INTEGER;

-- Update existing destinations with statuses
UPDATE destinations SET status = 'published', priority_score = 100
WHERE slug IN ('roumanie', 'madere', 'montenegro');

UPDATE destinations SET status = 'published', priority_score = 80
WHERE slug IN ('lisbonne', 'paris', 'sardaigne', 'sicile', 'colombie', 'portugal', 'normandie', 'suisse', 'zurich');

UPDATE destinations SET continent = 'Europe' WHERE continent IS NULL;

-- Seed new destinations
INSERT INTO destinations (slug, title, excerpt, country, continent, region, flag_emoji, tagline, teaser, hero_unsplash_url, travel_style, best_season, avg_budget_couple_week, status, priority_score, published, category)
VALUES
  ('naples', 'Naples', 'L''Italie brute, vivante et authentique — loin des cartes postales', 'Italie', 'Europe', 'Méditerranée', '🇮🇹', 'L''Italie brute, vivante et authentique', 'Pizza napoletana, Spaccanapoli, chaos magnifique', 'https://images.unsplash.com/photo-1555992828-ca4dbe41d294?w=1200&h=630&fit=crop', 'slow-culture', 'avril-juin / sept-oct', 1100, 'coming_soon', 85, false, 'food'),
  ('iles-eoliennes', 'Îles Éoliennes', 'Vulcans actifs, eaux cristallines, dolce vita insulaire', 'Italie', 'Europe', 'Méditerranée', '🇮🇹', 'Vulcans actifs, eaux cristallines', 'Stromboli de nuit, plages de ponce de Lipari', 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=1200&h=630&fit=crop', 'slow-nature', 'juin-sept', 1400, 'draft', 60, false, 'nature'),
  ('malte', 'Malte', 'Croix des civilisations — chevaliers, baroque, bleu méditerranéen', 'Malte', 'Europe', 'Méditerranée', '🇲🇹', 'Croix des civilisations — chevaliers, baroque', 'La Valette dorée, Gozo sauvage, eaux turquoise de Comino', 'https://images.unsplash.com/photo-1555448248-2571daf6344b?w=1200&h=630&fit=crop', 'slow-culture', 'avril-juin / sept-oct', 1000, 'coming_soon', 78, false, 'culture'),
  ('espagne', 'Espagne', 'Du Pays Basque à l''Andalousie — l''Espagne loin des clichés', 'Espagne', 'Europe', 'Atlantique/Méditerranée', '🇪🇸', 'Du Pays Basque à l''Andalousie', 'Pintxos à San Sebastián, Sierra Nevada, villages blancs', 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=1200&h=630&fit=crop', 'slow-culture', 'avril-juin / sept-oct', 1100, 'coming_soon', 82, false, 'culture'),
  ('pologne', 'Pologne', 'Cracovie médiévale, Mazurie lacustre, histoire à fleur de peau', 'Pologne', 'Europe', 'Europe centrale', '🇵🇱', 'Cracovie médiévale, Mazurie lacustre', 'L''Europe centrale authentique et encore abordable', 'https://images.unsplash.com/photo-1529980308703-e74ed8b77b3f?w=1200&h=630&fit=crop', 'slow-culture', 'mai-sept', 800, 'coming_soon', 70, false, 'culture'),
  ('corse', 'Corse', 'L''île de beauté — maquis, calanques, villages perchés', 'France', 'Europe', 'Méditerranée', '🇫🇷', 'L''île de beauté — maquis, calanques', 'GR20, golfe de Porto, fromages de brebis au coucher du soleil', 'https://images.unsplash.com/photo-1533587955158-aee4dc11b0de?w=1200&h=630&fit=crop', 'slow-nature', 'mai-juin / sept', 1300, 'coming_soon', 76, false, 'nature'),
  ('bari', 'Bari & Pouilles', 'Trulli, burrata, côte adriatique — le sud italien qui surprend', 'Italie', 'Europe', 'Méditerranée', '🇮🇹', 'Trulli, burrata, côte adriatique', 'Alberobello, Ostuni, le marché aux orecchiette', 'https://images.unsplash.com/photo-1518715303843-586e350947d0?w=1200&h=630&fit=crop', 'slow-culture', 'mai-juin / sept-oct', 950, 'coming_soon', 72, false, 'food')
ON CONFLICT (slug) DO UPDATE SET
  status = EXCLUDED.status,
  continent = EXCLUDED.continent,
  flag_emoji = EXCLUDED.flag_emoji,
  teaser = EXCLUDED.teaser,
  hero_unsplash_url = EXCLUDED.hero_unsplash_url,
  priority_score = EXCLUDED.priority_score,
  travel_style = EXCLUDED.travel_style,
  best_season = EXCLUDED.best_season,
  avg_budget_couple_week = EXCLUDED.avg_budget_couple_week;

-- Public view for frontend
CREATE OR REPLACE VIEW destinations_public AS
SELECT slug, title, excerpt, country, continent, region, flag_emoji,
       tagline, teaser, hero_unsplash_url, featured_image, link,
       COALESCE(travel_style, category) AS travel_style,
       best_season, avg_budget_couple_week, status,
       priority_score, article_count, coming_soon_date,
       latitude, longitude, published
FROM destinations
WHERE published = true OR status IN ('coming_soon', 'starred')
ORDER BY priority_score DESC, title ASC;

-- Auto-star trigger: destination gets 'starred' when 3+ articles reference it
CREATE OR REPLACE FUNCTION update_destination_stars()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE destinations
  SET status = 'starred', priority_score = GREATEST(priority_score, 95)
  WHERE slug = NEW.destination
    AND (
      SELECT COUNT(*) FROM articles
      WHERE destination = NEW.destination AND published = true
    ) >= 3
    AND status IN ('published', 'draft');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_star_destination ON articles;
CREATE TRIGGER auto_star_destination
AFTER INSERT OR UPDATE ON articles
FOR EACH ROW EXECUTE FUNCTION update_destination_stars();
