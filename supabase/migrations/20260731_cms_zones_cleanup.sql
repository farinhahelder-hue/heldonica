-- ============================================================================
-- Nettoyage cms_editable_zones — préalable à l'activation du rendu public
-- Date: 2026-07-31
-- ============================================================================
-- Contexte : jusqu'ici, InlineEditProvider ne fournissait le contexte d'édition
-- qu'aux admins connectés (`if (!admin) return <>{children}</>`). Tous les
-- <EditableZone> affichaient donc leur fallback codé en dur pour les visiteurs.
-- Le correctif de rendu public rendrait visibles d'un coup 207 zones — dont
-- plusieurs héritées d'un autre projet.
--
-- Ce fichier neutralise ce qui ne doit pas être publié, AVANT le correctif.
-- Aucune ligne n'est supprimée : on passe is_active à false, ce qui est
-- réversible d'un UPDATE et conserve l'historique éditorial.
--
-- Après désactivation, chaque zone retombe sur le fallback du code, qui est le
-- contenu Heldonica actuellement servi au public. Aucune régression visible.
-- ============================================================================


-- ─── 1. Résidus de l'ancien projet « Happy Humans / coaching » ───────────────
--
-- Ces zones décrivent une autre activité (coaching en entreprise) et nomment une
-- personne. Deux problèmes distincts :
--
--   a) Elles sont déjà servies au public. `lib/home-data.ts:190` charge TOUTES
--      les zones actives de la page 'home' et passe la map en props à
--      HomeClient. Même les clés qu'aucun composant ne lit finissent donc
--      sérialisées dans le payload HTML. Vérifié le 2026-07-31 sur
--      https://www.heldonica.fr/ : « Monica Schneider », « Executive Coach »,
--      « AoEC », « EMCC », « Philosophical », « Découvrir le coaching » sont
--      présents une fois chacun dans le HTML servi — donc lus par Googlebot.
--
--   b) Le contenu public Heldonica ne nomme jamais les fondateurs : les
--      portraits restent indéfinis (« L'un… », « L'autre… »). Publier un
--      prénom+nom contredit cette règle éditoriale.
--
-- `mentions-legales.content` est le cas le plus sensible : il porte l'identité
-- légale d'une AUTRE entité (« Happy Humans — Monica Schneider » +
-- happyhumans.coaching@gmail.com) sur la page mentions légales d'Heldonica.
-- Aucun EditableZone ne le lit aujourd'hui, mais le laisser actif c'est prendre
-- le risque qu'un futur composant l'affiche.

UPDATE public.cms_editable_zones SET is_active = false, updated_at = NOW()
WHERE is_active AND (page, zone_key) IN (
  ('home',             'section_about_title'),   -- « Monica Schneider »
  ('home',             'section_about_text'),    -- « Executive Coach certifiée AoEC… »
  ('home',             'hero_cta'),              -- « Découvrir le coaching »
  ('home',             'newsletter_subtitle'),   -- « Réflexions sur le leadership… »
  ('a-propos',         'page_title'),            -- « Monica Schneider — leadership, coaching… »
  ('a-propos',         'bio_text'),              -- « …Executive Coach certifiée AoEC et EMCC… »
  ('a-propos',         'intro_text'),            -- « Une pratique née au croisement… »
  ('contact',          'intro_text'),            -- « …réserver une séance découverte ? Écrivez-moi. »
  ('mentions-legales', 'content')                -- identité légale d'une autre entité
);


-- ─── 2. Images de stock (décisions A2 : aucune photo stock) ──────────────────
--
-- Toutes pointent vers images.unsplash.com. `a-propos.hero_image_url` est la
-- seule effectivement lue par un EditableZone : elle deviendrait visible avec
-- le correctif. Les autres sont orphelines aujourd'hui, mais on les neutralise
-- au même titre pour qu'un futur câblage ne les republie pas par accident.
--
-- Fallback du code pour a-propos.hero_image_url : '/og-default.jpg'.

UPDATE public.cms_editable_zones SET is_active = false, updated_at = NOW()
WHERE is_active AND value ~* '(unsplash|pexels|pixabay|shutterstock|istockphoto|gettyimages)';


