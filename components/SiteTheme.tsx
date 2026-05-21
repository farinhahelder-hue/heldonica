import { getSettings } from '@/lib/settings'

export default async function SiteTheme() {
  const colors = await getSettings(
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
    'header_sticky'
  )
  
  const opacity = parseInt(colors.hero_overlay_opacity || '40') / 100
  
  // Build CSS variables
  const cssVars = `
    :root {
      --color-primary: ${colors.color_primary || '#006D77'};
      --color-secondary: ${colors.color_secondary || '#83C5BE'};
      --color-accent: ${colors.color_accent || '#E29578'};
      --color-background: ${colors.color_background || '#F8F5F0'};
      --color-text: ${colors.color_text || '#1A1A1A'};
      --hero-overlay-color: ${colors.hero_overlay_color || '#000000'};
      --hero-overlay-opacity: ${opacity};
      --button-primary-bg: ${colors.button_primary_bg || '#006D77'};
      --button-primary-text: ${colors.button_primary_text || '#FFFFFF'};
      --button-secondary-bg: ${colors.button_secondary_bg || '#83C5BE'};
      --button-secondary-text: ${colors.button_secondary_text || '#1A1A1A'};
      --font-heading: ${colors.font_heading || 'Playfair Display, serif'};
      --font-body: ${colors.font_body || 'DM Sans, sans-serif'};
      --font-size-base: ${colors.font_size_base || '16px'};
      --container-max-width: ${colors.container_max_width || '1280px'};
      --header-sticky: ${colors.header_sticky === 'false' ? 'relative' : 'sticky'};
      --eucalyptus-green: var(--color-primary);
      --cloud-dancer: var(--color-background);
    }
  `
  
  // Load Google Fonts if custom fonts are specified
  const fontHeading = colors.font_heading || 'Playfair+Display'
  const fontBody = colors.font_body || 'DM+Sans'
  const fontUrl = `https://fonts.googleapis.com/css2?family=${fontHeading}:wght@400;500;600;700&family=${fontBody}:wght@400;500;600&display=swap`
  
  return (
    <>
      <link href={fontUrl} rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: cssVars }} />
    </>
  )
}
