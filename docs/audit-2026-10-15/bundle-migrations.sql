-- BUNDLE DES MIGRATIONS — plan de mise en ligne Heldonica
--
-- GÉNÉRÉ par scripts/generer-bundle-migrations.mjs — ne pas éditer à la main.
--
-- À COLLER dans Supabase → SQL Editor → Run.
--
-- Une SEULE transaction : tout ou rien. Si une instruction échoue, rien n'est
-- appliqué et la base reste dans son état actuel.
--
-- Contient 6 migrations :
--   - 20261016100000_remove_placeholder_zone_text.sql
--   - 20261016110000_seed_maramures_apuseni_zones.sql
--   - 20261016120000_fix_seo_descriptions.sql
--   - 20261016130000_fix_paris_tip.sql
--   - 20261016140000_subdest_coming_soon.sql
--   - 20261016150000_blank_generic_local_tip.sql
--
-- Après exécution, vérifier avec :
--   npm run check:migrations        → doit afficher « appliquées »
--
-- RAPPEL : le code doit être déployé ENSEMBLE. Ces migrations désactivent les
-- zones des 14 pages sans contenu ; l'ancien code, lui, ne sait pas rendre
-- « Bientôt » et retomberait sur son texte en dur.

BEGIN;

-- ═══════════════════════════════════════════════════════════════════════
-- 20261016100000_remove_placeholder_zone_text.sql
-- ═══════════════════════════════════════════════════════════════════════
-- Retire des textes provisoires visibles sur des pages publiques.
--
-- Constat (audit 2026-10-16, lecture seule de cms_editable_zones) :
--   * destinations-sicile-taormine/intro_text
--       « Taormine, c'est le spot tourism. Le theatre grec avec vue sur la mer.
--         Incredible. »  -> placeholder en anglais, fautes, rendu sur une page
--       presente dans sitemap.xml (taormine est en status=draft mais
--       published=true, donc servie publiquement).
--   * destinations-paris/tip_2
--       « Monter au Miradouro (équivalent) du Sacré-Cœur à l'aube »
--       -> note de rédaction restée dans le texte ; « Miradouro » est portugais
--       (copie depuis la fiche Lisbonne), Paris n'a pas de miradouro.
--
-- Ces deux textes sont retires, pas remplaces par une invention : on n'écrit
-- pas d'affirmation non vérifiée. La page garde ses autres conseils.
--
-- Rollback :
--   UPDATE public.cms_editable_zones SET value = 'Taormine, c''est le spot tourism. Le theatre grec avec vue sur la mer. Incredible.', updated_at = NOW() WHERE page = 'destinations-sicile-taormine' AND zone_key = 'intro_text';
--   UPDATE public.cms_editable_zones SET value = 'Monter au Miradouro (équivalent) du Sacré-Cœur à l''aube', updated_at = NOW() WHERE page = 'destinations-paris' AND zone_key = 'tip_2';

-- Taormine : retirer le placeholder anglais. Remplacement volontairement
-- factuel et neutre (le théâtre grec de Taormine surplombe la mer : fait
-- établi), sans superlatif ni affirmation de vécu. À réécrire par le
-- propriétaire s'il souhaite une intro plus incarnée.
UPDATE public.cms_editable_zones
SET value = 'Taormine, son théâtre grec antique ouvert sur la mer.',
    updated_at = NOW()
WHERE page = 'destinations-sicile-taormine'
  AND zone_key = 'intro_text'
  AND value LIKE '%spot tourism%';

-- Paris : retirer la note « (équivalent) » et la référence portugaise.
UPDATE public.cms_editable_zones
SET value = 'Monter au Sacré-Cœur à l''aube, avant les premiers groupes',
    updated_at = NOW()
WHERE page = 'destinations-paris'
  AND zone_key = 'tip_2'
  AND value LIKE '%(équivalent)%';

