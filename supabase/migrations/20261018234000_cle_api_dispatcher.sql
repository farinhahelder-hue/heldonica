-- Rotation des clés API agents : dispatcher
-- Générée par scripts/seed_agent_keys.mjs le 2026-10-18T21:57:12.156Z.
-- Les jetons ne sont pas ici (seulement leurs SHA-256) : ils sont dans
-- .agent-keys.local sur le poste qui a lancé le script.

UPDATE public.api_keys
SET is_active = false
WHERE name IN ('dispatcher') AND is_active;

INSERT INTO public.api_keys (name, key_prefix, key_hash, rate_limit, is_active)
VALUES
  ('dispatcher', 'hld_dp_', '54385e46e238081f8514af3bbbac86746b20a4fc5f3889f695306b04dce5a3ea', 30, true)
ON CONFLICT (key_hash) DO UPDATE SET is_active = true, rate_limit = EXCLUDED.rate_limit;
