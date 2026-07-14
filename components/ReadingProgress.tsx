'use client'

import { useEffect, useState } from 'react'

const SCROLL_COLOR = '#2D8B8A'

/**
 * Barre de progression de lecture en haut de la page
 * Affiche la progression du scroll en temps réel
 * Track l'engagement à 75% de lecture (event: article_lu_75)
 */
export default function ReadingProgress() {
  const [progress, setProgress] = useState(0)
  const [tracked75, setTracked75] = useState(false)

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      
      if (docHeight > 0) {
        const pct = Math.min(100, (scrollTop / docHeight) * 100)
        setProgress(pct)

        // GA4 — article_lu_75 (event canonique Heldonica)
        if (pct >= 75 && !tracked75 && typeof window !== 'undefined') {
          setTracked75(true)
          if ((window as any).gtag) {
            ;(window as any).gtag('event', 'article_lu_75', {
              event_category: 'Engagement',
              page: window.location.pathname,
              slug: window.location.pathname.split('/').pop(),
            })
          }
        }
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
  }, [tracked75])

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