'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import EnhancedRichContent from '@/components/EnhancedRichContent';
import MediaLibrary from '@/components/MediaLibrary';
import { sanitizeHtml } from '@/lib/sanitize-html';
import CarouselEditor from '@/components/admin/CarouselEditor';
import CarouselGenerator from '@/components/admin/CarouselGenerator';
import BlogGenerator from '@/components/admin/BlogGenerator';

const RichEditor = dynamic(() => import('@/components/RichEditor'), { ssr: false });

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
type Article = {
  id: number; title: string; slug: string; category: string;
  published: boolean; published_at: string; created_at: string;
  excerpt: string; featured_image: string; content?: string; voice_notes?: string;
};

type Demande = {
  id: string; prenom: string; nom: string; email: string;
  telephone: string; destination: string; style_voyage: string;
  duree_jours: number; budget_fourchette: string; nb_voyageurs: number;
  mois_depart: string; notes: string; statut: string; created_at: string;
};

type Setting = { id: number; key: string; value: string; label: string; group_name: string; };
type SiteContent = { id: number; page: string; block_key: string; value: string; label: string; type: string; };

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const fmt = (d: string) => d ? new Date(d).toLocaleDateString('fr-FR') : 'â€”';
const slug = (t: string) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function normalizeArticleDraft(article: Partial<Article> | null | undefined) {
  return {
    id: article?.id ?? null,
    title: article?.title ?? '',
    slug: article?.slug ?? '',
    category: article?.category ?? '',
    excerpt: article?.excerpt ?? '',
    featured_image: article?.featured_image ?? '',
    content: article?.content ?? '',
    voice_notes: article?.voice_notes ?? '',
    published: Boolean(article?.published),
  };
}

function getArticleDraftSignature(article: Partial<Article> | null | undefined) {
  return JSON.stringify(normalizeArticleDraft(article));
}

function getWordCount(content?: string) {
  if (!content) return 0;
  return content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
}

function getReadTimeMinutes(content?: string) {
  const words = getWordCount(content);
  return words === 0 ? 0 : Math.max(1, Math.ceil(words / 200));
}

// â”€â”€â”€ Config pages CMS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const PAGES_CONFIG: Record<string, { label: string; emoji: string; sections: { key: string; label: string; type: 'text' | 'textarea' }[] }> = {
  'home': {
    label: 'Accueil',
    emoji: 'ðŸ ',
    sections: [
      { key: 'hero_title',          label: 'Hero â€“ Titre',                     type: 'text' },
      { key: 'hero_subtitle',       label: 'Hero â€“ Sous-titre',                type: 'textarea' },
      { key: 'hero_cta',            label: 'Hero â€“ Bouton CTA',                type: 'text' },
      { key: 'section_about_title', label: 'Section Ã€ propos â€“ Titre',         type: 'text' },
      { key: 'section_about_text',  label: 'Section Ã€ propos â€“ Texte',         type: 'textarea' },
      { key: 'services_title',      label: 'Section Services â€“ Titre',         type: 'text' },
      { key: 'services_subtitle',   label: 'Section Services â€“ Sous-titre',    type: 'textarea' },
      { key: 'newsletter_title',    label: 'Newsletter â€“ Titre',               type: 'text' },
      { key: 'newsletter_subtitle', label: 'Newsletter â€“ Sous-titre',          type: 'textarea' },
    ],
  },
  'a-propos': {
    label: 'Ã€ propos',
    emoji: 'ðŸ‘‹',
    sections: [
      { key: 'page_title',  label: 'Titre de la page',      type: 'text' },
      { key: 'intro_text',  label: 'Texte d\'introduction', type: 'textarea' },
    ],
  },
  'nos-services': {
    label: 'Nos services',
    emoji: 'âœ¨',
    sections: [
      { key: 'hero_title',    label: 'Hero â€“ Titre',              type: 'text' },
      { key: 'hero_subtitle', label: 'Hero â€“ Sous-titre',         type: 'textarea' },
      { key: 'b2c_title',     label: 'B2C â€“ Titre service',       type: 'text' },
      { key: 'b2c_desc',      label: 'B2C â€“ Description',         type: 'textarea' },
      { key: 'b2c_cta',       label: 'B2C â€“ Bouton CTA',          type: 'text' },
      { key: 'b2b_title',     label: 'B2B â€“ Titre service',       type: 'text' },
      { key: 'b2b_desc',      label: 'B2B â€“ Description',         type: 'textarea' },
      { key: 'b2b_cta',       label: 'B2B â€“ Bouton CTA',          type: 'text' },
    ],
  },
  'travel-planning': {
    label: 'Travel Planning',
    emoji: 'âœˆï¸',
    sections: [
      { key: 'hero_title',    label: 'Hero â€“ Titre',       type: 'text' },
      { key: 'hero_subtitle', label: 'Hero â€“ Sous-titre',  type: 'textarea' },
      { key: 'form_intro',    label: 'Intro formulaire',   type: 'textarea' },
      { key: 'reassurance',   label: 'Texte rÃ©assurance',  type: 'text' },
    ],
  },
  'contact': {
    label: 'Contact',
    emoji: 'ðŸ“§',
    sections: [
      { key: 'page_title',  label: 'Titre de la page',      type: 'text' },
      { key: 'intro_text',  label: 'Texte d\'introduction', type: 'textarea' },
    ],
  },
  'hotel-consulting': {
    label: 'Hotel Consulting',
    emoji: 'ðŸ¨',
    sections: [
      { key: 'page_title',  label: 'Titre de la page',      type: 'text' },
      { key: 'intro_text',  label: 'Texte d\'introduction', type: 'textarea' },
    ],
  },
  'mentions-legales': {
    label: 'Mentions lÃ©gales',
    emoji: 'âš–ï¸',
    sections: [
      { key: 'page_title', label: 'Titre de la page', type: 'text' },
    ],
  },
};

const SETTINGS_GROUPS: Record<string, { label: string; emoji: string }> = {
  general: { label: 'GÃ©nÃ©ral',         emoji: 'ðŸŒ' },
  social:  { label: 'RÃ©seaux sociaux', emoji: 'ðŸ“±' },
  seo:     { label: 'SEO',             emoji: 'ðŸ”' },
  footer:  { label: 'Footer',          emoji: 'ðŸ“„' },
};

