-- Seed data for CMS tables: cms_seasons, cms_home_destinations, cms_blog_categories
-- This populates the new CMS tables with initial content

-- =============================================================================
-- CMS BLOG CATEGORIES SEED
-- =============================================================================

INSERT INTO cms_blog_categories (key, label, description, display_order, is_active)
VALUES 
  ('carnets-voyage', 'Carnets Voyage', 'Récits et carnets de route détaillés', 1, true),
  ('decouvertes-locales', 'Découvertes Locales', 'Lieux et adresses dénichées sur le terrain', 2, true),
  ('guides-pratiques', 'Guides Pratiques', 'Conseils et guides concrets pour voyager malin', 3, true)
ON CONFLICT (key) DO NOTHING;

-- =============================================================================
-- CMS HOME DESTINATIONS SEED
-- =============================================================================

INSERT INTO cms_home_destinations (destination_slug, display_order, is_featured)
VALUES
  ('madere', 1, true),
  ('roumanie', 2, true),
  ('montenegro', 3, true),
  ('grece', 4, true)
ON CONFLICT (destination_slug) DO NOTHING;

-- =============================================================================
-- CMS SEASONS SEED - MADEIRA
-- =============================================================================

INSERT INTO cms_seasons (destination_key, name, emoji, months, weather, crowd, price, description, display_order)
VALUES
  ('madere', 'Printemps', '🌸', '["Mars", "Avril", "Mai"]'::jsonb, 
   '16-22°C, fleurs, végétation vive', 'low', 'medium',
   'La période reine pour Madère. Floraisons, randos, prix encore modérés avant la haute saison.', 1),
  ('madere', 'Été', '☀️', '["Juin", "Juillet", "Août"]'::jsonb,
   '22-28°C, mer chaude, soleil', 'high', 'high',
   'Pic d''affluence et prix élevés. Parfait pour la plage et les activités nautiques. Réservez longtemps à l''avance.', 2),
  ('madere', 'Automne', '🍂', '["Septembre", "Octobre", "Novembre"]'::jsonb,
   '18-24°C, fin de l''été indien', 'medium', 'medium',
   'Excellent compromis : chaleur encore présente, moins de monde, prix en baisse. Notre recommandation pour un premier voyage.', 3),
  ('madere', 'Hiver', '🌧️', '["Décembre", "Janvier", "Février"]'::jsonb,
   '14-20°C, plus humide, brumeux', 'low', 'low',
   'Version contemplative de Madère. Moins de randos (boue), mais ambiance unique et prix cassés.', 4);

-- =============================================================================
-- CMS SEASONS SEED - ROUMANIE
-- =============================================================================

INSERT INTO cms_seasons (destination_key, name, emoji, months, weather, crowd, price, description, display_order)
VALUES
  ('roumanie', 'Printemps', '🌿', '["Avril", "Mai", "Juin"]'::jsonb,
   '12-22°C, Transylvanie en fleurs', 'medium', 'low',
   'Bucovina accessible, champs de fleurs sauvages, températures agréables pour explorer. Prix encore doux.', 1),
  ('roumanie', 'Été', '☀️', '["Juillet", "Août"]'::jsonb,
   '20-30°C, festivals, chaleur', 'high', 'medium',
   'Festivals暑热暑热暑热暑热暑热暑热暑热暑热暑热暑热暑热暑热暑热暑热暑热暑热暑热暑热暑热暑热暑热暑热. Attention à la chaleur à Bucarest.', 2),
  ('roumanie', 'Automne', '🍂', '["Septembre", "Octobre", '||']::jsonb || '["Novembre"]'::jsonb,
   '8-18°C, feuilles colorées, vendanges', 'low', 'low',
   'La Transylvanie en couleurs est un cauchemar photographique. Vendanges dans les vignobles, calme idéal.', 3),
  ('roumanie', 'Hiver', '❄️', '["Décembre", "Janvier", "Février", "Mars"]'::jsonb,
   '-5 à 5°C, neige, marchés de Noël', 'medium', 'low',
   'Marchés de Noël féériques, neige sur les châteaux, chaleur des auberges. La Transylvanie enneigée, c''est magique.', 4);

-- =============================================================================
-- CMS SEASONS SEED - MONTENEGRO  
-- =============================================================================

INSERT INTO cms_seasons (destination_key, name, emoji, months, weather, crowd, price, description, display_order)
VALUES
  ('montenegro', 'Printemps', '🌷', '["Avril", "Mai", "Juin"]'::jsonb,
   '18-26°C, idéal pour rando', 'low', 'low',
   'Températures agréables, nature en pleine croissance, sites historiques moins bondés. La meilleure période pour explorer.', 1),
  ('montenegro', 'Été', '🏖️', '["Juillet", "Août"]'::jsonb,
   '25-32°C, plage, festivals', 'high', 'high',
   'Haute saison avec affluence maximale sur la côte. Ambiance festive, plages, mais réserver tout à l''avance.', 2),
  ('montenegro', 'Automne', '🍁', '["Septembre", "Octobre"]'::jsonb,
   '18-24°C, vendanges, couleurs', 'medium', 'medium',
   'Notre coup de cœur : mer encore chaude, villages viticoles en couleurs, calme revenu. Parfait pour le slow travel.', 3),
  ('montenegro', 'Hiver', '❄️', '["Novembre", "Décembre", "Janvier", "Février", "Mars"]'::jsonb,
   '5-12°C, neige dans les montagnes', 'low', 'low',
   'Saison basse pour le tourisme晒日光浴 mais idéale pour le lac de Skadar, les Balkans intérieurs et les randos en montagne.', 4);

-- =============================================================================
-- CMS FAQ SEED FOR NOS-SERVICES PAGE
-- =============================================================================

INSERT INTO cms_editable_zones (page, zone, value, type, updated_at)
VALUES
  ('nos-services', 'faq_1_question', 'Comment fonctionne le Travel Planning sur mesure ?', 'text', NOW()),
  ('nos-services', 'faq_1_answer', 'Vous nous décrivez votre voyage idéal via notre formulaire ou lors d''un échange. On analyse vos envies, contraintes et budget, puis on vous prépare un carnet de route PDF complet avec itinéraire, hébergements, restaurants et conseils pratiques. Le tout en 7-10 jours.', 'textarea', NOW()),
  ('nos-services', 'faq_2_question', 'Combien coûte un voyage sur mesure avec Heldonica ?', 'text', NOW()),
  ('nos-services', 'faq_2_answer', 'Le tarif du Travel Planning commence à 149€ pour un voyage de base. Le prix varie selon la complexité de l''itinéraire, la durée du voyage et le niveau de personnalisation. Chaque projet est unique, on vous donne un chiffrage précis après notre échange découverte.', 'textarea', NOW()),
  ('nos-services', 'faq_3_question', 'Heldonica accompagne aussi les voyageurs en solo ?', 'text', NOW()),
  ('nos-services', 'faq_3_answer', 'Absolument. Le Travel Planning fonctionne pour tous les types de voyageurs : couples, solos, familles, groupes d''amis. Pour les voyageurs solo, on peut aussi te mettre en contact avec d''autres voyageurs ou te guider vers des expériences adaptées.', 'textarea', NOW())
ON CONFLICT (page, zone) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();
