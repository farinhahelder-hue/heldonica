-- Add maintenance mode settings to site_settings table (key/value structure)
-- Columns: key, value only

INSERT INTO site_settings (key, value)
VALUES 
  ('maintenance_mode', 'false')
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_settings (key, value)
VALUES 
  ('maintenance_message', 'On revient très vite avec de nouvelles pépites ! 🌿')
ON CONFLICT (key) DO NOTHING;