// â”€â”€â”€ Composant principal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function CMSAdmin() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState('');
  const [authErr, setAuthErr] = useState('');
  const [tab, setTab] = useState('articles');
  const [toast, setToast] = useState('');
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);

  // Articles
  const [articles, setArticles] = useState<Article[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingArticle, setEditingArticle] = useState<Partial<Article> | null>(null);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [savingArticle, setSavingArticle] = useState(false);
  const [uploadingFeaturedImage, setUploadingFeaturedImage] = useState(false);
  const [articleBaseline, setArticleBaseline] = useState(() => getArticleDraftSignature(null));
  const [showArticlePreview, setShowArticlePreview] = useState(false);

  // Demandes travel
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [loadingDemandes, setLoadingDemandes] = useState(false);
  const [updatingDemandeId, setUpdatingDemandeId] = useState<string | null>(null);

  // ParamÃ¨tres + Contenu pages
  const [settings, setSettings] = useState<Setting[]>([]);
  const [siteContent, setSiteContent] = useState<SiteContent[]>([]);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [settingsGroup, setSettingsGroup] = useState('general');
  const [activePage, setActivePage] = useState('home');
  const [editedSettings, setEditedSettings] = useState<Record<string, string>>({});
  const [editedContent, setEditedContent] = useState<Record<string, string>>({});
  const [savingSettings, setSavingSettings] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const isArticleDirty = getArticleDraftSignature(editingArticle) !== articleBaseline;
  const articleWordCount = getWordCount(editingArticle?.content);
  const articleReadTime = getReadTimeMinutes(editingArticle?.content);
  const articlePreviewHtml = sanitizeHtml(editingArticle?.content);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }, []);
  const handleUnauthorized = useCallback((res: Response, message = 'Session expirÃ©e. Merci de vous reconnecter.') => {
    if (res.status !== 401) return false;
    setAuthed(false);
    setPwd('');
    setAuthErr(message);
    showToast(message);
    return true;
  }, [showToast]);

  const resetArticleEditor = useCallback((nextTab = 'articles') => {
    setEditingArticle(null);
    setArticleBaseline(getArticleDraftSignature(null));
    setShowArticlePreview(false);
    setTab(nextTab);
  }, []);

  const confirmDiscardArticleChanges = useCallback(() => {
    if (!isArticleDirty) return true;
    return confirm('Tu as des modifications non sauvegardÃƒÂ©es. Les quitter ?');
  }, [isArticleDirty]);

  const openArticleEditor = useCallback((article?: Partial<Article>) => {
    if ((editingArticle || tab === 'new') && !confirmDiscardArticleChanges()) return;
    const draft = article ? { ...article } : {};
    setEditingArticle(draft);
    setArticleBaseline(getArticleDraftSignature(draft));
    setShowArticlePreview(false);
    setTab('new');
  }, [confirmDiscardArticleChanges, editingArticle, tab]);

  const closeArticleEditor = useCallback(() => {
    if (!confirmDiscardArticleChanges()) return false;
    resetArticleEditor();
    return true;
  }, [confirmDiscardArticleChanges, resetArticleEditor]);

  const handleTabChange = useCallback((nextTab: string) => {
    if (nextTab === 'new') {
      openArticleEditor({});
      return;
    }

    if (tab === 'new' && nextTab !== 'new' && !confirmDiscardArticleChanges()) {
      return;
    }

    setTab(nextTab);
  }, [confirmDiscardArticleChanges, openArticleEditor, tab]);

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      try {
        const res = await fetch('/api/cms/auth');
        if (!active) return;
        setAuthed(res.ok);
      } catch {
        if (!active) return;
        setAuthed(false);
      } finally {
        if (active) setCheckingSession(false);
      }
    };

    checkSession();

    return () => {
      active = false;
    };
  }, []);

  // Auth
  const login = async () => {
    if (authLoading) return;
    setAuthErr('');
    setAuthLoading(true);
    try {
      const res = await fetch('/api/cms/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setAuthed(true);
        setPwd('');
      } else {
        setAuthErr(data.error || 'Mot de passe incorrect');
      }
    } catch {
      setAuthErr('Impossible de contacter le CMS pour le moment.');
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    await fetch('/api/cms/auth', { method: 'DELETE' }).catch(() => {});
    setAuthed(false);
    setPwd('');
    setAuthErr('');
    setShowMediaLibrary(false);
    resetArticleEditor();
  };

  useEffect(() => {
    if (checkingSession || authed) return;
    fetch('/api/cms/auth', { method: 'DELETE' }).catch(() => {});
  }, [authed, checkingSession]);

  useEffect(() => {
    if (!isArticleDirty) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isArticleDirty]);

  // Load articles
  const loadArticles = useCallback(async () => {
    setLoadingArticles(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await fetch(`/api/cms/articles?${params}`);
      if (handleUnauthorized(res)) return;
      const data = await res.json();
      setArticles(data.articles || []);
    } catch {
      showToast('Impossible de charger les articles.');
    } finally {
      setLoadingArticles(false);
    }
  }, [handleUnauthorized, search, showToast, statusFilter]);

  // Load demandes
  const loadDemandes = useCallback(async () => {
    setLoadingDemandes(true);
    try {
      const res = await fetch('/api/cms/demandes-travel');
      if (handleUnauthorized(res)) return;
      const data = await res.json();
      setDemandes(data.demandes || []);
    } catch {
      showToast('Impossible de charger les demandes travel.');
    } finally {
      setLoadingDemandes(false);
    }
  }, [handleUnauthorized, showToast]);

  // Load settings + content
  const loadSettings = useCallback(async () => {
    setLoadingSettings(true);
    try {
      const [sRes, cRes] = await Promise.all([
        fetch('/api/cms/settings'),
        fetch('/api/cms/content'),
      ]);
      if (handleUnauthorized(sRes) || handleUnauthorized(cRes)) return;
      const sData = await sRes.json();
      const cData = await cRes.json();
      setSettings(sData.settings || []);
      setSiteContent(cData.content || []);
      const initS: Record<string, string> = {};
      (sData.settings || []).forEach((s: Setting) => { initS[s.key] = s.value || ''; });
      const initC: Record<string, string> = {};
      (cData.content || []).forEach((c: SiteContent) => { initC[`${c.page}__${c.block_key}`] = c.value || ''; });
      setEditedSettings(initS);
      setEditedContent(initC);
    } catch {
      showToast('Impossible de charger les contenus du CMS.');
    } finally {
      setLoadingSettings(false);
    }
  }, [handleUnauthorized, showToast]);

  useEffect(() => { if (authed) loadArticles(); }, [authed, loadArticles]);
  useEffect(() => { if (authed && tab === 'demandes') loadDemandes(); }, [authed, tab, loadDemandes]);
  useEffect(() => { if (authed && (tab === 'settings' || tab === 'pages')) loadSettings(); }, [authed, tab, loadSettings]);

  // Save settings
  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      const promises: Promise<Response>[] = [];
      settings.forEach(s => {
        const newVal = editedSettings[s.key];
        if (newVal !== undefined && newVal !== s.value) {
          promises.push(fetch('/api/cms/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: s.key, value: newVal }),
          }));
        }
      });

      if (promises.length === 0) {
        showToast('Aucune modification Ã  enregistrer.');
        return;
      }

      const responses = await Promise.all(promises);
      if (responses.some(res => handleUnauthorized(res))) return;
      showToast('âœ… ParamÃ¨tres sauvegardÃ©s !');
      loadSettings();
    } catch {
      showToast('Impossible de sauvegarder les paramÃ¨tres.');
    } finally {
      setSavingSettings(false);
    }
  };

  // Save content pour une page donnÃ©e
  const savePageContent = async (pageKey: string) => {
    setSavingSettings(true);
    const config = PAGES_CONFIG[pageKey];
    if (!config) { setSavingSettings(false); return; }

    try {
      const promises: Promise<Response>[] = [];
      config.sections.forEach(section => {
        const key = `${pageKey}__${section.key}`;
        const newVal = editedContent[key] ?? '';
        const existing = siteContent.find(c => c.page === pageKey && c.block_key === section.key);
        if (!existing || newVal !== existing.value) {
          promises.push(fetch('/api/cms/content', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ page: pageKey, block_key: section.key, value: newVal }),
          }));
        }
      });

      if (promises.length === 0) {
        showToast('Aucune modification Ã  enregistrer sur cette page.');
        return;
      }

      const responses = await Promise.all(promises);
      if (responses.some(res => handleUnauthorized(res))) return;
      showToast(`âœ… Page "${config.label}" sauvegardÃ©e !`);
      loadSettings();
    } catch {
      showToast('Impossible de sauvegarder cette page.');
    } finally {
      setSavingSettings(false);
    }
  };

  // Save article
  const saveArticle = useCallback(async () => {
    if (!editingArticle) return;
    if (savingArticle) return;
    if (!editingArticle.title?.trim()) {
      showToast('Le titre est obligatoire avant dâ€™enregistrer.');
      return;
    }

    const isNew = !editingArticle.id;
    const payload = {
      ...editingArticle,
      slug: editingArticle.slug || slug(editingArticle.title || ''),
      published_at: editingArticle.published && !editingArticle.published_at
        ? new Date().toISOString() : editingArticle.published_at,
    };
    const url = isNew ? '/api/cms/articles' : `/api/cms/articles/${editingArticle.id}`;
    const method = isNew ? 'POST' : 'PUT';
    setSavingArticle(true);
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (handleUnauthorized(res)) return;
      if (res.ok) {
        showToast(isNew ? 'âœ… Article crÃ©Ã© !' : 'âœ… Article mis Ã  jour !');
        setArticleBaseline(getArticleDraftSignature(payload));
        resetArticleEditor();
        loadArticles();
      } else {
        const d = await res.json();
        showToast(`âŒ Erreur : ${d.error}`);
      }
    } catch {
      showToast('Impossible de sauvegarder cet article.');
    } finally {
      setSavingArticle(false);
    }
  }, [editingArticle, handleUnauthorized, loadArticles, resetArticleEditor, savingArticle, showToast]);

  useEffect(() => {
    if (tab !== 'new') return;

    const handleSaveShortcut = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 's') return;
      event.preventDefault();
      void saveArticle();
    };

    window.addEventListener('keydown', handleSaveShortcut);
    return () => window.removeEventListener('keydown', handleSaveShortcut);
  }, [saveArticle, tab]);

  const togglePublish = async (a: Article) => {
    try {
      const res = await fetch(`/api/cms/articles/${a.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          published: !a.published,
          published_at: !a.published ? new Date().toISOString() : a.published_at,
        }),
      });
      if (handleUnauthorized(res)) return;
      if (res.ok) { showToast(!a.published ? 'âœ… PubliÃ© !' : 'ðŸ“¦ RepassÃ© en brouillon'); loadArticles(); }
    } catch {
      showToast('Impossible de mettre Ã  jour le statut de publication.');
    }
  };

  const deleteArticle = async (id: number) => {
    if (!confirm('Supprimer cet article ?')) return;
    try {
      const res = await fetch(`/api/cms/articles/${id}`, { method: 'DELETE' });
      if (handleUnauthorized(res)) return;
      if (res.ok) { showToast('ðŸ—‘ï¸ Article supprimÃ©'); loadArticles(); }
    } catch {
      showToast('Impossible de supprimer cet article.');
    }
  };

  const uploadFeaturedImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFeaturedImage(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'articles');
    try {
      const res = await fetch('/api/cms/media-upload', {
        method: 'POST',
        body: fd,
      });
      if (handleUnauthorized(res)) return;
      const data = await res.json();
      if (data.url) {
        setEditingArticle(prev => prev ? { ...prev, featured_image: data.url } : prev);
        showToast('âœ… Image uploadÃ©e sur Supabase !');
      } else {
        showToast(`âŒ Upload Ã©chouÃ© : ${data.error}`);
      }
    } catch {
      showToast('Impossible dâ€™envoyer cette image.');
    } finally {
      setUploadingFeaturedImage(false);
      e.target.value = '';
    }
  };

  const updateStatut = async (id: string, statut: string) => {
    setUpdatingDemandeId(id);
    try {
      const res = await fetch('/api/cms/demandes-travel', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, statut }),
      });
      if (handleUnauthorized(res)) return;
      if (res.ok) { showToast('âœ… Statut mis Ã  jour'); loadDemandes(); }
    } catch {
      showToast('Impossible de mettre Ã  jour cette demande.');
    } finally {
      setUpdatingDemandeId(null);
    }
  };

  // â”€â”€â”€ Login â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (checkingSession) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f3ef' }}>
      <div style={{ background: 'white', padding: '2.5rem', borderRadius: '1rem', boxShadow: '0 8px 32px rgba(0,0,0,.1)', width: '100%', maxWidth: 380, textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '.5rem' }}>...</div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#6b2a1a' }}>Heldonica CMS</h1>
        <p style={{ color: '#888', fontSize: '.9rem' }}>Verification de la session...</p>
      </div>
    </div>
  );

  if (!authed) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f3ef' }}>
      <div style={{ background: 'white', padding: '2.5rem', borderRadius: '1rem', boxShadow: '0 8px 32px rgba(0,0,0,.1)', width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '.5rem' }}>ðŸŒ¿</div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#6b2a1a' }}>Heldonica CMS</h1>
          <p style={{ color: '#888', fontSize: '.9rem' }}>AccÃ¨s rÃ©servÃ©</p>
        </div>
        <input type="password" placeholder="Mot de passe" value={pwd}
          onChange={e => setPwd(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()}
          style={{ width: '100%', padding: '.75rem 1rem', border: '1.5px solid #ddd', borderRadius: '.5rem', fontSize: '1rem', marginBottom: '.75rem', outline: 'none' }}
        />
        {authErr && <p style={{ color: '#c0392b', fontSize: '.85rem', marginBottom: '.75rem' }}>{authErr}</p>}
        <button onClick={login} disabled={authLoading}
          style={{ width: '100%', padding: '.8rem', background: '#6b2a1a', color: 'white', border: 'none', borderRadius: '.5rem', fontWeight: 700, fontSize: '1rem', cursor: authLoading ? 'wait' : 'pointer', opacity: authLoading ? .7 : 1 }}
        >{authLoading ? 'Connexionâ€¦' : 'Entrer'}</button>
      </div>
    </div>
  );

  // â”€â”€â”€ CMS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const TABS = [
    { id: 'articles', label: 'ðŸ“ Articles', count: articles.length },
    { id: 'new',      label: 'âœï¸ Nouvel article', count: null },
    { id: 'blog',     label: 'âœ¨ GÃ©nÃ©rateur Blog IA', count: null },
    { id: 'pages',    label: 'ðŸ—‚ï¸ Pages', count: null },
    { id: 'demandes', label: 'âœˆï¸ Travel Planning', count: demandes.length },
    { id: 'media',    label: 'ðŸ–¼ï¸ MÃ©diathÃ¨que', count: null },
    { id: 'carousel', label: 'ðŸŽ  Carrousel', count: null },
    { id: 'settings', label: 'âš™ï¸ ParamÃ¨tres', count: null },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f5f3ef', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#6b2a1a', color: 'white', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 2px 12px rgba(0,0,0,.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>ðŸŒ¿</span>
          <span style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '.03em' }}>Heldonica CMS</span>
          <span style={{ background: 'rgba(255,255,255,.18)', fontSize: '.72rem', padding: '.2rem .6rem', borderRadius: '9999px', fontWeight: 600 }}>Supabase</span>
        </div>
        <button onClick={logout} style={{ background: 'rgba(255,255,255,.15)', border: 'none', color: 'white', padding: '.4rem .9rem', borderRadius: '.4rem', cursor: 'pointer', fontSize: '.85rem' }}>DÃ©connexion</button>
      </div>

      {toast && (
        <div style={{ position: 'fixed', top: '5rem', right: '1.5rem', background: '#1a1a1a', color: 'white', padding: '.8rem 1.4rem', borderRadius: '.6rem', zIndex: 100, fontSize: '.9rem', boxShadow: '0 4px 16px rgba(0,0,0,.2)' }}>{toast}</div>
      )}

      {showMediaLibrary && (
        <MediaLibrary 
          cmsPassword={pwd}
          onClose={() => setShowMediaLibrary(false)}
          onSelect={(url) => {
            setEditingArticle(prev => prev ? { ...prev, featured_image: url } : prev);
            showToast('âœ… Image sÃ©lectionnÃ©e depuis la mÃ©diathÃ¨que !');
          }}
        />
      )}

      {/* Tabs */}
      <div style={{ background: 'white', borderBottom: '1.5px solid #e8e3dc', padding: '0 2rem', display: 'flex', gap: '.25rem', overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t.id}
            onClick={() => handleTabChange(t.id)}
            style={{
              padding: '.85rem 1.2rem', border: 'none', background: 'none', cursor: 'pointer',
              fontWeight: tab === t.id ? 700 : 400,
              color: tab === t.id ? '#6b2a1a' : '#666',
              borderBottom: tab === t.id ? '2.5px solid #6b2a1a' : '2.5px solid transparent',
              fontSize: '.9rem', display: 'flex', alignItems: 'center', gap: '.4rem', whiteSpace: 'nowrap',
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

        {/* â”€â”€ ARTICLES â”€â”€ */}
        {tab === 'articles' && (
          <div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <input placeholder="Rechercher un article..." value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && loadArticles()}
                style={{ padding: '.6rem 1rem', border: '1.5px solid #ddd', borderRadius: '.5rem', flex: 1, minWidth: 200, fontSize: '.9rem' }}
              />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                style={{ padding: '.6rem .9rem', border: '1.5px solid #ddd', borderRadius: '.5rem', fontSize: '.9rem' }}
              >
                <option value="all">Tous</option>
                <option value="published">PubliÃ©s</option>
                <option value="draft">Brouillons</option>
              </select>
              <button onClick={loadArticles} style={{ padding: '.6rem 1.2rem', background: '#6b2a1a', color: 'white', border: 'none', borderRadius: '.5rem', cursor: 'pointer', fontSize: '.9rem' }}>ðŸ”</button>
              <button onClick={() => openArticleEditor({})} style={{ padding: '.6rem 1.2rem', background: '#01696f', color: 'white', border: 'none', borderRadius: '.5rem', cursor: 'pointer', fontSize: '.9rem' }}>+ Nouvel article</button>
            </div>
            {loadingArticles ? <p style={{ textAlign: 'center', color: '#888', padding: '3rem' }}>Chargementâ€¦</p>
              : articles.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#aaa' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>ðŸ“­</div>
                  <p>Aucun article trouvÃ©</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                  {articles.map(a => (
                    <div key={a.id} style={{ background: 'white', borderRadius: '.75rem', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,.06)', flexWrap: 'wrap' }}>
                      {a.featured_image && <img src={a.featured_image} alt="" style={{ width: 64, height: 48, objectFit: 'cover', borderRadius: '.4rem', flexShrink: 0 }} />}
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ fontWeight: 600, fontSize: '1rem', color: '#1a1a1a', marginBottom: '.2rem' }}>{a.title}</div>
                        <div style={{ fontSize: '.8rem', color: '#888', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                          <span>{a.category || 'â€”'}</span>
                          <span>{fmt(a.created_at)}</span>
                        </div>
                      </div>
                      <span style={{ padding: '.3rem .8rem', borderRadius: '9999px', fontSize: '.78rem', fontWeight: 600, background: a.published ? '#d4edda' : '#fff3cd', color: a.published ? '#155724' : '#856404' }}>
                        {a.published ? 'âœ… PubliÃ©' : 'ðŸ“¦ Brouillon'}
                      </span>
                      <div style={{ display: 'flex', gap: '.5rem' }}>
                        <button onClick={() => openArticleEditor(a)} style={{ padding: '.35rem .8rem', border: '1px solid #ddd', borderRadius: '.4rem', background: 'white', cursor: 'pointer', fontSize: '.82rem' }}>âœï¸ Ã‰diter</button>
                        <button onClick={() => togglePublish(a)} style={{ padding: '.35rem .8rem', border: '1px solid #ddd', borderRadius: '.4rem', background: 'white', cursor: 'pointer', fontSize: '.82rem' }}>{a.published ? 'ðŸ“¦ DÃ©publier' : 'ðŸš€ Publier'}</button>
                        <button onClick={() => deleteArticle(a.id)} style={{ padding: '.35rem .8rem', border: '1px solid #fcc', borderRadius: '.4rem', background: '#fff5f5', color: '#c0392b', cursor: 'pointer', fontSize: '.82rem' }}>ðŸ—‘ï¸</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}

        {/* â”€â”€ Ã‰DITEUR ARTICLE â”€â”€ */}
        {tab === 'new' && (
          <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 2px 12px rgba(0,0,0,.07)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#6b2a1a' }}>{editingArticle?.id ? `âœï¸ Modifier : ${editingArticle.title}` : 'âœï¸ Nouvel article'}</h2>
              <button onClick={closeArticleEditor} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.3rem' }}>âœ•</button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <button
                onClick={() => setShowArticlePreview(prev => !prev)}
                style={{ padding: '.5rem .95rem', border: '1px solid #ddd', borderRadius: '.5rem', background: 'white', color: '#6b2a1a', cursor: 'pointer', fontSize: '.82rem', fontWeight: 700 }}
              >
                {showArticlePreview ? "Masquer l'aperÃ§u" : 'AperÃ§u live'}
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Titre *</label>
                <input value={editingArticle?.title || ''}
                  onChange={e => setEditingArticle(p => ({ ...p, title: e.target.value, slug: slug(e.target.value) }))}
                  style={inp} placeholder="Titre de l'article" />
              </div>
              <div>
                <label style={lbl}>Slug (URL)</label>
                <input value={editingArticle?.slug || ''}
                  onChange={e => setEditingArticle(p => ({ ...p, slug: e.target.value }))}
                  style={inp} placeholder="slug-auto-genere" />
              </div>
              <div>
                <label style={lbl}>CatÃ©gorie</label>
                <select value={editingArticle?.category || ''}
                  onChange={e => setEditingArticle(p => ({ ...p, category: e.target.value }))}
                  style={inp}
                >
                  <option value="">â€” Choisir â€”</option>
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
                <label style={lbl}>Image Ã  la une</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '.75rem' }}>
                  <button onClick={() => setShowMediaLibrary(true)}
                    style={{ padding: '.6rem 1.1rem', background: '#6b2a1a', color: 'white', border: 'none', borderRadius: '.5rem', cursor: 'pointer', fontSize: '.85rem', fontWeight: 600 }}
                  >ðŸ–¼ï¸ MÃ©diathÃ¨que Supabase</button>
                  <span style={{ color: '#aaa', fontSize: '.82rem' }}>ou</span>
                  <label style={{ padding: '.6rem 1rem', background: uploadingFeaturedImage ? '#8aa8a9' : '#01696f', color: 'white', borderRadius: '.5rem', cursor: uploadingFeaturedImage ? 'wait' : 'pointer', fontSize: '.85rem', fontWeight: 600 }}>
                    {uploadingFeaturedImage ? 'â³ Uploadâ€¦' : 'â¬†ï¸ Upload direct'}
                    <input type="file" accept="image/*" onChange={uploadFeaturedImage} style={{ display: 'none' }} disabled={uploadingFeaturedImage} />
                  </label>
                </div>
                {editingArticle?.featured_image ? (
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative' }}>
                      <img src={editingArticle.featured_image} alt="" style={{ height: 80, borderRadius: '.5rem', objectFit: 'cover' }} />
                      <button onClick={() => setEditingArticle(p => ({ ...p, featured_image: '' }))}
                        style={{ position: 'absolute', top: -6, right: -6, background: '#c0392b', color: 'white', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: '.7rem' }}>âœ•</button>
                    </div>
                    <input value={editingArticle.featured_image}
                      onChange={e => setEditingArticle(p => ({ ...p, featured_image: e.target.value }))}
                      style={{ ...inp, flex: 1, fontSize: '.82rem' }} placeholder="URL de l'image" />
                  </div>
                ) : (
                  <input value=""
                    onChange={e => setEditingArticle(p => ({ ...p, featured_image: e.target.value }))}
                    style={{ ...inp, fontSize: '.82rem' }} placeholder="Ou coller une URL directement" />
                )}
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Extrait</label>
                <textarea value={editingArticle?.excerpt || ''}
                  onChange={e => setEditingArticle(p => ({ ...p, excerpt: e.target.value }))}
                  style={{ ...inp, height: 80, resize: 'vertical' }}
                  placeholder="RÃ©sumÃ© accrocheur pour les cards du blogâ€¦" />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <div style={{ border: '1px solid #ece3d8', borderRadius: '1rem', background: '#faf6f1', padding: '1rem 1.1rem', marginBottom: '1rem' }}>
                  <p style={{ margin: 0, fontSize: '.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#8a7a70' }}>
                    Guide voix Heldonica
                  </p>
                  <ul style={{ margin: '.75rem 0 0', paddingLeft: '1.1rem', color: '#6d625a', fontSize: '.88rem', lineHeight: 1.7 }}>
                    <li>Ouverture : un moment précis ou une observation concrète.</li>
                    <li>Corps : des scènes qui avancent, une idée par paragraphe.</li>
                    <li>Détail signature : ce qu'on a vu, senti, raté ou retenu.</li>
                    <li>Fin : une impression juste, sans CTA forcé.</li>
                  </ul>
                </div>
                <label style={lbl}>Voice notes / détail signature</label>
                <textarea value={editingArticle?.voice_notes || ''}
                  onChange={e => setEditingArticle(p => ({ ...p, voice_notes: e.target.value }))}
                  style={{ ...inp, height: 96, resize: 'vertical' }}
                  placeholder="Détail terrain, texture, hésitation, micro-verdict, ou rappel d'angle vécu..." />
                <p style={{ margin: '.4rem 0 0', color: '#6d625a', fontSize: '.8rem', lineHeight: 1.6 }}>
                  Si la migration Supabase `voice_notes` n'est pas encore appliquée, ce champ peut être ignoré
                  temporairement à l'enregistrement.
                </p>
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Contenu</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!editingArticle?.title && !editingArticle?.content) {
                        alert('Veuillez entrer un titre ou un theme pour generer le contenu');
                        return;
                      }
                      try {
                        const topic = editingArticle?.title || editingArticle?.content?.slice(0, 50) || 'voyages';
                        const res = await fetch('/api/ai/generate', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ topic, platform: 'instagram' })
                        });
                        const data = await res.json();
                        if (data.success && data.content) {
                          setEditingArticle(p => ({ ...p, content: (p?.content || '') + '<p>' + data.content + '</p>' }));
                        } else {
                          alert('Erreur: ' + (data.error || data.message || 'Impossible de generer le contenu'));
                        }
                      } catch (err) {
                        alert('Erreur de connexion: Ollama nest peut-etre pas actif');
                      }
                    }}
                    style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                  >
                    âœ¨ Generer avec IA
                  </button>
                </div>
                <RichEditor value={editingArticle?.content || ''}
                  onChange={html => setEditingArticle(p => ({ ...p, content: html }))}
                  placeholder="Commence Ã  Ã©crire ton article iciâ€¦" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer', fontWeight: 600, color: '#444', fontSize: '.9rem' }}>
                  <input type="checkbox" checked={!!editingArticle?.published}
                    onChange={e => setEditingArticle(p => ({ ...p, published: e.target.checked }))}
                    style={{ width: 18, height: 18 }} />
                  Publier immÃ©diatement
                </label>
              </div>
              <div style={{ gridColumn: '1/-1', display: 'flex', gap: '.6rem', flexWrap: 'wrap' }}>
                <span style={metaChip}>URL: /blog/{editingArticle?.slug || slug(editingArticle?.title || '') || 'nouvel-article'}</span>
                <span style={metaChip}>{articleWordCount} mots</span>
                <span style={metaChip}>{articleReadTime} min de lecture</span>
                <span style={metaChip}>Cmd/Ctrl+S pour enregistrer</span>
                {isArticleDirty && <span style={{ ...metaChip, background: '#fff4db', color: '#8a5a00' }}>Brouillon non sauvegardÃ©</span>}
              </div>
            </div>
            {showArticlePreview && (
              <div style={previewPanel}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '.78rem', color: '#8a7a70', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700 }}>Preview</p>
                    <h3 style={{ margin: '.2rem 0 0', fontSize: '1.1rem', color: '#6b2a1a' }}>AperÃ§u public de l&apos;article</h3>
                  </div>
                  <span style={{ ...metaChip, background: '#e8f5f2', color: '#01696f' }}>HTML sanitizÃ© comme sur le site</span>
                </div>
                <div style={previewFrame}>
                  {editingArticle?.featured_image ? (
                    <img src={editingArticle.featured_image} alt="" style={{ width: '100%', maxHeight: 320, objectFit: 'cover', borderRadius: '.9rem', marginBottom: '1.5rem' }} />
                  ) : (
                    <div style={previewImageFallback}>Ajoute une image Ã  la une pour prÃ©visualiser le hero</div>
                  )}
                  <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    {editingArticle?.category && <span style={metaChip}>{editingArticle.category}</span>}
                    <span style={metaChip}>{editingArticle?.published ? 'Publication immÃ©diate' : 'Brouillon'}</span>
                    <span style={metaChip}>/blog/{editingArticle?.slug || slug(editingArticle?.title || '') || 'nouvel-article'}</span>
                  </div>
                  <h1 style={{ margin: 0, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', lineHeight: 1.1, color: '#1f1a17' }}>
                    {editingArticle?.title || 'Titre de lâ€™article'}
                  </h1>
                  <p style={{ margin: '1rem 0 1.5rem', color: '#6d625a', fontSize: '1rem', lineHeight: 1.7 }}>
                    {editingArticle?.excerpt || 'Ton extrait apparaÃ®tra ici pour donner envie dâ€™ouvrir lâ€™article.'}
                  </p>
                  {editingArticle?.voice_notes && (
                    <div style={{ margin: '0 0 1.5rem', padding: '1rem 1.1rem', background: '#f6f1eb', border: '1px solid #ece3d8', borderRadius: '1rem' }}>
                      <p style={{ margin: 0, fontSize: '.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#8a7a70' }}>
                        Détail terrain
                      </p>
                      <p style={{ margin: '.4rem 0 0', color: '#6d625a', lineHeight: 1.7 }}>
                        {editingArticle.voice_notes}
                      </p>
                    </div>
                  )}
                  {articlePreviewHtml ? (
                    <EnhancedRichContent html={articlePreviewHtml} style={previewBody} />
                  ) : (
                    <p style={{ margin: 0, color: '#8a7a70', lineHeight: 1.7 }}>
                      Commence Ã  Ã©crire dans lâ€™Ã©diteur pour voir le rendu du contenu ici.
                    </p>
                  )}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.75rem', justifyContent: 'flex-end' }}>
              <button onClick={closeArticleEditor}
                style={{ padding: '.7rem 1.5rem', border: '1.5px solid #ddd', borderRadius: '.5rem', background: 'white', cursor: 'pointer', fontSize: '.9rem' }}>Annuler</button>
              <button onClick={saveArticle} disabled={savingArticle}
                style={{ padding: '.7rem 2rem', background: '#6b2a1a', color: 'white', border: 'none', borderRadius: '.5rem', fontWeight: 700, cursor: savingArticle ? 'wait' : 'pointer', fontSize: '.9rem', opacity: savingArticle ? .75 : 1 }}>{savingArticle ? 'â³ Enregistrementâ€¦' : 'ðŸ’¾ Enregistrer'}</button>
            </div>
          </div>
        )}

        {/* â”€â”€ PAGES â”€â”€ */}
        {tab === 'pages' && (
          <div>
            {loadingSettings ? <p style={{ textAlign: 'center', color: '#888', padding: '3rem' }}>Chargementâ€¦</p> : (
              <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1.5rem', alignItems: 'start' }}>

                {/* Sidebar pages */}
                <div style={{ background: 'white', borderRadius: '1rem', padding: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
                  <p style={{ fontSize: '.75rem', fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.75rem', padding: '0 .5rem' }}>Pages du site</p>
                  {Object.entries(PAGES_CONFIG).map(([key, cfg]) => (
                    <button key={key} onClick={() => setActivePage(key)}
                      style={{ display: 'flex', alignItems: 'center', gap: '.5rem', width: '100%', textAlign: 'left', padding: '.6rem .75rem', borderRadius: '.5rem', border: 'none', cursor: 'pointer', fontSize: '.88rem', fontWeight: activePage === key ? 700 : 400, background: activePage === key ? '#f0e8e4' : 'transparent', color: activePage === key ? '#6b2a1a' : '#555', marginBottom: '.2rem' }}
                    >
                      <span>{cfg.emoji}</span> {cfg.label}
                    </button>
                  ))}
                </div>

                {/* Ã‰diteur de page */}
                <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
                  {(() => {
                    const config = PAGES_CONFIG[activePage];
                    if (!config) return null;
                    return (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#6b2a1a' }}>
                            {config.emoji} {config.label}
                          </h2>
                          <a
                            href={activePage === 'home' ? '/' : `/${activePage}`}
                            target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: '.82rem', color: '#01696f', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '.3rem' }}
                          >
                            ðŸ”— Voir la page
                          </a>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                          {config.sections.map(section => {
                            const key = `${activePage}__${section.key}`;
                            return (
                              <div key={key}>
                                <label style={lbl}>{section.label}</label>
                                {section.type === 'textarea' ? (
                                  <textarea
                                    value={editedContent[key] ?? ''}
                                    onChange={e => setEditedContent(prev => ({ ...prev, [key]: e.target.value }))}
                                    style={{ ...inp, height: 110, resize: 'vertical' }}
                                    placeholder={section.label}
                                  />
                                ) : (
                                  <input
                                    value={editedContent[key] ?? ''}
                                    onChange={e => setEditedContent(prev => ({ ...prev, [key]: e.target.value }))}
                                    style={inp}
                                    placeholder={section.label}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => savePageContent(activePage)}
                            disabled={savingSettings}
                            style={{ padding: '.75rem 2.25rem', background: '#6b2a1a', color: 'white', border: 'none', borderRadius: '.5rem', fontWeight: 700, cursor: 'pointer', fontSize: '.95rem', opacity: savingSettings ? .7 : 1 }}
                          >
                            {savingSettings ? 'â³ Sauvegardeâ€¦' : 'ðŸ’¾ Sauvegarder la page'}
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* â”€â”€ MÃ‰DIATHÃˆQUE â”€â”€ */}
        {tab === 'media' && (
          <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 2px 12px rgba(0,0,0,.07)', minHeight: 400 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#6b2a1a' }}>ðŸ–¼ï¸ MÃ©diathÃ¨que</h2>
              <p style={{ fontSize: '.85rem', color: '#888' }}>Supabase Storage</p>
            </div>
            <div style={{ background: '#faf8f5', borderRadius: '.75rem', padding: '2rem', textAlign: 'center', border: '2px dashed #e8e3dc' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>â˜ï¸</div>
              <p style={{ color: '#555', marginBottom: '1.25rem', lineHeight: 1.6 }}>Toutes tes images sont stockÃ©es sur <strong>Supabase Storage</strong>.</p>
              <button onClick={() => setShowMediaLibrary(true)}
                style={{ padding: '.8rem 1.75rem', background: '#6b2a1a', color: 'white', border: 'none', borderRadius: '.5rem', fontWeight: 700, cursor: 'pointer', fontSize: '.95rem' }}
              >ðŸ–¼ï¸ Ouvrir la mÃ©diathÃ¨que</button>
            </div>
          </div>
        )}

        {/* â”€â”€ TRAVEL PLANNING â”€â”€ */}
        {tab === 'demandes' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#6b2a1a' }}>âœˆï¸ Demandes Travel Planning</h2>
              <button onClick={loadDemandes} disabled={loadingDemandes} style={{ padding: '.5rem 1rem', background: 'white', border: '1.5px solid #ddd', borderRadius: '.5rem', cursor: loadingDemandes ? 'wait' : 'pointer', fontSize: '.85rem', opacity: loadingDemandes ? .7 : 1 }}>{loadingDemandes ? 'â³ Actualisationâ€¦' : 'ðŸ”„ Actualiser'}</button>
            </div>
            {loadingDemandes ? <p style={{ textAlign: 'center', color: '#888', padding: '3rem' }}>Chargementâ€¦</p>
              : demandes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#aaa' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>âœ‰ï¸</div>
                  <p>Aucune demande pour le moment</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {demandes.map(d => (
                    <div key={d.id} style={{ background: 'white', borderRadius: '.75rem', padding: '1.25rem 1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.75rem', flexWrap: 'wrap', gap: '.5rem' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1a1a1a' }}>{d.prenom} {d.nom}</div>
                          <div style={{ fontSize: '.85rem', color: '#888' }}>{d.email} {d.telephone && `Â· ${d.telephone}`}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                          <span style={{ fontSize: '.75rem', color: '#aaa' }}>{fmt(d.created_at)}</span>
                          <select value={d.statut || 'nouvelle'} onChange={e => updateStatut(d.id, e.target.value)} disabled={updatingDemandeId === d.id}
                            style={{ padding: '.3rem .7rem', border: '1.5px solid #ddd', borderRadius: '.4rem', fontSize: '.82rem', cursor: updatingDemandeId === d.id ? 'wait' : 'pointer', opacity: updatingDemandeId === d.id ? .7 : 1 }}
                          >
                            <option value="nouvelle">ðŸ†• Nouvelle</option>
                            <option value="en_cours">ðŸ”„ En cours</option>
                            <option value="devis_envoye">ðŸ“¨ Devis envoyÃ©</option>
                            <option value="accepte">âœ… AcceptÃ©e</option>
                            <option value="terminee">ðŸ TerminÃ©e</option>
                            <option value="annulee">âŒ AnnulÃ©e</option>
                          </select>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '.5rem .75rem', fontSize: '.85rem', color: '#555' }}>
                        {d.destination && <span>ðŸ“ <strong>Destination :</strong> {d.destination}</span>}
                        {d.style_voyage && <span>ðŸŒ¿ <strong>Style :</strong> {d.style_voyage}</span>}
                        {d.duree_jours && <span>ðŸ“… <strong>DurÃ©e :</strong> {d.duree_jours} jours</span>}
                        {d.mois_depart && <span>ðŸ—“ <strong>DÃ©part :</strong> {d.mois_depart}</span>}
                        {d.budget_fourchette && <span>ðŸ’¶ <strong>Budget :</strong> {d.budget_fourchette}</span>}
                        {d.nb_voyageurs && <span>ðŸ‘« <strong>Voyageurs :</strong> {d.nb_voyageurs}</span>}
                      </div>
                      {d.notes && (
                        <div style={{ marginTop: '.75rem', padding: '.75rem', background: '#faf8f5', borderRadius: '.5rem', fontSize: '.85rem', color: '#666', borderLeft: '3px solid #d4a88a' }}>ðŸ’¬ {d.notes}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}

        {/* â”€â”€ CAROUSEL â”€â”€ */}
        {tab === 'carousel' && (
          <div className="space-y-6">
            <CarouselGenerator />
            <CarouselEditor />
          </div>
        )}

        {/* â”€â”€ BLOG IA â”€â”€ */}
        {tab === 'blog' && (
          <BlogGenerator
            onGenerated={(data) => {
              setEditingArticle({
                title: data.title,
                slug: data.suggestedSlug,
                excerpt: data.excerpt,
                content: data.content,
                voice_notes: '',
                featured_image: '',
                category: 'Voyage',
                published: false,
              });
              showToast('âœ… Article gÃ©nÃ©rÃ© ! Edite-le puis enregistre.');
              setTab('new');
            }}
          />
        )}

        {/* â”€â”€ PARAMÃˆTRES â”€â”€ */}
        {tab === 'settings' && (
          <div>
            {loadingSettings ? <p style={{ textAlign: 'center', color: '#888', padding: '3rem' }}>Chargementâ€¦</p> : (
              <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1.5rem', alignItems: 'start' }}>

                {/* Sidebar settings */}
                <div style={{ background: 'white', borderRadius: '1rem', padding: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
                  <p style={{ fontSize: '.75rem', fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.75rem', padding: '0 .5rem' }}>ParamÃ¨tres globaux</p>
                  {Object.entries(SETTINGS_GROUPS).map(([key, cfg]) => (
                    <button key={key} onClick={() => setSettingsGroup(key)}
                      style={{ display: 'flex', alignItems: 'center', gap: '.5rem', width: '100%', textAlign: 'left', padding: '.6rem .75rem', borderRadius: '.5rem', border: 'none', cursor: 'pointer', fontSize: '.88rem', fontWeight: settingsGroup === key ? 700 : 400, background: settingsGroup === key ? '#f0e8e4' : 'transparent', color: settingsGroup === key ? '#6b2a1a' : '#555', marginBottom: '.2rem' }}
                    >
                      <span>{cfg.emoji}</span> {cfg.label}
                    </button>
                  ))}
                </div>

                {/* Panel settings */}
                <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
                  {(() => {
                    const groupItems = settings.filter(s => s.group_name === settingsGroup);
                    const groupCfg = SETTINGS_GROUPS[settingsGroup];
                    return (
                      <div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#6b2a1a', marginBottom: '1.5rem' }}>
                          {groupCfg?.emoji} {groupCfg?.label}
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                          {groupItems.map(s => (
                            <div key={s.key}>
                              <label style={lbl}>{s.label}</label>
                              <input value={editedSettings[s.key] || ''}
                                onChange={e => setEditedSettings(prev => ({ ...prev, [s.key]: e.target.value }))}
                                style={inp} placeholder={s.label} />
                            </div>
                          ))}
                          {groupItems.length === 0 && (
                            <p style={{ color: '#aaa', fontSize: '.9rem', textAlign: 'center', padding: '2rem' }}>Aucun paramÃ¨tre dans ce groupe.</p>
                          )}
                        </div>
                        <button onClick={saveSettings} disabled={savingSettings}
                          style={{ marginTop: '1.75rem', padding: '.7rem 2rem', background: '#6b2a1a', color: 'white', border: 'none', borderRadius: '.5rem', fontWeight: 700, cursor: 'pointer', fontSize: '.9rem', opacity: savingSettings ? .7 : 1 }}
                        >{savingSettings ? 'â³ Sauvegardeâ€¦' : 'ðŸ’¾ Sauvegarder'}</button>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

const lbl: React.CSSProperties = {
  display: 'block', fontWeight: 600, fontSize: '.85rem', color: '#555', marginBottom: '.35rem',
};
const inp: React.CSSProperties = {
  width: '100%', padding: '.65rem .9rem',
  border: '1.5px solid #e0dbd5', borderRadius: '.5rem',
  fontSize: '.9rem', outline: 'none', background: '#faf9f7', color: '#1a1a1a',
};
const metaChip: React.CSSProperties = {
  padding: '.35rem .65rem',
  borderRadius: '9999px',
  background: '#f0e8e4',
  color: '#6b2a1a',
  fontSize: '.76rem',
  fontWeight: 600,
};
const previewPanel: React.CSSProperties = {
  marginTop: '1.75rem',
  padding: '1.25rem',
  borderRadius: '1rem',
  background: '#f8f4ef',
  border: '1px solid #ece3d8',
};
const previewFrame: React.CSSProperties = {
  background: 'white',
  borderRadius: '1rem',
  padding: '1.5rem',
  boxShadow: '0 1px 4px rgba(0,0,0,.05)',
};
const previewImageFallback: React.CSSProperties = {
  minHeight: 220,
  marginBottom: '1.5rem',
  borderRadius: '.9rem',
  background: 'linear-gradient(135deg, #f2e8dc 0%, #d9ebe6 100%)',
  color: '#6d625a',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  padding: '1.5rem',
  fontWeight: 600,
};
const previewBody: React.CSSProperties = {
  color: '#302925',
  lineHeight: 1.8,
  fontSize: '1rem',
};


