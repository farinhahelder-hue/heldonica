'use client'

import { useCallback, useEffect, useState } from 'react'

interface ScheduledPost {
  id: string
  image_url: string
  caption: string
  status: string
  scheduled_at: string | null
}

interface SharePack {
  id: string
  image_url: string
  caption: string
  hashtags: string[]
  status: string
}

/**
 * /panel-manager/partage-manuel — publier sur Instagram SANS l'API Meta.
 * La file (remplie par le téléphone ou autoSchedule) fournit le pack ;
 * ici on copie la légende, on récupère l'image, on publie à la main dans
 * l'app Instagram, puis on marque l'entrée comme publiée (PATCH existant).
 * Aucun token Meta requis. Page autonome : l'auth est vérifiée par les API.
 */
export default function PartageManuelPage() {
  const [posts, setPosts] = useState<ScheduledPost[]>([])
  const [loading, setLoading] = useState(true)
  const [denied, setDenied] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [pack, setPack] = useState<SharePack | null>(null)
  const [toast, setToast] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const loadPosts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/instagram/scheduled')
      if (res.status === 401) { setDenied(true); return }
      const data = await res.json()
      const list: ScheduledPost[] = (data.posts || []).filter((p: ScheduledPost) => p.status !== 'published')
      setPosts(list)
    } catch {
      showToast('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadPack = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/cms/share-pack?post_id=${id}`)
      if (!res.ok) { showToast('Pack introuvable'); return }
      const data = await res.json()
      setPack(data.pack)
    } catch {
      showToast('Erreur pack')
    }
  }, [])

  useEffect(() => { loadPosts() }, [loadPosts])
  useEffect(() => {
    if (!selectedId && posts.length > 0) setSelectedId(posts[0].id)
  }, [posts, selectedId])
  useEffect(() => { if (selectedId) loadPack(selectedId) }, [selectedId, loadPack])

  async function copyCaption() {
    if (!pack?.caption) return
    try {
      await navigator.clipboard.writeText(pack.caption)
      showToast('Légende copiée !')
    } catch {
      showToast('Copie impossible')
    }
  }

  async function markPublished() {
    if (!pack) return
    if (!confirm('Marquer comme publié ? (à faire après publication dans Instagram)')) return
    try {
      const res = await fetch('/api/instagram/scheduled', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: pack.id, status: 'published', published_at: new Date().toISOString() }),
      })
      if (res.ok) {
        showToast('Marqué comme publié')
        setPack(null)
        setSelectedId(null)
        loadPosts()
      } else showToast('Erreur')
    } catch {
      showToast('Erreur')
    }
  }

  if (denied) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '2rem', fontFamily: 'system-ui' }}>
        <div style={{ maxWidth: 400, margin: '100px auto', background: 'white', padding: '2rem', borderRadius: 12 }}>
          <h1>Partage manuel</h1>
          <p>Connecte-toi d'abord au CMS.</p>
          <a href="/panel-manager">Aller au CMS</a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f8', fontFamily: 'system-ui', padding: '1.5rem' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700 }}>📤 Partage manuel Instagram (sans API Meta)</h1>
        <ol style={{ background: 'white', borderRadius: 12, padding: '1rem 1rem 1rem 2.2rem', lineHeight: 2 }}>
          <li><strong>Copie</strong> la légende ci-dessous.</li>
          <li><strong>Télécharge</strong> l'image (ou retrouve-la sur ton téléphone).</li>
          <li><strong>Publie</strong> dans l'app Instagram et <strong>colle</strong> la légende.</li>
          <li>Reviens ici et clique <strong>« Marqué comme publié »</strong>.</li>
        </ol>

        {loading ? <p>Chargement de la file…</p> : (
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '0 0 260px' }}>
              <h3>File ({posts.length})</h3>
              {posts.length === 0 && <p>Aucun brouillon. Publie un article ou envoie des photos depuis le téléphone.</p>}
              {posts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left', marginBottom: '.5rem',
                    padding: '.6rem', borderRadius: 8, cursor: 'pointer',
                    border: p.id === selectedId ? '2px solid #2E4F4F' : '1px solid #ddd',
                    background: 'white',
                  }}
                >
                  <div style={{ fontSize: '.8rem', color: '#666' }}>{p.status} · {p.scheduled_at || 'sans date'}</div>
                  <div style={{ fontSize: '.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {(p.caption || '').slice(0, 60)}
                  </div>
                </button>
              ))}
            </div>

            <div style={{ flex: '1 1 320px', background: 'white', borderRadius: 12, padding: '1rem' }}>
              {!pack ? <p>Choisis une entrée dans la file.</p> : (
                <>
                  {pack.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={pack.image_url} alt="Visuel à publier" style={{ width: '100%', borderRadius: 8, marginBottom: '1rem' }} />
                  )}
                  <textarea readOnly value={pack.caption} rows={8} style={{ width: '100%', fontSize: '.85rem', padding: '.5rem' }} />
                  <div style={{ display: 'flex', gap: '.5rem', marginTop: '.8rem', flexWrap: 'wrap' }}>
                    <button onClick={copyCaption} style={btn}>📋 Copier la légende</button>
                    {pack.image_url && (
                      <a href={pack.image_url} download target="_blank" rel="noreferrer" style={{ ...btn, textDecoration: 'none' }}>
                        ⬇ Télécharger l'image
                      </a>
                    )}
                    <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" style={{ ...btn, textDecoration: 'none' }}>
                      📸 Ouvrir Instagram
                    </a>
                    <button onClick={markPublished} style={{ ...btn, background: '#2E4F4F', color: 'white' }}>
                      ✅ Marqué comme publié
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {toast && (
          <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: '#333', color: 'white', padding: '.6rem 1.2rem', borderRadius: 8 }}>
            {toast}
          </div>
        )}
      </div>
    </div>
  )
}

const btn: React.CSSProperties = {
  padding: '.6rem 1rem',
  borderRadius: 8,
  border: '1px solid #ccc',
  background: '#f0f0f0',
  cursor: 'pointer',
  fontSize: '.85rem',
  color: '#333',
  display: 'inline-block',
}
