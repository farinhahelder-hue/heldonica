-- Migration: Ajout des sous-destinations Maramures et Apuseni
-- Date: 2026-09-01

INSERT INTO public.cms_sub_destinations (parent_slug, slug, title, teaser, emoji, display_order, is_active)
VALUES
  ('roumanie', 'maramures', 'Maramureș', 'Églises en bois UNESCO, portes sculptées et vie pastorale.', '🪵', 6, true),
  ('roumanie', 'apuseni', 'Monts Apuseni', 'Grottes karstiques, glaciers souterrains et cascades secrètes.', '🌲', 7, true)
ON CONFLICT (parent_slug, slug) DO UPDATE
SET
  title = EXCLUDED.title,
  teaser = EXCLUDED.teaser,
  emoji = EXCLUDED.emoji,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();
