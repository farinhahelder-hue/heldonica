-- Fix CHECK constraint on cms_editable_zones.zone_type
-- The original constraint only allowed: 'text', 'image', 'cta', 'color', 'boolean'
-- But the EditableZone component and seed SQL use: 'text', 'textarea', 'image', 'html'
-- We must add 'textarea' and 'html' to the allowed types

ALTER TABLE cms_editable_zones DROP CONSTRAINT IF EXISTS cms_editable_zones_zone_type_check;

ALTER TABLE cms_editable_zones ADD CONSTRAINT cms_editable_zones_zone_type_check
    CHECK (zone_type IN ('text', 'textarea', 'image', 'html', 'cta', 'color', 'boolean'));
