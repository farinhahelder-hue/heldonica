-- Migration 20261023170000_maintenance_message_sans_emoji.sql
-- Lot 2, priorité 3 : retirer l'emoji de `maintenance_message`.
--
-- Thème de l'audit : supprimer TOUS les emojis. La valeur en base
-- `site_settings.maintenance_message` portait « … de nouvelles pépites ! 🌿 »,
-- valeur héritée de la migration 20260527_maintenance_mode.sql et réinsérée par
-- six migrations suivantes (20260602, 20260610 ×2, 20260611, 20260613, seed).
--
-- Note de périmètre : ce réglage est aujourd'hui ORPHELIN — aucune ligne de
-- code ne le lit (`app/maintenance/page.tsx` lit la zone CMS
-- `page='maintenance', zone_key='message'`, dont la valeur en base est déjà
-- sans emoji). Le nettoyage est donc sans effet visible : il retire l'emoji de
-- la donnée et des installations futures, pour que le champ soit propre si on
-- le branche un jour.
--
-- Retour arrière : UPDATE ... SET value = value || ' 🌿' WHERE key = 'maintenance_message'.

UPDATE public.site_settings
SET value = 'On revient très vite avec de nouvelles pépites !'
WHERE key = 'maintenance_message'
  AND value LIKE '%🌿%';
