'use client'

import { useEffect, useState, useRef, useCallback } from 'react'

interface MediaFile {
  name: string
  url: string
  size: number
  createdAt: string
}

interface GooglePhoto {
  id: string
  filename: string
  baseUrl: string
  thumbnail: string
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||'1029603241729-ho9iipa3fql2ekgigpempkokbfb4q0ec.apps.googleusercontent.com'

export default function MediaPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const pwd = typeof searchParams === 'object' ? String(searchParams?.pwd || '') : ''
  
  const [tab, setTab] = useState<'local' | 'google'>('local')
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [importing, setImporting] = useState<string | null>(null)
  const [toast, setToast] = useState('')
  const [googleToken, setGoogleToken] = useState<string | null>(null)
  const [googlePhotos, setGooglePhotos] = useState<GooglePhoto[]>([])
  const [loadingGoogle, setLoadingGoogle] = useState(false)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }, [])

  const loadFiles = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/cms/media-storage', { headers: { 'x-cms-password': pwd } })
      const data = await res.json()
      if (res.ok) setFiles(data)
      else showToast(data.error || 'Erreur')
    } catch (e) { showToast('Erreur') }
    setLoading(false)
  }, [pwd, showToast])

  useEffect(() => {
    if (pwd && tab === 'local') loadFiles()
  }, [pwd, tab, loadFiles])

  async function handleDelete(name: string) {
    if (!confirm('Supprimer ' + name + '?')) return
    try {
      const res = await fetch('/api/cms/media-storage', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'x-cms-password': pwd },
        body: JSON.stringify({ filename: name })
      })
      if (res.ok) { showToast('Supprimé'); loadFiles() }
      else showToast('Erreur')
    } catch (e) { showToast('Erreur') }
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url)
    showToast('URL copiée!')
  }

  // Google OAuth
  function initGoogleAuth() {
    const scope = 'https://www.googleapis.com/auth/photoslibrary.readonly'
    const redirectUri = window.location.origin + '/cms-admin/media?pwd=' + pwd
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scope)}&include_granted_scopes=true`
    
    // Store current token in sessionStorage for return
    sessionStorage.setItem('google_photos_return', 'true')
    window.location.href = authUrl
  }

  // Check for OAuth token in URL hash
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const hash = window.location.hash
    if (hash && hash.includes('access_token')) {
      const params = new URLSearchParams(hash.substring(1))
      const token = params.get('access_token')
      if (token) {
        setGoogleToken(token)
        loadGooglePhotos(token)
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname + '?pwd=' + pwd)
      }
    }
  }, [pwd, loadGooglePhotos])

  const loadGooglePhotos = useCallback(async (token: string) => {
    setLoadingGoogle(true)
    try {
      const res = await fetch('/api/cms/google-photos', {
        headers: { 'x-google-access-token': token }
      })
      const data = await res.json()
      if (res.ok) setGooglePhotos(data.photos || [])
      else showToast(data.error || 'Erreur Google')
    } catch (e) { showToast('Erreur') }
    setLoadingGoogle(false)
  }, [showToast])

  async function importFromGoogle(photo: GooglePhoto) {
    setImporting(photo.id)
    try {
      const res = await fetch('/api/cms/google-photos/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-cms-password': pwd },
        body: JSON.stringify({ imageUrl: photo.baseUrl, filename: photo.filename })
      })
      const data = await res.json()
      if (res.ok) {
        showToast('Importé!')
        setTab('local')
        loadFiles()
      } else {
        showToast(data.error || 'Erreur')
      }
    } catch (e) { showToast('Erreur') }
    setImporting(null)
  }

  if (!pwd) return (
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
      <header style={{ background: 'white', borderBottom: '1px solid #ddd', padding: '1rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <a href="/cms-admin" style={{ color: '#666', textDecoration: 'none', marginRight: '1rem' }}>← CMS</a>
            <span style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>Médiathèque</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <button onClick={() => setTab('local')} style={{ padding: '0.5rem 1rem', border: '1px solid #ddd', borderRadius: 6, background: tab === 'local' ? '#006' : 'white', color: tab === 'local' ? 'white' : '#333', cursor: 'pointer' }}>
            🖼️ Ma médiathèque
          </button>
          <button onClick={() => setTab('google')} style={{ padding: '0.5rem 1rem', border: '1px solid #ddd', borderRadius: 6, background: tab === 'google' ? '#006' : 'white', color: tab === 'google' ? 'white' : '#333', cursor: 'pointer' }}>
            📷 Google Photos
          </button>
        </div>
      </header>

      <main style={{ padding: '2rem' }}>
        {/* LOCAL STORAGE */}
        {tab === 'local' && (
          <>
            {loading ? <p style={{ textAlign: 'center', color: '#888' }}>Chargement...</p>
             : files.length === 0 ? <p style={{ textAlign: 'center', color: '#888' }}>Aucune image</p>
             : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250,1fr))', gap: '1.5rem' }}>
                {files.map(f => (
                  <div key={f.name} style={{ background: 'white', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <div style={{ aspectRatio: '4/3', background: '#eee', overflow: 'hidden' }}>
                      <img src={f.url} alt={f.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                    </div>
                    <div style={{ padding: '0.8rem' }}>
                      <p style={{ margin: '0 0 0.4rem', fontSize: '0.85rem', wordBreak: 'break-all' }}>{f.name.length > 35 ? f.name.slice(0,35)+'...' : f.name}</p>
                      <p style={{ margin: '0 0 0.8rem', fontSize: '0.75rem', color: '#888' }}>{(f.size/1024).toFixed(1)} KB</p>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => copyUrl(f.url)} style={{ flex: 1, padding: '0.4rem', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer', background: '#f5f5f5' }}>Copier</button>
                        <button onClick={() => handleDelete(f.name)} style={{ padding: '0.4rem', border: '1px solid #fcc', borderRadius: 4, cursor: 'pointer', background: '#fee', color: '#c00' }}>Suppr</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>}
          </>
        )}

        {/* GOOGLE PHOTOS */}
        {tab === 'google' && (
          <>
            {!googleToken ? (
              <div style={{ background: 'white', borderRadius: 10, padding: '3rem', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📷</div>
                <h2>Importer depuis Google Photos</h2>
                <p style={{ color: '#666', marginBottom: '1.5rem' }}>Connectez-vous pour importer vos photos</p>
                <button onClick={initGoogleAuth} style={{ padding: '0.8rem 1.5rem', background: '#006', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '1rem' }}>
                  Connecter Google Photos
                </button>
              </div>
            ) : loadingGoogle ? (
              <p style={{ textAlign: 'center', color: '#888' }}>Chargement Google Photos...</p>
            ) : googlePhotos.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#888' }}>Aucune photo trouvée</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180,1fr))', gap: '1rem' }}>
                {googlePhotos.map(p => (
                  <div key={p.id} style={{ background: 'white', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                    <div style={{ aspectRatio: '1', background: '#eee' }}>
                      <img src={p.thumbnail} alt={p.filename} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ padding: '0.5rem' }}>
                      <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.filename}</p>
                      <button 
                        onClick={() => importFromGoogle(p)} 
                        disabled={importing === p.id}
                        style={{ width: '100%', padding: '0.4rem', background: importing === p.id ? '#ccc' : '#28a745', color: 'white', border: 'none', borderRadius: 4, cursor: importing === p.id ? 'not-allowed' : 'pointer', fontSize: '0.8rem' }}
                      >
                        {importing === p.id ? 'Import...' : 'Importer →'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {toast && <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: '#333', color: 'white', padding: '0.8rem 1.5rem', borderRadius: 8 }}>{toast}</div>}
    </div>
  )
}
