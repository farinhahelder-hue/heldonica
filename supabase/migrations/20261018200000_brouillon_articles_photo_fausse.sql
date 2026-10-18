-- Brouillon : 12 articles dont la photo principale ne montre pas le sujet
--
-- Décision du fondateur (18/10/2026), après la planche de contrôle des photos :
-- les articles dont la photo est fausse sortent du site jusqu'à ce qu'on ait la
-- vraie photo. Constats faits en regardant chaque image :
--   petrovac-na-moru…            couloir d'hôtel
--   quand-verdure-rime…           entrée du Parcul Botanic (Roumanie) pour la Petite Ceinture
--   perazica-do-tunnels…          pont Millennium de Podgorica pour la côte
--   prego-no-bolo-do-caco         un pudim (dessert)
--   stoos-ridge-notre-aventure-sur-la-crete-panoramique   vue depuis la voiture
--   cote-pastrovici…              cave à vin Šipčanik
--   bacalhau-a-lagareiro          photo de la recette Gomes de Sá
--   flotter-sur-la-limmat…        une pleine lune
--   les-meilleures-brasseries…    une pleine lune
--   urbex-paris-safe              affiche de périscolaire
--   petit-dejeuner-du-dimanche…   deux randonneurs
--   rues-cachees-paris-rue-temple la tour Eiffel
-- Brouillon simple, sans redirection (choix du fondateur). published_at est
-- conservé pour une remise en ligne à l'identique.
--
-- Garde-fou : seuls les articles encore publiés sont touchés. Idempotent.

UPDATE public.cms_blog_posts
SET status = 'draft', updated_at = NOW()
WHERE status = 'published'
  AND slug IN (
    'petrovac-na-moru-sentier-pins-criques-forteresse',
    'quand-verdure-rime-avec-street-art-escapade-a-la-petite-ceinture-75014',
    'perazica-do-tunnels-falaise-baie-hotel-as',
    'prego-no-bolo-do-caco',
    'stoos-ridge-notre-aventure-sur-la-crete-panoramique',
    'cote-pastrovici-en-mer-falaises-criques-pleine-lune',
    'bacalhau-a-lagareiro',
    'flotter-sur-la-limmat-zurich-aventure',
    'les-meilleures-brasseries-authentiques-de-zurich-guide-2026',
    'urbex-paris-safe',
    'petit-dejeuner-du-dimanche-crepes-legeres-a-la-farine-de-riz-sans-gluten',
    'rues-cachees-paris-rue-temple'
  );
