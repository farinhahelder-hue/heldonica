-- Migration 20261026170000_desactivation_zones_articles_alentejo.sql
-- Les trois cartes « Nos carnets liés » d'Alentejo pointaient toutes vers /blog
-- avec des titres d'articles qui n'existaient pas. Le 26/10/2026, la page a été
-- câblée sur les vrais articles (`getAllPosts` + filtre « alentejo ») ; les neuf
-- zones de ces cartes ne sont donc plus rendues.
--
-- On les désactive au lieu de les supprimer : le contenu reste consultable dans
-- l'admin, et une future carte éditoriale pourra les réactiver. Tant qu'elles
-- restent actives, `check:cms-zones` les compte comme orphelines.
--
-- Idempotente : ne touche que des lignes encore actives.

UPDATE public.cms_editable_zones
SET is_active = false
WHERE page = 'destinations-alentejo'
  AND is_active = true
  AND zone_key IN (
    'article_1_alt',
    'article_1_label',
    'article_1_title',
    'article_2_alt',
    'article_2_label',
    'article_2_title',
    'article_3_alt',
    'article_3_label',
    'article_3_title'
  );
