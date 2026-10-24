-- Migration 20261024130000_purge_emojis_file_instagram.sql
-- Lot 2, priorité 5 : retirer les emojis des légendes Instagram en file.
--
-- Thème de l'audit : supprimer TOUS les emojis (décision #682). Quatre purges ont
-- déjà nettoyé les zones CMS, les drapeaux de destination et le message de
-- maintenance. La table `instagram_scheduled_posts` a été oubliée.
--
-- Pourquoi ça compte : `publierEntreeFile` (lib/instagram.ts) publie la légende
-- **stockée** telle quelle (`const caption = entree.caption || ''`). Le correctif
-- du 24/10 filtre désormais les emojis au moment de publier (`captionSansEmoji`),
-- mais la donnée en file reste sale : un autre client (n8n, script) qui lirait la
-- colonne directement publierait encore les emojis. On nettoie la donnée en plus
-- du rendu, comme pour les purges précédentes.
--
-- Les 8 lignes visées sont toutes `status = 'draft'` et portent le format hérité
-- `📍 <ville> … 🌍 <url>` (09/2026), dont une ligne `📍` orpheline (3b7875df).
-- Mesuré en lecture seule le 24/10 : 8 lignes sur 8 visées, 0 sans pin/globe/lien,
-- 0 résidu après un passage (idempotent), toutes en `draft`.
--
-- Retour arrière : impossible de reconstituer les emojis retirés (données
-- héritées d'un format abandonné). Aucune perte de contenu éditorial : seuls les
-- pictogrammes décoratifs disparaissent, le texte, les liens et les hashtags
-- sont intacts.

UPDATE public.instagram_scheduled_posts AS p
SET caption = net.propre
FROM (
  SELECT id,
         regexp_replace(
           string_agg(btrim(regexp_replace(ligne, U&'[\+01F300-\+01FAFF\+01F1E6-\+01F1FF\+00231A-\+00231B\+0023E9-\+0023FF\+002600-\+002604\+002606-\+0026FF\+002700-\+0027BF\+002B1B-\+002B1C\+002B50\+002B55]', '', 'g')), chr(10) ORDER BY ord),
           chr(10) || '{3,}', chr(10) || chr(10), 'g'
         ) AS propre
  FROM instagram_scheduled_posts,
       LATERAL unnest(string_to_array(caption, chr(10))) WITH ORDINALITY AS t(ligne, ord)
  WHERE caption ~ U&'[\+01F300-\+01FAFF\+01F1E6-\+01F1FF\+00231A-\+00231B\+0023E9-\+0023FF\+002600-\+002604\+002606-\+0026FF\+002700-\+0027BF\+002B1B-\+002B1C\+002B50\+002B55]'
  GROUP BY id
) AS net
WHERE p.id = net.id;
