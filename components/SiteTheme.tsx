import { getSettings } from '@/lib/settings'

// ── CSS escaping ───────────────────────────────────────────────────────────
function escapeCss(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/;/g, '\\;')
    .replace(/{/g, '\\{')
    .replace(/}/g, '\\}')
    .replace(/\n/g, '\\A')
    .replace(/\r/g, '')
}

// ── Theme presets ───────────────────────────────────────────────────────────

type ThemeColors = {
  primary_color: string
  secondary_color: string
  color_accent: string
  color_background: string
  color_text: string
  button_primary_bg: string
  button_primary_text: string
  button_secondary_bg: string
  button_secondary_text: string
}

const THEME_PRESETS: Record<string, { label: string; emoji: string; colors: ThemeColors }> = {
  eucalyptus: {
    label: 'Eucalyptus',
    emoji: 'Eucalyptus',
    colors: {
      primary_color: '#006D77',
      secondary_color: '#83C5BE',
      color_accent: '#E29578',
      color_background: '#F8F5F0',
      color_text: '#1A1A1A',
      button_primary_bg: '#006D77',
      button_primary_text: '#FFFFFF',
      button_secondary_bg: '#83C5BE',
      button_secondary_text: '#1A1A1A',
    },
  },
  ocean: {
    label: 'Ocean',
    emoji: 'Ocean',
    colors: {
      primary_color: '#1A3A5C',
      secondary_color: '#5BA4D4',
      color_accent: '#7EC8E3',
      color_background: '#F4F8FB',
      color_text: '#1A2E3D',
      button_primary_bg: '#1A3A5C',
      button_primary_text: '#FFFFFF',
      button_secondary_bg: '#5BA4D4',
      button_secondary_text: '#FFFFFF',
    },
  },
  terre: {
    label: 'Terre',
    emoji: 'Terre',
    colors: {
      primary_color: '#C4714A',
      secondary_color: '#E8C9B0',
      color_accent: '#8B5E3C',
      color_background: '#FDF8F4',
      color_text: '#2C2220',
      button_primary_bg: '#C4714A',
      button_primary_text: '#FFFFFF',
      button_secondary_bg: '#E8C9B0',
      button_secondary_text: '#2C2220',
    },
  },
  ardoise: {
    label: 'Ardoise',
    emoji: 'Ardoise',
    colors: {
      primary_color: '#36454F',
      secondary_color: '#94A3B8',
      color_accent: '#64748B',
      color_background: '#F8FAFC',
      color_text: '#1E293B',
      button_primary_bg: '#36454F',
      button_primary_text: '#FFFFFF',
      button_secondary_bg: '#94A3B8',
      button_secondary_text: '#1E293B',
    },
  },
  rose: {
    label: 'Rose',
    emoji: 'Rose',
    colors: {
      primary_color: '#9B2335',
      secondary_color: '#F4B0C2',
      color_accent: '#D4A0B0',
      color_background: '#FDF4F6',
      color_text: '#2D1520',
      button_primary_bg: '#9B2335',
      button_primary_text: '#FFFFFF',
      button_secondary_bg: '#F4B0C2',
      button_secondary_text: '#2D1520',
    },
  },
}

export default async function SiteTheme() {
  const settings = await getSettings(
    'theme_preset',
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

  // Resolve theme preset or fall back to default
  const presetId = settings.theme_preset || 'eucalyptus'
  const preset = THEME_PRESETS[presetId] ?? THEME_PRESETS.eucalyptus

  const opacity = parseInt(settings.hero_overlay_opacity || '40') / 100

  // Merge: custom colors override preset, preset overrides hardcoded
  const primaryColor = settings.primary_color || settings.color_primary || preset.colors.primary_color
  const secondaryColor = settings.secondary_color || settings.color_secondary || preset.colors.secondary_color

  const cssVars = `
    :root {
      --theme-preset: '${presetId}';
      --theme-label: '${preset.label}';
      --color-primary: ${primaryColor};
      --color-secondary: ${secondaryColor};
      --color-accent: ${settings.color_accent || preset.colors.color_accent};
      --color-background: ${settings.color_background || preset.colors.color_background};
      --color-text: ${settings.color_text || preset.colors.color_text};
      --hero-overlay-color: ${settings.hero_overlay_color || '#000000'};
      --hero-overlay-opacity: ${opacity};
      --button-primary-bg: ${settings.button_primary_bg || preset.colors.button_primary_bg};
      --button-primary-text: ${settings.button_primary_text || preset.colors.button_primary_text};
      --button-secondary-bg: ${settings.button_secondary_bg || preset.colors.button_secondary_bg};
      --button-secondary-text: ${settings.button_secondary_text || preset.colors.button_secondary_text};
      --font-heading: ${settings.font_heading || 'Playfair Display, serif'};
      --font-body: ${settings.font_body || 'DM Sans, sans-serif'};
      --font-size-base: ${settings.font_size_base || '16px'};
      --container-max-width: ${settings.container_max_width || '1280px'};
      --header-sticky: ${settings.header_sticky === 'false' ? 'relative' : 'sticky'};
      --eucalyptus-green: var(--color-primary);
      --cloud-dancer: var(--color-background);
      --site-tagline: '${escapeCss(settings.site_tagline || '')}';
      --footer-text: '${escapeCss(settings.footer_text || '')}';
      --site-name: '${escapeCss(settings.site_name || 'Heldonica')}';
      --cta-label: '${escapeCss(settings.primary_cta_label || 'Planifier mon voyage')}';
    }
  `

  const fontHeading = settings.font_heading || 'Playfair+Display'
  const fontBody = settings.font_body || 'DM+Sans'
  const fontUrl = `https://fonts.googleapis.com/css2?family=${fontHeading}:wght@400;500;600;700&family=${fontBody}:wght@400;500;600&display=swap`

  const customCss = settings.custom_css || ''
  const customHtmlHead = settings.custom_html_head || ''
  const customHtmlBody = settings.custom_html_body || ''

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
