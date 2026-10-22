'use client'

import { useEffect } from 'react'
import { useEditableContext } from './InlineEditProvider'

/**
 * Textes de zones CMS sous forme de chaînes, pour ce qu'un <EditableZone> ne
 * peut pas envelopper : placeholder, libellé de bouton selon l'état, message
 * d'erreur, écran de confirmation.
 *
 * Les zones sont inscrites dans la barre latérale d'édition : elles restent
 * modifiables même quand elles ne sont pas à l'écran (un message de
 * confirmation n'apparaît jamais en mode édition).
 *
 * À appeler une fois, en tête de composant, avant tout retour anticipé :
 *   const t = useZoneTexts(PAGE, { form_submit: 'Envoyer', form_success: 'Merci' })
 */
export function useZoneTexts<T extends Record<string, string>>(page: string, fallbacks: T): T {
  const { zones, registerZone, unregisterZone } = useEditableContext()
  // Les replis sont des littéraux : leur signature suffit comme dépendance.
  const signature = JSON.stringify(fallbacks)

  useEffect(() => {
    const keys = Object.entries(fallbacks).map(([zone, fallback]) => {
      const key = `${page}__${zone}`
      registerZone(key, fallback, 'text')
      return key
    })
    return () => keys.forEach(unregisterZone)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, signature, registerZone, unregisterZone])

  return Object.fromEntries(
    Object.entries(fallbacks).map(([zone, fallback]) => [zone, zones[`${page}__${zone}`] ?? fallback])
  ) as T
}
