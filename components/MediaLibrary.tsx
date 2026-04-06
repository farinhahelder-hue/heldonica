'use client';

import { useState, useEffect, useCallback } from 'react';

type MediaFile = {
  key: string;
  url: string;
  name: string;
  size?: number;
  lastModified?: string;
};

type Props = {
  onSelect: (url: string) => void;
  onClose: () => void;
  cmsPassword: string;
};

export default function MediaLibrary({ onSelect, onClose, cmsPassword }: Props) {
  const [tab, setTab] = useState<'idrive' | 'google'>('idrive');
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState<string | null>(null);
  const [googleUrl, setGoogleUrl] = useState('');
  const [googleFilename, setGoogleFilename] = useState('');
  const [toast, setToast] = useState('');
  const [uploading, setUploading] = useState(false);
  const [prefix, setPrefix] = useState('articles/');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cms/media?prefix=${encodeURIComponent(prefix)}`, {
        headers: { 'x-cms-auth': cmsPassword },
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setFiles(data.files || []);
    } catch (e: unknown) {
      showToast(`❌ ${e instanceof Error ? e.message : 'Erreur de chargement'}`);
    } finally {
      setLoading(false);
    }
  }, [cmsPassword, prefix]);

  useEffect(() => { if (tab === 'idrive') loadFiles(); }, [tab, loadFiles]);

  // Upload direct vers iDrive
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', prefix.replace('/', ''));
    try {
      const res = await fetch('/api/cms/media-upload', {
        method: 'POST',
        headers: { 'x-cms-auth': cmsPassword },
        body: fd,
      });
      const data = await res.json();
      if (data.url) { showToast('✅ Image uploadée !'); loadFiles(); }
      else showToast(`❌ ${data.error}`);
    } finally { setUploading(false); e.target.value = ''; }
  };

  // Import depuis URL Google Photos
  const importFromGoogle = async () => {
    if (!googleUrl.trim()) return;
    const filename = googleFilename.trim() || `google-${Date.now()}.jpg`;
    setImporting(googleUrl);
    try {
      const res = await fetch('/api/cms/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-cms-auth': cmsPassword },
        body: JSON.stringify({ imageUrl: googleUrl, filename }),
      });
      const data = await res.json();
      if (data.url) {
        showToast('✅ Photo importée dans iDrive !');
        setGoogleUrl('');
        setGoogleFilename('');
        setTab('idrive');
        loadFiles();
      } else {
        showToast(`❌ ${data.error}`);
      }
    } finally { setImporting(null); }
  };

  const fmtSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
    return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: 'white', borderRadius: '1.25rem',
        width: '100%', maxWidth: 900, maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 64px rgba(0,0,0,.25)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1.5px solid #e8e3dc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#6b2a1a', margin: 0 }}>🖼️ Médiathèque</h2>
            <p style={{ fontSize: '.8rem', color: '#888', margin: 0 }}>iDrive e2 · Google Photos</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#888', lineHeight: 1 }}>✕</button>
        </div>

        {/* Toast */}
        {toast && (
          <div style={{ position: 'absolute', top: '5rem', right: '2rem', background: '#1a1a1a', color: 'white', padding: '.7rem 1.2rem', borderRadius: '.5rem', zIndex: 10, fontSize: '.85rem' }}>{toast}</div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1.5px solid #e8e3dc', padding: '0 1.5rem' }}>
          {([['idrive', '☁️ iDrive e2'], ['google', '📸 Google Photos']] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                padding: '.75rem 1.1rem', border: 'none', background: 'none', cursor: 'pointer',
                fontWeight: tab === id ? 700 : 400,
                color: tab === id ? '#6b2a1a' : '#666',
                borderBottom: tab === id ? '2.5px solid #6b2a1a' : '2.5px solid transparent',
                fontSize: '.88rem',
              }}
            >{label}</button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>

          {/* ── onglet iDrive ── */}
          {tab === 'idrive' && (
            <div>
              {/* Toolbar */}
              <div style={{ display: 'flex', gap: '.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <select
                  value={prefix}
                  onChange={e => setPrefix(e.target.value)}
                  style={{ padding: '.5rem .75rem', border: '1.5px solid #ddd', borderRadius: '.5rem', fontSize: '.85rem' }}
                >
                  <option value="articles/">📁 articles/</option>
                  <option value="destinations/">📁 destinations/</option>
                  <option value="blog/">📁 blog/</option>
                  <option value="">📁 Tout</option>
                </select>
                <button
                  onClick={loadFiles}
                  style={{ padding: '.5rem .9rem', background: 'white', border: '1.5px solid #ddd', borderRadius: '.5rem', cursor: 'pointer', fontSize: '.85rem' }}
                >🔄 Actualiser</button>
                <label style={{
                  padding: '.5rem 1rem', background: uploading ? '#ccc' : '#2d6a4f',
                  color: 'white', borderRadius: '.5rem', cursor: 'pointer', fontSize: '.85rem', fontWeight: 600,
                }}>
                  {uploading ? '⏳ Upload…' : '⬆️ Uploader une image'}
                  <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} disabled={uploading} />
                </label>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>Chargement des images…</div>
              ) : files.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '.75rem' }}>📂</div>
                  <p style={{ marginBottom: '.5rem' }}>Aucune image dans ce dossier</p>
                  <p style={{ fontSize: '.82rem' }}>Uploadez ou importez depuis Google Photos</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
                  {files.map(f => (
                    <div
                      key={f.key}
                      onClick={() => { onSelect(f.url); onClose(); }}
                      style={{
                        borderRadius: '.75rem', overflow: 'hidden', border: '2px solid #e8e3dc',
                        cursor: 'pointer', transition: 'all .18s',
                        background: '#faf8f5',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = '#6b2a1a')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = '#e8e3dc')}
                    >
                      <img
                        src={f.url}
                        alt={f.name}
                        style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }}
                        loading="lazy"
                        onError={e => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22160%22 height=%22120%22%3E%3Crect fill=%22%23f0ece6%22 width=%22160%22 height=%22120%22/%3E%3Ctext fill=%22%23aaa%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.35em%22 font-size=%2230%22%3E🖼%3C/text%3E%3C/svg%3E'; }}
                      />
                      <div style={{ padding: '.5rem .6rem' }}>
                        <p style={{ fontSize: '.72rem', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{f.name}</p>
                        <p style={{ fontSize: '.68rem', color: '#aaa', margin: 0 }}>{fmtSize(f.size)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── onglet Google Photos ── */}
          {tab === 'google' && (
            <div style={{ maxWidth: 540, margin: '0 auto' }}>
              <div style={{ background: '#faf8f5', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.5rem', border: '1.5px solid #e8e3dc' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '.5rem' }}>📸 Importer depuis Google Photos</h3>
                <p style={{ fontSize: '.85rem', color: '#666', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                  Dans Google Photos, ouvre ta photo → clique sur les <strong>⋮ 3 points</strong> → <strong>"Créer un lien"</strong> ou <strong>"Partager"</strong> → copie l&apos;URL directe de l&apos;image, puis colle-la ci-dessous.
                  La photo sera sauvegardée dans ton iDrive e2.
                </p>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '.85rem', color: '#555', marginBottom: '.35rem' }}>URL de l&apos;image Google Photos</label>
                <input
                  value={googleUrl}
                  onChange={e => setGoogleUrl(e.target.value)}
                  placeholder="https://lh3.googleusercontent.com/..."
                  style={{ width: '100%', padding: '.65rem .9rem', border: '1.5px solid #e0dbd5', borderRadius: '.5rem', fontSize: '.88rem', marginBottom: '1rem', background: '#fff' }}
                />
                <label style={{ display: 'block', fontWeight: 600, fontSize: '.85rem', color: '#555', marginBottom: '.35rem' }}>Nom du fichier (optionnel)</label>
                <input
                  value={googleFilename}
                  onChange={e => setGoogleFilename(e.target.value)}
                  placeholder="ex : portugal-sintra-2025.jpg"
                  style={{ width: '100%', padding: '.65rem .9rem', border: '1.5px solid #e0dbd5', borderRadius: '.5rem', fontSize: '.88rem', marginBottom: '1.25rem', background: '#fff' }}
                />
                <button
                  onClick={importFromGoogle}
                  disabled={!googleUrl.trim() || !!importing}
                  style={{
                    width: '100%', padding: '.8rem',
                    background: importing ? '#ccc' : '#6b2a1a',
                    color: 'white', border: 'none', borderRadius: '.5rem',
                    fontWeight: 700, cursor: importing ? 'wait' : 'pointer', fontSize: '.9rem',
                  }}
                >{importing ? '⏳ Import en cours…' : '⬆️ Importer dans iDrive e2'}</button>
              </div>

              <div style={{ background: '#fff8e1', borderRadius: '.75rem', padding: '1rem 1.25rem', border: '1.5px solid #ffe082' }}>
                <p style={{ fontSize: '.82rem', color: '#7a5c00', margin: 0, lineHeight: 1.65 }}>
                  <strong>💡 Astuce :</strong> Pour récupérer l&apos;URL directe d&apos;une photo Google Photos :
                  ouvre la photo en plein écran → clic droit → &quot;Copier l&apos;adresse de l&apos;image&quot;.
                  L&apos;URL commence par <code>https://lh3.googleusercontent.com</code>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1.5px solid #e8e3dc', background: '#faf8f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '.8rem', color: '#aaa' }}>
            {tab === 'idrive' ? `${files.length} image${files.length !== 1 ? 's' : ''} dans ce dossier` : 'Import vers iDrive e2'}
          </span>
          <button onClick={onClose} style={{ padding: '.55rem 1.25rem', border: '1.5px solid #ddd', borderRadius: '.5rem', background: 'white', cursor: 'pointer', fontSize: '.85rem' }}>Fermer</button>
        </div>
      </div>
    </div>
  );
}
