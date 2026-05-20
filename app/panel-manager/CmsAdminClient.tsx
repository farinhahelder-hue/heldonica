'use client';

console.log('[CMS] Rendering CMS admin page');

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import EnhancedRichContent from '@/components/EnhancedRichContent';
import MediaLibrary from '@/components/MediaLibrary';
import { sanitizeHtml } from '@/lib/sanitize-html';
import { Home, FileText, Plus, Sparkles, Folder, Plane, Image, Settings, BarChart3, Search, Save, Package, Car, Eye, EyeOff, Trash2, Send, Download, Upload, RefreshCw } from 'lucide-react';

const RichEditor = dynamic(() => import('@/components/RichEditor'), { ssr: false });
const CarouselEditor = dynamic(() => import('@/components/admin/CarouselEditor'), { ssr: false });
const CarouselGenerator = dynamic(() => import('@/components/admin/CarouselGenerator'), { ssr: false });
const BlogGenerator = dynamic(() => import('@/components/admin/BlogGenerator'), { ssr: false });

// ===== Types =====
type Article = {
  id: number; title: string; slug: string; category: string; scheduled_published_at?: string;
  published: boolean; published_at: string; created_at: string;
  excerpt: string; featured_image: string; content?: string; voice_notes?: string;
  // SEO
  meta_title?: string; meta_description?: string; og_image?: string; canonical_url?: string;
  // Geo
  city?: string; country?: string; country_code?: string; lat?: number; lng?: number;
  // Personalization
  travel_style?: string; season?: string; budget_level?: string; audience?: string;
  // Media
  video_url?: string; video_platform?: string; gallery_images?: string;
  read_time?: number;
};

type Demande = {
  id: string; prenom: string; nom: string; email: string;
  telephone: string; destination: string; destination_detail?: string;
  style_voyage: string; duree_jours: number; budget_fourchette: string;
  nb_voyageurs: number; mois_depart: string; notes: string;
  statut: string; created_at: string;
};

type Setting = { id: number; key: string; value: string; label: string; type?: string; };
type SiteContent = { id: number; page: string; block_key: string; value: string; label: string; type: string; };

// ===== Helpers =====
const fmt = (d: string) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
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
    // SEO
    meta_title: article?.meta_title ?? '',
    meta_description: article?.meta_description ?? '',
    og_image: article?.og_image ?? '',
    canonical_url: article?.canonical_url ?? '',
    // Geo
    city: article?.city ?? '',
    country: article?.country ?? '',
    country_code: article?.country_code ?? '',
    lat: article?.lat,
    lng: article?.lng,
    // Personalization
    travel_style: article?.travel_style ?? '',
    season: article?.season ?? '',
    budget_level: article?.budget_level ?? '',
    audience: article?.audience ?? '',
    // Media
    video_url: article?.video_url ?? '',
    video_platform: article?.video_platform ?? '',
    gallery_images: article?.gallery_images ?? '',
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

// ===== Config pages CMS =====
const PAGES_CONFIG: Record<string, { label: string; emoji: string; sections: { key: string; label: string; type: 'text' | 'textarea' | 'media' | 'color' }[] }> = {
  'home': {
    label: 'Accueil',
    emoji: '🏠',
    sections: [
      { key: 'hero_video_url',    label: 'Hero — Vidéo (URL)',              type: 'media' },
      { key: 'hero_poster_image', label: 'Hero — Image poster (URL)',        type: 'media' },
      { key: 'hero_title',          label: 'Hero — Titre',                     type: 'text' },
      { key: 'hero_subtitle',       label: 'Hero — Sous-titre',                type: 'textarea' },
      { key: 'hero_cta',            label: 'Hero — Bouton CTA',                type: 'text' },
      { key: 'section_about_title', label: 'Section À propos — Titre',         type: 'text' },
      { key: 'section_about_text',  label: 'Section À propos — Texte',         type: 'textarea' },
      { key: 'services_title',      label: 'Section Services — Titre',         type: 'text' },
      { key: 'services_subtitle',   label: 'Section Services — Sous-titre',    type: 'textarea' },
      { key: 'newsletter_title',    label: 'Newsletter — Titre',               type: 'text' },
      { key: 'newsletter_subtitle', label: 'Newsletter — Sous-titre',          type: 'textarea' },
    ],
  },
  'a-propos': {
    label: 'À propos',
    emoji: '👋',
    sections: [
      { key: 'page_title',  label: 'Titre de la page',      type: 'text' },
      { key: 'intro_text',  label: "Texte d’introduction",  type: 'textarea' },
    ],
  },
  'nos-services': {
    label: 'Nos services',
    emoji: '✨',
    sections: [
      { key: 'hero_title',    label: 'Hero — Titre',              type: 'text' },
      { key: 'hero_subtitle', label: 'Hero — Sous-titre',         type: 'textarea' },
      { key: 'b2c_title',     label: 'B2C — Titre service',       type: 'text' },
      { key: 'b2c_desc',      label: 'B2C — Description',         type: 'textarea' },
      { key: 'b2c_cta',       label: 'B2C — Bouton CTA',          type: 'text' },
      { key: 'b2b_title',     label: 'B2B — Titre service',       type: 'text' },
      { key: 'b2b_desc',      label: 'B2B — Description',         type: 'textarea' },
      { key: 'b2b_cta',       label: 'B2B — Bouton CTA',          type: 'text' },
    ],
  },
  'travel-planning': {
    label: 'Travel Planning',
    emoji: '✈️',
    sections: [
      { key: 'hero_title',    label: 'Hero — Titre',       type: 'text' },
      { key: 'hero_subtitle', label: 'Hero — Sous-titre',  type: 'textarea' },
      { key: 'form_intro',    label: 'Intro formulaire',   type: 'textarea' },
      { key: 'reassurance',   label: 'Texte réassurance',  type: 'text' },
    ],
  },
  'contact': {
    label: 'Contact',
    emoji: '📧',
    sections: [
      { key: 'page_title',  label: 'Titre de la page',      type: 'text' },
      { key: 'intro_text',  label: "Texte d’introduction",  type: 'textarea' },
    ],
  },
  'hotel-consulting': {
    label: 'Hotel Consulting',
    emoji: '🏨',
    sections: [
      { key: 'page_title',  label: 'Titre de la page',      type: 'text' },
      { key: 'intro_text',  label: "Texte d’introduction",  type: 'textarea' },
    ],
  },
  'mentions-legales': {
    label: 'Mentions légales',
    emoji: '⚖️',
    sections: [
      { key: 'page_title', label: 'Titre de la page', type: 'text' },
    ],
  },
};

const SETTINGS_GROUPS: Record<string, { label: string; emoji: string }> = {
  general:    { label: 'Général',         emoji: '🌐' },
  appearance:{ label: 'Apparence',      emoji: '🎨' },
  social:    { label: 'Réseaux sociaux', emoji: '📱' },
  seo:       { label: 'SEO',            emoji: '🔍' },
  footer:   { label: 'Footer',          emoji: '📄' },
  email:    { label: 'Email / Notifs',  emoji: '📧' },
};

// Paramètres d’apparence
const APPEARANCE_SETTINGS = [
  { key: 'site_logo',        label: 'Logo du site',       type: 'media' },
  { key: 'site_favicon',    label: 'Favicon',          type: 'media' },
  { key: 'color_primary',   label: 'Couleur primaire',type: 'color' },
  { key: 'color_secondary', label: 'Couleur secondaire',type: 'color' },
  { key: 'color_accent',    label: 'Couleur accent',    type: 'color' },
  { key: 'color_background',label: 'Couleur fond',      type: 'color' },
  { key: 'color_text',      label: 'Couleur texte',     type: 'color' },
  { key: 'font_heading',    label: 'Police titres',     type: 'text' },
  { key: 'font_body',       label: 'Police texte',      type: 'text' },
];

