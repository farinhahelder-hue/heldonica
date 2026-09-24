'use client'

import { useCallback, useEffect, useState } from 'react'

type Device = 'desktop' | 'mobile'

/**
 * /panel-manager/apercu — visualiser le site et modifier en direct.
 * Un iframe du site (même origine : le cookie de session CMS y est présent,
 * donc l'édition inline existante — InlineEditProvider/EditableZone — reste
 * active : clique un texte pour le modifier, comme sur le site).
 * Commutateur mobile/desktop + rechargement + ouverture externe.
 * Page autonome : aucune modification du panneau existant.
 */
const PRESETS: { id: string; label: string; path: string }[] = [
  { id: 'home', label: 'Accueil', path: '/' },
  { id: 'blog', label: 'Blog', path: '/blog' },
  { id: 'destinations', label: 'Destinations', path: '/destinations' },
  { id: 'carte', label: 'Carte', path: '/destinations/carte' },
]

export default function ApercuPage() {
  const [origin, setOrigin] = useState('')
  const [path, setPath] = useState('/')
  const [device, setDevice] = useState<Device>('desktop')
  const [frameKey, setFrameKey] = useState(0)
  const [editable, setEditable] = useState<boolean | null>(null)

  useEffect(() => {
    setOrigin(window.location.origin)
    // L'édition inline est active si la session CMS est reconnue.
    fetch('/api/cms/auth/check')
      .then((r) => r.json())
      .then((d) => setEditable(!!(d.authenticated || d.ok)))
      .catch(() => setEditable(false))
  }, [])

  const url = `${origin}${path}`

  const goPreset = useCallback((p: string) => {
    setPath(p)
    setFrameKey((k) => k + 1)
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#1a1a1a', fontFamily: 'system-ui', display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', gap: '.6rem', alignItems: 'center', padding: '.7rem 1rem', background: '#222', color: 'white', flexWrap: 'wrap' }}>
        <strong>👁 Aperçu live</strong>
        {PRESETS.map((p) => (
          <button key={p.id} onClick={() => goPreset(p.path)} style={toolBtn(path === p.path)}>
            {p.label}
          </button>
        ))}
        <input
          value={path}
          onChange={(e) => setPath(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') setFrameKey((k) => k + 1) }}
          placeholder="/blog/mon-article"
          style={{ flex: '1 1 200px', padding: '.45rem .7rem', borderRadius: 8, border: '1px solid #555', background: '#333', color: 'white' }}
        />
        <button onClick={() => setDevice(device === 'desktop' ? 'mobile' : 'desktop')} style={toolBtn(false)} title="Basculer mobile / bureau">
          {device === 'desktop' ? '📱 Mobile' : '🖥 Bureau'}
        </button>
        <button onClick={() => setFrameKey((k) => k + 1)} style={toolBtn(false)} title="Recharger">
          ⟳
        </button>
        <a href={url} target="_blank" rel="noreferrer" style={{ ...toolBtn(false), textDecoration: 'none' }} title="Ouvrir dans un onglet">
          ↗
        </a>
      </header>

      {editable === false && (
        <div style={{ background: '#5a3b00', color: '#ffe1a8', padding: '.5rem 1rem', fontSize: '.85rem' }}>
          Non connecté au CMS : visualisation seule. <a href="/panel-manager" style={{ color: 'white' }}>Se connecter</a> pour modifier les textes en cliquant dessus.
        </div>
      )}
      {editable === true && (
        <div style={{ background: '#0f3d2e', color: '#b9f5d6', padding: '.5rem 1rem', fontSize: '.85rem' }}>
          Session CMS reconnue : clique un texte du site pour le modifier en direct.
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '1rem', overflow: 'auto' }}>
        {origin && (
          <iframe
            key={frameKey}
            src={url}
            title="Aperçu live du site"
            style={{
              width: device === 'mobile' ? 390 : '100%',
              maxWidth: '100%',
              height: 'calc(100vh - 140px)',
              minHeight: 500,
              background: 'white',
              borderRadius: device === 'mobile' ? 24 : 8,
              border: device === 'mobile' ? '10px solid #000' : '1px solid #444',
            }}
          />
        )}
      </div>
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
