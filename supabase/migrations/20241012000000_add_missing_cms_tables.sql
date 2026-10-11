-- Missing table definitions as discovered by check-cms-drift.mjs

-- 1. cms_accommodations (from lib/cms-hospitality.ts and lib/cms-releases.ts)
CREATE TABLE IF NOT EXISTS public.cms_accommodations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  destination_slug text,
  type text NOT NULL,
  capacity integer NOT NULL DEFAULT 1,
  surface_m2 integer,
  price_per_night numeric,
  direct_booking_url text,
  description text NOT NULL,
  amenities jsonb DEFAULT '[]'::jsonb,
  photos jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'draft',
  created_by text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 2. cms_api_tokens (from lib/cms-tokens.ts)
CREATE TABLE IF NOT EXISTS public.cms_api_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  scopes jsonb DEFAULT '[]'::jsonb,
  created_by text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  last_used_at timestamp with time zone,
  expires_at timestamp with time zone,
  is_active boolean DEFAULT true
);

-- 3. cms_audit_log (from lib/cms-audit.ts)
CREATE TABLE IF NOT EXISTS public.cms_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  user_role text NOT NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  before_state jsonb,
  after_state jsonb,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 4. cms_post_revisions (from lib/cms-revisions.ts)
CREATE TABLE IF NOT EXISTS public.cms_post_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id bigint NOT NULL REFERENCES public.cms_blog_posts(id) ON DELETE CASCADE,
  title text,
  content text,
  excerpt text,
  author_id text,
  revision_note text,
  created_by text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 5. cms_releases (from lib/cms-releases.ts)
CREATE TABLE IF NOT EXISTS public.cms_releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  version text,
  status text NOT NULL DEFAULT 'draft',
  release_date timestamp with time zone,
  items jsonb DEFAULT '[]'::jsonb,
  created_by text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  published_at timestamp with time zone
);

-- 6. cms_webhooks and cms_webhook_deliveries (from lib/cms-webhooks.ts)
CREATE TABLE IF NOT EXISTS public.cms_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  events jsonb DEFAULT '[]'::jsonb,
  secret text,
  is_active boolean DEFAULT true,
  created_by text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.cms_webhook_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id uuid NOT NULL REFERENCES public.cms_webhooks(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  status_code integer,
  response_body text,
  duration_ms integer,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 7. cms_zone_variants (from lib/cms-targeting.ts)
CREATE TABLE IF NOT EXISTS public.cms_zone_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id bigint NOT NULL REFERENCES public.cms_editable_zones(id) ON DELETE CASCADE,
  name text NOT NULL,
  targeting_rules jsonb NOT NULL,
  content jsonb NOT NULL,
  priority integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 8. photo_blocks (from app/api/cms/photos/upload/route.ts)
CREATE TABLE IF NOT EXISTS public.photo_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id text NOT NULL,
  album_id text NOT NULL,
  url text NOT NULL,
  caption text,
  alt_text text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_by text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);
