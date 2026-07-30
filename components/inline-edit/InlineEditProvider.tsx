'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { invalidateZonesCache } from '@/lib/content-loader'
import EditModeToggle from './EditModeToggle'
import ZonesSidebar from './ZonesSidebar'
import UndoToast from './UndoToast'

export interface RegisteredZone {
  key: string
  fallback: string
  type: string
}

interface EditableContextType {
  zones: Record<string, string>
  isEditing: boolean
  saving: boolean
  toggleEditing: () => void
  updateZone: (page: string, zone: string, value: string) => Promise<boolean>
  refresh: () => Promise<void>
  registeredZones: RegisteredZone[]
  registerZone: (key: string, fallback: string, type: string) => void
  unregisterZone: (key: string) => void
  undoAction: { page: string; zone: string; previousValue: string } | null
  triggerUndo: (page: string, zone: string, previousValue: string) => void
  clearUndo: () => void
}

const EditableContext = createContext<EditableContextType | null>(null)

export function useEditableContext() {
  const ctx = useContext(EditableContext)
  if (!ctx) {
    return {
      zones: {},
      isEditing: false,
      saving: false,
      toggleEditing: () => {},
      updateZone: async () => false,
      refresh: async () => {},
      registeredZones: [],
      registerZone: () => {},
      unregisterZone: () => {},
      undoAction: null,
      triggerUndo: () => {},
      clearUndo: () => {},
    }
  }
  return ctx
}

export default function InlineEditProvider({
  page,
  children,
  initialZones,
}: {
  page?: string
  children: ReactNode
  /**
   * Zones préchargées côté serveur (voir `lib/cms-zones.ts`). Sans elles, le
   * premier rendu affiche les fallbacks et ne bascule sur le contenu CMS
   * qu'après le fetch client — visible par le lecteur, et absent du HTML
   * que reçoit un crawler qui n'exécute pas le JS.
   */
  initialZones?: Record<string, string>
}) {
  const [zones, setZones] = useState<Record<string, string>>(initialZones ?? {})
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [admin, setAdmin] = useState(false)
  const [registeredZones, setRegisteredZones] = useState<RegisteredZone[]>([])
  const [undoAction, setUndoAction] = useState<{ page: string; zone: string; previousValue: string } | null>(null)

  const fetchZones = useCallback(async () => {
    try {
      const params = page ? `?page=${page}` : ''
      const res = await fetch(`/api/cms/zones${params}`)
      if (!res.ok) return
      const data = await res.json()
      const flat: Record<string, string> = {}
      Object.entries(data.zones || {}).forEach(([key, zone]: [string, any]) => {
        flat[`${zone.page}__${key}`] = zone.value
      })
      setZones(flat)
    } catch {
      // silent
    }
  }, [page])

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/cms/auth')
      const data = await res.json()
      setAdmin(data.ok === true)
    } catch {
      setAdmin(false)
    }
  }, [])

  const hasServerZones = !!initialZones && Object.keys(initialZones).length > 0

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    // Si la page a préchargé ses zones côté serveur, le visiteur a déjà le bon
    // contenu : refaire l'appel ne changerait rien et coûterait une requête par
    // page vue. On ne charge que dans deux cas — page pas encore câblée au
    // chargement serveur, ou session admin (pour repartir d'un état frais
    // après une édition).
    if (!hasServerZones || admin) fetchZones()
  }, [fetchZones, hasServerZones, admin])

  const toggleEditing = useCallback(() => {
    setIsEditing((e) => !e)
  }, [])

  // Quit edit mode on Escape press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isEditing) {
        setIsEditing(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isEditing])

  const updateZone = useCallback(
    async (zonePage: string, zoneKey: string, value: string): Promise<boolean> => {
      setSaving(true)
      try {
        const res = await fetch('/api/cms/zones', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ page: zonePage, zone_key: zoneKey, value }),
        })
        if (!res.ok) return false
        const compoundKey = `${zonePage}__${zoneKey}`
        setZones((prev) => ({ ...prev, [compoundKey]: value }))
        invalidateZonesCache()
        return true
      } catch {
        return false
      } finally {
        setSaving(false)
      }
    },
    []
  )

  // `registeredZones` n'alimente que ZonesSidebar, une UI réservée aux admins.
  // Depuis que le provider enveloppe aussi les visiteurs, ces callbacks étaient
  // appelés à chaque montage de zone : sur Travel Planning, 75 mises à jour
  // d'état successives, chacune parcourant une liste qui grandit — pour un
  // résultat que le visiteur ne verra jamais. On ne les active donc qu'en admin.
  const registerZone = useCallback((key: string, fallback: string, type: string) => {
    if (!admin) return
    setRegisteredZones((prev) => {
      if (prev.some((z) => z.key === key)) return prev
      return [...prev, { key, fallback, type }]
    })
  }, [admin])

  const unregisterZone = useCallback((key: string) => {
    if (!admin) return
    setRegisteredZones((prev) => prev.filter((z) => z.key !== key))
  }, [admin])

  const triggerUndo = useCallback((zonePage: string, zoneKey: string, previousValue: string) => {
    setUndoAction({ page: zonePage, zone: zoneKey, previousValue })
  }, [])

  const clearUndo = useCallback(() => {
    setUndoAction(null)
  }, [])

  const refresh = useCallback(async () => {
    await fetchZones()
  }, [fetchZones])

  // Le contexte est fourni à TOUT LE MONDE, pas seulement aux admins.
  //
  // Auparavant : `if (!admin) return <>{children}</>`. Pour un visiteur non
  // connecté, les <EditableZone> se retrouvaient hors provider et retombaient
  // sur le contexte par défaut de useEditableContext(), dont `zones` vaut `{}`.
  // Comme EditableZone calcule `zones[zoneKey] ?? fallback`, chaque zone
  // affichait son fallback codé en dur. Autrement dit : le contenu saisi au CMS
  // n'était visible que par un admin connecté — donc par personne en pratique.
  // Le bug était invisible en préversion admin, ce qui l'a fait passer inaperçu.
  //
  // Seule l'INTERFACE d'édition reste réservée aux admins.
  return (
    <EditableContext.Provider
      value={{
        zones,
        // Un non-admin ne peut jamais entrer en mode édition, même si l'état
        // local était forcé : la garde vit ici, pas seulement dans l'UI.
        isEditing: admin && isEditing,
        saving,
        toggleEditing,
        updateZone,
        refresh,
        registeredZones,
        registerZone,
        unregisterZone,
        undoAction,
        triggerUndo,
        clearUndo,
      }}
    >
      {admin ? (
        <div className="relative">
          {children}
          <EditModeToggle />
          <ZonesSidebar page={page} />
          <UndoToast />
        </div>
      ) : (
        children
      )}
    </EditableContext.Provider>
  )
}
