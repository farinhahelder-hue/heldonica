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

interface EditableContextType {
  zones: Record<string, string>
  isEditing: boolean
  saving: boolean
  toggleEditing: () => void
  updateZone: (page: string, zone: string, value: string) => Promise<boolean>
  refresh: () => Promise<void>
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

  const refresh = useCallback(async () => {
    await fetchZones()
  }, [fetchZones])

  if (!admin) return <>{children}</>

  return (
    <EditableContext.Provider
      value={{ zones, isEditing, saving, toggleEditing, updateZone, refresh }}
    >
      <div className="relative">
        {isEditing && (
          <div className="fixed bottom-4 right-4 z-[9999] flex gap-2">
            <button
              onClick={toggleEditing}
              className="px-4 py-2 bg-red-600 text-white rounded-full text-sm font-semibold shadow-lg hover:bg-red-700 transition"
            >
              Quitter l&apos;édition
            </button>
          </div>
        )}
        {!isEditing && (
          <button
            onClick={toggleEditing}
            className="fixed bottom-4 right-4 z-[9999] px-4 py-2 bg-amber-600 text-white rounded-full text-sm font-semibold shadow-lg hover:bg-amber-700 transition"
          >
            ✏️ Modifier la page
          </button>
        )}
        {children}
      </div>
    </EditableContext.Provider>
  )
}
