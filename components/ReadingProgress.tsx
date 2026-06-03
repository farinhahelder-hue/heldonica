'use client'

import { useEffect, useState } from 'react'

const SCROLL_COLOR = '#2D8B8A'

/**
 * Barre de progression de lecture en haut de la page
 * Affiche la progression du scroll en temps réel
 */
export default function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      
      if (docHeight > 0) {
        const pct = Math.min(100, (scrollTop / docHeight) * 100)
        setProgress(pct)
      } else {
        setProgress(0)
      }
    }

    // Update on scroll
    window.addEventListener('scroll', updateProgress, { passive: true })
    
    // Initial calculation
    updateProgress()

    return () => {
      window.removeEventListener('scroll', updateProgress)
    }
  }, [])

  return (
    <div
      className="fixed top-0 left-0 z-[100] h-[3px] transition-all duration-100 ease-out"
      style={{ 
        width: `${progress}%`,
        backgroundColor: SCROLL_COLOR,
      }}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Progression de lecture"
    />
  )
}