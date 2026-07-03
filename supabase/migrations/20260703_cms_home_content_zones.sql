-- CMS Home Content Zones: Add pillars, FAQ and other home page content zones
-- Extends cms_editable_zones for homepage components

-- Seed pillars content
INSERT INTO cms_editable_zones (page, zone_key, zone_type, value, is_active) VALUES
-- Pillars section
('home', 'pillar_1_title', 'text', "L'émerveillement", true),
('home', 'pillar_1_desc', 'textarea', 'Il se cache dans un marché de quartier, une ruelle oubliée, ou un café perdu en Provence. Partout où vous posez les yeux, il y a quelque chose à découvrir.', true),
('home', 'pillar_1_icon', 'text', '✨', true),
('home', 'pillar_2_title', 'text', 'Notre philosophie', true),
('home', 'pillar_2_desc', 'textarea', 'Nous ne voyageons pas pour cocher des cases. Nous voyageons pour ralentir et nous reconnecter. Bien vivre son temps, c''est voir chaque moment comme une micro-aventure.', true),
('home', 'pillar_2_icon', 'text', '🧭', true),
('home', 'pillar_3_title', 'text', 'Notre promesse', true),
('home', 'pillar_3_desc', 'textarea', 'Que vous partiez trois semaines en Islande ou flâniez en bas de chez vous, Heldonica vous accompagne pour planifier vos voyages avec âme.', true),
('home', 'pillar_3_icon', 'text', '💚', true),

-- Destinations section
('home', 'destinations_title', 'text', 'Nos Pépites', true),
('home', 'destinations_subtitle', 'text', '4 destinations phares pour l''aventure en couple', true),

-- Blog categories
('blog', 'blog_category_tous', 'text', 'Tous', true),
('blog', 'blog_category_carnets', 'text', 'Carnets Voyage', true),
('blog', 'blog_category_decouvertes', 'text', 'Découvertes Locales', true),
('blog', 'blog_category_guides', 'text', 'Guides Pratiques', true),
('blog', 'blog_category_coulisses', 'text', 'Coulisses de marque', true),

-- FAQ for nos-services page
('nos-services', 'faq_1_question', 'text', 'Comment fonctionne le Travel Planning sur mesure ?', true),
('nos-services', 'faq_1_answer', 'textarea', 'Vous nous décrivez votre voyage idéal via notre formulaire ou lors d''un échange. On analyse vos envies, contraintes et budget, puis on vous prépare un carnet de route PDF complet avec itinéraire, hébergements, restaurants et conseils pratiques. Le tout en 7-10 jours.', true),
('nos-services', 'faq_2_question', 'text', 'Combien coûte un voyage sur mesure avec Heldonica ?', true),
('nos-services', 'faq_2_answer', 'textarea', 'Le tarif du Travel Planning commence à 149€ pour un voyage de base. Le prix varie selon la complexité de l''itinéraire, la durée du voyage et le niveau de personnalisation. Chaque projet est unique, on vous donne un chiffrage précis après notre échange découverte.', true),
('nos-services', 'faq_3_question', 'text', 'Heldonica accompagne aussi les voyageurs en solo ?', true),
('nos-services', 'faq_3_answer', 'textarea', 'Absolument. Le Travel Planning fonctionne pour tous les types de voyageurs : couples, solos, familles, groupes d''amis. Pour les voyageurs solo, on peut aussi te mettre en contact avec d''autres voyageurs ou te guider vers des expériences adaptées.', true)

ON CONFLICT (page, zone_key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();
