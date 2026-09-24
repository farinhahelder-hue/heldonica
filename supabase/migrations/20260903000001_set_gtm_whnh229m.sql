-- GTM container pour Heldonica — priority_5 ai_context
-- ID fourni: GTM-WHNH229M (Google Tag Manager)
-- Règle AGENTS.md: toute écriture prod via migration versionnée

INSERT INTO public.site_settings (key, value, updated_at)
VALUES ('google_analytics_id', 'GTM-WHNH229M', now())
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

INSERT INTO public.site_settings (key, value, updated_at)
VALUES ('gtm_id', 'GTM-WHNH229M', now())
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

INSERT INTO public.site_settings (key, value, updated_at)
VALUES ('ga_measurement_id', 'GTM-WHNH229M', now())
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
