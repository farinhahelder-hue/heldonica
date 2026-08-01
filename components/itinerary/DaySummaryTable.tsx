'use client'

import { useEditableContext } from '@/components/inline-edit/InlineEditProvider'

interface DayRow {
  day: number
  location: string
  activity: string
  accommodation: string | null
}

/**
 * Tableau « Aperçu du circuit » : cellules dérivées des zones jour
 * (location / activity / accommodation) pour rester synchronisées
 * quand le contenu est modifié depuis le CMS.
 */
export default function DaySummaryTable({ page, days }: { page: string; days: DayRow[] }) {
  const { zones } = useEditableContext()
  const val = (key: string, fallback: string) => zones[`${page}__${key}`] ?? fallback

  return (
    <tbody className="divide-y divide-stone-100">
      {days.map((d) => {
        const location = val(`day_${d.day}_location`, d.location)
        const activity = val(`day_${d.day}_activity`, d.activity)
        const accommodation = val(`day_${d.day}_accommodation`, d.accommodation ?? '')
        return (
          <tr key={d.day} className="hover:bg-cloud-dancer/50">
            <td className="px-4 py-3 font-semibold text-eucalyptus">J{d.day}</td>
            <td className="px-4 py-3 text-charcoal">{location.split('—')[0].trim()}</td>
            <td className="px-4 py-3 text-charcoal/70 hidden md:table-cell">{activity.split(',')[0]}</td>
            <td className="px-4 py-3 text-charcoal/70 hidden md:table-cell">
              {accommodation ? accommodation.split('—')[0].trim() : 'Départ'}
            </td>
          </tr>
        )
      })}
    </tbody>
  )
}
