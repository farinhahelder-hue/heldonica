-- ─── Accroche Monténégro : retirer le fjord de Kotor, jamais visité ───────────
-- Contexte : la carte Monténégro de l'accueil sert `destinations.excerpt` (via
-- `getHomeDestinations`, lib/home-data.ts) et affichait encore :
--   « Les Balkans secrets : fjord de Kotor, monastères orthodoxes et
--     Adriatique sans foule. Notre pépite dénichée hors des radars. »
--
-- Or l'inventaire terrain du 30/10/2026 (1 413 photos géolocalisées) ne compte
-- AUCUNE image à Kotor, Perast, Lovćen ni Durmitor. La phrase décrit un voyage
-- qui n'a pas eu lieu : règle n°1, on n'invente rien.
--
-- La ligne `montenegro-podgorica` (non publiée) portait la même revendication
-- (« Kotor sans foule, fjord de Boka ») ; elle est corrigée par cohérence.
--
-- Idempotent : les gardes `LIKE` rendent la migration rejouable sans effet.
-- Les deux textes de remplacement ne décrivent que le vécu documenté :
-- Petrovac comme camp de base, Perazića Do, les chutes de la Cijevna et
-- Stara Varoš à Podgorica, du 27 mai au 1er juin 2026.

UPDATE public.destinations
SET excerpt = 'Petrovac comme camp de base, les criques de Perazića Do, les chutes de la Cijevna et Stara Varoš à Podgorica. Six jours en couple, fin mai 2026.'
WHERE slug = 'montenegro'
  AND excerpt LIKE '%fjord de Kotor%';

UPDATE public.destinations
SET excerpt = 'Podgorica comme base méconnue, les chutes de la Cijevna et les ruelles de Stara Varoš. Notre itinéraire en couple, mai 2026.'
WHERE slug = 'montenegro-podgorica'
  AND (excerpt LIKE '%Kotor%' OR excerpt LIKE '%fjord de Boka%');
