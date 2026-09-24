-- ============================================================
-- HELDONICA — Normaliser la taxonomie des catégories du blog
-- Corrige le bug "Carnets 0" / "Guides 0" sur /blog (audit du 28.07.2026)
--
-- Cause : les filtres du blog comparent post.category à des clés exactes
-- ('Carnets Voyage', 'Guides Pratiques', 'Découvertes Locales'), mais les
-- valeurs stockées en base ont une casse différente ou des variantes :
--   articles         : "Carnets de voyage" (22), "Guides pratiques" (3),
--                       "Découvertes Locales" (6), "Découvertes" (2),
--                       "Coulisses de marque" (1), " Découverte" (1, espace en tête)
--   cms_blog_posts    : mêmes variantes
-- Résultat : 29 articles sur 35 n'apparaissent dans aucune section du blog.
--
-- "Coulisses de marque" et " Découverte" n'ont pas de correspondance évidente
-- avec les 3 filtres existants (Carnets Voyage / Découvertes Locales / Guides
-- Pratiques) — mappés ici vers "Découvertes Locales" par défaut le temps
-- d'une décision éditoriale ; à ajuster si une autre catégorie est voulue.
-- ============================================================

UPDATE articles
SET category = 'Carnets Voyage', updated_at = NOW()
WHERE category IN ('Carnets de voyage', 'Carnets de Voyage', 'carnets de voyage', 'carnets');

UPDATE articles
SET category = 'Guides Pratiques', updated_at = NOW()
WHERE category IN ('Guides pratiques', 'guides pratiques', 'Guides');

UPDATE articles
SET category = 'Découvertes Locales', updated_at = NOW()
WHERE trim(category) IN ('Découvertes', 'Découverte', 'Coulisses de marque')
   OR category != trim(category); -- corrige les valeurs avec espace parasite (" Découverte")

UPDATE cms_blog_posts
SET category = 'Carnets Voyage', updated_at = NOW()
WHERE category IN ('Carnets de voyage', 'Carnets de Voyage', 'carnets de voyage', 'carnets');

UPDATE cms_blog_posts
SET category = 'Guides Pratiques', updated_at = NOW()
WHERE category IN ('Guides pratiques', 'guides pratiques', 'Guides');

UPDATE cms_blog_posts
SET category = 'Découvertes Locales', updated_at = NOW()
WHERE trim(category) IN ('Découvertes', 'Découverte', 'Coulisses de marque')
   OR category != trim(category);
