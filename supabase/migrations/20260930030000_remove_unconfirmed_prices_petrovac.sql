-- Retire les prix et la scène du pêcheur non confirmés de l'article 203 (Petrovac).
-- Contexte : prix (14 €, 3,50 €, péage 2,50 €, 16 €, kayak 10 €) et rencontre du
-- pêcheur non vérifiables par les photos (règle n°1 : on n'invente rien).
-- Lieu/date/GPS (27/05/2026, 42.2056/18.9425, Petrovac) prouvés par EXIF : inchangés.
-- Rollback : ré-appliquer supabase/migrations/20260930021000_create_petrovac_article.sql
-- (restaure les passages d'origine).

UPDATE public.cms_blog_posts
SET content = REPLACE(REPLACE(REPLACE(REPLACE(content,
  'on a partagé une assiette de calamars grillés arrosés d''huile d''olive locale, d''ail frais et de persil pour 14 €, accompagnés d''un verre de vin blanc Krstač bien frais à 3,50 €.',
  'on a partagé une assiette de calamars grillés arrosés d''huile d''olive locale, d''ail frais et de persil, accompagnés d''un verre de vin blanc Krstač bien frais.'),
  'Au bout de la jetée de pierre, on a rencontré un vieux pêcheur local qui réparait ses filets au couteau : il nous a montré au large les deux îlots rocheux de Katič et Sveta Neđelja.',
  'Au bout de la jetée de pierre, on voit au large les deux îlots rocheux de Katič et Sveta Neđelja.'),
  'À 45 minutes de route depuis Podgorica via le tunnel de Sozina (péage 2,50 €).',
  'À 45 minutes de route depuis Podgorica via le tunnel de Sozina.'),
  'Poisson frais du jour et salade méditerranéenne en konoba locale pour environ 16 € par personne.',
  'Poisson frais du jour et salade méditerranéenne en konoba locale.'),
  updated_at = NOW()
WHERE id = 203;

UPDATE public.cms_blog_posts
SET faq_content = REPLACE(REPLACE(faq_content::text,
  '(péage à 2,50 €), ',
  ''),
  'ou des loueurs de kayaks au port de Petrovac proposent la traversée pour environ 10 € par personne pour accoster au pied de la chapelle.',
  'au port de Petrovac proposent la traversée pour accoster au pied de la chapelle.')::jsonb,
  updated_at = NOW()
WHERE id = 203;
