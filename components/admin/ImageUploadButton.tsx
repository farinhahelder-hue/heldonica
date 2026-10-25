'use client'

import { useRef, useState } from 'react'
import { supabase } from '@/lib/supabase-client'

interface ImageUploadButtonProps {
  onUpload: (url: string) => void
  bucket?: string
  accept?: string
}

export default function ImageUploadButton({ 
  onUpload, 
  bucket = 'media',
  accept = 'image/*' 
}: ImageUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('Fichier trop volumineux (max 5Mo)')
      if (inputRef.current) inputRef.current.value = ''
      return
    }

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/uploads/image', {
        method: 'POST',
        body: formData
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Erreur lors de l\'upload')
      }

      const data = await res.json()
      
      if (data?.url) {
        onUpload(data.url)
      } else {
        throw new Error('Impossible de récupérer l\'URL du fichier')
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'upload')
    } finally {
      setUploading(false)
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleUpload}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="px-3 py-2 border border-stone-200 rounded-lg text-sm text-charcoal hover:bg-stone-50 transition-colors whitespace-nowrap disabled:opacity-50"
      >
        {uploading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Upload…
          </span>
        ) : (
          '📎 Uploader'
        )}
      </button>
      {error && (
        <span className="text-xs text-red-600">{error}</span>
      )}
    </div>
  )
}