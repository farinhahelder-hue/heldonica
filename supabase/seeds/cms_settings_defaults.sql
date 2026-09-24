-- Seed CMS settings — clés exactes alignées avec CmsSettingsPanel.tsx
-- Exécuter dans Supabase Dashboard > SQL Editor

INSERT INTO site_settings (key, value) VALUES

  -- Général
  ('site_name',        'Heldonica'),
  ('site_url',         'https://www.heldonica.fr'),
  ('site_tagline',     'Le slow travel pour les curieux du monde'),
  ('site_description', 'Voyages en couple, hors sentiers battus, écoresponsable'),
  ('contact_email',    'bonjour@heldonica.fr'),
  ('contact_phone',    ''),
  ('logo_url',         ''),
  ('favicon_url',      ''),

  -- Apparence
  ('primary_color',     '#2D8B7A'),
  ('secondary_color',   '#C4714A'),
  ('font_heading',      'Playfair Display'),
  ('font_body',         'Inter'),
  ('hero_banner_url',   ''),
  ('primary_cta_label', 'Planifier mon voyage'),
  ('primary_cta_url',   '/travel-planning'),

  -- Réseaux sociaux
  ('social_instagram', 'https://instagram.com/heldonica'),
  ('social_facebook',  ''),
  ('social_linkedin',  'https://linkedin.com/company/heldonica'),
  ('social_pinterest', ''),
  ('social_tiktok',    ''),
  ('instagram_url',    'https://instagram.com/heldonica'),
  ('site_instagram',   'https://instagram.com/heldonica'),
  ('site_facebook',    ''),
  ('site_linkedin',    'https://linkedin.com/company/heldonica'),
  ('site_pinterest',   ''),
  ('site_tiktok',      ''),

  -- SEO
  ('meta_title',               'Heldonica — Slow Travel & Conseil Hôtelier'),
  ('meta_description',         'Découvrez nos carnets de voyage slow travel en couple et notre expertise en conseil hôtelier.'),
  ('meta_og_image',            ''),
  ('seo_title',                'Heldonica — Slow Travel en couple'),
  ('seo_description',          'Découvrez nos carnets de voyage slow travel, hors sentiers battus.'),
  ('seo_default_title',        'Heldonica – Slow travel & découvertes'),
  ('seo_default_description',  'Voyages lents, destinations authentiques et carnets de route.'),
  ('seo_og_image',             ''),
  ('seo_robots',               'index, follow'),
  ('seo_sitemap_url',          '/sitemap.xml'),
  ('seo_google_verification',  ''),
  ('google_analytics_id',      ''),

  -- Footer
  ('footer_text',      '© 2026 Heldonica – Tous droits réservés'),
  ('footer_copyright', '© 2026 Heldonica'),
  ('footer_tagline',   'Vivre, découvrir, partager.'),
  ('footer_legal',     'Heldonica – Blog Slow Travel & Consulting Hôtelier'),
  ('footer_cta_label', 'Écrire à Heldonica'),
  ('footer_cta_url',   'mailto:contact@heldonica.fr'),
  ('footer_links',     ''),

  -- Maintenance
  ('maintenance_mode',     'false'),
  ('maintenance_message',  'On revient très vite avec de nouvelles pépites ! 🌿'),
  ('maintenance_end_date', '')

ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
