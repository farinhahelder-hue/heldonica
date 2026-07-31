'use client'

/**
 * AffiliateLink — lien partenaire tracké.
 *
 * Deux choses que les liens affiliés écrits à la main dans les pages
 * d'itinéraire ne faisaient pas :
 *   1. `rel="sponsored"` — attribut attendu par Google pour un lien rémunéré.
 *      Sans lui, le lien est traité comme une recommandation éditoriale, ce qui
 *      expose à une pénalité manuelle « liens non naturels ».
 *   2. L'envoi de `affiliate_click` à GA4 — `trackAffiliateClick` existait dans
 *      lib/analytics.ts mais n'était appelé nulle part, donc le KPI « clics
 *      affiliés » du Sprint 2 n'avait aucune donnée.
 */

import type { ReactNode } from 'react'
import { trackAffiliateClick } from '@/lib/analytics'
import type { AffiliatePartner } from '@/lib/affiliates'

interface Props {
  href: string
  partner: AffiliatePartner
  /** Slug de destination, envoyé à GA4 pour segmenter les clics. */
  destination: string
  children: ReactNode
  className?: string
}

export default function AffiliateLink({
  href,
  partner,
  destination,
  children,
  className,
}: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="sponsored noreferrer noopener"
      className={className}
      onClick={() => trackAffiliateClick(partner, destination)}
    >
      {children}
    </a>
  )
}
