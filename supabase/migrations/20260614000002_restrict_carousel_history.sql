-- Restreindre cms_carousel_history au service_role uniquement
-- La policy existante USING (true) permet à tout authenticated de lire/écrire

DROP POLICY IF EXISTS "Admins can manage carousel history" ON public.cms_carousel_history;

-- Seul le service_role backend peut accéder à l'historique des carrousels
CREATE POLICY "service_role manage carousel history"
  ON public.cms_carousel_history
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
