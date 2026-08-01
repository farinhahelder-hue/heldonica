'use client'

import { useEditableContext } from '@/components/inline-edit/InlineEditProvider'
import EditableZone from '@/components/inline-edit/EditableZone'
import AffiliateLink from '@/components/AffiliateLink'
import { AFFILIATE_DISCLOSURE, bookingSearchUrl } from '@/lib/affiliates'

interface DayAccommodationBoxProps {
  page: string
  day: number
  cityFallback: string
  accommodationFallback: string
  departText: string
  disclosureClassName?: string
}

/**
 * Encart hébergement / départ d'un jour d'itinéraire.
 * - Si une valeur d'hébergement existe (CMS ou fallback) : carte « On a dormi chez »
 *   avec lien Booking (ville dérivée de la zone location) et mention affiliation.
 * - Sinon : encart « Départ ».
 */
export default function DayAccommodationBox({
  page,
  day,
  cityFallback,
  accommodationFallback,
  departText,
  disclosureClassName = 'mt-2',
}: DayAccommodationBoxProps) {
  const { zones } = useEditableContext()
  const zoneKey = `day_${day}_accommodation`
  const accommodation = zones[`${page}__${zoneKey}`] ?? accommodationFallback
  const locationZone = zones[`${page}__day_${day}_location`] ?? cityFallback
  const city = locationZone.split('—')[0].trim()

  if (accommodation) {
    return (
      <>
        <div className="rounded-xl bg-stone-50 border border-stone-200 p-3">
          <p className="text-xs font-semibold text-stone-600 mb-1">On a dormi chez</p>
          <p className="text-sm text-charcoal/80 mb-1">
            <EditableZone page={page} zone={zoneKey} type="textarea" fallback={accommodationFallback} as="span" />
          </p>
          <AffiliateLink
            href={bookingSearchUrl(city)}
            partner="booking"
            destination="roumanie"
            className="text-xs text-eucalyptus font-semibold hover:underline"
          >
            Voir les disponibilités →
          </AffiliateLink>
        </div>
        <div className={`text-xs text-stone-500 ${disclosureClassName}`}>
          <span>{AFFILIATE_DISCLOSURE}</span>
        </div>
      </>
    )
  }

  return (
    <div className="rounded-xl bg-teal/5 border border-teal/20 p-3">
      <p className="text-xs font-semibold text-teal mb-1">Départ</p>
      <p className="text-sm text-charcoal/80">{departText}</p>
    </div>
  )
}
