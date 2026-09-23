'use client'

import { useCallback, useEffect, useState } from 'react'
import { pathToNamespace } from '@/lib/cms-namespace'

type Device = 'desktop' | 'tablet' | 'mobile'
type Tab = 'brouillons' | 'zones'

interface Draft {
  id: number
  title: string
  slug: string
}

interface Zone {
  zone_key: string
  zone_type: string
  value: string
  is_active: boolean
}

const DEVICE_WIDTH: Record<Device, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '390px',
}

/**
 * /panel-manager/editeur-avance — preview avancé (v2 de /apercu, sans y toucher).
 * - Brouillons : liste les articles non publiés, génère un preview-token et
 *   affiche le rendu réel dans l'iframe (mécanisme /blog/[slug]?preview_token).
 * - Zones : inspecte les zones éditables du namespace deviné depuis l'URL,
 *   modifie et sauvegarde (PATCH /api/cms/zones, historique inclus côté API).
 * - Appareils : desktop / tablette / mobile + rechargement.
 */
export default function EditeurAvancePage() {
  const [origin, setOrigin] = useState('')
  const [path, setPath] = useState('/')
  const [device, setDevice] = useState<Device>('desktop')
  const [frameKey, setFrameKey] = useState(0)
  const [tab, setTab] = useState<Tab>('brouillons')
  const [editable, setEditable] = useState<boolean | null>(null)

  const [drafts, setDrafts] = useState<Draft[]>([])
  const [loadingDrafts, setLoadingDrafts] = useState(false)
  const [namespace, setNamespace] = useState('home')
  const [zones, setZones] = useState<Zone[]>([])
  const [loadingZones, setLoadingZones] = useState(false)
  const [editing, setEditing] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [toast, setToast] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  useEffect(() => {
    setOrigin(window.location.origin)
    fetch('/api/cms/auth/check')
      .then((r) => r.json())
      .then((d) => setEditable(!!(d.authenticated || d.ok)))
      .catch(() => setEditable(false))
  }, [])

  const loadDrafts = useCallback(async () => {
    setLoadingDrafts(true)
    try {
      const res = await fetch('/api/cms/articles?status=draft')
      const data = await res.json()
      setDrafts(Array.isArray(data.articles) ? data.articles : [])
    } catch {
      showToast('Brouillons illisibles')
    } finally {
      setLoadingDrafts(false)
    }
  }, [])

  useEffect(() => { loadDrafts() }, [loadDrafts])

  async function previewDraft(slug: string) {
    try {
      const res = await fetch(`/api/cms/preview-token?slug=${encodeURIComponent(slug)}`)
      if (!res.ok) { showToast('Token impossible'); return }
      const data = await res.json()
      // data.previewUrl absolue : on garde chemin + query pour l'iframe locale.
      const u = new URL(data.previewUrl, window.location.origin)
      setPath(u.pathname + u.search)
      setFrameKey((k) => k + 1)
      showToast('Aperçu du brouillon chargé')
    } catch {
      showToast('Aperçu impossible')
    }
  }

  async function loadZones() {
    if (!namespace) return
    setLoadingZones(true)
    try {
      const res = await fetch(`/api/cms/zones?page=${encodeURIComponent(namespace)}`)
      const data = await res.json()
      const byPage = data.byPage?.[namespace] || {}
      setZones(Object.values(byPage) as Zone[])
      setEditing({})
    } catch {
      showToast('Zones illisibles')
    } finally {
      setLoadingZones(false)
    }
  }

  function guessNamespace() {
    const ns = pathToNamespace(path)
    if (ns) { setNamespace(ns); showToast(`Namespace deviné : ${ns}`) }
    else showToast('URL non convertible')
  }

  async function saveZone(zoneKey: string) {
    const value = editing[zoneKey] ?? ''
    setSaving(zoneKey)
    try {
      const res = await fetch('/api/cms/zones', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: namespace, zone_key: zoneKey, value }),
      })
      if (res.ok) {
        showToast('Zone enregistrée')
        setZones((zs) => zs.map((z) => (z.zone_key === zoneKey ? { ...z, value } : z)))
        setFrameKey((k) => k + 1)
      } else showToast('Échec enregistrement')
    } catch {
      showToast('Échec enregistrement')
    } finally {
      setSaving(null)
    }
  }

  const url = `${origin}${path}`

  return (
    <div style={{ minHeight: '100vh', background: '#1a1a1a', fontFamily: 'system-ui', display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', gap: '.6rem', alignItems: 'center', padding: '.7rem 1rem', background: '#222', color: 'white', flexWrap: 'wrap' }}>
        <strong>🧪 Éditeur avancé</strong>
        <input
          value={path}
          onChange={(e) => setPath(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') setFrameKey((k) => k + 1) }}
          style={{ flex: '1 1 220px', padding: '.45rem .7rem', borderRadius: 8, border: '1px solid #555', background: '#333', color: 'white' }}
        />
        {(['desktop', 'tablet', 'mobile'] as Device[]).map((d) => (
          <button key={d} onClick={() => setDevice(d)} style={toolBtn(device === d)}>
            {d === 'desktop' ? '🖥' : d === 'tablet' ? '📟' : '📱'}
          </button>
        ))}
        <button onClick={() => setFrameKey((k) => k + 1)} style={toolBtn(false)} title="Recharger">⟳</button>
        <a href={url} target="_blank" rel="noreferrer" style={{ ...toolBtn(false), textDecoration: 'none' }}>↗</a>
      </header>

      {editable === false && (
        <div style={{ background: '#5a3b00', color: '#ffe1a8', padding: '.5rem 1rem', fontSize: '.85rem' }}>
          Non connecté : visualisation seule. <a href="/panel-manager" style={{ color: 'white' }}>Se connecter</a> pour prévisualiser les brouillons et modifier les zones.
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <aside style={{ width: 340, minWidth: 300, background: '#242424', color: 'white', padding: '1rem', overflowY: 'auto' }}>
          <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1rem' }}>
            <button onClick={() => setTab('brouillons')} style={toolBtn(tab === 'brouillons')}>📝 Brouillons</button>
            <button onClick={() => setTab('zones')} style={toolBtn(tab === 'zones')}>🧩 Zones</button>
          </div>

          {tab === 'brouillons' && (
            <>
              <button onClick={loadDrafts} style={toolBtn(false)}>⟳ Recharger</button>
              {loadingDrafts ? <p>Chargement…</p> : drafts.length === 0 ? <p>Aucun brouillon.</p> : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {drafts.map((d) => (
                    <li key={d.id} style={{ marginBottom: '.6rem', background: '#333', borderRadius: 8, padding: '.6rem' }}>
                      <div style={{ fontSize: '.9rem', marginBottom: '.4rem' }}>{d.title}</div>
                      <button onClick={() => previewDraft(d.slug)} style={toolBtn(false)}>👁 Aperçu</button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {tab === 'zones' && (
            <>
              <div style={{ display: 'flex', gap: '.4rem', marginBottom: '.6rem' }}>
                <input
                  value={namespace}
                  onChange={(e) => setNamespace(e.target.value)}
                  placeholder="destinations-roumanie-sibiu"
                  style={{ flex: 1, padding: '.45rem .6rem', borderRadius: 8, border: '1px solid #555', background: '#333', color: 'white' }}
                />
                <button onClick={guessNamespace} style={toolBtn(false)} title="Deviner depuis l'URL affichée">🎯</button>
                <button onClick={loadZones} style={toolBtn(false)}>Charger</button>
              </div>
              {loadingZones ? <p>Chargement…</p> : zones.length === 0 ? <p>Aucune zone. Charge un namespace.</p> : (
                zones.map((z) => (
                  <div key={z.zone_key} style={{ marginBottom: '.8rem', background: '#333', borderRadius: 8, padding: '.6rem' }}>
                    <div style={{ fontSize: '.75rem', color: '#aaa', marginBottom: '.3rem' }}>
                      {z.zone_key} <span style={{ opacity: .7 }}>({z.zone_type})</span>
                    </div>
                    <textarea
                      value={editing[z.zone_key] ?? z.value}
                      onChange={(e) => setEditing((m) => ({ ...m, [z.zone_key]: e.target.value }))}
                      rows={3}
                      style={{ width: '100%', fontSize: '.8rem', padding: '.4rem', borderRadius: 6, background: '#222', color: 'white', border: '1px solid #555' }}
                    />
                    <button
                      onClick={() => saveZone(z.zone_key)}
                      disabled={saving === z.zone_key}
                      style={{ ...toolBtn(false), marginTop: '.4rem' }}
                    >
                      {saving === z.zone_key ? '…' : '💾 Enregistrer'}
                    </button>
                  </div>
                ))
              )}
            </>
          )}
        </aside>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '1rem', overflow: 'auto' }}>
          {origin && (
            <iframe
              key={frameKey}
              src={url}
              title="Éditeur avancé"
              style={{
                width: DEVICE_WIDTH[device],
                maxWidth: '100%',
                height: 'calc(100vh - 140px)',
                minHeight: 500,
                background: 'white',
                borderRadius: device === 'desktop' ? 8 : 24,
                border: device === 'desktop' ? '1px solid #444' : '10px solid #000',
              }}
            />
          )}
        </div>
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: '#333', color: 'white', padding: '.6rem 1.2rem', borderRadius: 8 }}>
          {toast}
        </div>
      )}
    </div>
  )
}

function toolBtn(active: boolean): React.CSSProperties {
  return {
    padding: '.45rem .8rem',
    borderRadius: 8,
    border: '1px solid #555',
    background: active ? '#2E4F4F' : '#333',
    color: 'white',
    cursor: 'pointer',
    fontSize: '.85rem',
  }
}
