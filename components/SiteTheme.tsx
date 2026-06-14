import { getSettings } from '@/lib/settings'

export default async function SiteTheme() {
  const colors = await getSettings(
    'primary_color',
    'secondary_color',
    'color_primary', 
    'color_secondary',
    'color_accent',
    'color_background',
    'color_text',
    'hero_overlay_color',
    'hero_overlay_opacity',
    'button_primary_bg',
    'button_primary_text',
    'button_secondary_bg',
    'button_secondary_text',
    'font_heading',
    'font_body',
    'font_size_base',
    'container_max_width',
    'header_sticky',
    'site_tagline',
    'footer_text',
    'site_name',
    'logo_url',
    'favicon_url',
    'primary_cta_label',
    'primary_cta_url',
    'footer_copyright',
    'footer_tagline',
    'contact_email',
    'custom_css',
    'custom_html_head',
    'custom_html_body',
  )
  
  const opacity = parseInt(colors.hero_overlay_opacity || '40') / 100
  
  const primaryColor = colors.primary_color || colors.color_primary || '#006D77'
  const secondaryColor = colors.secondary_color || colors.color_secondary || '#83C5BE'
  
  const cssVars = `
    :root {
      --color-primary: ${primaryColor};
      --color-secondary: ${secondaryColor};
      --color-accent: ${colors.color_accent || '#E29578'};
      --color-background: ${colors.color_background || '#F8F5F0'};
      --color-text: ${colors.color_text || '#1A1A1A'};
      --hero-overlay-color: ${colors.hero_overlay_color || '#000000'};
      --hero-overlay-opacity: ${opacity};
      --button-primary-bg: ${colors.button_primary_bg || primaryColor};
      --button-primary-text: ${colors.button_primary_text || '#FFFFFF'};
      --button-secondary-bg: ${colors.button_secondary_bg || secondaryColor};
      --button-secondary-text: ${colors.button_secondary_text || '#1A1A1A'};
      --font-heading: ${colors.font_heading || 'Playfair Display, serif'};
      --font-body: ${colors.font_body || 'DM Sans, sans-serif'};
      --font-size-base: ${colors.font_size_base || '16px'};
      --container-max-width: ${colors.container_max_width || '1280px'};
      --header-sticky: ${colors.header_sticky === 'false' ? 'relative' : 'sticky'};
      --eucalyptus-green: var(--color-primary);
      --cloud-dancer: var(--color-background);
      --site-tagline: '${colors.site_tagline || ''}';
      --footer-text: '${colors.footer_text || ''}';
      --site-name: '${colors.site_name || 'Heldonica'}';
      --cta-label: '${colors.primary_cta_label || 'Planifier mon voyage'}';
    }
  `
  
  const fontHeading = colors.font_heading || 'Playfair+Display'
  const fontBody = colors.font_body || 'DM+Sans'
  const fontUrl = `https://fonts.googleapis.com/css2?family=${fontHeading}:wght@400;500;600;700&family=${fontBody}:wght@400;500;600&display=swap`
  
  const customCss = colors.custom_css || ''
  const customHtmlHead = colors.custom_html_head || ''
  const customHtmlBody = colors.custom_html_body || ''

  return (
    <>
      <link href={fontUrl} rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: cssVars }} />
      {customCss && <style dangerouslySetInnerHTML={{ __html: customCss }} />}
      {customHtmlHead && <div dangerouslySetInnerHTML={{ __html: customHtmlHead }} />}
      {customHtmlBody && <div dangerouslySetInnerHTML={{ __html: customHtmlBody }} className="custom-html-body" />}
    </>
  )
}
