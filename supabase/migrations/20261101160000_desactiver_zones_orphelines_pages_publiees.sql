-- ============================================================================
-- Désactiver les zones actives qu'AUCUN composant ne rend, sur des pages
-- PUBLIÉES (donc visibles par le public).
--
-- Contexte (mesuré le 2026-11-01 avec `npm run check:cms-zones` contre la base
-- de production) :
--
--   Le 2026-11-01, 76 pages de destination ont été réécrites (28 111 insertions)
--   par plusieurs agents : le gabarit partagé `SubDestinationTemplate` (66
--   lignes) a été remplacé par du code autonome (jusqu'à 522 lignes). Ce
--   gabarit rendait `cta_*`, `related_title`, `highlight_*`, `day_*`. Les pages
--   réécrites ne les rendent plus, mais leurs zones sont restées `is_active =
--   true` en base. Le contrôle « Zones et tables CMS » est passé au rouge.
--
--   Distinction faite par le contrôle après correction du script :
--     - 282 zones sur 29 pages en QUARANTAINE (lib/unpublished-pages.ts) : la
--       page rend « Bientôt », son contenu n'est pas publié. Ce ne sont PAS des
--       orphelines — elles reviennent en service dès que la page quitte le
--       registre. Aucun geste ici (dette assumée, visible dans la sortie).
--     - 12 zones sur 2 pages PUBLIÉES : elles ne sont rendues nulle part, et la
--       page est en ligne. C'est le défaut que cette migration ferme.
--
-- Pourquoi DÉSACTIVER plutôt que SUPPRIMER (règle du propriétaire : « je ne veux
-- rien supprimer ») :
--   - `is_active = false` est le seul état de publication de la table. La ligne,
--     sa valeur et son libellé restent consultables au CMS ;
--   - réactiver une zone rend son texte à nouveau éditable ET rendu (si le code
--     la lit de nouveau) : aucun contenu n'est perdu ;
--   - même précédent que 20261023180000_zones_actives_vides_desactivees.sql.
--
-- Les 12 zones, et pourquoi chacune est morte :
--
--   1. `destinations-roumanie-bucarest` (page PUBLIÉE, réécrite le 2026-11-01)
--      cta_kicker, cta_title, cta_text, cta_button_1, cta_button_2, related_title
--      Ce sont les clés du gabarit `SubDestinationTemplate` disparu. La page
--      autonome qui les remplace n'a plus de bloc CTA ni de bloc « même veine » ;
--      elle se termine par le conseil local et les liaisons pratiques. La
--      réécriture a donc retiré la section, pas le contenu : on ne réinvente pas
--      un CTA (les boutons n'ont d'ailleurs pas d'URL dans les zones — les
--      recâbler produirait des boutons morts, exactement le « contenu
--      incohérent » que le propriétaire signale).
--
--   2. `expert-hotelier` (page PUBLIÉE)
--      cas_1_tags, cas_2_tags, cas_clients_badge, cas_clients_text,
--      cas_clients_title, hero_cta_2
--      Le bloc « Ils nous font confiance / études de cas » était masqué
--      DÉLIBÉRÉMENT dans le code depuis le 19/10/2026 (`SHOW_CASE_STUDIES =
--      false`) : « tant que le fondateur n'a pas confirmé qu'il s'agit de vrais
--      clients, avec accord pour citer leurs chiffres ». Règle n°1 du dépôt :
--      « on n'invente rien ». La réécriture du 2026-11-01 a supprimé le bloc
--      masqué, et `hero_cta_2` (« Voir nos retours d'expérience ») avec lui —
--      il pointait vers une section qui n'existe plus. On ne les réaffiche PAS :
--      les témoignages ne sont pas vérifiés. On les désactive pour que le CMS
--      ne les présente plus comme des blocs pilotables, sans perdre le texte.
--
-- Retour arrière :
--   UPDATE public.cms_editable_zones SET is_active = true, updated_at = NOW()
--   WHERE (page = 'destinations-roumanie-bucarest' AND zone_key IN
--            ('cta_kicker','cta_title','cta_text','cta_button_1','cta_button_2','related_title'))
--      OR (page = 'expert-hotelier' AND zone_key IN
--            ('cas_1_tags','cas_2_tags','cas_clients_badge','cas_clients_text','cas_clients_title','hero_cta_2'));
--
-- Idempotent : rejouer la migration ne change rien (les lignes sont déjà
-- inactives, et le WHERE exige is_active = true).
-- ============================================================================

begin;

update public.cms_editable_zones
   set is_active = false,
       updated_at = now()
 where is_active = true
   and (
        (page = 'destinations-roumanie-bucarest'
         and zone_key in ('cta_kicker', 'cta_title', 'cta_text',
                          'cta_button_1', 'cta_button_2', 'related_title'))
     or (page = 'expert-hotelier'
         and zone_key in ('cas_1_tags', 'cas_2_tags', 'cas_clients_badge',
                          'cas_clients_text', 'cas_clients_title', 'hero_cta_2'))
   );

commit;
