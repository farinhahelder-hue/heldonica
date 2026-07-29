-- ============================================================
-- HELDONICA — Backup ciblé avant correction hero_image_url /travel-planning
-- 1 ligne, table cms_editable_zones
-- ============================================================

UPDATE cms_editable_zones SET
    page = 'travel-planning',
    zone_key = 'hero_image_url',
    zone_type = 'image',
    value = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&h=1080&fit=crop',
    default_val = NULL,
    label = NULL,
    description = NULL,
    is_active = true,
    updated_at = '2026-07-02T14:31:36.102983+00:00'
WHERE id = '66975aff-27cc-4217-9649-c48b73065585';
