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
}: {
  page?: string
  children: ReactNode
}) {
  const [zones, setZones] = useState<Record<string, string>>({})
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

  useEffect(() => {
    fetchZones()
    checkAuth()
  }, [fetchZones, checkAuth])

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

  const registerZone = useCallback((key: string, fallback: string, type: string) => {
    setRegisteredZones((prev) => {
      if (prev.some((z) => z.key === key)) return prev
      return [...prev, { key, fallback, type }]
    })
  }, [])

  const unregisterZone = useCallback((key: string) => {
    setRegisteredZones((prev) => prev.filter((z) => z.key !== key))
  }, [])

  const triggerUndo = useCallback((zonePage: string, zoneKey: string, previousValue: string) => {
    setUndoAction({ page: zonePage, zone: zoneKey, previousValue })
  }, [])

  const clearUndo = useCallback(() => {
    setUndoAction(null)
  }, [])

  const refresh = useCallback(async () => {
    await fetchZones()
  }, [fetchZones])

  if (!admin) return <>{children}</>

  return (
    <EditableContext.Provider
      value={{
        zones,
        isEditing,
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
      <div className="relative">
        {children}
        <EditModeToggle />
        <ZonesSidebar page={page} />
        <UndoToast />
      </div>
    </EditableContext.Provider>
  )
}
