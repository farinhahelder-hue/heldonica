-- Migration: Add focal_point metadata column to media storage
-- This stores the focal point coordinates for responsive image cropping
-- Run this in Supabase SQL Editor

BEGIN;

-- Note: Supabase Storage doesn't have a direct metadata column for files
-- We'll store focal point data in a separate table linked by file path
CREATE TABLE IF NOT EXISTS media_focal_points (
  id BIGSERIAL PRIMARY KEY,
  file_path TEXT UNIQUE NOT NULL,
  focal_x DECIMAL(3,2) DEFAULT 0.5,
  focal_y DECIMAL(3,2) DEFAULT 0.5,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_focal_points_path ON media_focal_points(file_path);

COMMIT;
