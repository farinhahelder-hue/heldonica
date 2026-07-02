'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useEditableContext } from './InlineEditProvider'

type ZoneType = 'text' | 'textarea' | 'image' | 'html'

interface EditableZoneProps {
  page: string
  zone: string
  type?: ZoneType
  fallback: string
  className?: string
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4'
  href?: string
  target?: string
  wrapper?: 'none' | 'link' | 'button'
}

export default function EditableZone({
  page,
  zone,
  type = 'text',
  fallback,
  className = '',
  as: Tag = 'span',
  href,
  wrapper = 'none',
}: EditableZoneProps) {
  const { zones, isEditing, updateZone, saving } = useEditableContext()
  const [editValue, setEditValue] = useState('')
  const [editing, setEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)
  const zoneKey = `${page}__${zone}`
  const value = zones[zoneKey] ?? fallback

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus()
  }, [editing])

  const startEdit = useCallback(() => {
    if (!isEditing) return
    setEditValue(value)
    setEditing(true)
  }, [isEditing, value])

  const save = useCallback(async () => {
    if (editValue === value) { setEditing(false); return }
    const ok = await updateZone(page, zone, editValue)
    if (ok) setEditing(false)
  }, [editValue, value, updateZone, page, zone])

  const cancel = useCallback(() => { setEditing(false); setEditValue('') }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') cancel()
    if (e.key === 'Enter' && type !== 'textarea') save()
  }, [cancel, save, type])

  const renderContent = (content: string, editMode: boolean) => {
    if (type === 'image') {
      return <img src={content} alt="" className={className} loading="lazy" />
    }
    return <Tag className={className} dangerouslySetInnerHTML={{ __html: content }} />
  }

  const renderViewMode = () => {
    const content = renderContent(value, false)

    if (isEditing && !editing) {
      return (
        <button
          onClick={startEdit}
          className={`relative cursor-pointer rounded ring-2 ring-transparent hover:ring-amber-400/50 transition ${className}`}
          title="Cliquer pour modifier"
          type="button"
        >
          {type === 'image' ? (
            <img src={value} alt="" className={className} loading="lazy" />
          ) : (
            <Tag dangerouslySetInnerHTML={{ __html: value }} />
          )}
          <span className="absolute -top-2 -right-2 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            </svg>
          </span>
        </button>
      )
    }

    if (href && wrapper === 'link') {
      return <Link href={href} className={className}>{content}</Link>
    }

    return content
  }

  const renderEditMode = () => {
    if (type === 'image') {
      return (
        <div className="relative group">
          <img src={editValue || value} alt="" className={className} loading="lazy" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition">
            <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onKeyDown={handleKeyDown}
              className="w-3/4 px-3 py-2 rounded text-sm text-black" placeholder="Image URL..." ref={inputRef as any} />
            <button onClick={save} className="px-3 py-2 bg-green-600 text-white rounded text-sm" disabled={saving}>OK</button>
            <button onClick={cancel} className="px-3 py-2 bg-gray-600 text-white rounded text-sm">X</button>
          </div>
        </div>
      )
    }

    if (type === 'textarea') {
      return (
        <div className="relative">
          <textarea ref={inputRef as any} value={editValue} onChange={(e) => setEditValue(e.target.value)} onKeyDown={handleKeyDown}
            className={`w-full bg-yellow-50 border-2 border-dashed border-amber-500 rounded p-2 text-sm ${className}`} rows={4} />
          <div className="flex gap-1 mt-1">
            <button onClick={save} className="px-2 py-1 bg-green-600 text-white rounded text-xs" disabled={saving}>
              {saving ? '...' : 'Sauvegarder'}
            </button>
            <button onClick={cancel} className="px-2 py-1 bg-gray-500 text-white rounded text-xs">Annuler</button>
          </div>
        </div>
      )
    }

    return (
      <div className="relative inline-block">
        <input ref={inputRef as any} type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onKeyDown={handleKeyDown}
          className={`bg-yellow-50 border-2 border-dashed border-amber-500 rounded px-2 py-1 text-sm ${className}`} />
        <div className="flex gap-1 mt-1">
          <button onClick={save} className="px-2 py-1 bg-green-600 text-white rounded text-xs" disabled={saving}>
            {saving ? '...' : 'OK'}
          </button>
          <button onClick={cancel} className="px-2 py-1 bg-gray-500 text-white rounded text-xs">X</button>
        </div>
      </div>
    )
  }

  return editing ? renderEditMode() : renderViewMode()
}
