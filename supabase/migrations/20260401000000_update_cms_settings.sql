-- Ajouter les colonnes nécessaires pour le CMS Manus si elles n'existent pas
ALTER TABLE cms_settings 
ADD COLUMN IF NOT EXISTS contact_email text,
ADD COLUMN IF NOT EXISTS hero_content jsonb DEFAULT '{}';

-- Mettre à jour les politiques RLS pour permettre l'insertion/mise à jour publique pour le test
-- (Note: En production, cela devrait être restreint aux utilisateurs authentifiés)
CREATE POLICY "Allow all for dev" ON cms_settings FOR ALL USING (true) WITH CHECK (true);
