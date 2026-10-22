'use client'

// Une zone CMS qui contient un emoji, rendue en icône.
//
// Sans ce composant, convertir un picto piloté par le CMS obligeait soit à
// laisser l'emoji, soit à cesser de lire la zone — et `check-cms-zones.mjs`
// signale alors une zone orpheline. Ici la zone reste lue et enregistrée :
// elle s'édite normalement dans le panneau, et le site public affiche l'icône
// correspondante. La valeur en base n'est jamais réécrite.

import { useEffect } from 'react'
import { useEditableContext } from './InlineEditProvider'
import EditableZone from './EditableZone'
import { EmojiIcon } from '@/components/ui/Icon'

interface EditableIconProps {
  page: string
  zone: string
  fallback: string
  size?: number
  className?: string
  /** Renseigné seulement si le picto porte du sens pour un lecteur d'écran. */
  label?: string
}

export default function EditableIcon({
  page,
  zone,
  fallback,
  size = 24,
  className = '',
  label,
}: EditableIconProps) {
  const { zones, isEditing, registerZone, unregisterZone } = useEditableContext()
  const zoneKey = `${page}__${zone}`
  const valeur = zones?.[zoneKey] ?? fallback

  useEffect(() => {
    registerZone(zoneKey, fallback, 'text')
    return () => unregisterZone(zoneKey)
  }, [zoneKey, fallback, registerZone, unregisterZone])

  // En édition, on montre le champ : on voit ce qu'on modifie, et le panneau
  // latéral garde la zone dans sa liste.
  if (isEditing) {
    return (
      <span className={className}>
        <EditableZone page={page} zone={zone} fallback={fallback} as="span" />
      </span>
    )
  }

  return <EmojiIcon emoji={valeur} size={size} className={className} label={label} />
}
