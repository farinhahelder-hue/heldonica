'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useEditableContext } from './InlineEditProvider'
import AiImproveModal from './AiImproveModal'
import dynamic from 'next/dynamic'
import TiptapEditor from './TiptapEditor'

const MediaLibrary = dynamic(() => import('@/components/MediaLibrary'), { ssr: false })

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
  const { zones, isEditing, updateZone, saving, registerZone, unregisterZone, triggerUndo } = useEditableContext()
  const [editValue, setEditValue] = useState('')
  const [editing, setEditing] = useState(false)
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [mediaLibOpen, setMediaLibOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)
  const zoneKey = `${page}__${zone}`
  const hasCmsValue = zones[zoneKey] !== undefined
  const value = zones[zoneKey] ?? fallback

  // Dynamic registration for sidebar listing
  useEffect(() => {
    registerZone(zoneKey, fallback, type)
    return () => {
      unregisterZone(zoneKey)
    }
  }, [zoneKey, fallback, type, registerZone, unregisterZone])

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus()
  }, [editing])

  const startEdit = useCallback(() => {
    if (!isEditing) return
    setEditValue(value)
    setEditing(true)
  }, [isEditing, value])

  const save = useCallback(async () => {
    if (editValue === value) {
      setEditing(false)
      return
    }
    const oldValue = value
    const ok = await updateZone(page, zone, editValue)
    if (ok) {
      setEditing(false)
      // Trigger undo action toast with the previous value
      triggerUndo(page, zone, oldValue)
    }
  }, [editValue, value, updateZone, page, zone, triggerUndo])

  const cancel = useCallback(() => {
    setEditing(false)
    setEditValue('')
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') cancel()
      if (e.key === 'Enter' && type !== 'textarea') save()
    },
    [cancel, save, type]
  )

  const renderContent = (content: string) => {
    if (type === 'image') {
      return <ZoneImage src={content} className={className} />
    }
    return <Tag className={className} dangerouslySetInnerHTML={{ __html: content }} />
  }

  const renderViewMode = () => {
    const content = renderContent(value)

    if (isEditing && !editing) {
      return (
        <div
          id={`zone-${zoneKey}`}
          onClick={startEdit}
          className={`relative group cursor-pointer rounded outline-dashed outline-eucalyptus/60 hover:outline-eucalyptus transition duration-200 p-1 min-h-[1.5em] ${
            type === 'image' ? 'inline-block' : 'block'
          } ${className}`}
          title="Cliquer pour modifier"
        >
          {/* CMS / Fallback visual badge */}
          <span
            className={`absolute -top-3.5 -left-1 z-30 text-[8px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded shadow-sm select-none ${
              hasCmsValue
                ? 'bg-green-600 text-white'
                : 'bg-orange-600 text-white'
            }`}
          >
            {hasCmsValue ? 'CMS' : '↩ Fallback'}
          </span>

          {type === 'image' ? (
            <img src={value} alt="" className={className} loading="lazy" />
          ) : (
            <Tag dangerouslySetInnerHTML={{ __html: value }} />
          )}

          {/* Crayon overlay button */}
          <span className="absolute -top-2 -right-2 w-5 h-5 bg-eucalyptus rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 shadow transition duration-200">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            </svg>
          </span>
        </div>
      )
    }

    if (href && wrapper === 'link') {
      return (
        <Link href={href} className={className}>
          {content}
        </Link>
      )
    }

    return content
  }

  const renderEditMode = () => {
    if (type === 'image') {
      return (
        <div data-zone-editing id={`zone-${zoneKey}`} className="relative group p-1 border border-eucalyptus rounded bg-stone-50">
          <img src={editValue || value} alt="" className={className} loading="lazy" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition duration-200">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-3/4 px-3 py-2 rounded text-sm text-black focus:outline-none"
              placeholder="Image URL..."
              ref={inputRef as any}
            />
            <button
              onClick={save}
              className="px-3 py-2 bg-eucalyptus text-white rounded text-sm font-semibold hover:brightness-110"
              disabled={saving}
            >
              OK
            </button>
            <button
              onClick={() => setMediaLibOpen(true)}
              className="px-3 py-2 bg-blue-600 text-white rounded text-sm font-semibold hover:bg-blue-700"
            >
              📷 Media
            </button>
            <button
              onClick={cancel}
              className="px-3 py-2 bg-stone-600 text-white rounded text-sm font-semibold hover:bg-stone-700"
            >
              X
            </button>
          </div>
        </div>
      )
    }

    if (type === 'textarea') {
      return (
        <div data-zone-editing id={`zone-${zoneKey}`} className="relative p-2 border-2 border-dashed border-eucalyptus rounded bg-stone-50 min-w-[300px]">
          <TiptapEditor
            value={editValue}
            onChange={(html) => setEditValue(html)}
            className={className}
          />
          <div className="flex items-center gap-1.5 mt-1.5">
            <button
              onClick={save}
              className="px-2 py-1 bg-eucalyptus text-white rounded text-xs font-semibold hover:brightness-110"
              disabled={saving}
            >
              {saving ? '...' : 'Sauvegarder'}
            </button>
            <button
              onClick={cancel}
              className="px-2 py-1 bg-stone-500 text-white rounded text-xs font-semibold hover:bg-stone-600"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={() => setAiModalOpen(true)}
              className="px-2 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded text-xs font-semibold flex items-center gap-1 shadow-sm transition"
            >
              ✨ IA
            </button>
          </div>
        </div>
      )
    }

    return (
      <div data-zone-editing id={`zone-${zoneKey}`} className="relative inline-block p-1 border-2 border-dashed border-eucalyptus rounded bg-stone-50">
        <input
          ref={inputRef as any}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`bg-transparent px-1 text-sm focus:outline-none ${className}`}
        />
        <div className="flex items-center gap-1.5 mt-1.5">
          <button
            onClick={save}
            className="px-2 py-1 bg-eucalyptus text-white rounded text-xs font-semibold hover:brightness-110"
            disabled={saving}
          >
            {saving ? '...' : 'OK'}
          </button>
          <button
            onClick={cancel}
            className="px-2 py-1 bg-stone-500 text-white rounded text-xs font-semibold hover:bg-stone-600"
          >
            X
          </button>
          <button
            type="button"
            onClick={() => setAiModalOpen(true)}
            className="px-2 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded text-xs font-semibold flex items-center gap-1 shadow-sm transition"
          >
            ✨
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {editing ? renderEditMode() : renderViewMode()}
      <AiImproveModal
        isOpen={aiModalOpen}
        text={editValue || value}
        zoneType={type === 'textarea' ? 'textarea' : 'text'}
        onClose={() => setAiModalOpen(false)}
        onSelect={(variant) => {
          setEditValue(variant)
          setAiModalOpen(false)
        }}
      />
      {mediaLibOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <button
              onClick={() => setMediaLibOpen(false)}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200"
            >
              ✕
            </button>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Bibliothèque de médias</h2>
              <MediaLibrary
                onSelect={(url) => {
                  setEditValue(url)
                  setMediaLibOpen(false)
                }}
                onClose={() => setMediaLibOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/** Image zone that hides itself on load failure instead of showing a broken-image icon. */
function ZoneImage({ src, className }: { src: string; className?: string }) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) return null
  return <img src={src} alt="" className={className} loading="lazy" onError={() => setFailed(true)} />
}
