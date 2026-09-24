-- ============================================
-- Table: cms_testimonials
-- Stocke les témoignages clients
-- ============================================
CREATE TABLE IF NOT EXISTS cms_testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  quote TEXT NOT NULL,
  destination VARCHAR(255),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  source VARCHAR(50) DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_testimonials_active ON cms_testimonials(is_active, display_order);

ALTER TABLE cms_testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active testimonials"
  ON cms_testimonials FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage testimonials"
  ON cms_testimonials FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- Table: cms_checklist_templates
-- Templates de checklists pour l'organisateur
-- ============================================
CREATE TABLE IF NOT EXISTS cms_checklist_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key VARCHAR(100) NOT NULL UNIQUE,
  template_name VARCHAR(255) NOT NULL,
  description TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_checklist_active ON cms_checklist_templates(is_active, template_key);

ALTER TABLE cms_checklist_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read checklist templates"
  ON cms_checklist_templates FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage checklists"
  ON cms_checklist_templates FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- Seed: témoignages par défaut
-- ============================================
INSERT INTO cms_testimonials (name, location, quote, destination, rating, display_order, source) VALUES
  ('Sophie & Marc', 'Lyon', 'On a reçu un carnet de route absolument incredible. Chaque adresse était parfaite, et les conseils pour éviter les pièges à touristes nous ont économisé tellement de temps.', 'Madère', 5, 1, 'manual'),
  ('Claire', 'Bruxelles', 'La qualité du research est impresionante. On a découvert des endroits qu on n aurait jamais trouvés seuls, et le ton du carnet était vraiment personnelle.', 'Roumanie', 5, 2, 'manual'),
  ('Thomas & Julie', 'Paris', 'Premiere fois qu on utilise un service pareil et on est converts. Le carnet était mieux que ce qu on espérait, et la réactivité quand on a demandé des adjustments était parfaite.', 'Monténégro', 5, 3, 'manual'),
  ('Marie', 'Genève', 'Le plus beau voyage de notre vie, en partie grace à Heldonica. Les recommendations étaient toujours justes, jamais déçues.', 'Sicile', 5, 4, 'google'),
  ('Jean-Luc', 'Bordeaux', 'Service exception. Le carnet de route était détaillé, pratique, et surtout — les conseils étaient vraiment sur le terrain, pas generiques.', 'Madère', 5, 5, 'manual')
ON CONFLICT DO NOTHING;

-- ============================================
-- Seed: templates checklist par défaut
-- ============================================
INSERT INTO cms_checklist_templates (template_key, template_name, description, items) VALUES
  ('citybreak', 'City Break', 'Checklist pour weekend ville', '[{"id":"1","text":"Passeport / CNI","category":"documents"},{"id":"2","text":"Billets train/avion","category":"documents"},{"id":"3","text":"Réservation hôtel","category":"réservations"},{"id":"4","text":"Plan du quartier","category":"divers"},{"id":"5","text":"Tenues légères","category":"équipement"},{"id":"6","text":"Chaussures marche","category":"équipement"},{"id":"7","text":"Appareil photo","category":"équipement"}]'),
  ('randonnee', 'Randonnée', 'Pour les trips nature', '[{"id":"1","text":"Validité passeport","category":"documents"},{"id":"2","text":"Assurance montagne","category":"santé"},{"id":"3","text":"Chaussures rando","category":"équipement"},{"id":"4","text":"Sac à dos","category":"équipement"},{"id":"5","text":"Vêtements pluie","category":"équipement"},{"id":"6","text":"Trousse secours","category":"santé"},{"id":"7","text":"Bouteille eau","category":"équipement"},{"id":"8","text":"Carte IGN","category":"équipement"}]'),
  ('roadtrip', 'Road Trip', 'Pour les grands trips', '[{"id":"1","text":"Permis conduire","category":"documents"},{"id":"2","text":"Location véhicule","category":"réservations"},{"id":"3","text":"Assurance RC","category":"santé"},{"id":"4","text":"Trousse secours","category":"santé"},{"id":"5","text":"Kit dépannage","category":"équipement"},{"id":"6","text":"GPS offline","category":"équipement"},{"id":"7","text":"Snacks route","category":"divers"}]'),
  ('default', 'Voyage Standard', 'Checklist universelle', '[{"id":"1","text":"Passeport / CNI valide","category":"documents"},{"id":"2","text":"Billets avion/train","category":"documents"},{"id":"3","text":"Réservation hébergement","category":"réservations"},{"id":"4","text":"Assurance voyage","category":"santé"},{"id":"5","text":"Médicaments","category":"santé"},{"id":"6","text":"Vêtements adaptés","category":"équipement"},{"id":"7","text":"Chargeurs appareils","category":"équipement"},{"id":"8","text":"Appareil photo","category":"équipement"},{"id":"9","text":"Argent liquide","category":"divers"},{"id":"10","text":"Cartes bancaires","category":"divers"}]')
ON CONFLICT (template_key) DO NOTHING;