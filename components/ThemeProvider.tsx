'use client'

import { useEffect, useState } from 'react'

type ColorSettings = Record<string, string>

const COLOR_KEYS = [
  'color_primary', 'color_secondary', 'color_accent',
  'color_background', 'color_text', 'hero_overlay_color',
  'hero_overlay_opacity', 'button_primary_bg', 'button_primary_text',
  'button_secondary_bg', 'button_secondary_text', 'font_heading',
  'font_body', 'font_size_base', 'container_max_width', 'header_sticky',
]

function applyVars(colors: ColorSettings, isDark: boolean) {
  const root = document.documentElement
  if (isDark || Object.keys(colors).length === 0) {
    // Clear inline styles so html.dark {} CSS rules take over
    root.style.cssText = ''
    return
  }
  const vars: string[] = []
  if (colors.color_primary)    vars.push(`--color-primary: ${colors.color_primary}`)
  if (colors.color_secondary)  vars.push(`--color-secondary: ${colors.color_secondary}`)
  if (colors.color_accent)     vars.push(`--color-accent: ${colors.color_accent}`)
  if (colors.color_background) vars.push(`--color-background: ${colors.color_background}`)
  if (colors.color_text)       vars.push(`--color-text: ${colors.color_text}`)
  if (vars.length > 0) root.style.cssText = vars.join(';')
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colors, setColors] = useState<ColorSettings>({})
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted) return
    async function loadColors() {
      try {
        const { getSiteSettings } = await import('@/lib/settings')
        const settings = await getSiteSettings()
        const c: ColorSettings = {}
        COLOR_KEYS.forEach(k => { if (settings[k]) c[k] = settings[k] })
        setColors(c)
      } catch {
        // Silently fall back to CSS defaults
      }
    }
    loadColors()
  }, [mounted])

  useEffect(() => {
    const root = document.documentElement
    applyVars(colors, root.classList.contains('dark'))

    // Re-apply whenever .dark class is toggled
    const observer = new MutationObserver(() => {
      applyVars(colors, root.classList.contains('dark'))
    })
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [colors])

  return <>{children}</>
}