-- ─── 3. Travel Planning — vouvoiement sur une page B2C ───────────────────────
--
-- La charte impose le tutoiement en B2C ; ces zones sont en vouvoiement et
-- cohabitaient avec des zones tutoyées sur la même page. Elles deviendraient
-- publiques avec le correctif. On réécrit plutôt que de désactiver : le
-- contenu est bon, seul le registre est faux.

UPDATE public.cms_editable_zones SET value =
  'Un voyage pensé pour toi, pas un itinéraire générique. Remplis le formulaire et on te prépare quelque chose d''unique.',
  updated_at = NOW()
WHERE page = 'travel-planning' AND zone_key = 'cta_text';

-- Volontairement NON modifiées, malgré la détection automatique :
--   faq_2_q « La destination doit-elle être dans votre liste ? »
--   faq_4_q « Travaillez-vous avec des agences partenaires ? »
-- Le « vous » y désigne Heldonica, pas le lecteur : c'est le visiteur qui
-- s'adresse à nous. Ce n'est donc pas un vouvoiement du lecteur.

UPDATE public.cms_editable_zones SET value =
  'Oui, jusqu''à 2 allers-retours inclus dans la formule. On ajuste jusqu''à ce que le planning soit parfait pour toi.',
  updated_at = NOW()
WHERE page = 'travel-planning' AND zone_key = 'faq_3_a';

UPDATE public.cms_editable_zones SET value =
  '1h de brief en visio pour cerner tes envies', updated_at = NOW()
WHERE page = 'travel-planning' AND zone_key = 'plan_1_feature_3';

-- promise_1_text « Chaque jour pensé pour vous deux » : « vous deux » s'adresse
-- au couple au pluriel, ce n'est pas un vouvoiement de politesse. Conservé.

UPDATE public.cms_editable_zones SET value =
  '5 minutes pour nous dire tes envies, tes contraintes et ton budget.', updated_at = NOW()
WHERE page = 'travel-planning' AND zone_key = 'step_1_text';

UPDATE public.cms_editable_zones SET value =
  'On analyse, on conçoit et on t''envoie une proposition détaillée.', updated_at = NOW()
WHERE page = 'travel-planning' AND zone_key = 'step_2_text';

UPDATE public.cms_editable_zones SET value =
  'Allers-retours jusqu''à la perfection — ton voyage, pas le nôtre.', updated_at = NOW()
WHERE page = 'travel-planning' AND zone_key = 'step_3_text';


-- ─── 4. Travel Planning — divergences sur l'offre commerciale ────────────────
--
-- plan_3_feature_1 : « Tout la Complète » — faute d'accord, deviendrait visible.
UPDATE public.cms_editable_zones SET value = 'Tout de la Complète', updated_at = NOW()
WHERE page = 'travel-planning' AND zone_key = 'plan_3_feature_1';

-- plan_3_feature_4 : le CMS promet « Conciergerie dédiée 24/7 » là où le code
-- (donc la page publique actuelle) promet « Disponibilité WhatsApp pendant le
-- voyage ». C'est un engagement commercial différent sur une formule payante :
-- le publier serait une décision business, pas une correction technique.
-- On désactive pour conserver la promesse actuellement affichée ; à trancher
-- côté éditorial puis réactiver ou réécrire.
UPDATE public.cms_editable_zones SET is_active = false, updated_at = NOW()
WHERE page = 'travel-planning' AND zone_key = 'plan_3_feature_4';


-- ─── Vérifications (lecture seule) ──────────────────────────────────────────

SELECT 'Résidus coaching encore actifs' AS controle, count(*)::text AS n,
       CASE WHEN count(*) = 0 THEN 'OK' ELSE 'ECHEC' END AS verdict
FROM public.cms_editable_zones
WHERE is_active AND value ~* '(Monica|Schneider|Happy Humans|Executive Coach|AoEC|EMCC|Philosophical)';

SELECT 'Images stock encore actives' AS controle, count(*)::text AS n,
       CASE WHEN count(*) = 0 THEN 'OK' ELSE 'ECHEC' END AS verdict
FROM public.cms_editable_zones
WHERE is_active AND value ~* '(unsplash|pexels|pixabay|shutterstock)';

SELECT page, count(*) AS zones_actives
FROM public.cms_editable_zones WHERE is_active GROUP BY page ORDER BY page;
