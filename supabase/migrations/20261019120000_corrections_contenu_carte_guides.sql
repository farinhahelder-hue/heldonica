-- Corrections de contenu relevées le 2026-10-19 sur les pages réellement en ligne.
--
-- Ces deux tables alimentent des pages indexables :
--   map_markers   -> /destinations/carte (les épingles et leur légende)
--   cms_guide_items -> /guides/top-10-pepites-madere
--
-- Idempotent : chaque UPDATE est conditionné par la valeur fautive. Rejouer la
-- migration ne fait rien. Aucune donnée n'est supprimée.

-- 1. Côte d'Albâtre : deux erreurs dans la même ligne.
--    La colonne `region` de cette même ligne vaut « Normandie » : la Côte
--    d'Albâtre est normande, pas bretonne. Et « Fagnes » (plateau ardennais)
--    n'a rien à faire dans une légende de falaises de craie.
UPDATE public.map_markers
SET title = 'Côte d''Albâtre, falaises normandes'
WHERE slug = 'cote-albatre'
  AND title = 'Côte d''Albâtre, falaises bretonnes';

UPDATE public.map_markers
SET excerpt = 'Falaises blanches, villages de pêcheurs et airs marins.'
WHERE slug = 'cote-albatre'
  AND excerpt = 'Fagnes blanches, villages de pêcheurs et airs marins.';

-- 2. Porto : « viñedos » est espagnol (le portugais écrit « vinhas »/« vignobles »),
--    et « architecture barcelonaise » décrit Barcelone, pas Porto.
--    L'adjectif est retiré plutôt que remplacé par un style que rien n'établit :
--    on n'invente pas une caractéristique architecturale pour combler le vide.
UPDATE public.map_markers
SET title = 'Porto, vignobles et Douro'
WHERE slug = 'porto'
  AND title = 'Porto, viñedos et Douro';

UPDATE public.map_markers
SET excerpt = 'Vin de Porto et scène gastronomique.'
WHERE slug = 'porto'
  AND excerpt = 'Architecture barcelonaise, vin de Porto et scène gastronomique.';

-- 3. Guide Madère : « propietario » est espagnol ; le portugais est « proprietário »,
--    le français « propriétaire ». Le reste de la phrase est en français.
UPDATE public.cms_guide_items
SET description = replace(description, 'propietario', 'propriétaire')
WHERE guide_slug = 'top-10-pepites-madere'
  AND description LIKE '%propietario%';
