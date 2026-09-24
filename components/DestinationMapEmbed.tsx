'use client'

/**
 * DestinationMapEmbed — carte Google Maps intégrée aux guides et pages piliers.
 *
 * Pourquoi un embed Google plutôt que le composant `ArticleMap` (Leaflet) :
 * `ArticleMap` lit les tables `article_map_routes` / `article_map_pois` et n'a
 * de sens que sur un itinéraire dont le tracé a été saisi. Pour une page pilier
 * ou un guide « pépites », on veut juste situer la destination — sans données à
 * maintenir en base, et sans clé API (le paramètre `output=embed` de Google Maps
 * ne demande aucune authentification).
 *
 * Performance : l'iframe n'est montée qu'à l'approche du viewport
 * (IntersectionObserver, marge 200px) et porte `loading="lazy"`. Le conteneur a
 * un ratio fixe pour que le montage ne provoque aucun décalage (CLS).
 */

import { useEffect, useRef, useState } from 'react'
import { trackMapInteraction } from '@/lib/analytics'

interface Props {
  /** Requête envoyée à Google Maps, ex. "Madère, Portugal". */
  query: string
  /** Nom affiché et utilisé pour l'attribut title de l'iframe. */
  label: string
  /** Slug de destination, envoyé à GA4 avec `carte_interactive_utilisee`. */
  destination: string
  /** Niveau de zoom Google Maps (1 = monde, 20 = rue). */
  zoom?: number
  className?: string
}

export default function DestinationMapEmbed({
  query,
  label,
  destination,
  zoom = 9,
  className = '',
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [shouldLoad, setShouldLoad] = useState(false)
  const interactionSent = useRef(false)
  const pointerInside = useRef(false)

  const encoded = encodeURIComponent(query)
  const embedSrc = `https://www.google.com/maps?q=${encoded}&z=${zoom}&hl=fr&output=embed`
  const externalSrc = `https://www.google.com/maps/search/?api=1&query=${encoded}`

  // Montage différé : on ne charge la carte que si l'utilisateur descend jusqu'à elle.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    if (typeof IntersectionObserver === 'undefined') {
      setShouldLoad(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShouldLoad(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const sendInteraction = () => {
    if (interactionSent.current) return
    interactionSent.current = true
    trackMapInteraction(destination)
  }

  // Une iframe cross-origin ne propage aucun événement souris au document parent.
  // Le seul signal exploitable est le `blur` de la fenêtre pendant que le curseur
  // survole le conteneur : cela signifie que le focus vient de passer à l'iframe,
  // donc que l'utilisateur a cliqué dedans.
  useEffect(() => {
    const onBlur = () => {
      if (pointerInside.current) sendInteraction()
    }
    window.addEventListener('blur', onBlur)
    return () => window.removeEventListener('blur', onBlur)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination])

  return (
    <div className={className}>
      <div
        ref={containerRef}
        onMouseEnter={() => { pointerInside.current = true }}
        onMouseLeave={() => { pointerInside.current = false }}
        className="relative w-full aspect-[4/3] sm:aspect-[16/9] overflow-hidden rounded-2xl border border-stone-200 bg-stone-100"
      >
        {shouldLoad ? (
          <iframe
            src={embedSrc}
            title={`Carte de ${label}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-charcoal/50">
            Chargement de la carte…
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-stone-500">
          Carte Google Maps — zoome et déplace-toi pour repérer les étapes.
        </p>
        <a
          href={externalSrc}
          target="_blank"
          rel="noreferrer noopener"
          onClick={sendInteraction}
          className="text-xs font-semibold text-eucalyptus hover:underline"
        >
          Ouvrir dans Google Maps →
        </a>
      </div>
    </div>
  )
}
