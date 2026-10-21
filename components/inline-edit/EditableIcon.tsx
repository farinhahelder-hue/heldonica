'use client'

import { useCallback, useEffect, useState } from 'react'
import { useEditableContext } from '@/components/inline-edit/InlineEditProvider'
import { FALLBACK_ICON, resolveIconName } from '@/lib/cms-icons'
import { ICON_REGISTRY } from '@/lib/icon-registry'

/**
 * Icône éditable d'une zone CMS.
 *
 * Pendant de `EditableZone` pour les zones `*_emoji` / `*_icon` / `*_badge`,
 * qui stockaient un emoji. La base a été nettoyée par migration versionnée :
 * elle contient désormais un nom d'icône lucide (« Leaf », « Sparkles »). Ce
 * composant le rend, et laisse le CMS changer ce nom.
 *
 * Ce qui change par rapport à `EditableZone` : la valeur n'est **jamais**
 * affichée telle quelle. Une valeur non reconnue — emoji résiduel, texte libre
 * saisi à la main — retombe sur l'icône neutre au lieu d'apparaître à l'écran.
 * Un emoji ne peut donc pas revenir par le CMS sans qu'on le voie.
 *
 * En édition, le champ attend un nom d'icône lucide. Les noms acceptés sont
 * ceux de `ICON_REGISTRY` ; la saisie est libre pour ne pas bloquer l'admin,
 * mais seul un nom connu s'affiche.
 */
export default function EditableIcon({
  page,
  zone,
  fallback,
  size = 24,
  className = '',
  strokeWidth = 1.25,
}: {
  page: string
  zone: string
  /** Nom d'icône lucide attendu quand la zone n'existe pas en base. */
  fallback: string
  size?: number
  className?: string
  strokeWidth?: number
}) {
  const { zones, isEditing, saving, updateZone, registerZone, unregisterZone } = useEditableContext()
  const zoneKey = `${page}__${zone}`
  const hasCmsValue = zones[zoneKey] !== undefined
  const value = zones[zoneKey] ?? fallback

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  useEffect(() => {
    registerZone(zoneKey, fallback, 'text')
    return () => unregisterZone(zoneKey)
  }, [zoneKey, fallback, registerZone, unregisterZone])

  const startEdit = useCallback(() => {
    if (!isEditing) return
    setDraft(value)
    setEditing(true)
  }, [isEditing, value])

  const save = useCallback(async () => {
    const next = draft.trim()
    if (!next || next === value) {
      setEditing(false)
      return
    }
    const ok = await updateZone(page, zone, next)
    if (ok) setEditing(false)
  }, [draft, value, updateZone, page, zone])

  const name = resolveIconName(value) ?? FALLBACK_ICON
  const Icon = ICON_REGISTRY[name] ?? ICON_REGISTRY[FALLBACK_ICON]

  if (editing) {
    return (
      <span data-zone-editing id={`zone-${zoneKey}`} className="relative inline-block p-1 border-2 border-dashed border-eucalyptus rounded bg-stone-50">
        <Icon size={size} strokeWidth={strokeWidth} className={className} aria-hidden="true" />
        <input
          autoFocus
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setEditing(false)
            if (e.key === 'Enter') save()
          }}
          placeholder="Nom d'icône (ex. Leaf)"
          className="block mt-1 w-36 px-1 py-0.5 text-xs border border-stone-300 rounded text-black bg-white"
        />
        <span className="flex items-center gap-1.5 mt-1.5">
          <button
            onClick={save}
            disabled={saving}
            className="px-2 py-1 bg-eucalyptus text-white rounded text-xs font-semibold hover:brightness-110"
          >
            {saving ? '...' : 'OK'}
          </button>
          <button
            onClick={() => setEditing(false)}
            className="px-2 py-1 bg-stone-500 text-white rounded text-xs font-semibold hover:bg-stone-600"
          >
            X
          </button>
        </span>
      </span>
    )
  }

  if (!isEditing) {
    return <Icon size={size} strokeWidth={strokeWidth} className={className} aria-hidden="true" focusable="false" />
  }

  return (
    <span
      id={`zone-${zoneKey}`}
      onClick={startEdit}
      title={`Cliquer pour modifier (${name})`}
      className={`relative inline-flex items-center cursor-pointer rounded outline-dashed outline-eucalyptus/60 hover:outline-eucalyptus transition duration-200 p-1 ${className}`}
    >
      <span
        className={`absolute -top-3.5 -left-1 z-30 text-[8px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded shadow-sm select-none ${
          hasCmsValue ? 'bg-green-600 text-white' : 'bg-orange-600 text-white'
        }`}
      >
        {hasCmsValue ? 'CMS' : '↩ Fallback'}
      </span>
      <Icon size={size} strokeWidth={strokeWidth} aria-hidden="true" focusable="false" />
    </span>
  )
}
