'use client';

import { useState, useEffect, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────
type Article = {
  id: number; title: string; slug: string; category: string;
  published: boolean; published_at: string; created_at: string;
  excerpt: string; featured_image: string; content?: string;
};

type Demande = {
  id: string; prenom: string; nom: string; email: string;
  telephone: string; destination: string; style_voyage: string;
  duree_jours: number; budget_fourchette: string; nb_voyageurs: number;
  mois_depart: string; notes: string; statut: string; created_at: string;
};

// ─── Helpers ─────────────────────────────────────────────────
const fmt = (d: string) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
const slug = (t: string) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// ─── Composant principal ──────────────────────────────────────
export default function CMSAdmin() {
  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState('');
  const [authErr, setAuthErr] = useState('');
  const [tab, setTab] = useState('articles');
  const [toast, setToast] = useState('');

  // Articles
  const [articles, setArticles] = useState<Article[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingArticle, setEditingArticle] = useState<Partial<Article> | null>(null);
  const [loadingArticles, setLoadingArticles] = useState(false);

  // Demandes travel
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [loadingDemandes, setLoadingDemandes] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  // Auth
  const login = async () => {
    setAuthErr('');
    const res = await fetch('/api/cms/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pwd }),
    });
    if (res.ok) { setAuthed(true); }
    else { setAuthErr('Mot de passe incorrect'); }
  };

  // Load articles
  const loadArticles = useCallback(async () => {
    setLoadingArticles(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    const res = await fetch(`/api/cms/articles?${params}`);
    const data = await res.json();
    setArticles(data.articles || []);
    setLoadingArticles(false);
  }, [search, statusFilter]);

  // Load demandes
  const loadDemandes = useCallback(async () => {
    setLoadingDemandes(true);
    const res = await fetch('/api/cms/demandes-travel');
    const data = await res.json();
    setDemandes(data.demandes || []);
    setLoadingDemandes(false);
  }, []);

  useEffect(() => { if (authed) loadArticles(); }, [authed, loadArticles]);
  useEffect(() => { if (authed && tab === 'demandes') loadDemandes(); }, [authed, tab, loadDemandes]);

  // Save article
  const saveArticle = async () => {
    if (!editingArticle) return;
    const isNew = !editingArticle.id;
    const payload = {
      ...editingArticle,
      slug: editingArticle.slug || slug(editingArticle.title || ''),
      published_at: editingArticle.published && !editingArticle.published_at
        ? new Date().toISOString() : editingArticle.published_at,
    };
    const url = isNew ? '/api/cms/articles' : `/api/cms/articles/${editingArticle.id}`;
    const method = isNew ? 'POST' : 'PUT';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      showToast(isNew ? '✅ Article créé !' : '✅ Article mis à jour !');
      setEditingArticle(null);
      loadArticles();
    } else {
      const d = await res.json();
      showToast(`❌ Erreur : ${d.error}`);
    }
  };

  // Toggle publish
  const togglePublish = async (a: Article) => {
    const res = await fetch(`/api/cms/articles/${a.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        published: !a.published,
        published_at: !a.published ? new Date().toISOString() : a.published_at,
      }),
    });
    if (res.ok) { showToast(!a.published ? '✅ Publié !' : '📦 Repassé en brouillon'); loadArticles(); }
  };

  // Delete article
  const deleteArticle = async (id: number) => {
    if (!confirm('Supprimer cet article ?')) return;
    const res = await fetch(`/api/cms/articles/${id}`, { method: 'DELETE' });
    if (res.ok) { showToast('🗑️ Article supprimé'); loadArticles(); }
  };

  // Upload image
  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>, field: 'featured_image') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'articles');
    const res = await fetch('/api/cms/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.url) {
      setEditingArticle(prev => prev ? { ...prev, [field]: data.url } : prev);
      showToast('✅ Image uploadée !');
    } else {
      showToast(`❌ Upload échoué : ${data.error}`);
    }
  };

  // Update statut demande
  const updateStatut = async (id: string, statut: string) => {
    const res = await fetch('/api/cms/demandes-travel', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, statut }),
    });
    if (res.ok) { showToast('✅ Statut mis à jour'); loadDemandes(); }
  };

  // ─── Écran login ──────────────────────────────────────────
  if (!authed) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f3ef' }}>
      <div style={{ background: 'white', padding: '2.5rem', borderRadius: '1rem', boxShadow: '0 8px 32px rgba(0,0,0,.1)', width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '.5rem' }}>🌿</div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#6b2a1a' }}>Heldonica CMS</h1>
          <p style={{ color: '#888', fontSize: '.9rem' }}>Accès réservé</p>
        </div>
        <input
          type="password"
          placeholder="Mot de passe"
          value={pwd}
          onChange={e => setPwd(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()}
          style={{ width: '100%', padding: '.75rem 1rem', border: '1.5px solid #ddd', borderRadius: '.5rem', fontSize: '1rem', marginBottom: '.75rem', outline: 'none' }}
        />
        {authErr && <p style={{ color: '#c0392b', fontSize: '.85rem', marginBottom: '.75rem' }}>{authErr}</p>}
        <button
          onClick={login}
          style={{ width: '100%', padding: '.8rem', background: '#6b2a1a', color: 'white', border: 'none', borderRadius: '.5rem', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}
        >Entrer</button>
      </div>
    </div>
  );

  // ─── CMS principal ────────────────────────────────────────
  const TABS = [
    { id: 'articles', label: '📝 Articles', count: articles.length },
    { id: 'new', label: '✏️ Nouvel article', count: null },
    { id: 'demandes', label: '✈️ Travel Planning', count: demandes.length },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f5f3ef', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#6b2a1a', color: 'white', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 2px 12px rgba(0,0,0,.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🌿</span>
          <span style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '.03em' }}>Heldonica CMS</span>
        </div>
        <button onClick={() => setAuthed(false)} style={{ background: 'rgba(255,255,255,.15)', border: 'none', color: 'white', padding: '.4rem .9rem', borderRadius: '.4rem', cursor: 'pointer', fontSize: '.85rem' }}>Déconnexion</button>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: '5rem', right: '1.5rem', background: '#1a1a1a', color: 'white', padding: '.8rem 1.4rem', borderRadius: '.6rem', zIndex: 100, fontSize: '.9rem', boxShadow: '0 4px 16px rgba(0,0,0,.2)' }}>{toast}</div>
      )}

      {/* Tabs nav */}
      <div style={{ background: 'white', borderBottom: '1.5px solid #e8e3dc', padding: '0 2rem', display: 'flex', gap: '.25rem' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); if (t.id === 'new') setEditingArticle({}); }}
            style={{
              padding: '.85rem 1.2rem', border: 'none', background: 'none', cursor: 'pointer',
              fontWeight: tab === t.id ? 700 : 400,
              color: tab === t.id ? '#6b2a1a' : '#666',
              borderBottom: tab === t.id ? '2.5px solid #6b2a1a' : '2.5px solid transparent',
              fontSize: '.9rem', display: 'flex', alignItems: 'center', gap: '.4rem',
            }}
          >
            {t.label}
            {t.count !== null && t.count > 0 && (
              <span style={{ background: '#f0e8e4', color: '#6b2a1a', borderRadius: '9999px', padding: '.1rem .55rem', fontSize: '.75rem', fontWeight: 700 }}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 1100, margin: '2rem auto', padding: '0 1.5rem' }}>

        {/* ── LISTE ARTICLES ── */}
        {tab === 'articles' && (
          <div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                placeholder="Rechercher un article..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && loadArticles()}
                style={{ padding: '.6rem 1rem', border: '1.5px solid #ddd', borderRadius: '.5rem', flex: 1, minWidth: 200, fontSize: '.9rem' }}
              />
              <select
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); }}
                style={{ padding: '.6rem .9rem', border: '1.5px solid #ddd', borderRadius: '.5rem', fontSize: '.9rem' }}
              >
                <option value="all">Tous</option>
                <option value="published">Publiés</option>
                <option value="draft">Brouillons</option>
              </select>
              <button onClick={loadArticles} style={{ padding: '.6rem 1.2rem', background: '#6b2a1a', color: 'white', border: 'none', borderRadius: '.5rem', cursor: 'pointer', fontSize: '.9rem' }}>🔍 Chercher</button>
              <button onClick={() => { setEditingArticle({}); setTab('new'); }} style={{ padding: '.6rem 1.2rem', background: '#2d6a4f', color: 'white', border: 'none', borderRadius: '.5rem', cursor: 'pointer', fontSize: '.9rem' }}>+ Nouvel article</button>
            </div>

            {loadingArticles ? (
              <p style={{ textAlign: 'center', color: '#888', padding: '3rem' }}>Chargement…</p>
            ) : articles.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: '#aaa' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                <p>Aucun article trouvé</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                {articles.map(a => (
                  <div key={a.id} style={{ background: 'white', borderRadius: '.75rem', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,.06)', flexWrap: 'wrap' }}>
                    {a.featured_image && (
                      <img src={a.featured_image} alt="" style={{ width: 64, height: 48, objectFit: 'cover', borderRadius: '.4rem', flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontWeight: 600, fontSize: '1rem', color: '#1a1a1a', marginBottom: '.2rem' }}>{a.title}</div>
                      <div style={{ fontSize: '.8rem', color: '#888', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <span>{a.category || '—'}</span>
                        <span>{fmt(a.created_at)}</span>
                      </div>
                    </div>
                    <span style={{
                      padding: '.3rem .8rem', borderRadius: '9999px', fontSize: '.78rem', fontWeight: 600,
                      background: a.published ? '#d4edda' : '#fff3cd',
                      color: a.published ? '#155724' : '#856404',
                    }}>{a.published ? '✅ Publié' : '📦 Brouillon'}</span>
                    <div style={{ display: 'flex', gap: '.5rem' }}>
                      <button
                        onClick={() => { setEditingArticle(a); setTab('new'); }}
                        style={{ padding: '.35rem .8rem', border: '1px solid #ddd', borderRadius: '.4rem', background: 'white', cursor: 'pointer', fontSize: '.82rem' }}
                      >✏️ Éditer</button>
                      <button
                        onClick={() => togglePublish(a)}
                        style={{ padding: '.35rem .8rem', border: '1px solid #ddd', borderRadius: '.4rem', background: 'white', cursor: 'pointer', fontSize: '.82rem' }}
                      >{a.published ? '📦 Dépublier' : '🚀 Publier'}</button>
                      <button
                        onClick={() => deleteArticle(a.id)}
                        style={{ padding: '.35rem .8rem', border: '1px solid #fcc', borderRadius: '.4rem', background: '#fff5f5', color: '#c0392b', cursor: 'pointer', fontSize: '.82rem' }}
                      >🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ÉDITEUR ARTICLE ── */}
        {tab === 'new' && (
          <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 2px 12px rgba(0,0,0,.07)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#6b2a1a' }}>
                {editingArticle?.id ? `✏️ Modifier : ${editingArticle.title}` : '✏️ Nouvel article'}
              </h2>
              <button onClick={() => setTab('articles')} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.3rem' }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Titre *</label>
                <input
                  value={editingArticle?.title || ''}
                  onChange={e => setEditingArticle(p => ({ ...p, title: e.target.value, slug: slug(e.target.value) }))}
                  style={inp}
                  placeholder="Titre de l'article"
                />
              </div>

              <div>
                <label style={lbl}>Slug (URL)</label>
                <input
                  value={editingArticle?.slug || ''}
                  onChange={e => setEditingArticle(p => ({ ...p, slug: e.target.value }))}
                  style={inp}
                  placeholder="slug-auto-genere"
                />
              </div>

              <div>
                <label style={lbl}>Catégorie</label>
                <select
                  value={editingArticle?.category || ''}
                  onChange={e => setEditingArticle(p => ({ ...p, category: e.target.value }))}
                  style={inp}
                >
                  <option value="">— Choisir —</option>
                  <option value="Slow Travel">Slow Travel</option>
                  <option value="Europe">Europe</option>
                  <option value="Escapades">Escapades</option>
                  <option value="Carnets de voyage">Carnets de voyage</option>
                  <option value="Coulisses">Coulisses</option>
                  <option value="Conseils">Conseils</option>
                  <option value="Destinations">Destinations</option>
                </select>
              </div>

              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Image à la une</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <input type="file" accept="image/*" onChange={e => uploadImage(e, 'featured_image')} style={{ fontSize: '.85rem' }} />
                  {editingArticle?.featured_image && (
                    <div style={{ position: 'relative' }}>
                      <img src={editingArticle.featured_image} alt="" style={{ height: 80, borderRadius: '.5rem', objectFit: 'cover' }} />
                      <button
                        onClick={() => setEditingArticle(p => ({ ...p, featured_image: '' }))}
                        style={{ position: 'absolute', top: -6, right: -6, background: '#c0392b', color: 'white', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: '.7rem' }}
                      >✕</button>
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <input
                      value={editingArticle?.featured_image || ''}
                      onChange={e => setEditingArticle(p => ({ ...p, featured_image: e.target.value }))}
                      style={{ ...inp, fontSize: '.82rem' }}
                      placeholder="Ou coller une URL d'image"
                    />
                  </div>
                </div>
              </div>

              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Extrait</label>
                <textarea
                  value={editingArticle?.excerpt || ''}
                  onChange={e => setEditingArticle(p => ({ ...p, excerpt: e.target.value }))}
                  style={{ ...inp, height: 80, resize: 'vertical' }}
                  placeholder="Résumé accrocheur pour les cards du blog…"
                />
              </div>

              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Contenu (HTML ou Markdown)</label>
                <textarea
                  value={editingArticle?.content || ''}
                  onChange={e => setEditingArticle(p => ({ ...p, content: e.target.value }))}
                  style={{ ...inp, height: 320, resize: 'vertical', fontFamily: 'monospace', fontSize: '.85rem' }}
                  placeholder="<p>Corps de l'article…</p>"
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer', fontWeight: 600, color: '#444', fontSize: '.9rem' }}>
                  <input
                    type="checkbox"
                    checked={!!editingArticle?.published}
                    onChange={e => setEditingArticle(p => ({ ...p, published: e.target.checked }))}
                    style={{ width: 18, height: 18 }}
                  />
                  Publier immédiatement
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setTab('articles')}
                style={{ padding: '.7rem 1.5rem', border: '1.5px solid #ddd', borderRadius: '.5rem', background: 'white', cursor: 'pointer', fontSize: '.9rem' }}
              >Annuler</button>
              <button
                onClick={saveArticle}
                style={{ padding: '.7rem 2rem', background: '#6b2a1a', color: 'white', border: 'none', borderRadius: '.5rem', fontWeight: 700, cursor: 'pointer', fontSize: '.9rem' }}
              >💾 Enregistrer</button>
            </div>
          </div>
        )}

        {/* ── DEMANDES TRAVEL PLANNING ── */}
        {tab === 'demandes' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#6b2a1a' }}>✈️ Demandes Travel Planning</h2>
              <button onClick={loadDemandes} style={{ padding: '.5rem 1rem', background: 'white', border: '1.5px solid #ddd', borderRadius: '.5rem', cursor: 'pointer', fontSize: '.85rem' }}>🔄 Actualiser</button>
            </div>

            {loadingDemandes ? (
              <p style={{ textAlign: 'center', color: '#888', padding: '3rem' }}>Chargement…</p>
            ) : demandes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: '#aaa' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✉️</div>
                <p>Aucune demande pour le moment</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {demandes.map(d => (
                  <div key={d.id} style={{ background: 'white', borderRadius: '.75rem', padding: '1.25rem 1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.75rem', flexWrap: 'wrap', gap: '.5rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1a1a1a' }}>{d.prenom} {d.nom}</div>
                        <div style={{ fontSize: '.85rem', color: '#888' }}>{d.email} {d.telephone && `· ${d.telephone}`}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                        <span style={{ fontSize: '.75rem', color: '#aaa' }}>{fmt(d.created_at)}</span>
                        <select
                          value={d.statut || 'nouvelle'}
                          onChange={e => updateStatut(d.id, e.target.value)}
                          style={{ padding: '.3rem .7rem', border: '1.5px solid #ddd', borderRadius: '.4rem', fontSize: '.82rem', cursor: 'pointer' }}
                        >
                          <option value="nouvelle">🆕 Nouvelle</option>
                          <option value="en_cours">🔄 En cours</option>
                          <option value="devis_envoye">📨 Devis envoyé</option>
                          <option value="accepte">✅ Acceptée</option>
                          <option value="terminee">🏁 Terminée</option>
                          <option value="annulee">❌ Annulée</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '.5rem .75rem', fontSize: '.85rem', color: '#555' }}>
                      {d.destination && <span>📍 <strong>Destination :</strong> {d.destination}</span>}
                      {d.style_voyage && <span>🌿 <strong>Style :</strong> {d.style_voyage}</span>}
                      {d.duree_jours && <span>📅 <strong>Durée :</strong> {d.duree_jours} jours</span>}
                      {d.mois_depart && <span>🗓 <strong>Départ :</strong> {d.mois_depart}</span>}
                      {d.budget_fourchette && <span>💶 <strong>Budget :</strong> {d.budget_fourchette}</span>}
                      {d.nb_voyageurs && <span>👫 <strong>Voyageurs :</strong> {d.nb_voyageurs}</span>}
                    </div>
                    {d.notes && (
                      <div style={{ marginTop: '.75rem', padding: '.75rem', background: '#faf8f5', borderRadius: '.5rem', fontSize: '.85rem', color: '#666', borderLeft: '3px solid #d4a88a' }}>
                        💬 {d.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Styles inline ────────────────────────────────────────────
const lbl: React.CSSProperties = {
  display: 'block', fontWeight: 600, fontSize: '.85rem',
  color: '#555', marginBottom: '.35rem',
};
const inp: React.CSSProperties = {
  width: '100%', padding: '.65rem .9rem',
  border: '1.5px solid #e0dbd5', borderRadius: '.5rem',
  fontSize: '.9rem', outline: 'none', background: '#faf9f7',
  color: '#1a1a1a',
};
