-- Corrige 2 fautes de l'article 203 (Petrovac) : vouvoiement + virgule manquante.
-- Rollback : restaurer depuis C:/Users/farin/AppData/Local/Temp/rollback_203.json
-- (snapshot complet du 2026-09-30 avant retrait des prix).

UPDATE public.cms_blog_posts
SET content = REPLACE(content,
  'chauffées par le soleil vous enveloppe.',
  'chauffées par le soleil t''enveloppe.'),
  updated_at = NOW()
WHERE id = 203;

UPDATE public.cms_blog_posts
SET faq_content = REPLACE(faq_content::text,
  'tunnel de Sozina le trajet',
  'tunnel de Sozina, le trajet')::jsonb,
  updated_at = NOW()
WHERE id = 203;
