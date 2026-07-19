'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import EnhancedRichContent from '@/components/EnhancedRichContent';
import MediaLibrary from '@/components/MediaLibrary';
import EeaatScore from '@/components/EeaatScore';
import { sanitizeHtml } from '@/lib/sanitize-html';
import { Home, FileText, Plus, Sparkles, Folder, Plane, Image, Settings, BarChart3, Search, Save, Package, Car, Eye, EyeOff, Trash2, Send, Download, Upload, RefreshCw, Bot, Mail, Map as MapIcon, ChevronLeft, ChevronRight, Palette, Zap, Inbox, MapPin, ListTree, Type } from 'lucide-react';
import { Film, Clapperboard, Camera, Calendar, MessageSquare, ClipboardList } from 'lucide-react';
import CmsSettingsPanel from '@/components/admin/CmsSettingsPanel';
import ErrorBoundary from '@/components/admin/ErrorBoundary';
import { ToastProvider, useToast } from '@/components/admin/Toast';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import ArticlePreview from '@/components/admin/ArticlePreview';
import { SkeletonTable, SkeletonForm, SkeletonCard } from '@/components/admin/SkeletonLoader';

const RichEditor = dynamic(() => import('@/components/RichEditor'), { ssr: false });
const CarouselEditor = dynamic(() => import('@/components/admin/CarouselEditor'), { ssr: false });
const CarouselGenerator = dynamic(() => import('@/components/admin/CarouselGenerator'), { ssr: false });
const BlogGenerator = dynamic(() => import('@/components/admin/BlogGenerator'), { ssr: false });
const VideoEditor = dynamic(() => import('@/components/admin/VideoEditor'), { ssr: false });
const FastTrimTool = dynamic(() => import('@/components/admin/FastTrimTool'), { ssr: false });
const VideoMaker = dynamic(() => import('@/components/admin/video-maker/VideoMaker'), { ssr: false });
const MapManagerSection = dynamic(() => import('./maps/MapManagerSection'), { ssr: false });
const DesignEditor = dynamic(() => import('@/components/admin/DesignEditor'), { ssr: false });
const GeoAuditPanel = dynamic(() => import('@/components/admin/GeoAuditPanel'), { ssr: false });
const TestimonialsManager = dynamic(() => import('@/components/admin/TestimonialsManager'), { ssr: false });
const ChecklistTemplatesManager = dynamic(() => import('@/components/admin/ChecklistTemplatesManager'), { ssr: false });
const InstagramPublisher = dynamic(() => import('@/components/admin/InstagramPublisher'), { ssr: false });
const InstagramStatsDashboard = dynamic(() => import('@/components/admin/InstagramStatsDashboard'), { ssr: false });
const ScheduledPostsList = dynamic(() => import('@/components/admin/ScheduledPostsList'), { ssr: false });

// New CMS integrations
const DestinationPillarEditor = dynamic(() => import('@/components/admin/DestinationPillarEditor'), { ssr: false });
const GuidesManager = dynamic(() => import('@/components/admin/GuidesManager'), { ssr: false });
const EditableZonesManager = dynamic(() => import('@/components/admin/EditableZonesManager'), { ssr: false });

type Article = {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: 'published' | 'draft' | 'scheduled';
  category?: string;
  tags?: string[];
  featured_image?: string;
  created_at?: string;
  updated_at?: string;
  published_at?: string;
  author?: string;
  seo_title?: string;
  seo_description?: string;
  visit_date?: string;
  visit_count?: number;
  sitemap_priority?: number;
  sitemap_changefreq?: string;
};

type NavSection =
  | 'dashboard' | 'articles' | 'new-article' | 'media'
  | 'settings' | 'seo' | 'analytics' | 'carousel'
  | 'blog-generator' | 'video' | 'fast-trim' | 'studio-video'
  | 'map' | 'auto-shorts' | 'design' | 'geo' | 'instagram' | 'messages'
  | 'testimonials' | 'checklists'
  | 'destination-pillars' | 'guides' | 'editable-zones';

function CmsAdminClientInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Status filter & bulk
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'scheduled'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Confirm dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [confirmVariant, setConfirmVariant] = useState<'danger' | 'default'>('default');

  // Preview
  const [previewArticle, setPreviewArticle] = useState<Article | null>(null);

  // Local draft recovery
  const [localDraft, setLocalDraft] = useState<{ article: Article; timestamp: string } | null>(null);

  // Article revisions
  type ArticleRevision = {
    id: number;
    article_id: number;
    title: string;
    content: string;
    excerpt?: string;
    saved_at: string;
    word_count: number;
  };
  const [revisions, setRevisions] = useState<ArticleRevision[]>([]);
  const [revisionsLoading, setRevisionsLoading] = useState(false);

  // Auto-save draft
  const [lastAutoSave, setLastAutoSave] = useState<string>('');
  useEffect(() => {
    if (!editingArticle) return;
    const timer = setInterval(() => {
      const key = `heldonica-draft-${editingArticle.slug || 'new'}`;
      const timestamp = new Date().toISOString();
      localStorage.setItem(key, JSON.stringify({ article: editingArticle, timestamp }));
      setLastAutoSave(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 30000);
    return () => clearInterval(timer);
  }, [editingArticle]);

  // Check for local draft when editingArticle is set
  useEffect(() => {
    if (!editingArticle) {
      setLocalDraft(null);
      return;
    }
    const key = `heldonica-draft-${editingArticle.slug || 'new'}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const draftTimestamp = new Date(parsed.timestamp).getTime();
        const articleTimestamp = editingArticle.updated_at
          ? new Date(editingArticle.updated_at).getTime()
          : 0;
        if (draftTimestamp > articleTimestamp) {
          setLocalDraft({ article: parsed.article, timestamp: parsed.timestamp });
        } else {
          setLocalDraft(null);
        }
      } catch {
        setLocalDraft(null);
      }
    } else {
      setLocalDraft(null);
    }
  }, [editingArticle]);

  // Load revisions when editing article changes
  useEffect(() => {
    if (!editingArticle?.id) {
      setRevisions([]);
      return;
    }
    setRevisionsLoading(true);
    fetch(`/api/cms/article-revisions?article_id=${editingArticle.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.revisions) {
          setRevisions(data.revisions);
        }
      })
      .catch(() => {})
      .finally(() => setRevisionsLoading(false));
  }, [editingArticle?.id]);

  // ── Messages section ───────────────────────────────────────────────────────
  type ContactMessage = {
    id: string;
    name: string;
    email: string;
    subject?: string;
    message: string;
    status: string;
    created_at: string;
    read_at?: string;
  };

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [msgFilter, setMsgFilter] = useState<'all' | 'unread' | 'read' | 'archived'>('all');
  const [selectedMsg, setSelectedMsg] = useState<ContactMessage | null>(null);
  const [msgActioning, setMsgActioning] = useState(false);
  const [messagesLoaded, setMessagesLoaded] = useState(false);

  const loadMessages = useCallback(async (filter?: string) => {
    setMessagesLoading(true);
    try {
      const params = (filter ?? msgFilter) !== 'all' ? `?status=${filter ?? msgFilter}` : '';
      const res = await fetch(`/api/cms/contact-messages${params}`, { cache: 'no-store' });
      const data = await res.json();
      if (res.ok) {
        setMessages(data.messages || []);
        setUnreadCount(data.unread || 0);
      }
    } catch { /* silent */ } finally {
      setMessagesLoading(false);
    }
  }, [msgFilter]);

  useEffect(() => {
    if (activeSection === 'messages') { if (!messagesLoaded) { loadMessages(); setMessagesLoaded(true); } }
    else { setMessagesLoaded(false); }
  }, [activeSection, loadMessages, messagesLoaded]);

  const handleMsgAction = async (id: string, action: 'read' | 'archive') => {
    setMsgActioning(true);
    try {
      const res = await fetch('/api/cms/contact-messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      if (res.ok) {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, status: action === 'read' ? 'read' : 'archived', read_at: action === 'read' ? new Date().toISOString() : m.read_at } : m));
        setUnreadCount(prev => action === 'read' && messages.find(m => m.id === id)?.status === 'unread' ? prev - 1 : prev);
        if (selectedMsg?.id === id) setSelectedMsg(null);
        toast(`${action === 'read' ? 'Marqué comme lu' : 'Archivé'}`, 'success');
      }
    } catch { toast('Erreur', 'error'); } finally { setMsgActioning(false); }
  };

  const handleMsgDelete = async (id: string) => {
    if (!(window as Window & { confirm: (msg: string) => boolean }).confirm('Supprimer ce message ?')) return;
    setMsgActioning(true);
    try {
      const res = await fetch(`/api/cms/contact-messages?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessages(prev => prev.filter(m => m.id !== id));
        if (selectedMsg?.id === id) setSelectedMsg(null);
        toast('Message supprime', 'success');
      }
    } catch { toast('Erreur', 'error'); } finally { setMsgActioning(false); }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

function CollapsibleSection({ title, defaultOpen, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen ?? true);
  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3 bg-gray-50 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors">
        <span>{title}</span>
        <span className={`transform transition text-gray-400 ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {open && <div className="p-4 space-y-4">{children}</div>}
    </div>
  );
}

  function MessagesSection() {
    const badgeStyle = (s: string) => s === 'unread' ? 'bg-red-100 text-red-700' : s === 'read' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500';
    const filtered = messages;
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Messages</h1>
        <p className="text-sm text-gray-500 mb-4">
          {unreadCount > 0 ? `${unreadCount} message${unreadCount > 1 ? 's' : ''} non lu${unreadCount > 1 ? 's' : ''}` : 'Aucun message non lu'}
        </p>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-4 w-fit">
          {(['all', 'unread', 'read', 'archived'] as const).map(f => (
            <button key={f} onClick={() => setMsgFilter(f)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${msgFilter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {f === 'all' ? 'Tous' : f === 'unread' ? `Non lus${unreadCount > 0 ? ` (${unreadCount})` : ''}` : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        {messagesLoading ? (
          <div className="text-sm text-gray-400 py-8 text-center">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="text-sm text-gray-400 py-8 text-center">Aucun message</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
              {filtered.map(msg => (
                <div key={msg.id} onClick={() => setSelectedMsg(msg)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedMsg?.id === msg.id ? 'bg-blue-50' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{msg.name}</p>
                      <p className="text-xs text-gray-500 truncate">{msg.email}</p>
                      {msg.subject && <p className="text-xs text-gray-600 mt-0.5 truncate">{msg.subject}</p>}
                    </div>
                    <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${badgeStyle(msg.status)}`}>
                      {msg.status === 'unread' ? 'NON LU' : msg.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(msg.created_at)}</p>
                </div>
              ))}
            </div>
            {selectedMsg ? (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{selectedMsg.name}</h3>
                    <p className="text-sm text-gray-500">{selectedMsg.email}</p>
                    {selectedMsg.subject && <p className="text-sm text-gray-700 mt-1"><span className="font-semibold">Sujet :</span> {selectedMsg.subject}</p>}
                  </div>
                  <button onClick={() => setSelectedMsg(null)} className="text-gray-400 hover:text-gray-600 p-1"><span className="text-lg">&times;</span></button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap max-h-64 overflow-y-auto mb-4">
                  {selectedMsg.message}
                </div>
                <p className="text-xs text-gray-400 mb-4">Recu le {formatDate(selectedMsg.created_at)}</p>
                <div className="flex gap-2">
                  {selectedMsg.status === 'unread' && (
                    <button onClick={() => handleMsgAction(selectedMsg.id, 'read')} disabled={msgActioning}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#2D8B7A] text-white rounded-lg text-sm font-medium hover:bg-[#257a6a] disabled:opacity-50 transition-colors">
                      <Eye size={14} /> Marquer comme lu
                    </button>
                  )}
                  {selectedMsg.status !== 'archived' && (
                    <button onClick={() => handleMsgAction(selectedMsg.id, 'archive')} disabled={msgActioning}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors">
                      Archive
                    </button>
                  )}
                  <button onClick={() => handleMsgDelete(selectedMsg.id)} disabled={msgActioning}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors">
                    <Trash2 size={14} />
                  </button>
                  <a href={`mailto:${selectedMsg.email}`}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    <Mail size={14} /> Repondre
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-8 flex items-center justify-center">
                <p className="text-sm text-gray-400">Selectionnez un message</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── Auth ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/cms/auth/check')
      .then(r => r.json())
      .then(d => setIsAuthenticated(!!(d.authenticated || d.ok)))
      .catch(() => setIsAuthenticated(false))
      .finally(() => setAuthLoading(false));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/cms/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setIsAuthenticated(true);
      } else {
        setAuthError('Mot de passe incorrect');
      }
    } catch {
      setAuthError('Erreur réseau');
    }
  };

  // ── Articles ──────────────────────────────────────────────────────────────
  const loadArticles = useCallback(async () => {
    setLoadingArticles(true);
    try {
      const res = await fetch('/api/cms/articles?limit=100');
      const data = await res.json();
      setArticles(Array.isArray(data) ? data : data.articles ?? []);
    } catch {
      console.error('Failed to load articles');
    } finally {
      setLoadingArticles(false);
    }
  }, []);

  const [articlesLoaded, setArticlesLoaded] = useState(false);
  useEffect(() => {
    if (isAuthenticated && (activeSection === 'articles' || activeSection === 'dashboard') && !articlesLoaded) {
      loadArticles().then(() => setArticlesLoaded(true));
    }
  }, [isAuthenticated, activeSection, loadArticles, articlesLoaded]);

  const openArticleEditor = (article: Article) => {
    setEditingArticle({ ...article });
    setActiveSection('new-article');
  };

  const confirm = (title: string, message: string, action: () => void, variant: 'danger' | 'default' = 'default') => {
    setConfirmTitle(title);
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setConfirmVariant(variant);
    setConfirmOpen(true);
  };

  const handleSaveArticle = async () => {
    if (!editingArticle) return;
    setSaving(true);
    setSaveMsg('💾 Sauvegarde en cours…');
    try {
      const method = editingArticle.id ? 'PATCH' : 'POST';
      const url = editingArticle.id
        ? `/api/cms/articles/${editingArticle.id}`
        : '/api/cms/articles';
      const body = { ...editingArticle };
      if (editingArticle.status === 'scheduled' && !editingArticle.published_at) {
        throw new Error('Date de publication requise pour le statut planifié');
      }
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Save failed' }));
        throw new Error(err.error || 'Save failed');
      }
      setSaveMsg('✅ Article sauvegardé');
      loadArticles();
    } catch (e: any) {
      setSaveMsg('❌ ' + (e.message || 'Erreur lors de la sauvegarde'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteArticle = async (article: Article) => {
    try {
      const res = await fetch(`/api/cms/articles/${article.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      toast('Article supprimé', 'success');
      loadArticles();
    } catch {
      toast('Erreur lors de la suppression', 'error');
    }
  };

  const filteredArticles = articles.filter(
    a =>
      (statusFilter === 'all' || a.status === statusFilter) &&
      (a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // ── Loading / Auth screens ─────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f3ef]">
        <div className="bg-white p-10 rounded-2xl shadow-lg text-center">
          <div className="text-3xl mb-2 text-[#2D8B7A]">🌿</div>
          <h1 className="text-xl font-bold text-[#6b2a1a]">Heldonica CMS</h1>
          <p className="text-gray-500 text-sm mt-1">Vérification…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f3ef]">
        <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="text-3xl mb-2">🌿</div>
            <h1 className="text-xl font-bold text-[#6b2a1a]">Heldonica CMS</h1>
            <p className="text-gray-400 text-sm mt-1">Connexion requise</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mot de passe"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8B7A]"
              autoFocus
            />
            {authError && <p className="text-red-500 text-sm">{authError}</p>}
            <button
              type="submit"
              className="w-full py-3 bg-[#2D8B7A] text-white rounded-xl font-medium hover:bg-[#256b5e] transition-colors"
            >
              Se connecter
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(filteredArticles.length / pageSize);
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // ── Nav items grouped ──────────────────────────────────────────────────────
  const navGroups: {
    title: string;
    items: {
      id: NavSection;
      label: string;
      icon: React.ReactNode;
      badge?: string;
      badgeColor?: string;
    }[];
  }[] = [
    {
      title: 'Édition',
      items: [
        { id: 'dashboard',     label: 'Tableau de bord', icon: <Home size={15} /> },
        { id: 'destination-pillars', label: 'Destinations', icon: <MapPin size={15} /> },
        { id: 'guides',        label: 'Guides Pépites',   icon: <ListTree size={15} /> },
        { id: 'editable-zones', label: 'Zones de Texte',  icon: <Type size={15} /> },
        { id: 'articles',      label: 'Articles',         icon: <FileText size={15} />, badge: articles.length > 0 ? String(articles.length) : undefined },
        { id: 'new-article',   label: 'Nouvel article',   icon: <Plus size={15} /> },
        { id: 'testimonials',  label: 'Témoignages',      icon: <MessageSquare size={15} /> },
      ]
    },
    {
      title: 'Contenu & Médias',
      items: [
        { id: 'media',         label: 'Médias',            icon: <Image size={15} /> },
        { id: 'carousel',      label: 'Carousels',         icon: <Package size={15} /> },
        { id: 'video',         label: 'Vidéos',            icon: <Film size={15} /> },
        { id: 'fast-trim',     label: 'Fast Trim',         icon: <Clapperboard size={15} /> },
        { id: 'map',           label: 'Cartes',            icon: <MapIcon size={15} /> },
        { id: 'checklists',    label: 'Checklists',        icon: <ClipboardList size={15} /> },
      ]
    },
    {
      title: 'Marketing & Outils',
      items: [
        { id: 'blog-generator',label: 'Générateur blog',  icon: <Bot size={15} /> },
        { id: 'instagram',     label: 'Instagram',           icon: <Camera size={15} /> },
        { id: 'messages',      label: 'Messages',           icon: <Inbox size={15} />, badge: unreadCount > 0 ? String(unreadCount) : undefined, badgeColor: 'bg-red-500 text-white' },
      ]
    },
    {
      title: 'Configuration',
      items: [
        { id: 'design',        label: 'Design',             icon: <Palette size={15} /> },
        { id: 'geo',           label: 'GEO',                icon: <Zap size={15} /> },
        { id: 'settings',      label: 'Paramètres',        icon: <Settings size={15} /> },
      ]
    }
  ];

  // ── Layout ─────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="min-h-screen bg-cloud-dancer flex font-sans">
        {/* Sidebar */}
        <aside className="w-60 shrink-0 bg-stone-900 text-stone-300 flex flex-col py-6 px-4 min-h-screen shadow-xl">
          <div className="px-3 mb-6 flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            <div>
              <div className="text-base font-bold text-white tracking-wide">Heldonica</div>
              <div className="text-[10px] text-teal tracking-widest uppercase font-semibold">Workspace</div>
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto pr-1 space-y-5 scrollbar-thin scrollbar-thumb-stone-800">
            {navGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-1">
                <div className="px-3 text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                  {group.title}
                </div>
                <ul className="space-y-0.5">
                  {group.items.map(item => {
                    const isActive = activeSection === item.id;
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => setActiveSection(item.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                            isActive
                              ? 'bg-teal text-white shadow-md shadow-teal/10 font-semibold'
                              : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={isActive ? 'text-white' : 'text-stone-500 group-hover:text-stone-300'}>
                              {item.icon}
                            </span>
                            <span>{item.label}</span>
                          </div>
                          {item.badge && (
                            <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-full ${item.badgeColor || 'bg-stone-800 text-stone-300 border border-stone-700'}`}>
                              {item.badge}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
          <div className="px-3 mt-4 pt-4 border-t border-stone-800">
            <button
              onClick={async () => {
                await fetch('/api/cms/auth/logout', { method: 'POST' });
                setIsAuthenticated(false);
              }}
              className="w-full text-left text-xs text-stone-500 hover:text-stone-300 transition-colors flex items-center gap-2 py-2"
            >
              🚪 Déconnexion
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-auto">

          {/* ── Dashboard ── */}
          {activeSection === 'dashboard' && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Tableau de bord</h1>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-5 border border-gray-100">
                  <div className="text-2xl font-bold text-[#2D8B7A]">{articles.length}</div>
                  <div className="text-sm text-gray-500 mt-1">Total articles</div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-gray-100">
                  <div className="text-2xl font-bold text-[#C4714A]">
                    {articles.filter(a => a.status === 'published').length}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Publies</div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-gray-100">
                  <div className="text-2xl font-bold text-yellow-600">
                    {articles.filter(a => a.status === 'scheduled').length}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Planifies</div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-gray-100">
                  <div className="text-2xl font-bold text-gray-400">
                    {articles.filter(a => a.status === 'draft').length}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Brouillons</div>
                </div>
              </div>
              {articles.some(a => a.author) && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl p-5 border border-gray-100">
                    <div className="text-sm font-medium text-gray-700">Dernier article</div>
                    <div className="text-sm text-gray-400 mt-1">
                      {articles.filter(a => a.status === 'published').sort((a, b) =>
                        new Date(b.published_at ?? 0).getTime() - new Date(a.published_at ?? 0).getTime()
                      )[0]?.title ?? '—'}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-5 border border-gray-100">
                    <div className="text-sm font-medium text-gray-700">Auteurs</div>
                    <div className="text-sm text-gray-400 mt-1">
                      {[...new Set(articles.map(a => a.author).filter(Boolean))].join(', ') || '—'}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-5 border border-gray-100">
                    <div className="text-sm font-medium text-gray-700">Categories</div>
                    <div className="text-sm text-gray-400 mt-1">
                      {[...new Set(articles.map(a => a.category).filter(Boolean))].length || '0'}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-5 border border-gray-100">
                    <div className="text-sm font-medium text-gray-700">Tags uniques</div>
                    <div className="text-sm text-gray-400 mt-1">
                      {[...new Set(articles.flatMap(a => a.tags ?? []).filter(Boolean))].length}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Articles list ── */}
          {activeSection === 'articles' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Articles</h1>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const data = JSON.stringify(articles, null, 2);
                      const blob = new Blob([data], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url; a.download = `heldonica-articles-${new Date().toISOString().split('T')[0]}.json`;
                      a.click(); URL.revokeObjectURL(url);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50"
                    title="Exporter tout en JSON"
                  >
                    <Download size={14} /> Export
                  </button>
                  <button
                    onClick={() => { setEditingArticle(null); setActiveSection('new-article'); }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#2D8B7A] text-white rounded-lg text-sm font-medium hover:bg-[#256b5e]"
                  >
                    <Plus size={16} /> Nouvel article
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  placeholder="Rechercher un article…"
                  className="w-full max-w-sm px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8B7A]"
                />
                <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
                  {(['all', 'published', 'draft', 'scheduled'] as const).map(s => (
                    <button key={s} onClick={() => { setStatusFilter(s); setCurrentPage(1); setSelectedIds(new Set()); }}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                        statusFilter === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {s === 'all' ? 'Tous' : s === 'published' ? 'Publies' : s === 'draft' ? 'Brouillons' : 'Planifies'}
                      <span className="ml-1 text-gray-400">
                        ({s === 'all' ? articles.length : articles.filter(a => a.status === s).length})
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {selectedIds.size > 0 && (
                <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-[#2D8B7A]/5 border border-[#2D8B7A]/20 rounded-lg">
                  <span className="text-xs text-gray-600">{selectedIds.size} selectionne(s)</span>
                  <button onClick={async () => {
                    const toPublish = articles.filter(a => selectedIds.has(a.id) && a.status !== 'published');
                    try {
                      await Promise.all(toPublish.map(a =>
                        fetch(`/api/cms/articles/${a.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...a, status: 'published' }) })
                      ));
                      loadArticles(); setSelectedIds(new Set());
                      toast('Articles publiés', 'success');
                    } catch { toast('Erreur lors de la publication', 'error'); }
                  }} className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Publier
                  </button>
                  <button onClick={async () => {
                    const toDelete = articles.filter(a => selectedIds.has(a.id));
                    if (!window.confirm(`Supprimer ${toDelete.length} article(s) ?`)) return;
                    try {
                      await Promise.all(toDelete.map(a =>
                        fetch(`/api/cms/articles/${a.id}`, { method: 'DELETE' })
                      ));
                      loadArticles(); setSelectedIds(new Set());
                      toast('Articles supprimés', 'success');
                    } catch { toast('Erreur lors de la suppression', 'error'); }
                  }} className="px-3 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600">
                    Supprimer
                  </button>
                  <button onClick={() => setSelectedIds(new Set())} className="px-3 py-1 text-xs border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50">
                    Annuler
                  </button>
                </div>
              )}
              {loadingArticles ? (
                <SkeletonTable rows={5} />
              ) : (
                <>
                  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                        <tr>
                          <th className="px-4 py-3 w-8">
                            <input type="checkbox" onChange={e => {
                              if (e.target.checked) setSelectedIds(new Set(paginatedArticles.map(a => a.id)));
                              else setSelectedIds(new Set());
                            }} checked={paginatedArticles.length > 0 && selectedIds.size === paginatedArticles.length}
                              className="w-3.5 h-3.5 rounded border-gray-300" />
                          </th>
                          <th className="px-4 py-3 text-left">Titre</th>
                          <th className="px-4 py-3 text-left">Catégorie</th>
                          <th className="px-4 py-3 text-left">Statut</th>
                          <th className="px-4 py-3 text-left">Date</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {paginatedArticles.map(article => (
                          <tr key={article.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <input type="checkbox" checked={selectedIds.has(article.id)}
                                onChange={() => {
                                  const next = new Set(selectedIds);
                                  if (next.has(article.id)) next.delete(article.id); else next.add(article.id);
                                  setSelectedIds(next);
                                }}
                                className="w-3.5 h-3.5 rounded border-gray-300" />
                            </td>
                            <td className="px-4 py-3 font-medium text-gray-900">{article.title}</td>
                            <td className="px-4 py-3 text-gray-500">{article.category ?? '—'}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                article.status === 'published'
                                  ? 'bg-green-100 text-green-700'
                                  : article.status === 'draft'
                                  ? 'bg-gray-100 text-gray-600'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {article.status === 'scheduled' ? 'Planifié' : article.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-400 text-xs">
                              {article.updated_at ? new Date(article.updated_at).toLocaleDateString('fr-FR') : '—'}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setPreviewArticle(article)}
                                  className="text-gray-400 hover:text-gray-600 text-xs"
                                  title="Aperçu"
                                >
                                  <Eye size={14} />
                                </button>
                                <button
                                  onClick={() => openArticleEditor(article)}
                                  className="text-[#2D8B7A] hover:underline text-xs font-medium"
                                >
                                  Modifier
                                </button>
                                <button
                                  onClick={() => confirm(
                                    'Supprimer l\'article',
                                    `Supprimer « ${article.title} » ? Cette action est irréversible.`,
                                    () => handleDeleteArticle(article),
                                    'danger'
                                  )}
                                  className="text-red-400 hover:text-red-600 text-xs"
                                  title="Supprimer"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {paginatedArticles.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">
                              Aucun article trouvé
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                        <button
                          key={p}
                          onClick={() => setCurrentPage(p)}
                          className={`px-3 py-1 text-sm rounded-lg ${
                            p === currentPage
                              ? 'bg-[#2D8B7A] text-white'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── Article editor ── */}
          {activeSection === 'new-article' && (
            <ErrorBoundary>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {editingArticle?.id ? 'Modifier l\'article' : 'Nouvel article'}
                  </h1>
                  <div className="flex items-center gap-3">
                    {editingArticle && (
                      <button
                        onClick={() => setPreviewArticle(editingArticle)}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50"
                      >
                        <Eye size={16} /> Aperçu
                      </button>
                    )}
                    {editingArticle && (
                      <button
                        onClick={async () => {
                          const res = await fetch('/api/cms/carousel-caption', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              topic: editingArticle.title,
                              destination: editingArticle.category,
                              slides: [{ title: editingArticle.title, content: editingArticle.excerpt || '' }],
                              style: 'narratif',
                            }),
                          });
                          const data = await res.json();
                          if (data.caption) {
                            navigator.clipboard?.writeText(data.caption + '\n\n' + (data.hashtags || []).join(' '));
                            toast('Caption copiée !', 'success');
                          }
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50"
                        title="Générer caption Instagram"
                      >
                        <Camera size={14} /> Caption IG
                      </button>
                    )}
                    <button
                      onClick={handleSaveArticle}
                      disabled={saving}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#C4714A] text-white rounded-lg text-sm font-bold hover:bg-[#b05f3a] disabled:opacity-60 transition-colors shadow-sm"
                    >
                      <Save size={16} />
                      {saving ? 'Sauvegarde…' : 'Sauvegarder'}
                    </button>
                  </div>
                </div>

                {/* Save status bar */}
                <div className={`mb-4 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  saving ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  saveMsg ? (saveMsg.includes('✅') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                             'bg-red-50 text-red-700 border border-red-200') :
                  'bg-transparent'
                }`}>
                  {saving && '💾 Sauvegarde en cours…'}
                  {!saving && saveMsg && saveMsg}
                  {!saving && lastAutoSave && !saveMsg &&
                    <span className="text-gray-400 text-xs">Auto-sauvegarde {lastAutoSave}</span>}
                </div>

                {/* Local draft recovery banner */}
                {localDraft && (
                  <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-600">💡</span>
                      <span className="text-sm text-amber-800">
                        Brouillon local détecté : Un brouillon enregistré localement dans votre navigateur le {new Date(localDraft.timestamp).toLocaleString('fr-FR')} contient des modifications non enregistrées.
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingArticle(localDraft.article);
                          setLocalDraft(null);
                          toast('Brouillon restauré avec succès', 'success');
                        }}
                        className="px-3 py-1.5 text-xs font-medium bg-amber-200 text-amber-800 rounded-lg hover:bg-amber-300 transition-colors"
                      >
                        Restaurer le brouillon
                      </button>
                      <button
                        onClick={() => setLocalDraft(null)}
                        className="px-3 py-1.5 text-xs font-medium text-amber-700 hover:text-amber-900 transition-colors"
                      >
                        Ignorer
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">

                  {/* ── Content section ── */}
                  <CollapsibleSection title="📝 Contenu" defaultOpen={true}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                      <input
                        type="text"
                        value={editingArticle?.title ?? ''}
                        onChange={e => setEditingArticle(prev => prev ? { ...prev, title: e.target.value } : prev)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-base font-medium focus:outline-none focus:ring-2 focus:ring-[#2D8B7A]"
                        placeholder="Titre de l’article"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editingArticle?.slug ?? ''}
                          onChange={e => setEditingArticle(prev => prev ? { ...prev, slug: e.target.value } : prev)}
                          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8B7A] font-mono"
                          placeholder="mon-article-slug"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!editingArticle?.title) return;
                            const slug = editingArticle.title
                              .toLowerCase()
                              .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                              .replace(/[^a-z0-9\s-]/g, '')
                              .trim()
                              .replace(/\s+/g, '-')
                              .replace(/-+/g, '-');
                            setEditingArticle(prev => prev ? { ...prev, slug } : prev);
                          }}
                          className="px-3 py-2 text-xs border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 whitespace-nowrap"
                        >
                          ↺ Générer
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Extrait</label>
                      <textarea
                        rows={2}
                        value={editingArticle?.excerpt ?? ''}
                        onChange={e => setEditingArticle(prev => prev ? { ...prev, excerpt: e.target.value } : prev)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8B7A] resize-y"
                        placeholder="Résumé court de l’article"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contenu</label>
                      <Suspense fallback={<SkeletonForm />}>
                        <RichEditor
                          value={editingArticle?.content || ''}
                          onChange={(html: string) =>
                            setEditingArticle(prev => prev ? { ...prev, content: html } : prev)
                          }
                        />
                      </Suspense>
                    </div>
                  </CollapsibleSection>

                  {/* ── Media section ── */}
                  <CollapsibleSection title="🖼️ Média" defaultOpen={false}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image à la une (URL)</label>
                      <input
                        type="url"
                        value={editingArticle?.featured_image ?? ''}
                        onChange={e => setEditingArticle(prev => prev ? { ...prev, featured_image: e.target.value } : prev)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8B7A]"
                        placeholder="https://..."
                      />
                    </div>
                    {editingArticle?.content && (() => {
                      const imgs = editingArticle.content.match(/<img(?![^>]*\salt=)[^>]*>/g);
                      if (imgs && imgs.length > 0) {
                        return (
                          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-xs text-amber-700 font-medium">
                              ⚠️ {imgs.length} image(s) sans attribut alt dans le contenu
                            </p>
                            <p className="text-[10px] text-amber-600 mt-0.5">Ajoutez des textes alternatifs pour l’accessibilité et le SEO</p>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </CollapsibleSection>

                  {/* ── SEO section ── */}
                  <CollapsibleSection title="🔍 SEO & Métadonnées" defaultOpen={false}>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                        <input
                          type="text"
                          value={editingArticle?.category ?? ''}
                          onChange={e => setEditingArticle(prev => prev ? { ...prev, category: e.target.value } : prev)}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8B7A]"
                          placeholder="Slow Travel"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Auteur</label>
                        <input
                          type="text"
                          value={editingArticle?.author ?? ''}
                          onChange={e => setEditingArticle(prev => prev ? { ...prev, author: e.target.value } : prev)}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8B7A]"
                          placeholder="Heldonica"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                      <input
                        type="text"
                        value={editingArticle?.tags?.join(', ') ?? ''}
                        onChange={e => {
                          const tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                          setEditingArticle(prev => prev ? { ...prev, tags } : prev);
                        }}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8B7A]"
                        placeholder="slow-travel, portugal, madère (séparés par des virgules)"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SEO Title</label>
                        <input
                          type="text"
                          value={editingArticle?.seo_title ?? ''}
                          onChange={e => setEditingArticle(prev => prev ? { ...prev, seo_title: e.target.value } : prev)}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8B7A]"
                          placeholder="Titre optimisé SEO (30-60 car.)"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">{(editingArticle?.seo_title?.length ?? 0)} car.</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SEO Description</label>
                        <input
                          type="text"
                          value={editingArticle?.seo_description ?? ''}
                          onChange={e => setEditingArticle(prev => prev ? { ...prev, seo_description: e.target.value } : prev)}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8B7A]"
                          placeholder="Meta description (70-160 car.)"
                        />
                        <p className={`text-[10px] mt-1 ${(editingArticle?.seo_description?.length ?? 0) > 160 ? 'text-red-400' : 'text-gray-400'}`}>
                          {(editingArticle?.seo_description?.length ?? 0)} car. {editingArticle?.seo_description && editingArticle.seo_description.length < 70 ? '(min. 70)' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priorité Sitemap</label>
                        <select
                          value={String(editingArticle?.sitemap_priority ?? 0.9)}
                          onChange={e => setEditingArticle(prev => prev ? { ...prev, sitemap_priority: parseFloat(e.target.value) } : prev)}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8B7A]"
                        >
                          <option value="1.0">1.0 — Page principale</option>
                          <option value="0.9">0.9 — Prioritaire</option>
                          <option value="0.8">0.8 — Important</option>
                          <option value="0.7">0.7 — Standard</option>
                          <option value="0.6">0.6 — Secondaire</option>
                          <option value="0.5">0.5 — Archives</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fréquence Sitemap</label>
                        <select
                          value={editingArticle?.sitemap_changefreq ?? 'weekly'}
                          onChange={e => setEditingArticle(prev => prev ? { ...prev, sitemap_changefreq: e.target.value } : prev)}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8B7A]"
                        >
                          <option value="always">always</option>
                          <option value="hourly">hourly</option>
                          <option value="daily">daily</option>
                          <option value="weekly">weekly</option>
                          <option value="monthly">monthly</option>
                          <option value="yearly">yearly</option>
                          <option value="never">never</option>
                        </select>
                      </div>
                    </div>

                    {/* Google SERP Preview */}
                    <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
                      <p className="text-xs text-gray-500 mb-2">Aperçu Google</p>
                      <div className="font-sans">
                        <p className="text-blue-600 text-lg hover:underline cursor-pointer">
                          {editingArticle?.seo_title || editingArticle?.title || 'Titre de l\'article'}
                        </p>
                        <p className="text-green-700 text-sm">heldonica.fr/blog/{editingArticle?.slug || 'slug'}</p>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {editingArticle?.seo_description || editingArticle?.excerpt || 'Description...'}
                        </p>
                      </div>
                    </div>

                    {/* Social Card Preview */}
                    <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
                      <p className="text-xs text-gray-500 mb-2">Aperçu réseau social</p>
                      <div className="border border-gray-200 rounded-lg overflow-hidden max-w-[500px]">
                        {editingArticle?.featured_image && (
                          <img src={editingArticle.featured_image} className="w-full h-48 object-cover" alt="" />
                        )}
                        <div className="p-3 bg-gray-50">
                          <p className="text-[10px] text-gray-500 uppercase">heldonica.fr</p>
                          <p className="text-gray-900 font-semibold text-sm line-clamp-1">{editingArticle?.seo_title || editingArticle?.title}</p>
                          <p className="text-gray-500 text-xs line-clamp-2">{editingArticle?.seo_description || editingArticle?.excerpt}</p>
                        </div>
                      </div>
                    </div>
                  </CollapsibleSection>

                  {/* ── Publication section ── */}
                  <CollapsibleSection title="📅 Publication" defaultOpen={false}>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                        <select
                          value={editingArticle?.status ?? 'draft'}
                          onChange={e => setEditingArticle(prev => prev ? { ...prev, status: e.target.value as Article['status'] } : prev)}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8B7A]"
                        >
                          <option value="draft">Brouillon</option>
                          <option value="published">Publié</option>
                          <option value="scheduled">Planifié</option>
                        </select>
                      </div>
                      {editingArticle?.status === 'scheduled' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Date de publication</label>
                          <input
                            type="datetime-local"
                            value={editingArticle?.published_at ? editingArticle.published_at.slice(0, 16) : ''}
                            onChange={e => setEditingArticle(prev => prev ? { ...prev, published_at: new Date(e.target.value).toISOString() } : prev)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8B7A]"
                          />
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date de visite</label>
                        <input
                          type="date"
                          value={editingArticle?.visit_date ? editingArticle.visit_date.slice(0, 10) : ''}
                          onChange={e => setEditingArticle(prev => prev ? { ...prev, visit_date: e.target.value } : prev)}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8B7A]"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">Quand le voyage a eu lieu (renforce E-E-A-T)</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Visites</label>
                        <input
                          type="number" min={1}
                          value={editingArticle?.visit_count ?? ''}
                          onChange={e => setEditingArticle(prev => prev ? { ...prev, visit_count: e.target.value ? parseInt(e.target.value) : undefined } : prev)}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8B7A]"
                          placeholder="Ex: 2"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">Nombre de fois que vous avez visité ce lieu</p>
                      </div>
                    </div>
                  </CollapsibleSection>

                  {/* ── Revision History section ── */}
                  <CollapsibleSection title="⏳ Historique des versions" defaultOpen={false}>
                    {revisionsLoading ? (
                      <div className="text-sm text-gray-400 py-2">Chargement...</div>
                    ) : revisions.length === 0 ? (
                      <div className="text-sm text-gray-400 py-2">Aucune version sauvegardée</div>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {revisions.map((rev) => (
                          <div key={rev.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-700 truncate">
                                {new Date(rev.saved_at).toLocaleString('fr-FR')}
                              </p>
                              <p className="text-[10px] text-gray-400">
                                {rev.word_count} mots • "{rev.title?.substring(0, 40) || 'Sans titre'}..."
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                confirm(
                                  'Restaurer cette version ?',
                                  `Cette action remplacera le titre, l'extrait et le contenu actuels par la version du ${new Date(rev.saved_at).toLocaleString('fr-FR')}.`,
                                  () => {
                                    setEditingArticle(prev => prev ? {
                                      ...prev,
                                      title: rev.title || prev.title,
                                      excerpt: rev.excerpt || prev.excerpt,
                                      content: rev.content || prev.content,
                                    } : prev);
                                    toast('Version restaurée avec succès', 'success');
                                  },
                                  'default'
                                );
                              }}
                              className="ml-2 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                            >
                              Restaurer
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CollapsibleSection>

                  <EeaatScore
                    seoTitle={editingArticle?.seo_title}
                    seoDescription={editingArticle?.seo_description}
                    author={editingArticle?.author}
                    excerpt={editingArticle?.excerpt}
                    featuredImage={editingArticle?.featured_image}
                    tags={editingArticle?.tags}
                    publishedAt={editingArticle?.published_at}
                    content={editingArticle?.content}
                    category={editingArticle?.category}
                    visitDate={editingArticle?.visit_date}
                    visitCount={editingArticle?.visit_count}
                  />
                </div>
              </div>
            </ErrorBoundary>
          )}

          {/* ── Media ── */}
          {activeSection === 'media' && (
            <ErrorBoundary>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Médiathèque</h1>
                <MediaLibrary onSelect={() => {}} onClose={() => setActiveSection('dashboard')} />
              </div>
            </ErrorBoundary>
          )}

          {/* ── Design ── */}
          {activeSection === 'design' && (
            <ErrorBoundary>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Personnalisation du site</h1>
                <Suspense fallback={<div className="text-sm text-gray-400">Chargement...</div>}>
                  <DesignEditor />
                </Suspense>
              </div>
            </ErrorBoundary>
          )}

          {/* ── GEO ── */}
          {activeSection === 'geo' && (
            <ErrorBoundary>
              <Suspense fallback={<div className="text-sm text-gray-400 p-8">Chargement de l’audit GEO...</div>}>
                <GeoAuditPanel />
              </Suspense>
            </ErrorBoundary>
          )}

          {/* ── Instagram ── */}
          {activeSection === 'instagram' && (
            <ErrorBoundary>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Instagram</h1>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <Suspense fallback={<div className="text-sm text-gray-400">Chargement...</div>}>
                      <InstagramPublisher />
                    </Suspense>
                  </div>
                  <div className="space-y-4">
                    <InstagramStatsDashboard />
                    <Suspense fallback={<div className="text-sm text-gray-400">Chargement...</div>}>
                      <ScheduledPostsList />
                    </Suspense>
                  </div>
                </div>
              </div>
            </ErrorBoundary>
          )}

          {/* ── Messages ── */}
          {activeSection === 'messages' && <MessagesSection />}

          {/* ── Settings ── */}
          {activeSection === 'settings' && (
            <ErrorBoundary>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Paramètres du site</h1>
                <CmsSettingsPanel />
              </div>
            </ErrorBoundary>
          )}

          {/* ── Carousel ── */}
          {activeSection === 'carousel' && (
            <ErrorBoundary>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Carousels Instagram</h1>
                <Suspense fallback={<SkeletonForm />}>
                  <CarouselEditor />
                </Suspense>
              </div>
            </ErrorBoundary>
          )}

          {/* ── Blog Generator ── */}
          {activeSection === 'blog-generator' && (
            <ErrorBoundary>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Générateur de blog IA</h1>
                <Suspense fallback={<SkeletonForm />}>
                  <BlogGenerator />
                </Suspense>
              </div>
            </ErrorBoundary>
          )}

          {/* ── Video ── */}
          {activeSection === 'video' && (
            <ErrorBoundary>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Studio Vidéo</h1>
                <Suspense fallback={<SkeletonForm />}>
                  <VideoEditor />
                </Suspense>
              </div>
            </ErrorBoundary>
          )}

          {/* ── Fast Trim ── */}
          {activeSection === 'fast-trim' && (
            <ErrorBoundary>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Fast Trim</h1>
                <Suspense fallback={<SkeletonForm />}>
                  <FastTrimTool />
                </Suspense>
              </div>
            </ErrorBoundary>
          )}

          {/* ── Map ── */}
          {activeSection === 'map' && (
            <ErrorBoundary>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestion des cartes</h1>
                <Suspense fallback={<SkeletonForm />}>
                  <MapManagerSection />
                </Suspense>
              </div>
            </ErrorBoundary>
          )}

          {/* ── Destination Pillars ── */}
          {activeSection === 'destination-pillars' && (
            <ErrorBoundary>
              <Suspense fallback={<SkeletonForm />}>
                <DestinationPillarEditor />
              </Suspense>
            </ErrorBoundary>
          )}

          {/* ── Guides ── */}
          {activeSection === 'guides' && (
            <ErrorBoundary>
              <Suspense fallback={<SkeletonForm />}>
                <GuidesManager />
              </Suspense>
            </ErrorBoundary>
          )}

          {/* ── Editable Zones ── */}
          {activeSection === 'editable-zones' && (
            <ErrorBoundary>
              <Suspense fallback={<SkeletonForm />}>
                <EditableZonesManager />
              </Suspense>
            </ErrorBoundary>
          )}

          {/* ── Testimonials ── */}
          {activeSection === 'testimonials' && (
            <ErrorBoundary>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Témoignages</h1>
                <Suspense fallback={<SkeletonForm />}>
                  <TestimonialsManager />
                </Suspense>
              </div>
            </ErrorBoundary>
          )}

          {/* ── Checklists ── */}
          {activeSection === 'checklists' && (
            <ErrorBoundary>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Checklists</h1>
                <Suspense fallback={<SkeletonForm />}>
                  <ChecklistTemplatesManager />
                </Suspense>
              </div>
            </ErrorBoundary>
          )}

        </main>
      </div>

      {/* Confirm dialog */}
      <ConfirmDialog
        open={confirmOpen}
        title={confirmTitle}
        message={confirmMessage}
        variant={confirmVariant}
        onConfirm={() => { confirmAction(); setConfirmOpen(false); }}
        onCancel={() => setConfirmOpen(false)}
      />

      {/* Article preview */}
      <ArticlePreview
        open={!!previewArticle}
        title={previewArticle?.title ?? ''}
        excerpt={previewArticle?.excerpt}
        content={previewArticle?.content}
        category={previewArticle?.category}
        author={previewArticle?.author}
        featured_image={previewArticle?.featured_image}
        onClose={() => setPreviewArticle(null)}
      />
    </>
  );
}

export default function CmsAdminClient() {
  return (
    <ToastProvider>
      <CmsAdminClientInner />
    </ToastProvider>
  );
}
