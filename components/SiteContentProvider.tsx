'use client'

/**
 * Diffuse le contenu global (zones CMS + réglages) chargé par le layout serveur.
 *
 * Sans ce contexte, chaque composant appelant `useContentLoader` refaisait ses
 * propres appels à `/api/cms/zones` et `/api/cms/settings`, en `no-store` et
 * sans cache partagé. Le header et le pied de page rendaient donc leurs valeurs
 * codées en dur jusqu'au retour du réseau — y compris dans le HTML servi aux
 * crawlers.
 */

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { CmsZone } from '@/lib/content-loader'

export interface SiteContent {
  zones: Record<string, CmsZone>
  settings: Record<string, string>
}

const SiteContentContext = createContext<SiteContent | null>(null)

/** Retourne le contenu préchargé, ou `null` hors provider. */
export function useSiteContent(): SiteContent | null {
  return useContext(SiteContentContext)
}

export default function SiteContentProvider({
  zones,
  settings,
  children,
}: SiteContent & { children: ReactNode }) {
  // La valeur vient du serveur et ne change pas côté client : pas de state,
  // donc pas de re-render à l'hydratation. Le useMemo évite simplement de
  // recréer l'objet — sans lui, tout re-render du layout invaliderait les
  // consommateurs mémoïsés.
  const value = useMemo(() => ({ zones, settings }), [zones, settings])

  return (
    <SiteContentContext.Provider value={value}>
      {children}
    </SiteContentContext.Provider>
  )
}
