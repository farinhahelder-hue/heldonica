// Centralise les filtres de groupes de paramètres CMS
// Utilisé par CmsAdminClient.tsx pour afficher les bons settings dans chaque onglet

export function matchSettingsGroup(key: string, group: string): boolean {
  switch (group) {
    case 'general':
      return [
        'site_name', 'site_title', 'site_url', 'site_description',
        'site_email', 'contact_email', 'contact_phone', 'site_tagline',
        'site_phone', 'site_logo', 'site_favicon',
      ].includes(key);

    case 'appearance':
      return [
        'primary_color', 'secondary_color', 'color_primary', 'color_secondary',
        'color_accent', 'color_background', 'color_text',
        'hero_overlay_color', 'hero_overlay_opacity', 'hero_banner_url',
        'button_primary_bg', 'button_primary_text',
        'button_secondary_bg', 'button_secondary_text',
        'font_heading', 'font_body', 'font_size_base',
        'container_max_width', 'header_sticky',
        'logo_url', 'favicon_url',
      ].includes(key);

    case 'social':
      return (
        key.startsWith('social_') ||
        key.startsWith('site_instagram') ||
        key.startsWith('site_facebook') ||
        key.startsWith('site_linkedin') ||
        key.startsWith('site_pinterest') ||
        key.startsWith('site_tiktok') ||
        key === 'instagram_url'
      );

    case 'seo':
      return (
        key.startsWith('seo_') ||
        key.startsWith('meta_') ||
        key === 'google_analytics_id'
      );

    case 'footer':
      return (
        key.startsWith('footer_') ||
        ['footer_text', 'footer_copyright', 'footer_tagline',
         'footer_cta_label', 'footer_cta_url', 'footer_legal',
         'footer_links', 'primary_cta_label', 'primary_cta_url'].includes(key)
      );

    case 'maintenance':
      return ['maintenance_mode', 'maintenance_message', 'maintenance_end_date',
              'travel_planning_active'].includes(key);

    default:
      return true;
  }
}
