-- ============================================================
-- MIGRATION : Restreindre cms_carousel_history à service_role
-- Policy actuelle "Admins can manage" utilise USING (true)
-- = tout authenticated peut lire/écrire. Trop large.
-- ============================================================

DROP POLICY IF EXISTS "Admins can manage carousel history" ON public.cms_carousel_history;

CREATE POLICY "service_role_only_carousel_history"
  ON public.cms_carousel_history FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
