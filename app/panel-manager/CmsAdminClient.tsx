'use client';

console.log('[CMS] Rendering CMS admin page');

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import EnhancedRichContent from '@/components/EnhancedRichContent';
import MediaLibrary from '@/components/MediaLibrary';
import EeaatScore from '@/components/EeaatScore';
import { sanitizeHtml } from '@/lib/sanitize-html';
import { Home, FileText, Plus, Sparkles, Folder, Plane, Image, Settings, BarChart3, Search, Save, Package, Car, Eye, EyeOff, Trash2, Send, Download, Upload, RefreshCw, Bot, Mail, Map as MapIcon, ChevronLeft, ChevronRight, Palette, Zap } from 'lucide-react';
import { Film, Clapperboard, Camera, Calendar } from 'lucide-react';
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
const InstagramPublisher = dynamic(() => import('@/components/admin/InstagramPublisher'), { ssr: false });
const InstagramStatsDashboard = dynamic(() => import('@/components/admin/InstagramStatsDashboard'), { ssr: false });
const ScheduledPostsList = dynamic(() => import('@/components/admin/ScheduledPostsList'), { ssr: false });

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
  | 'map' | 'auto-shorts' | 'design' | 'geo' | 'instagram';

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

  // Auto-save draft
  const [lastAutoSave, setLastAutoSave] = useState<string>('');
  useEffect(() => {
    if (!editingArticle) return;
    const timer = setInterval(() => {
      const key = `heldonica-draft-${editingArticle.slug || 'new'}`;
      localStorage.setItem(key, JSON.stringify(editingArticle));
      setLastAutoSave(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 30000);
    return () => clearInterval(timer);
  }, [editingArticle]);

  // ── Auth ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/cms/auth/check')
      .then(r => r.json())
      .then(d => setIsAuthenticated(!!d.authenticated))
      .catch(() => setIsAuthenticated(false))
      .finally(() => setAuthLoading(false));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
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

  useEffect(() => {
    if (isAuthenticated && activeSection === 'articles') loadArticles();
  }, [isAuthenticated, activeSection, loadArticles]);

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
    setSaveMsg('');
    try {
      const method = editingArticle.id ? 'PATCH' : 'POST';
      const url = editingArticle.id
        ? `/api/cms/articles/${editingArticle.id}`
        : '/api/cms/articles';
      const body = { ...editingArticle };
      if (editingArticle.status === 'scheduled' && !editingArticle.published_at) {
        body.published_at = new Date().toISOString();
      }
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Save failed');
      toast('Article sauvegardé', 'success');
      loadArticles();
    } catch {
      toast('Erreur lors de la sauvegarde', 'error');
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
          <div className="text-4xl mb-3">⏳</div>
          <p className="text-gray-500 text-sm">Vérification de l'authentification…</p>
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

  // ── Nav items ─────────────────────────────────────────────────────────────
  const navItems: { id: NavSection; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard',     label: 'Tableau de bord', icon: <Home size={16} /> },
    { id: 'articles',      label: 'Articles',         icon: <FileText size={16} /> },
    { id: 'new-article',   label: 'Nouvel article',   icon: <Plus size={16} /> },
    { id: 'media',         label: 'Médias',            icon: <Image size={16} /> },
    { id: 'carousel',      label: 'Carousels',         icon: <Package size={16} /> },
    { id: 'blog-generator',label: 'Générateur blog',  icon: <Bot size={16} /> },
    { id: 'video',         label: 'Vidéos',            icon: <Film size={16} /> },
    { id: 'fast-trim',     label: 'Fast Trim',         icon: <Clapperboard size={16} /> },
    { id: 'map',           label: 'Cartes',            icon: <MapIcon size={16} /> },
    { id: 'design',        label: 'Design',             icon: <Palette size={16} /> },
    { id: 'geo',           label: 'GEO',                icon: <Zap size={16} /> },
    { id: 'geo',           label: 'GEO',                icon: <Zap size={16} /> },
    { id: 'instagram',     label: 'Instagram',           icon: <Camera size={16} /> },
    { id: 'settings',      label: 'Paramètres',        icon: <Settings size={16} /> },
  ];

  // ── Layout ─────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="min-h-screen bg-[#f5f3ef] flex">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 bg-white border-r border-gray-100 flex flex-col py-6 px-3 min-h-screen">
          <div className="px-3 mb-6">
            <div className="text-lg font-bold text-[#6b2a1a]">🌿 Heldonica</div>
            <div className="text-xs text-gray-400">CMS</div>
          </div>
          <nav className="flex-1">
            <ul className="space-y-0.5">
              {navItems.map(item => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeSection === item.id
                        ? 'bg-[#2D8B7A] text-white'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <div className="px-3 mt-4">
            <button
              onClick={async () => {
                await fetch('/api/cms/auth/logout', { method: 'POST' });
                setIsAuthenticated(false);
              }}
              className="w-full text-xs text-gray-400 hover:text-gray-600 py-2"
            >
              Déconnexion
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
                  <button onClick={() => {
                    const toPublish = articles.filter(a => selectedIds.has(a.id) && a.status !== 'published');
                    Promise.all(toPublish.map(a =>
                      fetch(`/api/cms/articles/${a.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...a, status: 'published' }) })
                    )).then(() => { loadArticles(); setSelectedIds(new Set()); });
                  }} className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Publier
                  </button>
                  <button onClick={() => {
                    const toDelete = articles.filter(a => selectedIds.has(a.id));
                    if (window.confirm(`Supprimer ${toDelete.length} article(s) ?`)) {
                      Promise.all(toDelete.map(a =>
                        fetch(`/api/cms/articles/${a.id}`, { method: 'DELETE' })
                      )).then(() => { loadArticles(); setSelectedIds(new Set()); });
                    }
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
                <div className="flex items-center justify-between mb-6">
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
                    {lastAutoSave && <span className="text-[10px] text-gray-400">Auto-sauvegarde {lastAutoSave}</span>}
                    {saveMsg && <span className="text-sm text-green-600">{saveMsg}</span>}
                    <button
                      onClick={handleSaveArticle}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-[#C4714A] text-white rounded-lg text-sm font-medium hover:bg-[#b05f3a] disabled:opacity-50"
                    >
                      <Save size={16} />
                      {saving ? 'Sauvegarde…' : 'Sauvegarder'}
                    </button>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                    <input
                      type="text"
                      value={editingArticle?.title ?? ''}
                      onChange={e => setEditingArticle(prev => prev ? { ...prev, title: e.target.value } : prev)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8B7A]"
                      placeholder="Titre de l'article"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                    <input
                      type="text"
                      value={editingArticle?.slug ?? ''}
                      onChange={e => setEditingArticle(prev => prev ? { ...prev, slug: e.target.value } : prev)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8B7A] font-mono"
                      placeholder="mon-article-slug"
                    />
                  </div>
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
                  </div>
                  {editingArticle?.status === 'scheduled' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date de publication</label>
                      <input
                        type="datetime-local"
                        value={editingArticle?.published_at ? editingArticle.published_at.slice(0, 16) : ''}
                        onChange={e => setEditingArticle(prev => prev ? { ...prev, published_at: new Date(e.target.value).toISOString() } : prev)}
                        className="w-full max-w-xs px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8B7A]"
                      />
                    </div>
                  )}
                  <div className="border-t pt-4 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">SEO Title</label>
                      <input
                        type="text"
                        value={editingArticle?.seo_title ?? ''}
                        onChange={e => setEditingArticle(prev => prev ? { ...prev, seo_title: e.target.value } : prev)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8B7A]"
                        placeholder="Titre optimise SEO (30-60 car.)"
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
                  <div className="border-t pt-4 grid grid-cols-2 gap-4">
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
                      <p className="text-[10px] text-gray-400 mt-1">Nombre de fois que vous avez visite ce lieu</p>
                    </div>
                  </div>
                  <div className="border-t pt-4 grid grid-cols-2 gap-4">
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Extrait</label>
                    <textarea
                      rows={2}
                      value={editingArticle?.excerpt ?? ''}
                      onChange={e => setEditingArticle(prev => prev ? { ...prev, excerpt: e.target.value } : prev)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8B7A] resize-y"
                      placeholder="Résumé court de l'article"
                    />
                  </div>
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
                    const imgWithoutAlt = editingArticle.content.match(/<img(?![^>]*\salt=)[^>]*>/g);
                    if (imgWithoutAlt && imgWithoutAlt.length > 0) {
                      return (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <p className="text-xs text-amber-700 font-medium">
                            ⚠️ {imgWithoutAlt.length} image(s) sans attribut alt dans le contenu
                          </p>
                          <p className="text-[10px] text-amber-600 mt-0.5">Ajoutez des textes alternatifs pour l'accessibilité et le SEO</p>
                        </div>
                      );
                    }
                    return null;
                  })()}
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
              <Suspense fallback={<div className="text-sm text-gray-400 p-8">Chargement de l'audit GEO...</div>}>
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