-- ═══════════════════════════════════════════════════════════════════════
-- 20261016110000_seed_maramures_apuseni_zones.sql
-- ═══════════════════════════════════════════════════════════════════════
-- Seed des zones CMS pour deux sous-destinations roumaines restees sans zones.
--
-- POURQUOI
-- `app/destinations/roumanie/maramures/page.tsx` et
-- `app/destinations/roumanie/apuseni/page.tsx` utilisent bien
-- `SubDestinationTemplate` (donc des `EditableZone`), mais leurs cles de page
-- n'existent pas dans `cms_editable_zones`. Consequence : leur contenu vit
-- uniquement dans le code, et ils n'apparaissent pas dans la section
-- « Zones de Texte » du CMS.
--
-- Les 41 autres sous-destinations ont ete seedees par
-- `20260801000010_cms_sub_destinations_zones.sql`. Ces deux pages, ajoutees
-- apres, ont ete oubliees : le generateur `scripts/generate-subdest-cms.mjs`
-- est un script PowerShell (Windows uniquement) qui n'est pas rejoue
-- automatiquement a l'ajout d'une page.
--
-- NOTE IMPORTANTE — ce n'est pas un blocage absolu : la route
-- `PATCH /api/cms/zones` fait un `upsert` sur `(page, zone_key)`. Un
-- administrateur qui ouvre ces pages et utilise le Live Edit CREE donc la zone.
-- La migration sert a rendre ces pages visibles et editables depuis la liste du
-- CMS, sans devoir d'abord les visiter.
--
-- VALEURS
-- Reprises A L'IDENTIQUE du code actuel. Aucun contenu nouveau, aucun fait
-- ajoute, aucune reformulation. La base devient la source de verite ; le code
-- reste le fallback (`fallback={...}` dans les composants).
--
-- Idempotente : ON CONFLICT (page, zone_key) DO UPDATE.
--
-- ROLLBACK
--   DELETE FROM public.cms_editable_zones
--    WHERE page IN ('destinations-roumanie-maramures','destinations-roumanie-apuseni');

INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
  -- --- destinations-roumanie-maramures -------------------------------------
  ('destinations-roumanie-maramures', 'hero_image', 'image', 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/roumanie/IMG_20260827_135025.jpg', 'Image du hero', true),
  ('destinations-roumanie-maramures', 'intro_text', 'textarea', 'Tout au nord de la Roumanie, le Maramureș est l''un des derniers sanctuaires ruraux d''Europe où le bois reste une matière vivante. On a arpenté ces vallées en toute saison lors de nos voyages en 2025 et 2026, au rythme lent des chevaux de trait et du travail artisanal.', 'Texte d''introduction', true),
  ('destinations-roumanie-maramures', 'local_tip', 'textarea', 'Pars tôt le matin sur les routes secondaires de la vallée de la Mara pour observer la brume se lever sur les meules de foin. Prévois du liquide pour les petites auberges familiales et roule prudemment sur les virages de montagne.', 'Conseil local', true),
  ('destinations-roumanie-maramures', 'highlight_1_emoji', 'text', '🪵', 'Pépite 1 — emoji', true),
  ('destinations-roumanie-maramures', 'highlight_1_title', 'text', 'Les Églises en bois UNESCO (Bârsana & Ieud)', 'Pépite 1 — titre', true),
  ('destinations-roumanie-maramures', 'highlight_1_description', 'textarea', 'Des flèches de chêne noirci s''élançant vers les nuages, des fresques peintes sur toile à la lueur des cierges et le silence de la vallée de l''Iza.', 'Pépite 1 — description', true),
  ('destinations-roumanie-maramures', 'highlight_2_emoji', 'text', '🚪', 'Pépite 2 — emoji', true),
  ('destinations-roumanie-maramures', 'highlight_2_title', 'text', 'Les Portes monumentales & la vie pastorale', 'Pépite 2 — titre', true),
  ('destinations-roumanie-maramures', 'highlight_2_description', 'textarea', 'Des portails de chêne sculptés de soleils et de motifs séculaires, au milieu de collines où le foin sèche en meules coniques traditionnelles.', 'Pépite 2 — description', true),
  ('destinations-roumanie-maramures', 'highlight_3_emoji', 'text', '🍲', 'Pépite 3 — emoji', true),
  ('destinations-roumanie-maramures', 'highlight_3_title', 'text', 'L''Hospitalité paysanne & la Mămăligă', 'Pépite 3 — titre', true),
  ('destinations-roumanie-maramures', 'highlight_3_description', 'textarea', 'Des tables paysannes au coin du poêle à bois, où l''on partage le fromage frais de brebis brânză à 8 € et la confiture de prune maison.', 'Pépite 3 — description', true),
  -- --- destinations-roumanie-apuseni ---------------------------------------
  ('destinations-roumanie-apuseni', 'hero_image', 'image', 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/roumanie/IMG_20260827_135834.jpg', 'Image du hero', true),
  ('destinations-roumanie-apuseni', 'intro_text', 'textarea', 'Les monts Apuseni forment le massif le plus occidental des Carpates roumaines, à cheval sur les comtés d''Alba, de Bihor et de Cluj. Le relief karstique a creusé des centaines de grottes et de gouffres, et les vallons cachent cascades et prairies isolées, loin des grands axes touristiques de Transylvanie.', 'Texte d''introduction', true),
  ('destinations-roumanie-apuseni', 'local_tip', 'textarea', 'Les routes qui relient les cabanes et les grottes sont souvent non asphaltées et sinueuses en montagne : mieux vaut un véhicule adapté et une marge horaire large, surtout après la pluie.', 'Conseil local', true),
  ('destinations-roumanie-apuseni', 'highlight_1_emoji', 'text', '🕳️', 'Pépite 1 — emoji', true),
  ('destinations-roumanie-apuseni', 'highlight_1_title', 'text', 'Grottes karstiques', 'Pépite 1 — titre', true),
  ('destinations-roumanie-apuseni', 'highlight_1_description', 'textarea', 'Le massif est troué de cavités façonnées par l''érosion calcaire, dont la grotte d''Ionele et le gouffre glaciaire de Vartop.', 'Pépite 1 — description', true),
  ('destinations-roumanie-apuseni', 'highlight_2_emoji', 'text', '💧', 'Pépite 2 — emoji', true),
  ('destinations-roumanie-apuseni', 'highlight_2_title', 'text', 'Cascades et ravins', 'Pépite 2 — titre', true),
  ('destinations-roumanie-apuseni', 'highlight_2_description', 'textarea', 'La cascade de Pișoaia et le ravin d''Ordâncușa serpentent entre les falaises, alimentés par des sources karstiques comme l''izbuc de Tăuzu.', 'Pépite 2 — description', true),
  ('destinations-roumanie-apuseni', 'highlight_3_emoji', 'text', '🏔️', 'Pépite 3 — emoji', true),
  ('destinations-roumanie-apuseni', 'highlight_3_title', 'text', 'Refuges de montagne', 'Pépite 3 — titre', true),
  ('destinations-roumanie-apuseni', 'highlight_3_description', 'textarea', 'Les cabanes autour de Gârda de Sus et Dealu Frumos servent d''étape aux randonneurs qui montent vers le Cucurbăta Mare, point culminant du massif.', 'Pépite 3 — description', true)
ON CONFLICT (page, zone_key) DO UPDATE
  SET value = EXCLUDED.value,
      zone_type = EXCLUDED.zone_type,
      label = EXCLUDED.label,
      is_active = EXCLUDED.is_active,
      updated_at = now();

-- ═══════════════════════════════════════════════════════════════════════
-- 20261016120000_fix_seo_descriptions.sql
-- ═══════════════════════════════════════════════════════════════════════
-- Repare les 9 descriptions SEO charabia en base.
--
-- POURQUOI
-- Un gabarit automatique avait colle un suffixe marketing anglais
-- (« ⭐ Hidden Gem » / « ⭐ Secret Gem ») derriere un fragment d'introduction
-- tronque, ce qui a mange les accents et les espaces :
--   « Le port typique »   -> « Le portype »
--   « L'ile prison »      -> « L ile prison »
--   « pêcheurs »          -> « pecheurs »
-- Ces valeurs alimentent le <title>, la meta description, OpenGraph et Twitter
-- (voir lib/page-metadata.ts), donc elles sont visibles par Google et dans les
-- partages sociaux.
--
-- CE QUE FAIT CETTE MIGRATION — et rien d'autre
--   1. retire le suffixe marketing anglais ;
--   2. RESTAURE les accents et espaces perdus ;
--   3. remplace « Notre guide slow travel testé en couple : ... » par la meme
--      formule sans la fausse premisse « testé » (le guide n'est pas encore
--      publie pour ces lieux).
-- Aucun fait nouveau n'est ajoute : ce sont les memes informations, reparées.
-- Les fragments sont ceux des teasers deja ecrits par les proprietaires
-- (table cms_sub_destinations) quand ils existaient.
--
-- Les memes valeurs ont ete appliquees au code (app/destinations/**/page.tsx).
--
-- ROLLBACK : les valeurs d'origine sont en commentaire sous chaque UPDATE.

UPDATE public.cms_editable_zones
   SET value = 'Le funiculaire, 1 000 m de chute, le vertige. Guide slow travel en couple : pépites locales, adresses insolites et conseils pratiques.',
       updated_at = now()
 WHERE page = 'destinations-madere-achadas-da-cruz' AND zone_key = 'seo_description';
-- avant : « Le funiculaire. 1000m de chute. Vertige en ⭐ Secret Gem. Notre guide slow travel testé en couple : ... »

UPDATE public.cms_editable_zones
   SET value = 'L''île prison, ses ânes blanchis, son exclusivité. Guide slow travel en couple : pépites locales, adresses insolites et conseils pratiques.',
       updated_at = now()
 WHERE page = 'destinations-sardaigne-asinara' AND zone_key = 'seo_description';
-- avant : « L ile prison. Ane blanchis, exclusivite en ⭐ Hidden Gem. ... »

UPDATE public.cms_editable_zones
   SET value = 'Volcans et boue volcanique. Guide slow travel en couple : pépites locales, adresses insolites et conseils pratiques.',
       updated_at = now()
 WHERE page = 'destinations-sicile-etoile' AND zone_key = 'seo_description';
-- avant : « Volcans, boue en ⭐ Secret Gem. ... »

UPDATE public.cms_editable_zones
   SET value = 'Le village de pêcheurs, le plus authentique. Guide slow travel en couple : pépites locales, adresses insolites et conseils pratiques.',
       updated_at = now()
 WHERE page = 'destinations-madere-camara-de-lobos' AND zone_key = 'seo_description';
-- avant : « Le village de pecheurs. Le plus authentique en ⭐ Hidden Gem. ... »

UPDATE public.cms_editable_zones
   SET value = 'Le village dans les nuages, à flanc de montagne. Guide slow travel en couple : pépites locales, adresses insolites et conseils pratiques.',
       updated_at = now()
 WHERE page = 'destinations-madere-faial' AND zone_key = 'seo_description';
-- avant : « Le village dans les nuages. Montagne en ⭐ Hidden Gem. ... »

UPDATE public.cms_editable_zones
   SET value = 'Le bout de l’île, le plus à l’ouest, le moins connu. Guide slow travel en couple : pépites locales, adresses insolites et conseils pratiques.',
       updated_at = now()
 WHERE page = 'destinations-madere-ponta-do-sol' AND zone_key = 'seo_description';
-- avant : « Le bout de l’île. Le plus west. Le moins connu en ⭐ Secret Gem. ... »

UPDATE public.cms_editable_zones
   SET value = 'Le village, la vue, le cimetière, les eucalyptus. Guide slow travel en couple : pépites locales, adresses insolites et conseils pratiques.',
       updated_at = now()
 WHERE page = 'destinations-madere-portela' AND zone_key = 'seo_description';
-- avant : « Le village. La vue, le cimetiere, les eucalyptus en ⭐ Secret Gem. ... »

UPDATE public.cms_editable_zones
   SET value = 'Le petit village, ses tavernes et son vin. Guide slow travel en couple : pépites locales, adresses insolites et conseils pratiques.',
       updated_at = now()
 WHERE page = 'destinations-madere-santos' AND zone_key = 'seo_description';
-- avant : « Le petit village. Les tavernes, le vin en ⭐ Hidden Gem. ... »

UPDATE public.cms_editable_zones
   SET value = 'Le nord oublié : grottes, plage noire, éoliennes. Guide slow travel en couple : pépites locales, adresses insolites et conseils pratiques.',
       updated_at = now()
 WHERE page = 'destinations-madere-sao-vicente' AND zone_key = 'seo_description';
-- avant : « Le nord forgotten. Grottes, plage noire, eoliennes en ⭐ Hidden Gem. ... »

-- ═══════════════════════════════════════════════════════════════════════
-- 20261016130000_fix_paris_tip.sql
-- ═══════════════════════════════════════════════════════════════════════
-- Repare le conseil n°2 de la page Paris, qui contient une note de redaction.
--
-- AVANT : « Monter au Miradouro (équivalent) du Sacré-Cœur à l'aube »
--   - « Miradouro » est le mot portugais pour belvedere ;
--   - « (équivalent) » est une note de redaction restee en clair.
--
-- APRES : la valeur deja presente dans le code
-- (app/destinations/[slug]/DestinationPage.tsx, entree Paris), qui est propre
-- et plus informative. Aucun fait ajoute : on aligne la base sur le code.
--
-- ROLLBACK :
--   UPDATE public.cms_editable_zones
--      SET value = 'Monter au Miradouro (équivalent) du Sacré-Cœur à l''aube'
--    WHERE page = 'destinations-paris' AND zone_key = 'tip_2';

UPDATE public.cms_editable_zones
   SET value = 'Monter au Sacré-Cœur à l''aube, avant les premiers groupes',
       updated_at = now()
 WHERE page = 'destinations-paris' AND zone_key = 'tip_2';

-- ═══════════════════════════════════════════════════════════════════════
-- 20261016140000_subdest_coming_soon.sql
-- ═══════════════════════════════════════════════════════════════════════
-- Bascule les 14 sous-destinations sans matiere sur le gabarit « Bientot ».
--
-- POURQUOI
-- Ces 14 pages (Sicile x5, Sardaigne x5, Colombie x4) ne sont pas des guides :
-- aucun texte propre (25 zones, ~830 caracteres toutes generiques), aucune
-- photo (couverture = /og-default.jpg), aucun article. Le bloc « Pepites »
-- n'affichait que des notes de redaction (« Theatre » / « Grec. »).
-- Le code passe sur ComingSoonDestination (voir app/destinations/**/page.tsx).
--
-- CE QUE FAIT CETTE MIGRATION
--   1. desactive les 25 zones par page : le nouveau gabarit ne les lit plus,
--      elles deviendraient orphelines (check:cms-zones) ;
--   2. seme les zones du gabarit « Bientot » pour que Live Edit reste utilisable ;
--   3. restaure les accents des teasers dans cms_sub_destinations
--      (memes accents perdus que les descriptions SEO).
--
-- Aucun fait invente : les teasers sont ceux deja ecrits par les proprietaires.
--
-- ROLLBACK : UPDATE cms_editable_zones SET is_active = true
--              WHERE page LIKE 'destinations-sicile-%' OR ... (voir ci-dessous)
--            DELETE FROM cms_editable_zones WHERE page = 'destinations-<p>-<s>'
--              AND zone_key IN (zones du gabarit) ;

-- 1. Desactive les anciennes zones des 14 pages.
UPDATE public.cms_editable_zones
   SET is_active = false, updated_at = now()
 WHERE page IN (
  ('destinations-sicile-taormine'),
  ('destinations-sicile-catane'),
  ('destinations-sicile-palerme'),
  ('destinations-sicile-syracuse'),
  ('destinations-sicile-etoile'),
  ('destinations-sardaigne-alghero'),
  ('destinations-sardaigne-asinara'),
  ('destinations-sardaigne-cagliari'),
  ('destinations-sardaigne-costa-smeralda'),
  ('destinations-sardaigne-nuoro'),
  ('destinations-colombie-bogota'),
  ('destinations-colombie-cali'),
  ('destinations-colombie-cartago'),
  ('destinations-colombie-medellin')
 );

-- 2. Seme les zones du gabarit « Bientot » (idempotent).
INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
  ('destinations-sicile-taormine', 'hero_eyebrow', 'text', 'Italie — Bientôt', 'Bientôt — surtitre', true),
  ('destinations-sicile-taormine', 'hero_title', 'text', 'Taormine', 'Bientôt — titre', true),
  ('destinations-sicile-taormine', 'hero_teaser', 'textarea', 'Le théâtre antique face à la mer ionienne.', 'Bientôt — accroche', true),
  ('destinations-sicile-taormine', 'section_title', 'text', 'On prépare le guide taormine — à notre façon.', 'Bientôt — titre de section', true),
  ('destinations-sicile-catane', 'hero_eyebrow', 'text', 'Italie — Bientôt', 'Bientôt — surtitre', true),
  ('destinations-sicile-catane', 'hero_title', 'text', 'Catane', 'Bientôt — titre', true),
  ('destinations-sicile-catane', 'hero_teaser', 'textarea', 'La cité baroque au pied de l''Etna.', 'Bientôt — accroche', true),
  ('destinations-sicile-catane', 'section_title', 'text', 'On prépare le guide catane — à notre façon.', 'Bientôt — titre de section', true),
  ('destinations-sicile-palerme', 'hero_eyebrow', 'text', 'Italie — Bientôt', 'Bientôt — surtitre', true),
  ('destinations-sicile-palerme', 'hero_title', 'text', 'Palerme', 'Bientôt — titre', true),
  ('destinations-sicile-palerme', 'hero_teaser', 'textarea', 'Marchés de rue animés et joyaux arabo-normands.', 'Bientôt — accroche', true),
  ('destinations-sicile-palerme', 'section_title', 'text', 'On prépare le guide palerme — à notre façon.', 'Bientôt — titre de section', true),
  ('destinations-sicile-syracuse', 'hero_eyebrow', 'text', 'Italie — Bientôt', 'Bientôt — surtitre', true),
  ('destinations-sicile-syracuse', 'hero_title', 'text', 'Syracuse', 'Bientôt — titre', true),
  ('destinations-sicile-syracuse', 'hero_teaser', 'textarea', 'L''île d''Ortygie et des vestiges grecs légendaires.', 'Bientôt — accroche', true),
  ('destinations-sicile-syracuse', 'section_title', 'text', 'On prépare le guide syracuse — à notre façon.', 'Bientôt — titre de section', true),
  ('destinations-sicile-etoile', 'hero_eyebrow', 'text', 'Italie — Bientôt', 'Bientôt — surtitre', true),
  ('destinations-sicile-etoile', 'hero_title', 'text', 'Isole Eoliennes', 'Bientôt — titre', true),
  ('destinations-sicile-etoile', 'hero_teaser', 'textarea', 'Volcans et boue volcanique.', 'Bientôt — accroche', true),
  ('destinations-sicile-etoile', 'section_title', 'text', 'On prépare le guide isole eoliennes — à notre façon.', 'Bientôt — titre de section', true),
  ('destinations-sardaigne-alghero', 'hero_eyebrow', 'text', 'Italie — Bientôt', 'Bientôt — surtitre', true),
  ('destinations-sardaigne-alghero', 'hero_title', 'text', 'Alghero', 'Bientôt — titre', true),
  ('destinations-sardaigne-alghero', 'hero_teaser', 'textarea', 'La cité catalane fortifiée face au couchant.', 'Bientôt — accroche', true),
  ('destinations-sardaigne-alghero', 'section_title', 'text', 'On prépare le guide alghero — à notre façon.', 'Bientôt — titre de section', true),
  ('destinations-sardaigne-asinara', 'hero_eyebrow', 'text', 'Italie — Bientôt', 'Bientôt — surtitre', true),
  ('destinations-sardaigne-asinara', 'hero_title', 'text', 'Asinara', 'Bientôt — titre', true),
  ('destinations-sardaigne-asinara', 'hero_teaser', 'textarea', 'L''île prison, ses ânes blanchis, son exclusivité.', 'Bientôt — accroche', true),
  ('destinations-sardaigne-asinara', 'section_title', 'text', 'On prépare le guide asinara — à notre façon.', 'Bientôt — titre de section', true),
  ('destinations-sardaigne-cagliari', 'hero_eyebrow', 'text', 'Italie — Bientôt', 'Bientôt — surtitre', true),
  ('destinations-sardaigne-cagliari', 'hero_title', 'text', 'Cagliari', 'Bientôt — titre', true),
  ('destinations-sardaigne-cagliari', 'hero_teaser', 'textarea', 'Bastions de pierre, flamants roses et lagunes.', 'Bientôt — accroche', true),
  ('destinations-sardaigne-cagliari', 'section_title', 'text', 'On prépare le guide cagliari — à notre façon.', 'Bientôt — titre de section', true),
  ('destinations-sardaigne-costa-smeralda', 'hero_eyebrow', 'text', 'Italie — Bientôt', 'Bientôt — surtitre', true),
  ('destinations-sardaigne-costa-smeralda', 'hero_title', 'text', 'Costa Smeralda', 'Bientôt — titre', true),
  ('destinations-sardaigne-costa-smeralda', 'hero_teaser', 'textarea', 'Eaux turquoises et criques de granit sculptées.', 'Bientôt — accroche', true),
  ('destinations-sardaigne-costa-smeralda', 'section_title', 'text', 'On prépare le guide costa smeralda — à notre façon.', 'Bientôt — titre de section', true),
  ('destinations-sardaigne-nuoro', 'hero_eyebrow', 'text', 'Italie — Bientôt', 'Bientôt — surtitre', true),
  ('destinations-sardaigne-nuoro', 'hero_title', 'text', 'Nuoro', 'Bientôt — titre', true),
  ('destinations-sardaigne-nuoro', 'hero_teaser', 'textarea', 'Le cœur sauvage et traditionnel de la Barbagia.', 'Bientôt — accroche', true),
  ('destinations-sardaigne-nuoro', 'section_title', 'text', 'On prépare le guide nuoro — à notre façon.', 'Bientôt — titre de section', true),
  ('destinations-colombie-bogota', 'hero_eyebrow', 'text', 'Colombie — Bientôt', 'Bientôt — surtitre', true),
  ('destinations-colombie-bogota', 'hero_title', 'text', 'Bogota', 'Bientôt — titre', true),
  ('destinations-colombie-bogota', 'hero_teaser', 'textarea', 'Cité andine perchée à 2 600 mètres d''altitude.', 'Bientôt — accroche', true),
  ('destinations-colombie-bogota', 'section_title', 'text', 'On prépare le guide bogota — à notre façon.', 'Bientôt — titre de section', true),
  ('destinations-colombie-cali', 'hero_eyebrow', 'text', 'Colombie — Bientôt', 'Bientôt — surtitre', true),
  ('destinations-colombie-cali', 'hero_title', 'text', 'Cali', 'Bientôt — titre', true),
  ('destinations-colombie-cali', 'hero_teaser', 'textarea', 'Capitale mondiale de la salsa et joie de vivre.', 'Bientôt — accroche', true),
  ('destinations-colombie-cali', 'section_title', 'text', 'On prépare le guide cali — à notre façon.', 'Bientôt — titre de section', true),
  ('destinations-colombie-cartago', 'hero_eyebrow', 'text', 'Colombie — Bientôt', 'Bientôt — surtitre', true),
  ('destinations-colombie-cartago', 'hero_title', 'text', 'Cartago', 'Bientôt — titre', true),
  ('destinations-colombie-cartago', 'hero_teaser', 'textarea', 'Héritage colonial au cœur de la région du café.', 'Bientôt — accroche', true),
  ('destinations-colombie-cartago', 'section_title', 'text', 'On prépare le guide cartago — à notre façon.', 'Bientôt — titre de section', true),
  ('destinations-colombie-medellin', 'hero_eyebrow', 'text', 'Colombie — Bientôt', 'Bientôt — surtitre', true),
  ('destinations-colombie-medellin', 'hero_title', 'text', 'Medellin', 'Bientôt — titre', true),
  ('destinations-colombie-medellin', 'hero_teaser', 'textarea', 'La ville de l''éternel printemps et de la transformation.', 'Bientôt — accroche', true),
  ('destinations-colombie-medellin', 'section_title', 'text', 'On prépare le guide medellin — à notre façon.', 'Bientôt — titre de section', true)
ON CONFLICT (page, zone_key) DO UPDATE
   SET value = EXCLUDED.value, is_active = true, updated_at = now();

-- 3. Restaure les accents des teasers (cms_sub_destinations).

UPDATE public.cms_sub_destinations SET teaser = 'La cité baroque au pied de l''Etna.', updated_at = now() WHERE slug = 'catane';
UPDATE public.cms_sub_destinations SET teaser = 'Marchés de rue animés et joyaux arabo-normands.', updated_at = now() WHERE slug = 'palerme';
UPDATE public.cms_sub_destinations SET teaser = 'L''île d''Ortygie et des vestiges grecs légendaires.', updated_at = now() WHERE slug = 'syracuse';
UPDATE public.cms_sub_destinations SET teaser = 'La cité catalane fortifiée face au couchant.', updated_at = now() WHERE slug = 'alghero';
UPDATE public.cms_sub_destinations SET teaser = 'Bastions de pierre, flamants roses et lagunes.', updated_at = now() WHERE slug = 'cagliari';
UPDATE public.cms_sub_destinations SET teaser = 'Eaux turquoises et criques de granit sculptées.', updated_at = now() WHERE slug = 'costa-smeralda';
UPDATE public.cms_sub_destinations SET teaser = 'Le cœur sauvage et traditionnel de la Barbagia.', updated_at = now() WHERE slug = 'nuoro';
UPDATE public.cms_sub_destinations SET teaser = 'Cité andine perchée à 2 600 mètres d''altitude.', updated_at = now() WHERE slug = 'bogota';
UPDATE public.cms_sub_destinations SET teaser = 'Capitale mondiale de la salsa et joie de vivre.', updated_at = now() WHERE slug = 'cali';
UPDATE public.cms_sub_destinations SET teaser = 'Héritage colonial au cœur de la région du café.', updated_at = now() WHERE slug = 'cartago';
UPDATE public.cms_sub_destinations SET teaser = 'La ville de l''éternel printemps et de la transformation.', updated_at = now() WHERE slug = 'medellin';
UPDATE public.cms_sub_destinations SET teaser = 'Le théâtre antique face à la mer ionienne.', updated_at = now() WHERE slug = 'taormine';

-- ═══════════════════════════════════════════════════════════════════════
-- 20261016150000_blank_generic_local_tip.sql
-- ═══════════════════════════════════════════════════════════════════════
-- Neutralise le conseil local generique duplique sur 23 pages.
--
-- POURQUOI
-- 37 pages portaient mot pour mot le meme conseil :
--   « Prends le temps de visiter les lieux d'interet en debut de matinee et
--     d'echanger avec les habitants pour denicher les meilleures adresses
--     de quartier. »
-- Ce n'est pas un conseil : c'est un texte de remplissage, identique partout,
-- qui se presente comme une recommandation. Il ne doit pas rester affiche.
--
-- CE QU'ON FAIT
-- On vide la valeur (on ne supprime pas la ligne, on ne la desactive pas) :
--   * le gabarit masque le bloc « Notre conseil » quand la valeur est vide ;
--   * la zone reste active et visible en mode edition -> le CMS reste propre,
--     les proprietaires peuvent y saisir un vrai conseil quand ils en auront un.
-- On ne remplace par rien : on n'invente pas un conseil par ville.
--
-- PERIMETRE
-- Les 23 pages concernees a ce stade : IdF (4), Madere (12), Normandie (3),
-- Porto, Roumanie (3). Les 14 autres (Sicile/Sardaigne/Colombie) sont deja
-- traitees par 20261016140000_subdest_coming_soon.sql, qui desactive leurs zones.
--
-- Les 4 vrais conseils (Lisbonne, Madere/Porto Moniz, Brasov, Cluj) ne
-- correspondent PAS a ce motif : ils sont intacts.
--
-- ROLLBACK :
--   Impossible de restaurer le texte d'origine automatiquement (il etait
--   identique partout). Le reecrire n'aurait aucun interet : c'est justement
--   ce qu'on retire. En cas de besoin, ressaisir via le CMS.

UPDATE public.cms_editable_zones
   SET value = '', updated_at = now()
 WHERE zone_key = 'local_tip'
   AND is_active = true
   AND value LIKE 'Prends le temps de visiter les lieux d''intérêt en début de matinée%';

COMMIT;
