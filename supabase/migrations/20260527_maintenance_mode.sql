-- Add maintenance mode settings to site_settings table (key/value structure)
-- This creates the necessary rows if they don't exist

INSERT INTO site_settings (key, value, label, type, updated_at)
VALUES 
  ('maintenance_mode', 'false', 'Mode Maintenance', 'boolean', NOW())
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_settings (key, value, label, type, updated_at)
VALUES 
  ('maintenance_message', 'On revient très vite avec de nouvelles pépites ! 🌿', 'Message Maintenance', 'text', NOW())
ON CONFLICT (key) DO NOTHING;