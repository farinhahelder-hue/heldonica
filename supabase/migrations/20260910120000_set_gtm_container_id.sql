-- Identifiant du conteneur Google Tag Manager fourni par l'utilisateur.
--
-- GTM-WHNH229M est un conteneur Tag Manager, pas une mesure GA4. Il va donc
-- dans seo_gtm_id, et non dans seo_google_analytics_id que l'ecran d'admin
-- documente comme un G-XXXXXXXXXX.
--
-- La table visee est site_settings : c'est celle que lisent getSiteSettings()
-- et l'ecran d'admin. Les deux cles SEO n'avaient ete posees que dans
-- cms_settings (migration 20260501000000), que plus rien ne lit — le champ
-- "GTM ID" de l'admin s'affichait donc toujours vide.
--
-- ATTENTION, cette ligne ne change encore rien pour le visiteur : app/layout.tsx
-- charge gtag.js avec G-JDJNTZLBJS ecrit en dur et ne consulte ni cette cle ni
-- l'autre. Le branchement reste a faire, et il demande un arbitrage (GTM a la
-- place de gtag.js, ou a cote).

INSERT INTO site_settings (key, value, label, type)
VALUES ('seo_gtm_id', 'GTM-WHNH229M', 'GTM Container ID', 'text')
ON CONFLICT (key) DO UPDATE
  SET value = EXCLUDED.value,
      label = EXCLUDED.label,
      updated_at = NOW();
