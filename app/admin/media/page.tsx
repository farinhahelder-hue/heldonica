'use client'

import { useEffect, useState } from 'react'

interface MediaFile {
  key: string
  name: string
  size?: number
  lastModified?: string
  url: string
}

export default function MediaAdminPage() {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [folder, setFolder] = useState('articles')

  const fetchMedia = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/cms/media?prefix=${folder}`)
      const data = await res.json()
      if (data.files) {
        setFiles(data.files)
      } else {
        setError(data.error || 'Erreur lors du chargement des fichiers media')
      }
    } catch {
      setError('Impossible de se connecter a l\'API')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedia()
  }, [folder])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return

    setUploading(true)
    setError(null)
    setSuccessMsg(null)

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('folder', folder)

    try {
      const res = await fetch('/api/cms/media-upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (data.url) {
        setSuccessMsg('Fichier televerse avec succes !')
        setSelectedFile(null)
        // Reset file input
        const fileInput = document.getElementById('file-upload') as HTMLInputElement
        if (fileInput) fileInput.value = ''
        fetchMedia()
      } else {
        setError(data.error || 'Erreur lors de l\'upload')
      }
    } catch {
      setError('Erreur reseau pendant le televersement')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (key: string) => {
    if (!confirm('Es-tu sur de vouloir supprimer définitivement cette image de la mediatheque ?')) return
    setError(null)
    setSuccessMsg(null)

    try {
      const res = await fetch('/api/cms/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      })
      const data = await res.json()

      if (data.success) {
        setSuccessMsg('Fichier supprime avec succes !')
        fetchMedia()
      } else {
        setError(data.error || 'Erreur lors de la suppression')
      }
    } catch {
      setError('Erreur reseau')
    }
  }

  const handleCopyUrl = (url: string, key: string) => {
    navigator.clipboard.writeText(url)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-serif font-bold text-stone-900">
          Médiathèque (Supabase Storage)
        </h2>
        <p className="text-stone-500 text-sm mt-1">
          Téléverser des photos de voyage et copier les URLs pour enrichir le contenu du blog et des destinations.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">
          {successMsg}
        </div>
      )}

      {/* Grid of folders / settings and upload form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Folder Select */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Dossiers de stockage
          </h3>
          <div className="flex flex-col gap-2">
            {['articles', 'destinations', 'avatars'].map((f) => (
              <button
                key={f}
                onClick={() => setFolder(f)}
                className={`w-full py-2.5 px-4 rounded-xl text-left text-xs font-semibold uppercase tracking-wider transition ${
                  folder === f
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                📁 {f}
              </button>
            ))}
          </div>
        </div>

        {/* Upload Form */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm lg:col-span-2 space-y-4">
          <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Téléverser une nouvelle image
          </h3>
          <form onSubmit={handleUpload} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Fichier Image (JPG, PNG, WebP)
              </label>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs text-stone-600 focus:outline-none bg-stone-50"
                required
              />
            </div>
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="py-2.5 px-6 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white text-xs font-semibold rounded-lg shadow transition shrink-0 w-full sm:w-auto"
            >
              {uploading ? 'Téléversement…' : 'Téléverser'}
            </button>
          </form>
        </div>
      </div>

      {/* Media Files Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider">
          Fichiers dans le dossier "{folder}" ({files.length})
        </h3>

        {loading ? (
          <p className="text-stone-400 text-sm italic">Chargement de la mediatheque…</p>
        ) : files.length === 0 ? (
          <p className="text-stone-400 text-sm italic">Aucun fichier dans ce dossier</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {files.map((file) => (
              <div
                key={file.key}
                className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col group"
              >
                {/* Thumbnail */}
                <div className="h-32 bg-stone-100 relative overflow-hidden flex items-center justify-center border-b border-stone-100">
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    loading="lazy"
                  />
                </div>
                {/* Metadata & Actions */}
                <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-stone-900 truncate" title={file.name}>
                      {file.name}
                    </p>
                    {file.size && (
                      <p className="text-[10px] text-stone-400 font-mono">
                        {Math.round(file.size / 1024)} KB
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-stone-100">
                    <button
                      onClick={() => handleCopyUrl(file.url, file.key)}
                      className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-lg border transition ${
                        copiedKey === file.key
                          ? 'bg-green-500 text-white border-green-500'
                          : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {copiedKey === file.key ? 'Copié !' : 'URL'}
                    </button>
                    <button
                      onClick={() => handleDelete(file.key)}
                      className="px-2 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-lg text-xs font-bold transition"
                      title="Supprimer"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
