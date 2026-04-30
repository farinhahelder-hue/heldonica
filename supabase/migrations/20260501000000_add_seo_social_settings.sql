-- Add more SEO and social settings
INSERT INTO public.cms_settings (key, label, value, type) VALUES
  -- SEO
  ('seo_google_analytics_id', 'Google Analytics / GTM ID', '', 'text'),
  ('seo_gtm_id', 'GTM Container ID', '', 'text'),
  ('seo_sitemap_auto', 'Sitemap automatique', 'true', 'boolean'),
  ('seo_robots_txt', 'Robots.txt custom', '', 'text'),
  -- Social
  ('social_tiktok', 'TikTok', '', 'text'),
  ('social_youtube', 'YouTube', '', 'text'),
  ('social_linkedin', 'LinkedIn', '', 'text'),
  ('social_twitter', 'Twitter / X', '', 'text')
ON CONFLICT (key) DO NOTHING;