-- Migration: Création des tables de commentaires et webhooks Instagram
-- Date: 2026-09-01

CREATE TABLE IF NOT EXISTS public.instagram_comments (
  id BIGSERIAL PRIMARY KEY,
  ig_comment_id TEXT NOT NULL UNIQUE,
  media_id TEXT,
  media_permalink TEXT,
  parent_id TEXT,
  username TEXT NOT NULL,
  text TEXT NOT NULL,
  sentiment TEXT DEFAULT 'neutral',
  status TEXT NOT NULL DEFAULT 'pending_review', -- 'pending_review', 'approved', 'rejected', 'auto_replied'
  ai_draft TEXT,
  ai_confidence NUMERIC(3, 2),
  reply_published TEXT,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.instagram_webhook_logs (
  id BIGSERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT FALSE,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ig_comments_status ON public.instagram_comments(status);
CREATE INDEX IF NOT EXISTS idx_ig_comments_media_id ON public.instagram_comments(media_id);
CREATE INDEX IF NOT EXISTS idx_ig_comments_created_at ON public.instagram_comments(created_at DESC);
