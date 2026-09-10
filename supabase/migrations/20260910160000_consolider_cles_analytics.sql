-- Une seule cle par identifiant, au lieu de quatre.
--
-- Etat trouve le 10 septembre : quatre cles portaient la meme valeur
-- GTM-WHNH229M. La migration 20260903000001 avait ecrit l'identifiant du
-- conteneur Tag Manager dans google_analytics_id et ga_measurement_id, qui
-- attendent un G-XXXXXXXXXX. Passer un GTM- a gtag('config') ne leve rien :
-- la mesure part simplement nulle part.
--
-- Aucune des quatre n'etait lue par le site avant le 10 septembre —
-- app/layout.tsx portait G-JDJNTZLBJS en dur. Les supprimer ne casse donc
-- rien, et layout.tsx verifie desormais la forme de ce qu'il lit.
--
-- La convention retenue est seo_*, celle de la migration 20260501000000 et de
-- l'ecran app/admin/settings. CmsSettingsPanel, qui employait le nom nu, s'y
-- range dans le meme lot.

INSERT INTO site_settings (key, value, label, type)
VALUES ('seo_google_analytics_id', 'G-JDJNTZLBJS', 'Google Analytics ID', 'text')
ON CONFLICT (key) DO UPDATE
  SET value = EXCLUDED.value,
      label = EXCLUDED.label,
      updated_at = NOW();

DELETE FROM site_settings
WHERE key IN ('google_analytics_id', 'ga_measurement_id', 'gtm_id');
