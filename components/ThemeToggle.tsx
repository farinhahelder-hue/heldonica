'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null
    const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const active = saved || preferred
    setTheme(active)
  }, [])

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem('theme', next)
    
    if (next === 'dark') {
      document.documentElement.classList.add('dark')
      if (typeof window !== 'undefined' && (window as any).gtag) {
        ;(window as any).gtag('event', 'theme_change', { theme: 'dark' })
      }
    } else {
      document.documentElement.classList.remove('dark')
      if (typeof window !== 'undefined' && (window as any).gtag) {
        ;(window as any).gtag('event', 'theme_change', { theme: 'light' })
      }
    }
  }

  if (!mounted) {
    // Avoid layout shift during SSR hydration
    return (
      <div className="w-9 h-9 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 opacity-0" />
    )
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === 'light' ? 'Activer le mode sombre' : 'Activer le mode clair'}
      className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 hover:scale-105 active:scale-95 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-eucalyptus outline-none"
    >
      {theme === 'light' ? (
        <Moon size={18} className="transition-transform duration-300 hover:rotate-12" />
      ) : (
        <Sun size={18} className="transition-transform duration-300 hover:rotate-45" />
      )}
    </button>
  )
}
