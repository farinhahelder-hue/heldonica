-- Migration: Add Le Havre and Hyères to CMS Pillar Pages
-- Date: 2026-07-30
-- Purpose: Expand hub destinations with two new French coastal destinations

INSERT INTO cms_pillar_pages (slug, name, country, published, created_at, updated_at)
VALUES
  ('le-havre', 'Le Havre', 'France', true, now(), now()),
  ('hyeres', 'Hyères', 'France', true, now(), now())
ON CONFLICT (slug) DO UPDATE SET
  published = EXCLUDED.published,
  updated_at = now();

-- Validation
SELECT slug, name, country, published FROM cms_pillar_pages WHERE slug IN ('le-havre', 'hyeres');
