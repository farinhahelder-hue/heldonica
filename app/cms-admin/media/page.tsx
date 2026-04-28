'use client'

import { useEffect, useState, useRef } from 'react'

interface MediaItem {
  key: string
  size: number
  lastModified: string
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function truncate(str: string, len: number): string {
  return str.length > len ? str.slice(0, len) + '...' : str
}

const S3_URL = process.env.NEXT_PUBLIC_S3_URL || ''

export default function MediaPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const password = typeof searchParams === 'object' ? String(searchParams?.pwd || '') : ''
  
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (password) loadMedia()
    else setLoading(false)
  }, [password])

  async function loadMedia() {
    setLoading(true)
    try {
      const res = await fetch('/api/media', { 
        headers: { 'x-cms-password': password } 
      })
      const data = await res.json()
      if (res.ok) setMedia(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !password) return
    setUploading(true)
    try {
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-cms-password': password },
        body: JSON.stringify({ filename: file.name, contentType: file.type })
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setToast(data.error || 'Erreur')
        return
      }
      await fetch(data.uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
      setToast('Upload réussi!')
      loadMedia()
    } catch (err) {
      setToast('Erreur: ' + String(err))
    } finally {
      setUploading(false)
      setTimeout(() => setToast(''), 3000)
    }
  }

  async function handleDelete(key: string) {
    if (!confirm('Supprimer?')) return
    try {
      const res = await fetch('/api/media/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-cms-password': password },
        body: JSON.stringify({ key })
      })
      if (res.ok) { setToast('Supprimé'); loadMedia() }
      else setToast('Erreur')
    } catch (err) { setToast('Erreur') }
    setTimeout(() => setToast(''), 3000)
  }

  function copyUrl(key: string) {
    const url = S3_URL + key
    navigator.clipboard.writeText(url)
    setToast('URL copiée!')
    setTimeout(() => setToast(''), 2000)
  }

  if (!password) return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '2rem', fontFamily: 'system-ui' }}>
      <div style={{ maxWidth: 400, margin: '100px auto', background: 'white', padding: '2rem', borderRadius: 12 }}>
        <h1>Médiathèque</h1>
        <p>Accès admin requis.</p>
        <a href="/cms-admin">Aller au CMS</a>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f8', fontFamily: 'system-ui' }}>
      <header style={{ background: 'white', borderBottom: '1px solid #ddd', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <a href="/cms-admin" style={{ color: '#666', textDecoration: 'none', marginRight: '1rem' }}>← CMS</a>
          <span style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>Médiathèque S3</span>
        </div>
        <div>
          <input type="file" accept="image/*" ref={fileInput} onChange={handleUpload} style={{ display: 'none' }} />
          <button onClick={() => fileInput.current?.click()} disabled={uploading} style={{ background: uploading ? '#ccc' : '#006', color: 'white', padding: '0.6rem 1.2rem', borderRadius: 6, cursor: uploading ? 'not-allowed' : 'pointer' }}>
            {uploading ? 'Upload...' : 'Uploader'}
          </button>
        </div>
      </header>
      <main style={{ padding: '2rem' }}>
        {loading ? <p style={{ textAlign: 'center', color: '#888' }}>Chargement...</p>
         : media.length === 0 ? <p style={{ textAlign: 'center', color: '#888' }}>Aucune image</p>
         : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250,1fr))', gap: '1.5rem' }}>
            {media.map(m => (
              <div key={m.key} style={{ background: 'white', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <div style={{ aspectRatio: '4/3', background: '#eee', overflow: 'hidden' }}>
                  <img src={S3_URL + m.key} alt={m.key} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                </div>
                <div style={{ padding: '0.8rem' }}>
                  <p style={{ margin: '0 0 0.4rem', fontSize: '0.85rem' }}>{truncate(m.key, 35)}</p>
                  <p style={{ margin: '0 0 0.8rem', fontSize: '0.75rem', color: '#888' }}>{formatBytes(m.size)}</p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => copyUrl(m.key)} style={{ flex: 1, padding: '0.4rem', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer', background: '#f5f5f5' }}>Copier</button>
                    <button onClick={() => handleDelete(m.key)} style={{ padding: '0.4rem', border: '1px solid #fcc', borderRadius: 4, cursor: 'pointer', background: '#fee', color: '#c00' }}>Suppr</button>
                  </div>
                </div>
              </div>
            ))}
          </div>}
      </main>
      {toast && <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: '#333', color: 'white', padding: '0.8rem 1.5rem', borderRadius: 8 }}>{toast}</div>}
    </div>
  )
}