-- Rotation des clés API agents : antigravity, claude, pencode, mobile_apk
-- Générée par scripts/seed_agent_keys.mjs le 2026-09-16T13:46:40.949Z.
-- Les jetons ne sont pas ici (seulement leurs SHA-256) : ils sont dans
-- .agent-keys.local sur le poste qui a lancé le script.

UPDATE public.api_keys
SET is_active = false
WHERE name IN ('antigravity', 'claude', 'pencode', 'mobile_apk') AND is_active;

INSERT INTO public.api_keys (name, key_prefix, key_hash, rate_limit, is_active)
VALUES
  ('antigravity', 'hld_ag_', 'e5563b75763305f4ed151d0bbb45309cd98f5c3c1d3e3aff850c7953928dc1c1', 120, true),
  ('claude', 'hld_cl_', 'dbba29e22e7b1310f81bcb21be9d3ed2a76a36e053fa1a93a55dc70f9c978a18', 120, true),
  ('pencode', 'hld_pe_', '64811438be45e64c7be0c3fba4a223a34a448f524394adb6da04af134a5a9f3f', 100, true),
  ('mobile_apk', 'hld_mb_', 'cb3384a58f3054b6f08f97240faf5276507ffccbb5d19d7a8cd22b2b00005627', 150, true)
ON CONFLICT (key_hash) DO UPDATE SET is_active = true, rate_limit = EXCLUDED.rate_limit;
