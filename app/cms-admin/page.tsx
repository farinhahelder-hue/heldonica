'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import EnhancedRichContent from '@/components/EnhancedRichContent';
import MediaLibrary from '@/components/MediaLibrary';
import { sanitizeHtml } from '@/lib/sanitize-html';
import CarouselEditor from '@/components/admin/CarouselEditor';
import CarouselGenerator from '@/components/admin/CarouselGenerator';
import BlogGenerator from '@/components/admin/BlogGenerator';
import { Home, FileText, Plus, Sparkles, Folder, Plane, Image, Settings, BarChart3, Search, Save, Package, Car, Eye, EyeOff, Trash2, Send, Download, Upload, RefreshCw } from 'lucide-react';

const RichEditor = dynamic(() => import('@/components/RichEditor'), { ssr: false });

// ===== —€ Types ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== —€
type Article = {
  id: number; title: string; slug: string; category: string; scheduled_published_at?: string;
  published: boolean; published_at: string; created_at: string;
  excerpt: string; featured_image: string; content?: string; voice_notes?: string;
};

type Demande = {
  id: string; prenom: string; nom: string; email: string;
  telephone: string; destination: string; style_voyage: string;
  duree_jours: number; budget_fourchette: string; nb_voyageurs: number;
  mois_depart: string; notes: string; statut: string; created_at: string;
};

type Setting = { id: number; key: string; value: string; label: string; type?: string; };
type SiteContent = { id: number; page: string; block_key: string; value: string; label: string; type: string; };

// ===== —€ Helpers ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== —€
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

// ===== —€ Config pages CMS ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== —€
const PAGES_CONFIG: Record<string, { label: string; emoji: string; sections: { key: string; label: string; type: 'text' | 'textarea' }[] }> = {
  'home': {
    label: 'Accueil',
    emoji: '<Home className="w-4 h-4" />',
    sections: [
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
      { key: 'intro_text',  label: 'Texte d\'introduction', type: 'textarea' },
    ],
  },
  'nos-services': {
    label: 'Nos services',
    emoji: '<Sparkles className="w-4 h-4" />',
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
    emoji: '✈',
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
      { key: 'intro_text',  label: 'Texte d\'introduction', type: 'textarea' },
    ],
  },
  'hotel-consulting': {
    label: 'Hotel Consulting',
    emoji: '🏨',
    sections: [
      { key: 'page_title',  label: 'Titre de la page',      type: 'text' },
      { key: 'intro_text',  label: 'Texte d\'introduction', type: 'textarea' },
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
  general: { label: 'Général',         emoji: '🌐' },
  social:  { label: 'Réseaux sociaux', emoji: '📱' },
  seo:     { label: 'SEO',             emoji: '<Search className="w-4 h-4" />' },
  footer:  { label: 'Footer',          emoji: '📄' },
};

// ===== —€ Composant principal ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== 
export default function CMSAdmin() {
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
  const [activePage, setActivePage] = useState('home');
  const [editedSettings, setEditedSettings] = useState<Record<string, string>>({});
  const [editedContent, setEditedContent] = useState<Record<string, string>>({});
  const [savingSettings, setSavingSettings] = useState(false);
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

  // Autosave every 30s when editing
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

  // Autosave
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
        showToast('<Save className="w-4 h-4" /> Brouillon auto-sauvegardé');
        setUnsavedChanges(false);
      } catch { /* silent */ }
    }, 30000);
    return () => clearTimeout(timer);
  }, [tab, unsavedChanges, savingArticle, editingArticle]);

  // Clean URL params on mount
  useEffect(() => {
    const error = searchParams.get('error');
    const connected = searchParams.get('connected');
    if (error || connected) {
      router.replace('/cms-admin');
    }
  }, []);

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


} // export default function CMSAdmin
