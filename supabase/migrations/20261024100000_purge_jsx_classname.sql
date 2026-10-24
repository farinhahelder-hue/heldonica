-- Migration 20261024100000_purge_jsx_classname.sql
-- Audit éditorial du lot 2 : retrait du JSX (`className=`) stocké comme du HTML.
--
-- Défaut : du JSX a été saisi dans des zones CMS et des articles comme si c'était
-- du HTML. Le contenu est injecté par `dangerouslySetInnerHTML` : le navigateur
-- reçoit un attribut `className` qu'il ne connaît pas, l'ignore, et la classe
-- Tailwind ne s'applique jamais. La couleur voulue est absente, sans aucune erreur
-- visible — c'est un défaut silencieux, pas un rendu cassé.
--
-- Le correctif de rendu (`lib/html-attributes.ts`, appelé par `normalizeZoneText`
-- et `markdownToHtml`) couvre déjà l'affichage. Cette migration nettoie la source
-- pour que la base ne serve plus jamais l'attribut fautif, y compris à un autre
-- consommateur que le site (export, email, application mobile).
--
-- Périmètre mesuré avant écriture (information_schema, 641 colonnes texte balayées) :
--   * `cms_editable_zones.value` : 18 lignes, une occurrence chacune
--     (destinations-alentejo intro_1/intro_2/quick_1_value/quick_4_value,
--      destinations-montenegro-kotor day_3_desc + info_1..4_item_1..3, home section_quiz_title) ;
--   * `cms_blog_posts.content` : 5 lignes — flotter-sur-la-limmat-zurich-aventure (25),
--     itineraire-slow-travel-roumanie-bucarest-apuseni (2, publié),
--     maramures-roumanie-authentique (2), petrovac-na-moru-sentier-pins-criques-forteresse (2),
--     roumanie-villages-caches (2).
-- Aucune autre table ni colonne n'en porte. Les balises concernées sont `strong`,
-- `em`, `span`, `img`, `a`, `table`, `thead`, `tr`, `th`, `td` : aucun exemple de
-- code pédagogique (`<code>`/`<pre>`) n'est touché — le risque de faux positif est nul.
--
-- `\m`/`\M` (limites de mot) évitent de toucher un identifiant qui se terminerait
-- par « className ». L'attribut est toujours précédé d'un blanc en HTML comme en JSX.
--
-- Retour arrière : UPDATE ... SET value = replace(value, ' class=', ' className=')
-- sur les mêmes clés, et idem sur `content`.

UPDATE public.cms_editable_zones
SET value = regexp_replace(value, '\mclassName(\s*)=', 'class\1=', 'g'),
    updated_at = now()
WHERE value ~ '\mclassName\M';

UPDATE public.cms_blog_posts
SET content = regexp_replace(content, '\mclassName(\s*)=', 'class\1=', 'g'),
    updated_at = now()
WHERE content ~ '\mclassName\M';
