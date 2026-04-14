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
  cmsPassword?: string;
};

const FOLDERS = [
  { value: 'articles', label: '📁 articles/' },
  { value: 'destinations', label: '📁 destinations/' },
  { value: 'blog', label: '📁 blog/' },
  { value: 'coulisses', label: '📁 coulisses/' },
];

export default function MediaLibrary({ onSelect, onClose, cmsPassword }: Props) {
  const [tab, setTab] = useState<'library' | 'url'>('library');
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [toast, setToast] = useState('');
  const [uploading, setUploading] = useState(false);
  const [folder, setFolder] = useState('articles');
  const [deleting, setDeleting] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cms/media?prefix=${encodeURIComponent(folder)}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setFiles(data.files || []);
    } catch (e: unknown) {
      showToast(`❌ ${e instanceof Error ? e.message : 'Erreur'}`);
    } finally {
      setLoading(false);
    }
  }, [folder]);

  useEffect(() => { if (tab === 'library') loadFiles(); }, [tab, loadFiles]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', folder);
    try {
      const res = await fetch('/api/cms/media-upload', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (data.url) { showToast('✅ Image uploadée sur Supabase !'); loadFiles(); }
      else showToast(`❌ ${data.error}`);
    } finally { setUploading(false); e.target.value = ''; }
  };

  const importFromUrl = async () => {
    if (!imageUrl.trim()) return;
    const filename = `import-${Date.now()}.jpg`;
    setImporting(true);
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (cmsPassword) {
        headers['x-cms-auth'] = cmsPassword;
      }
      const res = await fetch('/api/cms/media', {
        method: 'POST',
        headers,
        body: JSON.stringify({ imageUrl: imageUrl, filename, folder }),
      });
      const data = await res.json();
      if (data.url) {
        showToast('✅ Photo importée !');
        setImageUrl('');
        setTab('library');
        loadFiles();
      } else {
        showToast(`❌ ${data.error}`);
      }
    } finally { setImporting(false); }
  };

  const deleteFile = async (key: string) => {
    if (!confirm('Supprimer cette image ?')) return;
    setDeleting(key);
    try {
      const res = await fetch('/api/cms/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });
      const data = await res.json();
      if (data.success) { showToast('🗑️ Image supprimée'); loadFiles(); }
      else showToast(`❌ ${data.error}`);
    } finally { setDeleting(null); }
  };

  const fmtSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} Ko`;
    return `${(bytes / 1048576).toFixed(1)} Mo`;
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
        width: '100%', maxWidth: 960, maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 64px rgba(0,0,0,.25)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1.5px solid #e8e3dc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#6b2a1a', margin: 0 }}>🖼️ Médiathèque Supabase</h2>
            <p style={{ fontSize: '.8rem', color: '#888', margin: 0 }}>Storage · Upload direct · Import Google Photos</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#888' }}>✕</button>
        </div>

        {toast && (
          <div style={{ position: 'absolute', top: '5rem', right: '2rem', background: '#1a1a1a', color: 'white', padding: '.7rem 1.2rem', borderRadius: '.5rem', zIndex: 10, fontSize: '.85rem', boxShadow: '0 4px 16px rgba(0,0,0,.2)' }}>{toast}</div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1.5px solid #e8e3dc', padding: '0 1.5rem' }}>
          {([['library', '☁️ Bibliothèque'], ['url', '🔗 Importer par URL']] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              padding: '.75rem 1.1rem', border: 'none', background: 'none', cursor: 'pointer',
              fontWeight: tab === id ? 700 : 400,
              color: tab === id ? '#6b2a1a' : '#666',
              borderBottom: tab === id ? '2.5px solid #6b2a1a' : '2.5px solid transparent',
              fontSize: '.88rem',
            }}>{label}</button>
          ))}
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>

          {/* ── Bibliothèque ── */}
          {tab === 'library' && (
            <div>
              <div style={{ display: 'flex', gap: '.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <select
                  value={folder}
                  onChange={e => setFolder(e.target.value)}
                  style={{ padding: '.5rem .75rem', border: '1.5px solid #ddd', borderRadius: '.5rem', fontSize: '.85rem' }}
                >
                  {FOLDERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
                <button onClick={loadFiles} style={{ padding: '.5rem .9rem', background: 'white', border: '1.5px solid #ddd', borderRadius: '.5rem', cursor: 'pointer', fontSize: '.85rem' }}>🔄</button>
                <label style={{
                  padding: '.5rem 1rem',
                  background: uploading ? '#ccc' : '#01696f',
                  color: 'white', borderRadius: '.5rem', cursor: uploading ? 'wait' : 'pointer',
                  fontSize: '.85rem', fontWeight: 600,
                }}>
                  {uploading ? '⏳ Upload…' : '⬆️ Uploader'}
                  <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} disabled={uploading} />
                </label>
                <button
                  onClick={() => setTab('url')}
                  style={{ padding: '.5rem 1rem', background: '#4285F4', color: 'white', border: 'none', borderRadius: '.5rem', cursor: 'pointer', fontSize: '.85rem', fontWeight: 600 }}
                >🔗 Importer par URL</button>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>Chargement…</div>
              ) : files.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '.75rem' }}>📂</div>
                  <p>Aucune image dans ce dossier</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
                  {files.map(f => (
                    <div
                      key={f.key}
                      style={{
                        borderRadius: '.75rem', overflow: 'hidden',
                        border: '2px solid #e8e3dc', background: '#faf8f5',
                        position: 'relative',
                      }}
                    >
                      <img
                        src={f.url}
                        alt={f.name}
                        style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block', cursor: 'pointer' }}
                        loading="lazy"
                        onClick={() => { onSelect(f.url); onClose(); }}
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      <div style={{ padding: '.5rem .6rem' }}>
                        <p style={{ fontSize: '.72rem', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{f.name}</p>
                        <p style={{ fontSize: '.68rem', color: '#aaa', margin: '2px 0 0' }}>{fmtSize(f.size)}</p>
                      </div>
                      <button
                        onClick={() => deleteFile(f.key)}
                        disabled={deleting === f.key}
                        style={{
                          position: 'absolute', top: 6, right: 6,
                          background: 'rgba(192,57,43,.85)', color: 'white',
                          border: 'none', borderRadius: '50%', width: 22, height: 22,
                          cursor: 'pointer', fontSize: '.7rem', lineHeight: 1,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                        title="Supprimer"
                      >✕</button>
                      <button
                        onClick={() => { onSelect(f.url); onClose(); }}
                        style={{
                          position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
                          background: 'rgba(107,42,26,.9)', color: 'white',
                          border: 'none', borderRadius: '.4rem', padding: '.25rem .6rem',
                          cursor: 'pointer', fontSize: '.72rem', fontWeight: 600, whiteSpace: 'nowrap',
                        }}
                      >✅ Sélectionner</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Import par URL ── */}
          {tab === 'url' && (
            <div style={{ maxWidth: 560, margin: '0 auto' }}>
              <div style={{ background: '#faf8f5', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.5rem', border: '1.5px solid #e8e3dc' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '.75rem' }}>🔗 Importer depuis une URL</h3>

                <div style={{ background: '#e8f4f8', borderRadius: '.75rem', padding: '1rem', marginBottom: '1.25rem', fontSize: '.83rem', color: '#1a5276', lineHeight: 1.7 }}>
                  <strong>Compatible avec :</strong><br />
                  • Google Photos, iCloud, Dropbox<br />
                  • Unsplash, Pexels, Pixabay<br />
                  • N'importe quel hébergement d'images<br /><br />
                  <strong>Comment obtenir l'URL :</strong><br />
                  Clic droit → "Copier l'adresse de l'image"
                </div>

                <label style={{ display: 'block', fontWeight: 600, fontSize: '.85rem', color: '#555', marginBottom: '.35rem' }}>URL de l'image *</label>
                <input
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="https://lh3.googleusercontent.com/... ou https://images.unsplash.com/..."
                  style={{ width: '100%', padding: '.65rem .9rem', border: '1.5px solid #e0dbd5', borderRadius: '.5rem', fontSize: '.88rem', marginBottom: '1rem', background: '#fff' }}
                />

                <label style={{ display: 'block', fontWeight: 600, fontSize: '.85rem', color: '#555', marginBottom: '.35rem' }}>Dossier de destination</label>
                <select
                  value={folder}
                  onChange={e => setFolder(e.target.value)}
                  style={{ width: '100%', padding: '.65rem .9rem', border: '1.5px solid #e0dbd5', borderRadius: '.5rem', fontSize: '.88rem', marginBottom: '1.5rem', background: '#fff' }}
                >
                  {FOLDERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>

                <button
                  onClick={importFromUrl}
                  disabled={!imageUrl.trim() || importing}
                  style={{
                    width: '100%', padding: '.8rem',
                    background: importing ? '#ccc' : '#01696f',
                    color: 'white', border: 'none', borderRadius: '.5rem',
                    cursor: importing ? 'wait' : 'pointer',
                    fontSize: '.9rem', fontWeight: 600,
                  }}
                >
                  {importing ? '⏳ Import en cours...' : '📥 Importer cette image'}
                </button>
              </div>

              {imageUrl && (
                <div style={{ background: 'white', borderRadius: '.75rem', padding: '1rem', border: '2px solid #e8e3dc' }}>
                  <p style={{ fontSize: '.8rem', color: '#888', marginBottom: '.5rem' }}>Aperçu :</p>
                  <img src={imageUrl} alt="Aperçu" style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: '.5rem' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ padding: '1rem 1.5rem', borderTop: '1.5px solid #e8e3dc', background: '#faf8f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '.8rem', color: '#aaa' }}>
            {tab === 'library' ? `${files.length} image${files.length !== 1 ? 's' : ''} · Supabase Storage` : 'Import vers Supabase Storage'}
          </span>
          <button onClick={onClose} style={{ padding: '.55rem 1.25rem', border: '1.5px solid #ddd', borderRadius: '.5rem', background: 'white', cursor: 'pointer', fontSize: '.85rem' }}>Fermer</button>
        </div>
      </div>
    </div>
  );
}
