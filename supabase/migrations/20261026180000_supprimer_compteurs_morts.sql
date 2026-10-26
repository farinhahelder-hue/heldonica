-- Compteurs : supprimer les deux cles mortes — 2026-10-26
--
-- Contexte (audit editorial du 2026-10-20, constats E et F) : deux reglages de
-- `site_settings` portent un chiffre de compteur que PLUS AUCUN code ne lit.
-- Verifie sur tout le depot (hors ce fichier) :
--   grep -rn "stat_notebooks_published" --include='*.ts' --include='*.tsx' --include='*.mjs' .
--   grep -rn "stat_countries_lived"    --include='*.ts' --include='*.tsx' --include='*.mjs' .
--   => 0 occurrence. Ce sont des residus d'un ancien compteur manuel.
--
-- Ce qui est REELLEMENT affiche aujourd'hui :
--   - accueil : `publishedArticles = totalPosts` et `parsedCountries =
--     parseInt(coveredCountries || '0')` (components/HomeClient.tsx) — valeurs
--     CALCULEES, pas lues depuis ces cles ;
--   - /a-propos : `carnetCount = posts.length` (app/a-propos/page.tsx).
-- Le proprietaire a demande un compteur CALCULE plutot qu'un reglage fixe : c'est
-- deja le cas dans le code. Le seul geste utile en base est donc de retirer les
-- deux valeurs fausses (25 carnets, 6 pays) qui pourraient etre lues par erreur.
--
-- `covered_countries` (= '7', LUE par l'accueil) n'est PAS touchee : sa vraie
-- valeur depend de la liste de pays que le proprietaire doit fournir (constat E).
--
-- Aucune autre table, aucune autre cle. NON APPLIQUEE.

DELETE FROM public.site_settings
WHERE key IN ('stat_notebooks_published', 'stat_countries_lived');
