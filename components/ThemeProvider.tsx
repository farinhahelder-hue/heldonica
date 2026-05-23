'use client'

import { useEffect, useState } from 'react'

type ColorSettings = Record<string, string>

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colors, setColors] = useState<ColorSettings>({})
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    async function loadColors() {
      try {
        // Dynamically import settings to avoid SSR issues
        const { getSiteSettings } = await import('@/lib/settings')
        const settings = await getSiteSettings()
        const c: ColorSettings = {}
        const colorKeys = [
          'color_primary', 'color_secondary', 'color_accent',
          'color_background', 'color_text', 'hero_overlay_color',
          'hero_overlay_opacity', 'button_primary_bg', 'button_primary_text',
          'button_secondary_bg', 'button_secondary_text', 'font_heading',
          'font_body', 'font_size_base', 'container_max_width', 'header_sticky'
        ]
        colorKeys.forEach(k => {
          if (settings[k]) c[k] = settings[k]
        })
        setColors(c)
      } catch (err) {
        // Silently fail - defaults will be used
        console.warn('Failed to load theme settings:', err)
      }
    }
    
    loadColors()
  }, [mounted])

  useEffect(() => {
    if (Object.keys(colors).length === 0) return
    
    const root = document.documentElement
    const cssVars: string[] = []
    
    if (colors.color_primary) cssVars.push(`--color-primary: ${colors.color_primary}`)
    if (colors.color_secondary) cssVars.push(`--color-secondary: ${colors.color_secondary}`)
    if (colors.color_accent) cssVars.push(`--color-accent: ${colors.color_accent}`)
    if (colors.color_background) cssVars.push(`--color-background: ${colors.color_background}`)
    if (colors.color_text) cssVars.push(`--color-text: ${colors.color_text}`)
    
    if (cssVars.length > 0) {
      root.style.cssText = cssVars.join(';')
    }
  }, [colors])

  return <>{children}</>
}