// ===== Composant interne (utilise useSearchParams) =====
function CMSAdminInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
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
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [scheduleMode, setScheduleMode] = useState(false);

  // SEO analysis
  const analyzeSEO = (content: string, title: string) => {
    if (!content || !title) return { score: 0, readability: '-', wordCount: 0, density: 0, issues: [] };
    const text = content.replace(/<[^>]+>/g, ' ');
    const words = text.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const sentences = text.split(/[.!?]+/).filter(Boolean);
    const avgWordsPerSentence = wordCount / Math.max(sentences.length, 1);
    const readability = avgWordsPerSentence < 15 ? '✅ Bonne' : avgWordsPerSentence < 20 ? '⚠️ Moyenne' : '❌ Difficile';
    const titleLower = title.toLowerCase();
    const contentLower = text.toLowerCase();
    const titleInContent = contentLower.includes(titleLower) ? 1 : 0;
    const density = titleInContent ? Math.round((contentLower.split(titleLower).length - 1) * 100 / wordCount) : 0;
    const issues: string[] = [];
    if (wordCount < 300) issues.push('Contenu court (< 300 mots)');
    if (avgWordsPerSentence > 20) issues.push('Phrases trop longues');
    if (!titleInContent) issues.push('Titre absent du contenu');
    if (density > 5) issues.push('Répétition excessive du titre');
    const score = Math.max(0, 100 - issues.length * 20 - (wordCount < 300 ? 20 : 0));
    return { score, readability, wordCount, density, issues };
  };
  const seo = analyzeSEO(editingArticle?.content || '', editingArticle?.title || '');
  const [uploadingFeaturedImage, setUploadingFeaturedImage] = useState(false);
  const [articleBaseline, setArticleBaseline] = useState(() => getArticleDraftSignature(null));
  const [showArticlePreview, setShowArticlePreview] = useState(false);

  // Demandes travel
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [loadingDemandes, setLoadingDemandes] = useState(false);
  const [updatingDemandeId, setUpdatingDemandeId] = useState<string | null>(null);
  const [expandedDemandeId, setExpandedDemandeId] = useState<string | null>(null);
  const [aiReplyDraft, setAiReplyDraft] = useState<Record<string, string>>({});
  const [generatingReplyId, setGeneratingReplyId] = useState<string | null>(null);
  const [internalNotes, setInternalNotes] = useState<Record<string, string>>({});
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null);

  // Paramètres + Contenu pages
  const [settings, setSettings] = useState<Setting[]>([]);
  const [siteContent, setSiteContent] = useState<SiteContent[]>([]);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [settingsGroup, setSettingsGroup] = useState('general');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchType, setSearchType] = useState<'all' | 'articles' | 'demandes'>('all');
  const [showPalette, setShowPalette] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState('');
  const [demandesStatusFilter, setDemandesStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [pilier, setPilier] = useState('');
  const [eeat, setEeat] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [archivedFilter, setArchivedFilter] = useState(false);
  // New filters
  const [countryFilter, setCountryFilter] = useState('all');
  const [travelStyleFilter, setTravelStyleFilter] = useState('all');
  const [seasonFilter, setSeasonFilter] = useState('all');
  const [activePage, setActivePage] = useState('home');
  const [editedSettings, setEditedSettings] = useState<Record<string, string>>({});
  const [editedContent, setEditedContent] = useState<Record<string, string>>({});
  const [savingSettings, setSavingSettings] = useState(false);
  const [uploadingMediaKey, setUploadingMediaKey] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const isArticleDirty = getArticleDraftSignature(editingArticle) !== articleBaseline;
  const articleWordCount = getWordCount(editingArticle?.content);
  const articleReadTime = getReadTimeMinutes(editingArticle?.content);
  const articlePreviewHtml = sanitizeHtml(editingArticle?.content);

  const handleSearch = useCallback(async () => {
    if (!searchQuery || searchQuery.length < 2) return;
    setLoadingSearch(true);
    try {
      const res = await fetch('/api/cms/llm-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, type: searchType, limit: 10 })
      });
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (e) { console.error(e); }
    setLoadingSearch(false);
  }, [searchQuery, searchType]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }, []);

  const handleUnauthorized = useCallback((res: Response, message = 'Session expirée. Merci de vous reconnecter.') => {
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
    return confirm('Tu as des modifications non sauvegardées. Les quitter ?');
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

  // Ctrl+K palette
  useEffect(() => {
    const handlePaletteKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowPalette(true);
      }
      if (e.key === 'Escape') setShowPalette(false);
    };
    window.addEventListener('keydown', handlePaletteKey);
    return () => window.removeEventListener('keydown', handlePaletteKey);
  }, []);

  // Autosave every 30s when editing
  useEffect(() => {
    if (tab !== 'new' || !unsavedChanges || savingArticle) return;
    const timer = setTimeout(async () => {
      if (!editingArticle || savingArticle || !editingArticle.title?.trim()) return;
      const payload = { ...editingArticle };
      const isNew = !editingArticle.id;
      const url = isNew ? '/api/cms/articles' : `/api/cms/articles/${editingArticle.id}`;
      const method = isNew ? 'POST' : 'PUT';
      try {
        await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        showToast('💾 Brouillon auto-sauvegardé');
        setUnsavedChanges(false);
      } catch { /* silent */ }
    }, 30000);
    return () => clearTimeout(timer);
  }, [tab, unsavedChanges, savingArticle, editingArticle, showToast]);

  // Clean URL params on mount
  useEffect(() => {
    const error = searchParams.get('error');
    const connected = searchParams.get('connected');
    if (error || connected) {
      router.replace('/cms-admin');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check session on mount
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
    return () => { active = false; };
  }, []);

  // Logout when session lost
  useEffect(() => {
    if (checkingSession || authed) return;
    fetch('/api/cms/auth', { method: 'DELETE' }).catch(() => {});
  }, [authed, checkingSession]);

  // beforeunload guard
  useEffect(() => {
    if (!isArticleDirty) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isArticleDirty]);

  // Auth
  const login = async () => {
    console.log('[CMS] login called, pwd length:', pwd?.length);
    if (authLoading) return;
    setAuthErr('');
    setAuthLoading(true);
    try {
      console.log('[CMS] making POST to /api/cms/auth');
      const res = await fetch('/api/cms/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd }),
      });
      console.log('[CMS] got response:', res.status);
      const data = await res.json().catch(() => ({}));
      console.log('[CMS] response data:', data);
      if (res.ok) {
        setAuthed(true);
        setPwd('');
      } else {
        setAuthErr(data.error || 'Mot de passe incorrect');
      }
    } catch (e) {
      console.log('[CMS] login error:', e);
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

  // Load articles
  const loadCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/cms/articles?aggregate=category');
      const data = await res.json();
      if (data.articles) {
        const cats = [...new Set(data.articles.map((a: any) => a.category).filter(Boolean))];
        setAvailableCategories(cats as string[]);
      }
    } catch { /* ignore */ }
  }, []);

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

  const loadDemandes = useCallback(async () => {
    setLoadingDemandes(true);
    try {
      const res = await fetch('/api/cms/demandes-travel');
      if (handleUnauthorized(res)) return;
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || res.statusText);
      setDemandes(data.demandes || []);
    } catch (e: any) {
      showToast('Impossible de charger les demandes travel : ' + (e.message || 'Erreur inconnue'));
    } finally {
      setLoadingDemandes(false);
    }
  }, [handleUnauthorized, showToast]);

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

  const saveArticle = useCallback(async () => {
    if (!editingArticle || savingArticle) return;
    if (!editingArticle.title?.trim()) {
      showToast("Le titre est obligatoire avant d’enregistrer.");
      return;
    }
    const isNew = !editingArticle.id;
    // Pre-publishing validation: validate BEFORE publishing
    if (editingArticle.published && !isNew) {
      try {
        const res = await fetch('/api/cms/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ post_id: editingArticle.id }),
        });
        const validation = await res.json();
        if (!validation.valid) {
          showToast(`⚠️ Validation failed (score: ${validation.score}). Fix errors before publishing.`);
          return;
        }
      } catch { /* validation optional */ }
    }

    // Auto-calculate read_time if not set
    const contentText = (editingArticle.content || '').replace(/<[^>]*>/g, '').trim();
    const calculatedReadTime = Math.ceil(contentText.length / 1000);
    
    // Check for duplicate slug
    if (editingArticle.slug) {
      const existing = articles.find(a => a.slug === editingArticle.slug && a.id !== editingArticle.id);
      if (existing) {
        showToast(`⚠️ Warning: slug "${editingArticle.slug}" used by another article`);
      }
    }

    const payload = {
      ...editingArticle,
      slug: editingArticle.slug || slug(editingArticle.title || ''),
      read_time: editingArticle.read_time || calculatedReadTime || 1,
      published_at: editingArticle.published && !editingArticle.published_at
        ? new Date().toISOString() : editingArticle.published_at,
      ...(scheduleMode && editingArticle?.scheduled_published_at ?
        { scheduled_published_at: new Date(editingArticle.scheduled_published_at).toISOString() } : {}),
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
        showToast(isNew ? '✅ Article créé !' : '✅ Article mis à jour !');
        setArticleBaseline(getArticleDraftSignature(payload));
        resetArticleEditor();
        loadArticles();
      } else {
        const d = await res.json();
        showToast(`❌ Erreur : ${d.error}`);
      }
    } catch {
      showToast('Impossible de sauvegarder cet article.');
    } finally {
      setSavingArticle(false);
    }
  }, [editingArticle, handleUnauthorized, loadArticles, resetArticleEditor, savingArticle, scheduleMode, showToast]);

  // Ctrl+S shortcut
  useEffect(() => {
    if (tab !== 'new') return;
    const handleSaveShortcut = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 's') return;
      event.preventDefault();
      void saveArticle();
    };
    window.addEventListener('keydown', handleSaveShortcut);
    return () => window.removeEventListener('keydown', handleSaveShortcut);
  }, [tab, saveArticle]);

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
      if (promises.length === 0) { showToast('Aucune modification à enregistrer.'); return; }
      const responses = await Promise.all(promises);
      if (responses.some(res => handleUnauthorized(res))) return;
      showToast('✅ Paramètres sauvegardés !');
      loadSettings();
    } catch {
      showToast('Impossible de sauvegarder les paramètres.');
    } finally {
      setSavingSettings(false);
    }
  };

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
      if (promises.length === 0) { showToast('Aucune modification à enregistrer sur cette page.'); return; }
      const responses = await Promise.all(promises);
      if (responses.some(res => handleUnauthorized(res))) return;
      showToast(`✅ Page "${config.label}" sauvegardée !`);
      loadSettings();
    } catch {
      showToast('Impossible de sauvegarder cette page.');
    } finally {
      setSavingSettings(false);
    }
  };


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
      if (res.ok) { showToast(!a.published ? '✓ Publié !' : '📝 Repassé en brouillon'); loadArticles(); }
    } catch {
      showToast('Impossible de mettre à jour le statut de publication.');
    }
  };

  const deleteArticle = async (id: number) => {
    if (!confirm('Supprimer cet article ?')) return;
    try {
      const res = await fetch(`/api/cms/articles/${id}`, { method: 'DELETE' });
      if (handleUnauthorized(res)) return;
      if (res.ok) { showToast('🗑 Article supprimé'); loadArticles(); }
    } catch {
      showToast('Impossible de supprimer cet article.');
    }
  };

  // Duplicate article
  const duplicateArticle = async (a: Article) => {
    if (!confirm(`Dupliquer "${a.title}" ?`)) return;
    try {
      const res = await fetch('/api/cms/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...a,
          id: undefined,
          title: a.title + ' (copie)',
          slug: a.slug + '-copy',
          published: false,
          published_at: null,
          created_at: new Date().toISOString(),
        }),
      });
      if (handleUnauthorized(res)) return;
      if (res.ok) { showToast('✓ Article dupliqué !'); loadArticles(); }
    } catch {
      showToast('Impossible de dupliquer cet article.');
    }
  };

  // Bulk publish
  const bulkPublish = async (ids: number[]) => {
    if (!confirm(`Publier ${ids.length} article(s) ?`)) return;
    try {
      for (const id of ids) {
        await fetch(`/api/cms/articles/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ published: true, published_at: new Date().toISOString() }),
        });
      }
      showToast(`✓ ${ids.length} article(s) publié(s) !`);
      loadArticles();
    } catch {
      showToast('Erreur lors de la publication.');
    }
  };

  // Bulk delete
  const bulkDelete = async (ids: number[]) => {
    if (!confirm(`Supprimer ${ids.length} article(s) ?`)) return;
    try {
      for (const id of ids) {
        await fetch(`/api/cms/articles/${id}`, { method: 'DELETE' });
      }
      showToast(`🗑 ${ids.length} article(s) supprimé(s)`);
      loadArticles();
    } catch {
      showToast('Erreur lors de la suppression.');
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
      const res = await fetch('/api/cms/media-upload', { method: 'POST', body: fd });
      if (handleUnauthorized(res)) return;
      const data = await res.json();
      if (data.url) {
        setEditingArticle(prev => prev ? { ...prev, featured_image: data.url } : prev);
        showToast('✅ Image uploadée sur Supabase !');
      } else {
        showToast(`❌ Upload échoué : ${data.error}`);
      }
    } catch {
      showToast("Impossible d’envoyer cette image.");
    } finally {
      setUploadingFeaturedImage(false);
      e.target.value = '';
    }
  };

  // Upload media (image or video) for page content
  const uploadMediaForPage = async (e: React.ChangeEvent<HTMLInputElement>, sectionKey: string, pageKey: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const key = `${pageKey}__${sectionKey}`;
    setUploadingMediaKey(key);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'hero-media');
    try {
      const res = await fetch('/api/cms/media-upload', { method: 'POST', body: fd });
      if (handleUnauthorized(res)) return;
      const data = await res.json();
      if (data.url) {
        setEditedContent(prev => ({ ...prev, [key]: data.url }));
        showToast('✅ Média uploadé sur Supabase !');
      } else {
        showToast(`❌ Upload échoué : ${data.error}`);
      }
    } catch {
      showToast("Impossible d’envoyer ce média.");
    } finally {
      setUploadingMediaKey('');
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
      if (res.ok) { showToast('✅ Statut mis à jour'); loadDemandes(); }
    } catch {
      showToast('Impossible de mettre à jour cette demande.');
    } finally {
      setUpdatingDemandeId(null);
    }
  };

  const generateAiReply = async (d: Demande) => {
    setGeneratingReplyId(d.id);
    try {
      const res = await fetch('/api/cms/ai-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demande: d }),
      });
      const data = await res.json();
      if (data.reply) {
        setAiReplyDraft(prev => ({ ...prev, [d.id]: data.reply }));
        showToast('✅ Email généré !');
      } else {
        showToast('❌ Erreur génération email');
      }
    } catch {
      showToast('Impossible de générer la réponse.');
    } finally {
      setGeneratingReplyId(null);
    }
  };

  const exportDemandesCSV = () => {
    if (demandes.length === 0) return;
    const headers = ['Prénom','Nom','Email','Téléphone','Destination','Style','Durée','Budget','Mois départ','Statut','Date','Notes'];
    const rows = demandes.map(d => [
      d.prenom, d.nom, d.email, d.telephone,
      d.destination, d.style_voyage,
      d.duree_jours ? `${d.duree_jours}j` : '',
      d.budget_fourchette, d.mois_depart,
      d.statut, new Date(d.created_at).toLocaleDateString('fr-FR'),
      (d.notes || '').replace(/,/g, ';'),
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v || ''}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `demandes-heldonica-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('✅ CSV téléchargé !');
  };

  // ===== Login screen =====
  if (checkingSession) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f3ef' }}>
      <div style={{ background: 'white', padding: '2.5rem', borderRadius: '1rem', boxShadow: '0 8px 32px rgba(0,0,0,.1)', width: '100%', maxWidth: 380, textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '.5rem' }}>⏳</div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#6b2a1a' }}>Heldonica CMS</h1>
        <p style={{ color: '#888', fontSize: '.9rem' }}>Vérification de la session...</p>
      </div>
    </div>
  );

  if (!authed) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f3ef' }}>
      <div style={{ background: 'white', padding: '2.5rem', borderRadius: '1rem', boxShadow: '0 8px 32px rgba(0,0,0,.1)', width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '.5rem' }}>🌍</div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#6b2a1a' }}>Heldonica CMS</h1>
          <p style={{ color: '#888', fontSize: '.9rem' }}>Accès réservé</p>
        </div>
        <input type="password" placeholder="Mot de passe" value={pwd}
          onChange={e => setPwd(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()}
          style={{ width: '100%', padding: '.75rem 1rem', border: '1.5px solid #ddd', borderRadius: '.5rem', fontSize: '1rem', marginBottom: '.75rem', outline: 'none' }}
        />
        {authErr && <p style={{ color: '#c0392b', fontSize: '.85rem', marginBottom: '.75rem' }}>{authErr}</p>}
        <button onClick={login} disabled={authLoading}
          style={{ width: '100%', padding: '.8rem', background: '#6b2a1a', color: 'white', border: 'none', borderRadius: '.5rem', fontWeight: 700, fontSize: '1rem', cursor: authLoading ? 'wait' : 'pointer', opacity: authLoading ? .7 : 1 }}
        >{authLoading ? 'Connexion…' : 'Entrer'}</button>
      </div>
    </div>
  );

  // ===== CMS UI =====
  const TABS = [
    { id: 'dashboard', icon: <Home size={16} />, label: 'Accueil', count: null },
    { id: 'articles', icon: <FileText size={16} />, label: 'Articles', count: articles.length },
    { id: 'new',      icon: <Plus size={16} />,  label: 'Nouvel article', count: null },
    { id: 'blog',    icon: <Sparkles size={16} />, label: 'Générateur Blog IA', count: null },
    { id: 'calendar', icon: <span style={{fontSize:14}}>📅</span>, label: 'Calendrier', count: null },
    { id: 'pages',    icon: <Folder size={16} />, label: 'Pages', count: null },
    { id: 'demandes',icon: <Plane size={16} />, label: 'Travel Planning', count: demandes.length },
    // eslint-disable-next-line jsx-a11y/alt-text -- Image is a lucide-react icon, not an <img> element
    { id: 'media',   icon: <Image size={16} aria-hidden="true" />, label: 'Médiathèque', count: null },
    { id: 'carousel',icon: <Car size={16} />,  label: 'Carrousel', count: null },
    { id: 'settings',icon: <Settings size={16} />,label: 'Paramètres', count: null },
    { id: 'analytics',icon: <BarChart3 size={16} />,label: 'Analytics', count: null },
    { id: 'search',  icon: <Search size={16} />, label: 'Search', count: null },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f5f3ef', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
      <style>{`
        @media (min-width: 768px) {
          [data-mobile-only="true"] { display: none !important; }
        }
      `}</style>
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }}
          data-mobile-only="true"
        />
      )}
      <div style={{ background: '#6b2a1a', color: 'white', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 2px 12px rgba(0,0,0,.15)' }}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{ display: 'none', background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer', marginRight: '0.5rem' }}
          data-mobile-only="true"
        >☰</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🌍</span>
          <span style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '.03em' }}>Heldonica CMS</span>
          <span style={{ background: 'rgba(255,255,255,.18)', fontSize: '.72rem', padding: '.2rem .6rem', borderRadius: '9999px', fontWeight: 600 }}>Supabase</span>
        </div>
        <button onClick={logout} style={{ background: 'rgba(255,255,255,.15)', border: 'none', color: 'white', padding: '.4rem .9rem', borderRadius: '.4rem', cursor: 'pointer', fontSize: '.85rem' }}>Déconnexion</button>
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
            showToast('✅ Image sélectionnée depuis la médiathèque !');
          }}
        />
      )}

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
            {t.icon} {t.label}
            {t.count !== null && t.count > 0 && (
              <span style={{ background: '#f0e8e4', color: '#6b2a1a', borderRadius: '9999px', padding: '.1rem .55rem', fontSize: '.75rem', fontWeight: 700 }}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 1100, margin: '2rem auto', padding: '0 1.5rem' }}>

        {tab === 'dashboard' && (
          <div>
            <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 1px 4px rgba(0,0,0,.06)', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#6b2a1a', marginBottom: '1.5rem' }}>🏠 Tableau de bord</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#f8f6f4', padding: '1.25rem', borderRadius: '.75rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '1.8rem', fontWeight: 700, color: '#6b2a1a' }}>{articles.filter(a => a.published).length}</p>
                  <p style={{ fontSize: '.75rem', color: '#888', textTransform: 'uppercase' }}>Articles publiés</p>
                </div>
                <div style={{ background: '#f8f6f4', padding: '1.25rem', borderRadius: '.75rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '1.8rem', fontWeight: 700, color: '#6b2a1a' }}>{articles.filter(a => !a.published).length}</p>
                  <p style={{ fontSize: '.75rem', color: '#888', textTransform: 'uppercase' }}>Brouillons</p>
                </div>
                <div style={{ background: '#f8f6f4', padding: '1.25rem', borderRadius: '.75rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '1.8rem', fontWeight: 700, color: '#6b2a1a' }}>{demandes.length}</p>
                  <p style={{ fontSize: '.75rem', color: '#888', textTransform: 'uppercase' }}>Demandes travel</p>
                </div>
                <div style={{ background: '#f8f6f4', padding: '1.25rem', borderRadius: '.75rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '1.8rem', fontWeight: 700, color: '#6b2a1a' }}>{settings.length}</p>
                  <p style={{ fontSize: '.75rem', color: '#888', textTransform: 'uppercase' }}>Paramètres</p>
                </div>
              </div>
              {/* Quality overview */}
              <div style={{ marginTop: '1rem' }}>
                <p style={{ fontSize: '.75rem', color: '#888', textTransform: 'uppercase', marginBottom: '.5rem' }}>Qualité du contenu</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '.5rem' }}>
                  <div style={{ background: '#d1fae5', padding: '.75rem', borderRadius: '.5rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#065f46' }}>{articles.filter(a => a.published).length}</p>
                    <p style={{ fontSize: '.65rem', color: '#065f46' }}>Publiés</p>
                  </div>
                  <div style={{ background: '#fef3c7', padding: '.75rem', borderRadius: '.5rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#92400e' }}>{articles.filter(a => !a.published).length}</p>
                    <p style={{ fontSize: '.65rem', color: '#92400e' }}>Brouillons</p>
                  </div>
                  <div style={{ background: '#eff6ff', padding: '.75rem', borderRadius: '.5rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e40af' }}>{demandes.length}</p>
                    <p style={{ fontSize: '.65rem', color: '#1e40af' }}>Demandes</p>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button onClick={() => openArticleEditor({})} style={{ padding: '.7rem 1.5rem', background: '#6b2a1a', color: 'white', border: 'none', borderRadius: '.5rem', cursor: 'pointer', fontWeight: 600 }}>+ Nouvel article</button>
                <button onClick={() => setTab('blog')} style={{ padding: '.7rem 1.5rem', background: '#01696f', color: 'white', border: 'none', borderRadius: '.5rem', cursor: 'pointer', fontWeight: 600 }}>✨ Générateur IA</button>
                <button onClick={() => setTab('demandes')} style={{ padding: '.7rem 1.5rem', background: '#444', color: 'white', border: 'none', borderRadius: '.5rem', cursor: 'pointer', fontWeight: 600 }}>✈️ Travel Planning</button>
                <button onClick={() => window.open('/', '_blank')} style={{ padding: '.7rem 1.5rem', background: '#e0dbd5', color: '#333', border: 'none', borderRadius: '.5rem', cursor: 'pointer', fontWeight: 600 }}>🌐 Voir le site</button>
              </div>
            </div>
          </div>
        )}

        {tab === 'articles' && (
          <div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <input placeholder="Rechercher un article..." value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && loadArticles()}
                style={{ padding: '.6rem 1rem', border: '1.5px solid #ddd', borderRadius: '.5rem', flex: 1, minWidth: 200, fontSize: '.9rem' }}
              />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                style={{ padding: '.6rem .9rem', border: '1.5px solid #ddd', borderRadius: '.5rem', fontSize: '.9rem' }}>
                <option value="all">Tous</option>
                <option value="published">Publiés</option>
                <option value="draft">Brouillons</option>
                <option value="archived">Archivés</option>
              </select>
              <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                style={{ padding: '.6rem .9rem', border: '1.5px solid #ddd', borderRadius: '.5rem', fontSize: '.9rem' }}>
                <option value="all">Toutes catégories</option>
                {availableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <button onClick={loadArticles} style={{ padding: '.6rem 1.2rem', background: '#6b2a1a', color: 'white', border: 'none', borderRadius: '.5rem', cursor: 'pointer', fontSize: '.9rem' }}>🔍</button>
              <button onClick={() => openArticleEditor({})} style={{ padding: '.6rem 1.2rem', background: '#01696f', color: 'white', border: 'none', borderRadius: '.5rem', cursor: 'pointer', fontSize: '.9rem' }}>+ Nouvel article</button>
            </div>
            {loadingArticles ? <p style={{ textAlign: 'center', color: '#888', padding: '3rem' }}>Chargement…</p>
              : articles.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#aaa' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
                  <p>Aucun article trouvé</p>
                </div>
              ) : (
                <div>
                  {/* Advanced Filters */}
                  <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '1rem', padding: '.75rem', background: '#faf8f5', borderRadius: '.5rem' }}>
                    <select value={countryFilter} onChange={e => setCountryFilter(e.target.value)}
                      style={{ padding: '.4rem .6rem', border: '1.5px solid #ddd', borderRadius: '.4rem', fontSize: '.8rem' }}>
                      <option value="all">Tous pays</option>
                      {['France', 'Portugal', 'Espagne', 'Italie', 'Suisse', 'Allemagne', 'Belgique', 'Pays-Bas', 'Royaume-Uni'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select value={travelStyleFilter} onChange={e => setTravelStyleFilter(e.target.value)}
                      style={{ padding: '.4rem .6rem', border: '1.5px solid #ddd', borderRadius: '.4rem', fontSize: '.8rem' }}>
                      <option value="all">Tous styles</option>
                      {['slow-travel', 'adventure', 'romantique', 'famille', 'solo', 'gastronomie'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select value={seasonFilter} onChange={e => setSeasonFilter(e.target.value)}
                      style={{ padding: '.4rem .6rem', border: '1.5px solid #ddd', borderRadius: '.4rem', fontSize: '.8rem' }}>
                      <option value="all">Toutes saisons</option>
                      {['printemps', 'ete', 'automne', 'hiver', 'annee'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                  {articles.filter(a => {
                    if (categoryFilter !== 'all' && a.category !== categoryFilter) return false;
                    if (countryFilter !== 'all' && a.country !== countryFilter) return false;
                    if (travelStyleFilter !== 'all' && a.travel_style !== travelStyleFilter) return false;
                    if (seasonFilter !== 'all' && a.season !== seasonFilter) return false;
                    return true;
                  }).map(a => {
                    // Quick local quality check
                    const hasImage = !!a.featured_image;
                    const hasExcerpt = a.excerpt && a.excerpt.length >= 50;
                    const hasContent = a.content && a.content.length > 300;
                    const quality = hasImage && hasExcerpt && hasContent ? 'good' : hasImage ? 'medium' : 'low';
                    return (
                    <div key={a.id} style={{ background: 'white', borderRadius: '.75rem', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,.06)', flexWrap: 'wrap' }}>
                      {a.featured_image && <img src={a.featured_image} alt="" style={{ width: 64, height: 48, objectFit: 'cover', borderRadius: '.4rem', flexShrink: 0 }} />}
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ fontWeight: 600, fontSize: '1rem', color: '#1a1a1a', marginBottom: '.2rem' }}>{a.title}</div>
                        <div style={{ fontSize: '.8rem', color: '#888', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                          <span>{a.category || '—'}</span>
                          <span>{fmt(a.created_at)}</span>
                          {a.read_time && <span>⏱ {a.read_time} min</span>}
                        </div>
                        {/* Tags */}
                        <div style={{ display: 'flex', gap: '.3rem', marginTop: '.4rem', flexWrap: 'wrap' }}>
                          {a.country && <span style={{ padding: '.15rem .4rem', background: '#e3f2fd', borderRadius: '.3rem', fontSize: '.7rem', color: '#1565c0' }}>📍 {a.country}</span>}
                          {a.travel_style && <span style={{ padding: '.15rem .4rem', background: '#e8f5e9', borderRadius: '.3rem', fontSize: '.7rem', color: '#2e7d32' }}>🚶 {a.travel_style}</span>}
                          {a.season && <span style={{ padding: '.15rem .4rem', background: '#fff3e0', borderRadius: '.3rem', fontSize: '.7rem', color: '#ef6c00' }}>☀️ {a.season}</span>}
                          {a.budget_level && <span style={{ padding: '.15rem .4rem', background: '#f3e5f5', borderRadius: '.3rem', fontSize: '.7rem', color: '#7b1fa2' }}>💰 {a.budget_level}</span>}
                        </div>
                      </div>
                      <span style={{ padding: '.3rem .8rem', borderRadius: '9999px', fontSize: '.78rem', fontWeight: 600, background: a.published ? '#d4edda' : '#fff3cd', color: a.published ? '#155724' : '#856404' }}>
                        {a.published ? '✓ Publié' : '📝 Brouillon'}
                      </span>
                      <span title="Qualité: image + excerpt + contenu" style={{ padding: '.3rem .6rem', borderRadius: '.4rem', fontSize: '.7rem', fontWeight: 600, background: quality === 'good' ? '#d1fae5' : quality === 'medium' ? '#fef3c7' : '#fee2e2', color: quality === 'good' ? '#065f46' : quality === 'medium' ? '#92400e' : '#991b1b' }}>
                        {quality === 'good' ? '✓✓' : quality === 'medium' ? '✓' : '⚠️'}
                      </span>
                      <div style={{ display: 'flex', gap: '.5rem' }}>
                        <button onClick={() => openArticleEditor(a)} style={{ padding: '.35rem .8rem', border: '1px solid #ddd', borderRadius: '.4rem', background: 'white', cursor: 'pointer', fontSize: '.82rem' }}>✏️ Éditer</button>
                        <button onClick={() => duplicateArticle(a)} title="Dupliquer" style={{ padding: '.35rem .8rem', border: '1px solid #ddd', borderRadius: '.4rem', background: 'white', cursor: 'pointer', fontSize: '.82rem' }}>📋</button>
                        <button onClick={() => togglePublish(a)} style={{ padding: '.35rem .8rem', border: '1px solid #ddd', borderRadius: '.4rem', background: 'white', cursor: 'pointer', fontSize: '.82rem' }}>{a.published ? '📦 Dépublier' : 'Publier'}</button>
                        <button onClick={() => deleteArticle(a.id)} style={{ padding: '.35rem .8rem', border: '1px solid #fcc', borderRadius: '.4rem', background: '#fff5f5', color: '#c0392b', cursor: 'pointer', fontSize: '.82rem' }}>🗑</button>
                      </div>
                    </div>
                  )})}
                </div>
              )}
          </div>
        )}

        {tab === 'new' && (
          <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 2px 12px rgba(0,0,0,.07)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#6b2a1a' }}>{editingArticle?.id ? `✏️ Modifier : ${editingArticle.title}` : '✏️ Nouvel article'}</h2>
              <button onClick={closeArticleEditor} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.3rem' }}>✖️</button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <button onClick={() => setShowArticlePreview(prev => !prev)}
                style={{ padding: '.5rem .95rem', border: '1px solid #ddd', borderRadius: '.5rem', background: 'white', color: '#6b2a1a', cursor: 'pointer', fontSize: '.82rem', fontWeight: 700 }}
              >{showArticlePreview ? "Masquer l’aperçu" : 'Aperçu live'}</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Titre *</label>
                <input value={editingArticle?.title || ''}
                  onChange={e => setEditingArticle(p => ({ ...p, title: e.target.value, slug: slug(e.target.value) }))}
                  style={inp} placeholder="Titre de l’article" />
              </div>
              <div>
                <label style={lbl}>Slug (URL)</label>
                <input value={editingArticle?.slug || ''}
                  onChange={e => setEditingArticle(p => ({ ...p, slug: e.target.value }))}
                  style={inp} placeholder="slug-auto-genere" />
              </div>
              <div style={{ gridColumn: '1/-1', marginBottom: '1rem' }}>
                <label style={{ ...lbl, fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Pilier éditorial</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {['Découvertes locales', 'Carnets de voyage', 'Coulisses', 'Expert hôtelier'].map(p => (
                    <button key={p}
                      onClick={() => { setPilier(p); setEditingArticle(art => ({ ...art, category: p })); }}
                      style={{
                        padding: '0.5rem 1rem', borderRadius: '9999px',
                        border: pilier === p ? '2px solid #4A7C59' : '1px solid #4A7C59',
                        background: pilier === p ? '#4A7C59' : 'transparent',
                        color: pilier === p ? 'white' : '#4A7C59',
                        cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s'
                      }}
                    >{p}</button>
                  ))}
                </div>
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Image à la une</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '.75rem' }}>
                  <button onClick={() => setShowMediaLibrary(true)}
                    style={{ padding: '.6rem 1.1rem', background: '#6b2a1a', color: 'white', border: 'none', borderRadius: '.5rem', cursor: 'pointer', fontSize: '.85rem', fontWeight: 600 }}
                  >🖼️ Médiathèque Supabase</button>
                  <span style={{ color: '#aaa', fontSize: '.82rem' }}>ou</span>
                  <label style={{ padding: '.6rem 1rem', background: uploadingFeaturedImage ? '#8aa8a9' : '#01696f', color: 'white', borderRadius: '.5rem', cursor: uploadingFeaturedImage ? 'wait' : 'pointer', fontSize: '.85rem', fontWeight: 600 }}>
                    {uploadingFeaturedImage ? '⏳ Upload…' : '⬆️ Upload direct'}
                    <input type="file" accept="image/*" onChange={uploadFeaturedImage} style={{ display: 'none' }} disabled={uploadingFeaturedImage} />
                  </label>
                </div>
                {editingArticle?.featured_image ? (
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative' }}>
                      <img src={editingArticle.featured_image} alt="" style={{ height: 80, borderRadius: '.5rem', objectFit: 'cover' }} />
                      <button onClick={() => setEditingArticle(p => ({ ...p, featured_image: '' }))}
                        style={{ position: 'absolute', top: -6, right: -6, background: '#c0392b', color: 'white', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: '.7rem' }}>✖️</button>
                    </div>
                    <input value={editingArticle.featured_image}
                      onChange={e => setEditingArticle(p => ({ ...p, featured_image: e.target.value }))}
                      style={{ ...inp, flex: 1, fontSize: '.82rem' }} placeholder="URL de l’image" />
                  </div>
                ) : (
                  <input value=""
                    onChange={e => setEditingArticle(p => ({ ...p, featured_image: e.target.value }))}
                    style={{ ...inp, fontSize: '.82rem' }} placeholder="Ou coller une URL directement" />
                )}
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Extrait</label>
                <div style={{ position: 'relative' }}>
                <textarea value={editingArticle?.excerpt || ''}
                  onChange={e => setEditingArticle(p => ({ ...p, excerpt: e.target.value }))}
                  style={{ ...inp, height: 80, resize: 'vertical' }}
                  placeholder="Résumé accrocheur pour les cards du blog…" />
                {editingArticle?.content && !(editingArticle?.excerpt) && (
                  <button type="button" onClick={() => {
                    const text = (editingArticle.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
                    const autoExcerpt = text.slice(0, 150) + (text.length > 150 ? '...' : '');
                    setEditingArticle(p => ({ ...p, excerpt: autoExcerpt }));
                  }} style={{ position: 'absolute', bottom: 8, right: 8, fontSize: '.7rem', padding: '.2rem .5rem', background: '#e0e0e0', border: 'none', borderRadius: '.3rem', cursor: 'pointer' }}>
                    ✨ Auto
                  </button>
                )}
                </div>
                <p style={{ fontSize: '.7rem', color: '#888', marginTop: '.2rem' }}>{(editingArticle?.excerpt || '').length}/160 caractères</p>
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Contenu</label>
                <RichEditor value={editingArticle?.content || ''}
                  onChange={html => setEditingArticle(p => ({ ...p, content: html }))}
                  placeholder="Commence à écrire ton article ici…" />
              </div>
              {/* SEO Section */}
              <div style={{ gridColumn: '1/-1', padding: '1rem', background: '#fff5f5', borderRadius: '.5rem', border: '1px solid #fadbd8' }}>
                <div style={{ fontWeight: 600, marginBottom: '.75rem', fontSize: '.9rem', color: '#922b21' }}>🔍 SEO</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
                  <div>
                    <label style={lbl}>Méta titre</label>
                    <input value={editingArticle?.meta_title || ''}
                      onChange={e => setEditingArticle(p => ({ ...p, meta_title: e.target.value }))}
                      style={inp}
                      placeholder={editingArticle?.title ? editingArticle.title.slice(0, 55) : 'Titre pour Google (55 car. max)'}
                    />
                  </div>
                  <div>
                    <label style={lbl}>URL canonique</label>
                    <input value={editingArticle?.canonical_url || ''}
                      onChange={e => setEditingArticle(p => ({ ...p, canonical_url: e.target.value }))}
                      style={inp}
                      placeholder="https://..."
                    />
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={lbl}>Méta description</label>
                    <textarea value={editingArticle?.meta_description || ''}
                      onChange={e => setEditingArticle(p => ({ ...p, meta_description: e.target.value }))}
                      style={{ ...inp, height: 60 }}
                      placeholder="Description pour Google (155 car. max)"
                    />
                    <p style={{ fontSize: '.7rem', color: '#888', marginTop: '.2rem' }}>{(editingArticle?.meta_description || '').length}/155</p>
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={lbl}>Image OG (Open Graph)</label>
                    <input value={editingArticle?.og_image || ''}
                      onChange={e => setEditingArticle(p => ({ ...p, og_image: e.target.value }))}
                      style={inp}
                      placeholder="https://... pour les partages sociaux"
                    />
                  </div>
                </div>
              </div>

              {/* Geo Section */}
              <div style={{ gridColumn: '1/-1', padding: '1rem', background: '#f0f8ff', borderRadius: '.5rem', border: '1px solid '#dae0e6' }}>
                <div style={{ fontWeight: 600, marginBottom: '.75rem', fontSize: '.9rem', color: '#1e40af' }}>📍 Localisation</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '.75rem' }}>
                  <div>
                    <label style={lbl}>Ville</label>
                    <input value={editingArticle?.city || ''}
                      onChange={e => setEditingArticle(p => ({ ...p, city: e.target.value }))}
                      style={inp}
                      placeholder="Lisbonne, Funchal..."
                    />
                  </div>
                  <div>
                    <label style={lbl}>Pays</label>
                    <input value={editingArticle?.country || ''}
                      onChange={e => setEditingArticle(p => ({ ...p, country: e.target.value }))}
                      style={inp}
                      placeholder="Portugal, France..."
                    />
                  </div>
                  <div>
                    <label style={lbl}>Code pays (ISO)</label>
                    <input value={editingArticle?.country_code || ''}
                      onChange={e => setEditingArticle(p => ({ ...p, country_code: e.target.value.toUpperCase().slice(0, 2) }))}
                      style={inp}
                      placeholder="PT, FR..."
                    />
                  </div>
                  <div>
                    <label style={lbl}>Latitude</label>
                    <input type="number" step="any" value={editingArticle?.lat || ''}
                      onChange={e => setEditingArticle(p => ({ ...p, lat: parseFloat(e.target.value) || undefined }))}
                      style={inp}
                      placeholder="38.7223"
                    />
                  </div>
                  <div>
                    <label style={lbl}>Longitude</label>
                    <input type="number" step="any" value={editingArticle?.lng || ''}
                      onChange={e => setEditingArticle(p => ({ ...p, lng: parseFloat(e.target.value) || undefined }))}
                      style={inp}
                      placeholder="-9.1393"
                    />
                  </div>
                </div>
              </div>

              {/* Personalization Section */}
              <div style={{ gridColumn: '1/-1', padding: '1rem', background: '#f0fff4', borderRadius: '.5rem', border: '1px solid '#c3e6cb' }}>
                <div style={{ fontWeight: 600, marginBottom: '.75rem', fontSize: '.9rem', color: '#155724' }}>🎯 Ciblage & Personnalisation</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '.75rem' }}>
                  <div>
                    <label style={lbl}>Style de voyage</label>
                    <select value={editingArticle?.travel_style || ''}
                      onChange={e => setEditingArticle(p => ({ ...p, travel_style: e.target.value }))}
                      style={inp}>
                      <option value="">— Tous —</option>
                      <option value="slow-travel">Slow Travel</option>
                      <option value="adventure">Aventure</option>
                      <option value="romantique">Romantique</option>
                      <option value="famille">Famille</option>
                      <option value="solo">Solo</option>
                      <option value="gastronomie">Gastronomie</option>
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Saison</label>
                    <select value={editingArticle?.season || ''}
                      onChange={e => setEditingArticle(p => ({ ...p, season: e.target.value }))}
                      style={inp}>
                      <option value="">— Toutes —</option>
                      <option value="printemps">Printemps</option>
                      <option value="ete">Été</option>
                      <option value="automne">Automne</option>
                      <option value="hiver">Hiver</option>
                      <option value="annee">Toute l'année</option>
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Budget</label>
                    <select value={editingArticle?.budget_level || ''}
                      onChange={e => setEditingArticle(p => ({ ...p, budget_level: e.target.value }))}
                      style={inp}>
                      <option value="">— Tous —</option>
                      <option value="economique">Économique</option>
                      <option value="moyen">Moyen</option>
                      <option value="haut-de-gamme">Haut de gamme</option>
                      <option value="luxe">Luxe</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={lbl}>Audience cible</label>
                    <input value={editingArticle?.audience || ''}
                      onChange={e => setEditingArticle(p => ({ ...p, audience: e.target.value }))}
                      style={inp}
                      placeholder="Couples, familles, solo travelers..."
                    />
                  </div>
                </div>
              </div>

              {/* Media Section - Video & Gallery */}
              <div style={{ gridColumn: '1/-1', padding: '1rem', background: '#1a1a2e', borderRadius: '.5rem', border: '1px solid #333' }}>
                <div style={{ fontWeight: 600, marginBottom: '.75rem', fontSize: '.9rem', color: '#e0e0e0' }}>🎬 Médias</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
                  <div>
                    <label style={lbl}>Vidéo (YouTube/Vimeo)</label>
                    <input value={editingArticle?.video_url || ''}
                      onChange={e => {
                        const url = e.target.value
                        const platform = url.includes('youtube') || url.includes('youtu.be') ? 'youtube' 
                          : url.includes('vimeo') ? 'vimeo' 
                          : ''
                        setEditingArticle(p => ({ ...p, video_url: url, video_platform: platform }))
                      }}
                      style={inp}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                  <div>
                    <label style={lbl}>Gallery (JSON URLs)</label>
                    <input value={editingArticle?.gallery_images || ''}
                      onChange={e => setEditingArticle(p => ({ ...p, gallery_images: e.target.value }))}
                      style={inp}
                      placeholder='["url1","url2"]'
                    />
                    <p style={{ fontSize: '.7rem', color: '#888', marginTop: '.2rem' }}>Format: JSON array d'URLs</p>
                  </div>
                </div>
                {/* Video preview */}
                {editingArticle?.video_url && (
                  <div style={{ marginTop: '.75rem' }}>
                    <iframe
                      src={editingArticle.video_url.replace('watch?v=', 'embed/')}
                      style={{ width: '100%', height: 200, border: 'none', borderRadius: '.5rem' }}
                      allowFullScreen
                    />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer', fontWeight: 600, color: '#444', fontSize: '.9rem' }}>
                  <input type="checkbox" checked={!!editingArticle?.published}
                    onChange={e => setEditingArticle(p => ({ ...p, published: e.target.checked }))}
                    style={{ width: 18, height: 18 }} />
                  Publier immédiatement
                </label>
                <button onClick={() => { setScheduleMode(!scheduleMode); if (!scheduleMode) setEditingArticle(p => ({ ...p, published: false })); }}
                  style={{ padding: '.25rem .6rem', border: '1px solid #ddd', borderRadius: '.3rem', background: '#faf8f5', cursor: 'pointer', fontSize: '.75rem' }}>
                  {scheduleMode ? '📅 Programmer' : '⏰ Planifier'}
                </button>
              </div>
              {scheduleMode && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginTop: '.5rem' }}>
                  <label style={{ fontWeight: 600, color: '#444', fontSize: '.85rem' }}>Publication prévue:</label>
                  <input type="datetime-local"
                    value={editingArticle?.scheduled_published_at?.slice(0, 16) || ''}
                    onChange={e => setEditingArticle(p => ({ ...p, scheduled_published_at: e.target.value, published: false }))}
                    style={{ padding: '.4rem .6rem', border: '1.5px solid #ddd', borderRadius: '.4rem', fontSize: '.85rem' }}
                  />
                </div>
              )}
              <div style={{ gridColumn: '1 / -1', padding: '1rem', background: '#f8f9fa', borderRadius: '.5rem', marginTop: '1rem' }}>
                <div style={{ fontWeight: 600, marginBottom: '.5rem', fontSize: '.85rem' }}>📊 Analyse SEO</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '.5rem', fontSize: '.8rem' }}>
                  <div>📖 Lisibilité: <strong>{seo.readability}</strong></div>
                  <div>📄 Mots: <strong>{seo.wordCount}</strong></div>
                  <div>🔑 Densité titre: <strong>{seo.density}%</strong></div>
                </div>
                {seo.issues.length > 0 && (
                  <div style={{ marginTop: '.5rem', color: '#c0392b', fontSize: '.75rem' }}>
                    {seo.issues.map((issue, i) => <div key={i}>⚠️ {issue}</div>)}
                  </div>
                )}
              </div>
              <div style={{ gridColumn: '1/-1', display: 'flex', gap: '.6rem', flexWrap: 'wrap' }}>
                <span style={metaChip}>URL: /blog/{editingArticle?.slug || slug(editingArticle?.title || '') || 'nouvel-article'}</span>
                <span style={metaChip}>{articleWordCount} mots</span>
                <span style={metaChip}>{articleReadTime} min de lecture</span>
                <span style={{ ...metaChip, background: seo.score >= 70 ? '#d4edda' : seo.score >= 40 ? '#fff3cd' : '#f8d7da', color: seo.score >= 70 ? '#155724' : seo.score >= 40 ? '#856404' : '#721c24' }}>SEO: {seo.score}/100</span>
                <span style={metaChip}>Cmd/Ctrl+S pour enregistrer</span>
                {isArticleDirty && <span style={{ ...metaChip, background: '#fff4db', color: '#8a5a00' }}>Brouillon non sauvegardé</span>}
              </div>
            </div>
            {showArticlePreview && (
              <div style={previewPanel}>
                <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', color: '#6b2a1a' }}>Aperçu public</h3>
                <div style={previewFrame}>
                  {editingArticle?.featured_image ? (
                    <img src={editingArticle.featured_image} alt="" style={{ width: '100%', maxHeight: 320, objectFit: 'cover', borderRadius: '.9rem', marginBottom: '1.5rem' }} />
                  ) : (
                    <div style={previewImageFallback}>Ajoute une image à la une</div>
                  )}
                  <h1 style={{ margin: 0, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', lineHeight: 1.1, color: '#1f1a17' }}>{editingArticle?.title || "Titre de l’article"}</h1>
                  <p style={{ margin: '1rem 0 1.5rem', color: '#6d625a', fontSize: '1rem', lineHeight: 1.7 }}>{editingArticle?.excerpt || "Ton extrait apparaîtra ici."}</p>
                  {articlePreviewHtml ? (
                    <EnhancedRichContent html={articlePreviewHtml} style={previewBody} />
                  ) : (
                    <p style={{ margin: 0, color: '#8a7a70', lineHeight: 1.7 }}>Commence à écrire dans l&apos;éditeur pour voir le rendu ici.</p>
                  )}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.75rem', justifyContent: 'flex-end' }}>
              <button onClick={closeArticleEditor}
                style={{ padding: '.7rem 1.5rem', border: '1.5px solid #ddd', borderRadius: '.5rem', background: 'white', cursor: 'pointer', fontSize: '.9rem' }}>Annuler</button>
              <button onClick={saveArticle} disabled={savingArticle}
                style={{ padding: '.7rem 2rem', background: '#6b2a1a', color: 'white', border: 'none', borderRadius: '.5rem', fontWeight: 700, cursor: savingArticle ? 'wait' : 'pointer', fontSize: '.9rem', opacity: savingArticle ? .75 : 1 }}>{savingArticle ? '⏳ Enregistrement…' : '💾 Enregistrer'}</button>
            </div>
          </div>
        )}

        {tab === 'pages' && (
          <div>
            {loadingSettings ? <p style={{ textAlign: 'center', color: '#888', padding: '3rem' }}>Chargement…</p> : (
              <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1.5rem', alignItems: 'start' }}>
                <div style={{ background: 'white', borderRadius: '1rem', padding: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
                  {Object.entries(PAGES_CONFIG).map(([key, cfg]) => (
                    <button key={key} onClick={() => setActivePage(key)}
                      style={{ display: 'flex', alignItems: 'center', gap: '.5rem', width: '100%', textAlign: 'left', padding: '.6rem .75rem', borderRadius: '.5rem', border: 'none', cursor: 'pointer', fontSize: '.88rem', fontWeight: activePage === key ? 700 : 400, background: activePage === key ? '#f0e8e4' : 'transparent', color: activePage === key ? '#6b2a1a' : '#555', marginBottom: '.2rem' }}
                    ><span>{cfg.emoji}</span> {cfg.label}</button>
                  ))}
                </div>
                <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
                  {(() => {
                    const config = PAGES_CONFIG[activePage];
                    if (!config) return null;
                    return (
                      <div>
                        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#6b2a1a', marginBottom: '1.5rem' }}>{config.emoji} {config.label}</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                          {config.sections.map(section => {
                            const key = `${activePage}__${section.key}`;
                            return (
                              <div key={key}>
                                <label style={lbl}>{section.label}</label>
                                {section.type === 'textarea' ? (
                                  <textarea value={editedContent[key] ?? ''} onChange={e => setEditedContent(prev => ({ ...prev, [key]: e.target.value }))} style={{ ...inp, height: 110, resize: 'vertical' }} placeholder={section.label} />
                                ) : section.type === 'media' ? (
                                  <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <input value={editedContent[key] ?? ''} onChange={e => setEditedContent(prev => ({ ...prev, [key]: e.target.value }))} style={{ ...inp, flex: 1, minWidth: 200 }} placeholder="URL ou upload..." />
                                    <label style={{ padding: '.5rem .85rem', background: uploadingMediaKey === key ? '#8aa8a9' : '#01696f', color: 'white', borderRadius: '.4rem', cursor: uploadingMediaKey === key ? 'wait' : 'pointer', fontSize: '.8rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                      {uploadingMediaKey === key ? '⏳...' : '⬆️ Upload'}
                                      <input type="file" accept="video/*,image/*" onChange={(e) => uploadMediaForPage(e, section.key, activePage)} style={{ display: 'none' }} disabled={!!uploadingMediaKey} />
                                    </label>
                                    {editedContent[key] && (
                                      <button onClick={() => setEditedContent(prev => ({ ...prev, [key]: '' }))} style={{ padding: '.5rem .75rem', background: '#f0e8e4', color: '#6b2a1a', border: 'none', borderRadius: '.4rem', cursor: 'pointer', fontSize: '.8rem' }}>✕</button>
                                    )}
                                  </div>
                                ) : section.type === 'color' ? (
                                  <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center' }}>
                                    <input type="color" value={editedContent[key] || '#6b2a1a'} onChange={e => setEditedContent(prev => ({ ...prev, [key]: e.target.value }))} style={{ width: 50, height: 40, padding: 0, border: 'none', cursor: 'pointer' }} />
                                    <input value={editedContent[key] ?? ''} onChange={e => setEditedContent(prev => ({ ...prev, [key]: e.target.value }))} style={{ ...inp, flex: 1 }} placeholder="#RRGGBB" />
                                  </div>
                                ) : (
                                  <input value={editedContent[key] ?? ''} onChange={e => setEditedContent(prev => ({ ...prev, [key]: e.target.value }))} style={inp} placeholder={section.label} />
                                )}
                                {section.type === 'media' && editedContent[key] && (
                                  <div style={{ marginTop: '.5rem', borderRadius: '.5rem', overflow: 'hidden', maxWidth: 320 }}>
                                    {section.key.includes('video') || editedContent[key]?.endsWith('.mp4') || editedContent[key]?.endsWith('.webm') ? (
                                      <video src={editedContent[key]} controls style={{ width: '100%', borderRadius: '.5rem' }} />
                                    ) : (
                                      <img src={editedContent[key]} alt="Preview" style={{ width: '100%', borderRadius: '.5rem', objectFit: 'cover' }} />
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                          <button onClick={() => savePageContent(activePage)} disabled={savingSettings}
                            style={{ padding: '.75rem 2.25rem', background: '#6b2a1a', color: 'white', border: 'none', borderRadius: '.5rem', fontWeight: 700, cursor: 'pointer', fontSize: '.95rem', opacity: savingSettings ? .7 : 1 }}
                          >{savingSettings ? '⏳ Sauvegarde…' : '💾 Sauvegarder la page'}</button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'media' && (
          <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 2px 12px rgba(0,0,0,.07)', minHeight: 400 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#6b2a1a', marginBottom: '1.5rem' }}>🖼️ Médiathèque</h2>
            <div style={{ background: '#faf8f5', borderRadius: '.75rem', padding: '2rem', textAlign: 'center', border: '2px dashed #e8e3dc' }}>
              <p style={{ color: '#555', marginBottom: '1.25rem' }}>Toutes tes images sont stockées sur <strong>Supabase Storage</strong>.</p>
              <button onClick={() => setShowMediaLibrary(true)}
                style={{ padding: '.8rem 1.75rem', background: '#6b2a1a', color: 'white', border: 'none', borderRadius: '.5rem', fontWeight: 700, cursor: 'pointer', fontSize: '.95rem' }}
              >🖼️ Ouvrir la médiathèque</button>
            </div>
          </div>
        )}

        {tab === 'demandes' && (
          <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#6b2a1a' }}>✈️ Demandes Travel Planning</h2>
              <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <select value={demandesStatusFilter} onChange={e => setDemandesStatusFilter(e.target.value)}
                  style={{ padding: '.5rem .8rem', border: '1.5px solid #ddd', borderRadius: '.5rem', fontSize: '.85rem' }}>
                  <option value="all">Tous statuts</option>
                  <option value="nouvelle">🆕 Nouvelle</option>
                  <option value="en_cours">🔍 En cours</option>
                  <option value="devis_envoye">📨 Devis envoyé</option>
                  <option value="accepte">✅ Acceptée</option>
                  <option value="terminee">🏁 Terminée</option>
                  <option value="annulee">❌ Annulée</option>
                </select>
                <button onClick={exportDemandesCSV}
                  style={{ padding: '.5rem 1rem', background: '#01696f', color: 'white', border: 'none', borderRadius: '.5rem', cursor: 'pointer', fontSize: '.85rem', fontWeight: 600 }}>
                  ⬇️ CSV
                </button>
                <button onClick={loadDemandes} disabled={loadingDemandes}
                  style={{ padding: '.5rem 1rem', background: 'white', border: '1.5px solid #ddd', borderRadius: '.5rem', cursor: loadingDemandes ? 'wait' : 'pointer', fontSize: '.85rem', opacity: loadingDemandes ? .7 : 1 }}>
                  {loadingDemandes ? '⏳' : '🔄'}
                </button>
              </div>
            </div>

            {/* Stats row */}
            {demandes.length > 0 && (
              <div style={{ display: 'flex', gap: '.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {[['🆕','nouvelle','Nouvelles'],['🔍','en_cours','En cours'],['📨','devis_envoye','Devis'],['✅','accepte','Acceptées']].map(([emoji, key, label]) => {
                  const count = demandes.filter(d => d.statut === key).length;
                  return (
                    <button key={key} onClick={() => setDemandesStatusFilter(demandesStatusFilter === key ? 'all' : key)}
                      style={{ padding: '.5rem 1rem', borderRadius: '.5rem', border: '1.5px solid', borderColor: demandesStatusFilter === key ? '#6b2a1a' : '#e0dbd5', background: demandesStatusFilter === key ? '#f0e8e4' : 'white', cursor: 'pointer', fontSize: '.82rem', fontWeight: 600 }}>
                      {emoji} {label} <span style={{ background: '#e0dbd5', borderRadius: '9999px', padding: '0 .4rem', marginLeft: '.3rem' }}>{count}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {loadingDemandes ? <p style={{ textAlign: 'center', color: '#888', padding: '3rem' }}>Chargement…</p>
              : demandes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#aaa' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✉️</div>
                  <p>Aucune demande pour le moment</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {demandes.filter(d => demandesStatusFilter === 'all' || d.statut === demandesStatusFilter).map(d => {
                    const isExpanded = expandedDemandeId === d.id;
                    const statusColors: Record<string, { bg: string; color: string }> = {
                      nouvelle: { bg: '#dbeafe', color: '#1d4ed8' },
                      en_cours: { bg: '#fef3c7', color: '#92400e' },
                      devis_envoye: { bg: '#ede9fe', color: '#5b21b6' },
                      accepte: { bg: '#d1fae5', color: '#065f46' },
                      terminee: { bg: '#e5e7eb', color: '#374151' },
                      annulee: { bg: '#fee2e2', color: '#991b1b' },
                    };
                    const sc = statusColors[d.statut] || { bg: '#f3f4f6', color: '#111' };
                    return (
                      <div key={d.id} style={{ background: 'white', borderRadius: '.75rem', boxShadow: '0 1px 4px rgba(0,0,0,.06)', overflow: 'hidden', border: isExpanded ? '1.5px solid #6b2a1a' : '1.5px solid transparent' }}>
                        {/* Card header — always visible */}
                        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '.75rem', cursor: 'pointer' }}
                          onClick={() => setExpandedDemandeId(isExpanded ? null : d.id)}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f0e8e4', color: '#6b2a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem', flexShrink: 0 }}>
                              {(d.prenom || '?')[0].toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: '#1a1a1a' }}>{d.prenom} {d.nom}</div>
                              <div style={{ fontSize: '.82rem', color: '#888' }}>{d.email}{d.telephone ? ` · ${d.telephone}` : ''}</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap' }}>
                            <span style={{ padding: '.25rem .7rem', borderRadius: '9999px', fontSize: '.75rem', fontWeight: 700, background: sc.bg, color: sc.color }}>
                              {d.destination || '—'}
                            </span>
                            <select value={d.statut || 'nouvelle'} onClick={e => e.stopPropagation()}
                              onChange={e => updateStatut(d.id, e.target.value)} disabled={updatingDemandeId === d.id}
                              style={{ padding: '.3rem .7rem', border: '1.5px solid #ddd', borderRadius: '.4rem', fontSize: '.82rem', cursor: 'pointer' }}>
                              <option value="nouvelle">🆕 Nouvelle</option>
                              <option value="en_cours">🔍 En cours</option>
                              <option value="devis_envoye">📨 Devis envoyé</option>
                              <option value="accepte">✅ Acceptée</option>
                              <option value="terminee">🏁 Terminée</option>
                              <option value="annulee">❌ Annulée</option>
                            </select>
                            <span style={{ fontSize: '.72rem', color: '#aaa' }}>{fmt(d.created_at)}</span>
                            <span style={{ fontSize: '.9rem', color: '#999', transition: 'transform .2s', display: 'inline-block', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                          </div>
                        </div>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div style={{ borderTop: '1px solid #f0ebe5', padding: '1.25rem 1.5rem', background: '#faf8f5' }}>
                            {/* Trip details grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '.75rem', marginBottom: '1.25rem' }}>
                              {[
                                ['🗺️ Destination', `${d.destination || ''}${d.destination_detail ? ` — ${d.destination_detail}` : ''}`],
                                ['🧳 Style', d.style_voyage || '—'],
                                ['📅 Durée', d.duree_jours ? `${d.duree_jours} jours` : '—'],
                                ['💶 Budget', d.budget_fourchette || '—'],
                                ['🗓️ Départ', d.mois_depart || '—'],
                                ['👥 Voyageurs', d.nb_voyageurs ? String(d.nb_voyageurs) : '—'],
                              ].map(([label, val]) => (
                                <div key={label} style={{ background: 'white', borderRadius: '.5rem', padding: '.75rem 1rem' }}>
                                  <div style={{ fontSize: '.72rem', color: '#999', marginBottom: '.2rem' }}>{label}</div>
                                  <div style={{ fontSize: '.88rem', fontWeight: 600, color: '#1a1a1a' }}>{val || '—'}</div>
                                </div>
                              ))}
                            </div>

                            {/* Client message */}
                            {d.notes && (
                              <div style={{ background: 'white', borderRadius: '.5rem', padding: '.75rem 1rem', marginBottom: '1.25rem', borderLeft: '3px solid #6b2a1a' }}>
                                <div style={{ fontSize: '.72rem', color: '#999', marginBottom: '.3rem' }}>💬 Message client</div>
                                <p style={{ fontSize: '.88rem', color: '#333', lineHeight: 1.6, margin: 0 }}>{d.notes}</p>
                              </div>
                            )}

                            {/* Action buttons */}
                            <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                              <a href={`mailto:${d.email}?subject=Votre demande Travel Planning — ${d.destination}&body=Bonjour ${d.prenom},%0A%0A`}
                                style={{ padding: '.5rem 1rem', background: '#6b2a1a', color: 'white', borderRadius: '.5rem', fontSize: '.85rem', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '.4rem' }}>
                                📧 Écrire
                              </a>
                              <button
                                onClick={() => generateAiReply(d)}
                                disabled={generatingReplyId === d.id}
                                style={{ padding: '.5rem 1rem', background: '#01696f', color: 'white', border: 'none', borderRadius: '.5rem', fontSize: '.85rem', fontWeight: 600, cursor: generatingReplyId === d.id ? 'wait' : 'pointer', opacity: generatingReplyId === d.id ? .7 : 1 }}>
                                {generatingReplyId === d.id ? '⏳ Génération…' : '✨ Réponse IA'}
                              </button>
                            </div>

                            {/* AI reply draft */}
                            {aiReplyDraft[d.id] && (
                              <div style={{ background: 'white', borderRadius: '.75rem', padding: '1rem', marginBottom: '1.25rem', border: '1.5px solid #01696f' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.5rem' }}>
                                  <span style={{ fontSize: '.78rem', fontWeight: 700, color: '#01696f' }}>✨ Brouillon généré</span>
                                  <div style={{ display: 'flex', gap: '.5rem' }}>
                                    <button
                                      onClick={() => {
                                        const mailto = `mailto:${d.email}?subject=${encodeURIComponent(`Votre demande Travel Planning — ${d.destination}`)}&body=${encodeURIComponent(aiReplyDraft[d.id])}`;
                                        window.open(mailto);
                                      }}
                                      style={{ padding: '.3rem .75rem', background: '#6b2a1a', color: 'white', border: 'none', borderRadius: '.4rem', fontSize: '.78rem', cursor: 'pointer', fontWeight: 600 }}>
                                      📧 Ouvrir dans mail
                                    </button>
                                    <button
                                      onClick={() => { navigator.clipboard.writeText(aiReplyDraft[d.id]); showToast('📋 Copié !'); }}
                                      style={{ padding: '.3rem .75rem', background: '#f0e8e4', color: '#6b2a1a', border: 'none', borderRadius: '.4rem', fontSize: '.78rem', cursor: 'pointer', fontWeight: 600 }}>
                                      📋 Copier
                                    </button>
                                  </div>
                                </div>
                                <textarea
                                  value={aiReplyDraft[d.id]}
                                  onChange={e => setAiReplyDraft(prev => ({ ...prev, [d.id]: e.target.value }))}
                                  rows={10}
                                  style={{ width: '100%', border: 'none', background: 'transparent', fontSize: '.85rem', lineHeight: 1.7, resize: 'vertical', outline: 'none', color: '#333', fontFamily: 'Georgia, serif' }}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
          </div>
        )}

        {tab === 'calendar' && (() => {
          const now = new Date();
          const year = now.getFullYear();
          const month = now.getMonth();
          const monthName = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          const firstDay = (new Date(year, month, 1).getDay() + 6) % 7; // Mon=0
          const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
            i < firstDay ? null : i - firstDay + 1
          );
          const getArticlesForDay = (day: number) => {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            return articles.filter(a => {
              const pub = a.published_at || a.scheduled_published_at || '';
              return pub.startsWith(dateStr);
            });
          };
          return (
            <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#6b2a1a' }}>📅 Calendrier — {monthName}</h2>
                <button onClick={() => openArticleEditor({})} style={{ padding: '.5rem 1.25rem', background: '#6b2a1a', color: 'white', border: 'none', borderRadius: '.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '.85rem' }}>+ Planifier un article</button>
              </div>
              {/* Day headers */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '.35rem', marginBottom: '.35rem' }}>
                {['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].map(d => (
                  <div key={d} style={{ textAlign: 'center', fontSize: '.72rem', fontWeight: 700, color: '#aaa', padding: '.4rem 0', textTransform: 'uppercase' }}>{d}</div>
                ))}
              </div>
              {/* Day cells */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '.35rem' }}>
                {cells.map((day, i) => {
                  if (!day) return <div key={`empty-${i}`} />;
                  const dayArticles = getArticlesForDay(day);
                  const isToday = day === now.getDate();
                  return (
                    <div key={day} style={{ minHeight: 80, background: isToday ? '#f0e8e4' : '#faf8f5', borderRadius: '.5rem', padding: '.5rem', border: isToday ? '2px solid #6b2a1a' : '1px solid #eee' }}>
                      <div style={{ fontSize: '.78rem', fontWeight: isToday ? 700 : 400, color: isToday ? '#6b2a1a' : '#888', marginBottom: '.3rem' }}>{day}</div>
                      {dayArticles.map(a => (
                        <div key={a.id} onClick={() => openArticleEditor(a)} title={a.title}
                          style={{ fontSize: '.68rem', padding: '.2rem .4rem', borderRadius: '.25rem', background: a.published ? '#d1fae5' : '#fef3c7', color: a.published ? '#065f46' : '#92400e', marginBottom: '.2rem', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600 }}>
                          {a.published ? '●' : '○'} {a.title}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
              {/* Legend */}
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.25rem', fontSize: '.78rem', color: '#888' }}>
                <span><span style={{ background: '#d1fae5', color: '#065f46', padding: '.1rem .4rem', borderRadius: '.25rem', fontWeight: 600 }}>● Publié</span></span>
                <span><span style={{ background: '#fef3c7', color: '#92400e', padding: '.1rem .4rem', borderRadius: '.25rem', fontWeight: 600 }}>○ Brouillon/Planifié</span></span>
              </div>
              {/* Upcoming scheduled */}
              {articles.filter(a => a.scheduled_published_at && !a.published).length > 0 && (
                <div style={{ marginTop: '2rem' }}>
                  <h3 style={{ fontSize: '.95rem', fontWeight: 700, color: '#6b2a1a', marginBottom: '1rem' }}>🕐 Articles planifiés</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                    {articles.filter(a => a.scheduled_published_at && !a.published).map(a => (
                      <div key={a.id} onClick={() => openArticleEditor(a)}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.75rem 1rem', background: '#fef3c7', borderRadius: '.5rem', cursor: 'pointer', fontSize: '.88rem' }}>
                        <span style={{ fontWeight: 600, color: '#92400e' }}>{a.title}</span>
                        <span style={{ color: '#b45309', fontWeight: 600 }}>{a.scheduled_published_at ? new Date(a.scheduled_published_at).toLocaleDateString('fr-FR') : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {tab === 'carousel' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <CarouselGenerator />
            <CarouselEditor />
          </div>
        )}

        {tab === 'blog' && (
          <BlogGenerator
            onGenerated={(data) => {
              setEditingArticle({
                title: data.title, slug: data.suggestedSlug,
                excerpt: data.excerpt, content: data.content,
                voice_notes: '', featured_image: '',
                category: 'Voyage', published: false,
              });
              showToast('✅ Article généré ! Édite-le puis enregistre.');
              setTab('new');
            }}
          />
        )}

        {tab === 'analytics' && (
          <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 1px 4px rgba(0,0,0,.06)', maxWidth: '900px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#6b2a1a', marginBottom: '1.5rem' }}>📊 Analytics</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
              {(['Sessions', 'Utilisateurs', 'Pages vues', 'Taux rebond'] as const).map(label => (
                <div key={label} style={{ background: '#f8f6f4', padding: '1.25rem', borderRadius: '.75rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '1.8rem', fontWeight: 700, color: '#6b2a1a' }}>—</p>
                  <p style={{ fontSize: '.75rem', color: '#888', textTransform: 'uppercase' }}>{label}</p>
                </div>
              ))}
            </div>
            <button onClick={async () => {
              setLoadingAnalytics(true);
              try {
                const res = await fetch('/api/cms/analytics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ startDate: '30daysAgo', endDate: 'today' }) });
                const data = await res.json();
                setAnalyticsData(data);
              } catch (e) { console.error(e); }
              setLoadingAnalytics(false);
            }} disabled={loadingAnalytics}
              style={{ padding: '.7rem 1.5rem', background: '#6b2a1a', color: 'white', border: 'none', borderRadius: '.5rem', fontWeight: 600, cursor: 'pointer' }}>
              {loadingAnalytics ? '⏳ Chargement…' : '🔄 Actualiser'}
            </button>
          </div>
        )}

        {tab === 'search' && (
          <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 1px 4px rgba(0,0,0,.06)', maxWidth: '900px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#6b2a1a', marginBottom: '1.5rem' }}>🔍 Recherche intelligente</h2>
            <div style={{ display: 'flex', gap: '.75rem', marginBottom: '1.5rem' }}>
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                style={{ flex: 1, padding: '.75rem 1rem', border: '1.5px solid #e0dbd5', borderRadius: '.5rem', fontSize: '1rem' }}
                placeholder="Rechercher dans articles, demandes..." />
              <button onClick={handleSearch} disabled={loadingSearch || !searchQuery}
                style={{ padding: '.75rem 1.5rem', background: '#6b2a1a', color: 'white', border: 'none', borderRadius: '.5rem', fontWeight: 600, cursor: 'pointer', opacity: loadingSearch || !searchQuery ? .7 : 1 }}>
                {loadingSearch ? '⏳' : '🔍'}
              </button>
            </div>
            {searchResults.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ fontSize: '.85rem', color: '#888' }}>{searchResults.length} résultat(s)</p>
                {searchResults.map((r: any, i: number) => (
                  <div key={i} style={{ padding: '1rem', background: '#f8f6f4', borderRadius: '.5rem', cursor: 'pointer' }} onClick={() => setTab(r.type === 'article' ? 'articles' : 'demandes')}>
                    <div style={{ fontWeight: 600, color: '#333', marginBottom: '.35rem' }}>{r.title}</div>
                    {r.excerpt && <p style={{ fontSize: '.85rem', color: '#666' }}>{r.excerpt}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'settings' && (
          <div>
            {loadingSettings ? <p style={{ textAlign: 'center', color: '#888', padding: '3rem' }}>Chargement…</p> : (
              <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1.5rem', alignItems: 'start' }}>
                <div style={{ background: 'white', borderRadius: '1rem', padding: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
                  {Object.entries(SETTINGS_GROUPS).map(([key, cfg]) => (
                    <button key={key} onClick={() => setSettingsGroup(key)}
                      style={{ display: 'flex', alignItems: 'center', gap: '.5rem', width: '100%', textAlign: 'left', padding: '.6rem .75rem', borderRadius: '.5rem', border: 'none', cursor: 'pointer', fontSize: '.88rem', fontWeight: settingsGroup === key ? 700 : 400, background: settingsGroup === key ? '#f0e8e4' : 'transparent', color: settingsGroup === key ? '#6b2a1a' : '#555', marginBottom: '.2rem' }}
                    ><span>{cfg.emoji}</span> {cfg.label}</button>
                  ))}
                </div>
                <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
                  {(() => {
                    const groupItems = settings.filter(s => {
                      if (settingsGroup === 'general') return ['site_title', 'site_logo', 'site_favicon'].includes(s.key);
                      if (settingsGroup === 'appearance') return APPEARANCE_SETTINGS.map(a => a.key).includes(s.key);
                      if (settingsGroup === 'social') return s.key.startsWith('social_');
                      if (settingsGroup === 'seo') return s.key.startsWith('seo_');
                      if (settingsGroup === 'footer') return s.key.startsWith('footer_');
                      if (settingsGroup === 'email') return s.key.startsWith('email_') || s.key.startsWith('notif_');
                      return true;
                    });
                    const groupCfg = SETTINGS_GROUPS[settingsGroup];
                    return (
                      <div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#6b2a1a', marginBottom: '1.5rem' }}>{groupCfg?.emoji} {groupCfg?.label}</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                          {groupItems.map(s => (
                            <div key={s.key}>
                              <label style={lbl}>{s.label}</label>
                              <input value={editedSettings[s.key] || ''}
                                onChange={e => setEditedSettings(prev => ({ ...prev, [s.key]: e.target.value }))}
                                style={inp} placeholder={s.label} />
                            </div>
                          ))}
                          {groupItems.length === 0 && <p style={{ color: '#aaa', fontSize: '.9rem', textAlign: 'center', padding: '2rem' }}>Aucun paramètre dans ce groupe.</p>}
                        </div>
                        <button onClick={saveSettings} disabled={savingSettings}
                          style={{ marginTop: '1.75rem', padding: '.7rem 2rem', background: '#6b2a1a', color: 'white', border: 'none', borderRadius: '.5rem', fontWeight: 700, cursor: 'pointer', fontSize: '.9rem', opacity: savingSettings ? .7 : 1 }}
                        >{savingSettings ? '⏳ Sauvegarde…' : '💾 Sauvegarder'}</button>
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

// ===== Export avec Suspense (obligatoire car useSearchParams) =====
export default function CmsAdminClient() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f3ef' }}>
        <div style={{ background: 'white', padding: '2.5rem', borderRadius: '1rem', boxShadow: '0 8px 32px rgba(0,0,0,.1)', width: '100%', maxWidth: 380, textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '.5rem' }}>⏳</div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#6b2a1a' }}>Heldonica CMS</h1>
          <p style={{ color: '#888', fontSize: '.9rem' }}>Chargement…</p>
        </div>
      </div>
    }>
      <CMSAdminInner />
    </Suspense>
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
  padding: '.35rem .65rem', borderRadius: '9999px',
  background: '#f0e8e4', color: '#6b2a1a',
  fontSize: '.76rem', fontWeight: 600,
};
const previewPanel: React.CSSProperties = {
  marginTop: '1.75rem', padding: '1.25rem',
  borderRadius: '1rem', background: '#f8f4ef',
  border: '1px solid #ece3d8',
};
const previewFrame: React.CSSProperties = {
  background: 'white', borderRadius: '1rem',
  padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,.05)',
};
const previewImageFallback: React.CSSProperties = {
  minHeight: 220, marginBottom: '1.5rem', borderRadius: '.9rem',
  background: 'linear-gradient(135deg, #f2e8dc 0%, #d9ebe6 100%)',
  color: '#6d625a', display: 'flex', alignItems: 'center',
  justifyContent: 'center', textAlign: 'center', padding: '1.5rem', fontWeight: 600,
};
const previewBody: React.CSSProperties = {
  color: '#302925', lineHeight: 1.8, fontSize: '1rem',
};
