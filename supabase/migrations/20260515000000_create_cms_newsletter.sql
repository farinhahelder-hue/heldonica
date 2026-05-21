-- Create newsletter subscriptions table (simplified)
CREATE TABLE IF NOT EXISTS public.cms_newsletter (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  source TEXT DEFAULT 'website',
  subscribed BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.cms_newsletter ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (PUBLIC write)
CREATE POLICY "Public insert newsletter" ON public.cms_newsletter
  FOR INSERT WITH CHECK (true);

-- Allow public to select (read)
CREATE POLICY "Public select newsletter" ON public.cms_newsletter
  FOR SELECT USING (true);

COMMENT ON TABLE public.cms_newsletter IS 'Newsletter subscribers for Heldonica email list';