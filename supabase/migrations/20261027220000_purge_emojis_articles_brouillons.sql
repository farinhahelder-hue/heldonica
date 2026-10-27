-- Migration 20261027220000_purge_emojis_articles_brouillons.sql
-- Lot 3 (audit editorial) : retirer les emojis decoratifs des BROUILLONS d'articles.
--
-- Contexte : la decision #682 (« supprimer TOUS les emojis ») a ete appliquee au
-- code (lots 1 et 2) et aux zones CMS (migrations 20261021 a 20261025). La table
-- `cms_blog_posts` n'a jamais ete purgee. Le garde-fou `check-cms-emojis.mjs` ne
-- regarde que les articles PUBLIES (`published = true`) : les brouillons echappent
-- donc a la CI, et publier l'un d'eux ferait apparaitre ses emojis en ligne.
--
-- Mesure en lecture seule le 27/10 (regex officielle DECORATIVE_EMOJI_RE, plage
-- complete, drapeaux exclus) :
--   - 55 articles lus ; 8 publies (0 emoji decoratif) ; 47 brouillons.
--   - 18 brouillons portent 71 occurrences decoratives, dans 3 colonnes :
--     content (65), excerpt (4), meta_description (2).
--   - 15 de ces 71 occurrences sont VOLONTAIREMENT conservees par la politique
--     deja arretee : les 10 ✦ du libelle de marque « Verdict Heldonica » (✦ est
--     enregistre comme icone dans `lib/cms-icons.ts` et sert de wordmark dans le
--     contenu publie), 4 ➔ et 1 ⚠ (fleche et convention de liste).
--     Le retrait porte donc sur 56 occurrences.
--   - Aucun drapeau (indicateur regional) dans ces brouillons.
--
-- La classe ci-dessous est la plage COMPLETE du detecteur
-- (`scripts/check-design-tics.mjs`), DECOUPEE pour exclure nommement les glyphes
-- conserves ✓ (2713), ✗ (2717), ⚠ (26A0), ➔ (2794), ✦ (2726), et les drapeaux
-- (1F1E6-1F1FF). Toute evolution de la plage du detecteur doit etre repercutee
-- ici, sinon le trou du 22/10 (purge 20261022230000) se rouvre.
--
-- Portee : uniquement `published = false`. Les articles publies ne sont pas
-- touches (ils sont deja propres, et c'est le role du garde-fou de le verifier).
-- Seules les 3 colonnes ou un emoji a ete MESURE sont traitees.
--
-- `updated_at` n'est pas modifie : c'est la date de derniere edition humaine de
-- l'article, et cette migration ne change pas la substance editoriale.
--
-- Retour arriere : impossible de reconstituer les emojis retires. Aucune perte de
-- contenu editorial : seuls les pictogrammes decoratifs disparaissent ; le texte,
-- les balises HTML, les entites, les accents et les fleches sont intacts.

UPDATE public.cms_blog_posts
SET content = regexp_replace(
      content,
      U&'[\+01F300-\+01FAFF\+00231A-\+00231B\+0023E9-\+0023FF\+002600-\+002604\+002606-\+00269F\+0026A1-\+0026FF\+002700-\+002712\+002714-\+002716\+002718-\+002725\+002727-\+002793\+002795-\+0027BF\+002B1B-\+002B1C\+002B50\+002B55]',
      '',
      'g'
    )
WHERE published = false
  AND content ~ U&'[\+01F300-\+01FAFF\+00231A-\+00231B\+0023E9-\+0023FF\+002600-\+002604\+002606-\+00269F\+0026A1-\+0026FF\+002700-\+002712\+002714-\+002716\+002718-\+002725\+002727-\+002793\+002795-\+0027BF\+002B1B-\+002B1C\+002B50\+002B55]';

UPDATE public.cms_blog_posts
SET excerpt = regexp_replace(
      excerpt,
      U&'[\+01F300-\+01FAFF\+00231A-\+00231B\+0023E9-\+0023FF\+002600-\+002604\+002606-\+00269F\+0026A1-\+0026FF\+002700-\+002712\+002714-\+002716\+002718-\+002725\+002727-\+002793\+002795-\+0027BF\+002B1B-\+002B1C\+002B50\+002B55]',
      '',
      'g'
    )
WHERE published = false
  AND excerpt ~ U&'[\+01F300-\+01FAFF\+00231A-\+00231B\+0023E9-\+0023FF\+002600-\+002604\+002606-\+00269F\+0026A1-\+0026FF\+002700-\+002712\+002714-\+002716\+002718-\+002725\+002727-\+002793\+002795-\+0027BF\+002B1B-\+002B1C\+002B50\+002B55]';

UPDATE public.cms_blog_posts
SET meta_description = regexp_replace(
      meta_description,
      U&'[\+01F300-\+01FAFF\+00231A-\+00231B\+0023E9-\+0023FF\+002600-\+002604\+002606-\+00269F\+0026A1-\+0026FF\+002700-\+002712\+002714-\+002716\+002718-\+002725\+002727-\+002793\+002795-\+0027BF\+002B1B-\+002B1C\+002B50\+002B55]',
      '',
      'g'
    )
WHERE published = false
  AND meta_description ~ U&'[\+01F300-\+01FAFF\+00231A-\+00231B\+0023E9-\+0023FF\+002600-\+002604\+002606-\+00269F\+0026A1-\+0026FF\+002700-\+002712\+002714-\+002716\+002718-\+002725\+002727-\+002793\+002795-\+0027BF\+002B1B-\+002B1C\+002B50\+002B55]';
