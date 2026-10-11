-- Missing CMS tables
CREATE TABLE IF NOT EXISTS public.cms_accommodations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  name text NOT NULL,
  location text,
  status text DEFAULT 'draft'
);

CREATE TABLE IF NOT EXISTS public.cms_api_tokens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  token text NOT NULL UNIQUE,
  name text NOT NULL
);

CREATE TABLE IF NOT EXISTS public.cms_audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL
);

CREATE TABLE IF NOT EXISTS public.cms_post_revisions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  post_id text NOT NULL,
  content jsonb NOT NULL
);

CREATE TABLE IF NOT EXISTS public.cms_releases (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  name text NOT NULL,
  status text DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS public.cms_webhook_deliveries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  webhook_id text NOT NULL,
  status text NOT NULL
);

CREATE TABLE IF NOT EXISTS public.cms_webhooks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  url text NOT NULL,
  events jsonb DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS public.cms_zone_variants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  zone_id text NOT NULL,
  variant_name text NOT NULL
);

CREATE TABLE IF NOT EXISTS public.photo_blocks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  post_id text NOT NULL,
  photo_url text NOT NULL
);
