-- Create carousel history table
CREATE TABLE IF NOT EXISTS public.cms_carousel_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL,
  title TEXT,
  caption TEXT,
  hashtags TEXT[] DEFAULT '{}',
  slides JSONB DEFAULT '[]',
  images TEXT[] DEFAULT '{}',
  cms_password TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS
ALTER TABLE public.cms_carousel_history ENABLE ROW LEVEL SECURITY;

-- Policy for admin
CREATE POLICY "Admins can manage carousel history" ON public.cms_carousel_history
  FOR ALL USING (true);

-- Insert existing localStorage data (will be done via API migration)
-- This creates the API endpoint /api/cms/carousel-history