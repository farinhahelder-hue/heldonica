-- Creation de la table pour les plans de tarifs
CREATE TABLE IF NOT EXISTS cms_pricing_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  price TEXT NOT NULL,
  description TEXT,
  features TEXT[] DEFAULT '{}',
  is_popular BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS (Row Level Security)
ALTER TABLE cms_pricing_plans ENABLE ROW LEVEL SECURITY;

-- Politique de lecture publique
CREATE POLICY "Public read pricing" ON cms_pricing_plans 
  FOR SELECT USING (active = true);

-- Politique d'administration complete
CREATE POLICY "Admin all pricing" ON cms_pricing_plans 
  USING (auth.role() = 'service_role');

-- Insertion des 3 plans de tarifs de reference par defaut
INSERT INTO cms_pricing_plans (slug, name, price, description, features, is_popular, display_order, active)
VALUES
  (
    'essentielle',
    'Essentielle',
    '250€',
    'Pour ceux qui veulent l''itinéraire clé en main',
    ARRAY[
      'Itinéraire jour par jour personnalisé',
      'Carnet de route PDF complet',
      '1h de brief en visio pour cerner tes envies',
      'Liens directs hébergements & restaurants'
    ],
    false,
    1,
    true
  ),
  (
    'complete',
    'Complète',
    '450€',
    'Le plus complet — on s''occupes de tout',
    ARRAY[
      'Tout l''Essentiel',
      'Réservations hébergements incluses',
      'Accès au carnet d''adresses privé Heldonica',
      'Suivi WhatsApp pendant ton voyage'
    ],
    true,
    2,
    true
  ),
  (
    'sur-mesure',
    'Sur-Mesure',
    'Sur devis',
    'Voyages complexes, 2+ semaines, destinations multiples',
    ARRAY[
      'Tout la Complète',
      'Itinéraires multi-destinations',
      'Événements spéciaux (lune de miel, anniversaire)',
      'Conciergerie dédiée 24/7'
    ],
    false,
    3,
    true
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  is_popular = EXCLUDED.is_popular,
  display_order = EXCLUDED.display_order,
  active = EXCLUDED.active;
