'use client';

console.log('[CMS] Rendering CMS admin page');

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import EnhancedRichContent from '@/components/EnhancedRichContent';
import MediaLibrary from '@/components/MediaLibrary';
import { sanitizeHtml } from '@/lib/sanitize-html';
import { getFallbackImageUrl } from '@/lib/unsplash';
import { Home, FileText, Plus, Sparkles, Folder, Plane, Image, Settings, BarChart3, Search, Save, Package, Car, Eye, EyeOff, Trash2, Send, Download, Upload, RefreshCw, Bot, CheckSquare, Square } from 'lucide-react';

const RichEditor = dynamic(() => import('@/components/RichEditor'), { ssr: false });
const CarouselEditor = dynamic(() => import('@/components/admin/CarouselEditor'), { ssr: false });
const CarouselGenerator = dynamic(() => import('@/components/admin/CarouselGenerator'), { ssr: false });
const BlogGenerator = dynamic(() => import('@/components/admin/BlogGenerator'), { ssr: false });

// ===== Types =====
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
      { key: 'hero_type', label: 'Hero — Type (video/image)', type: 'text' },
      { key: 'hero_video_url', label: 'Hero — Vidéo (URL mp4)', type: 'media' },
      { key: 'hero_poster_image', label: 'Hero — Image poster (URL)', type: 'media' },
      { key: 'hero_background_image', label: 'Hero — Image de fond (URL)', type: 'media' },
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
      { key: 'hero_type', label: 'Hero — Type (video/image)', type: 'text' },
      { key: 'hero_video_url', label: 'Hero — Vidéo (URL mp4)', type: 'media' },
      { key: 'hero_poster_image', label: 'Hero — Image poster (URL)', type: 'media' },
      { key: 'hero_background_image', label: 'Hero — Image de fond (URL)', type: 'media' },
      { key: 'page_title',  label: 'Titre de la page',      type: 'text' },
      { key: 'intro_text',  label: "Texte d’introduction",  type: 'textarea' },
      { key: 'contact_email', label: 'Email de contact', type: 'text' },
      { key: 'contact_phone', label: 'Téléphone', type: 'text' },
    ],
  },
  'hotel-consulting': {
    label: 'Hotel Consulting',
    emoji: '🏨',
    sections: [
      { key: 'hero_type', label: 'Hero — Type (video/image)', type: 'text' },
      { key: 'hero_video_url', label: 'Hero — Vidéo (URL mp4)', type: 'media' },
      { key: 'hero_poster_image', label: 'Hero — Image poster (URL)', type: 'media' },
      { key: 'hero_background_image', label: 'Hero — Image de fond (URL)', type: 'media' },
      { key: 'page_title',  label: 'Titre de la page',      type: 'text' },
      { key: 'intro_text',  label: "Texte d’introduction",  type: 'textarea' },
      { key: 'hero_cta', label: 'Hero — Bouton CTA', type: 'text' },
      { key: 'hero_cta_link', label: 'Hero — Lien du bouton', type: 'text' },
      { key: 'section_approach_title', label: 'Section Approche — Titre', type: 'text' },
      { key: 'section_approach_text', label: 'Section Approche — Texte', type: 'textarea' },
      { key: 'section_services_title', label: 'Section Services — Titre', type: 'text' },
      { key: 'section_services_list', label: 'Services (liste séparée par |)', type: 'textarea' },
    ],
  },
  'mentions-legales': {
    label: 'Mentions légales',
    emoji: '⚖️',
    sections: [
      { key: 'page_title', label: 'Titre de la page', type: 'text' },
      { key: 'content', label: 'Contenu (HTML)', type: 'textarea' },
    ],
  },
  'politique-confidentialite': {
    label: 'Politique de confidentialité',
    emoji: '🔒',
    sections: [
      { key: 'page_title', label: 'Titre de la page', type: 'text' },
      { key: 'content', label: 'Contenu (HTML)', type: 'textarea' },
    ],
  },
  'slow-travel': {
    label: 'Slow Travel',
    emoji: '🐌',
    sections: [
      { key: 'hero_type', label: 'Hero — Type (video/image)', type: 'text' },
      { key: 'hero_video_url', label: 'Hero — Vidéo (URL mp4)', type: 'media' },
      { key: 'hero_poster_image', label: 'Hero — Image poster (URL)', type: 'media' },
      { key: 'hero_background_image', label: 'Hero — Image de fond (URL)', type: 'media' },
      { key: 'page_title', label: 'Titre de la page', type: 'text' },
      { key: 'intro_text', label: 'Texte introduction', type: 'textarea' },
      { key: 'definition_title', label: 'Titre Définition', type: 'text' },
      { key: 'definition_text', label: 'Texte Définition', type: 'textarea' },
      { key: 'principles_title', label: 'Titre Principes', type: 'text' },
      { key: 'principles_list', label: 'Principes (séparés par |)', type: 'textarea' },
    ],
  },
  'destinations': {
    label: 'Destinations',
    emoji: '🗺️',
    sections: [
      { key: 'hero_type', label: 'Hero — Type (video/image)', type: 'text' },
      { key: 'hero_video_url', label: 'Hero — Vidéo (URL mp4)', type: 'media' },
      { key: 'hero_poster_image', label: 'Hero — Image poster (URL)', type: 'media' },
      { key: 'hero_background_image', label: 'Hero — Image de fond (URL)', type: 'media' },
      { key: 'page_title', label: 'Titre de la page', type: 'text' },
      { key: 'intro_text', label: 'Texte introduction', type: 'textarea' },
    ],
  },
  'temoignages': {
    label: 'Témoignages',
    emoji: '💬',
    sections: [
      { key: 'hero_type', label: 'Hero — Type (video/image)', type: 'text' },
      { key: 'hero_video_url', label: 'Hero — Vidéo (URL mp4)', type: 'media' },
      { key: 'hero_poster_image', label: 'Hero — Image poster (URL)', type: 'media' },
      { key: 'hero_background_image', label: 'Hero — Image de fond (URL)', type: 'media' },
      { key: 'page_title', label: 'Titre de la page', type: 'text' },
      { key: 'intro_text', label: 'Texte introduction', type: 'textarea' },
    ],
  },
  'etudes-de-cas': {
    label: 'Études de cas',
    emoji: '📁',
    sections: [
      { key: 'hero_type', label: 'Hero — Type (video/image)', type: 'text' },
      { key: 'hero_video_url', label: 'Hero — Vidéo (URL mp4)', type: 'media' },
      { key: 'hero_poster_image', label: 'Hero — Image poster (URL)', type: 'media' },
      { key: 'hero_background_image', label: 'Hero — Image de fond (URL)', type: 'media' },
      { key: 'page_title', label: 'Titre de la page', type: 'text' },
      { key: 'intro_text', label: 'Texte introduction', type: 'textarea' },
    ],
  },
  'ai-hotellerie': {
    label: 'IA & Hôtellerie',
    emoji: '🤖',
    sections: [
      { key: 'hero_type', label: 'Hero — Type (video/image)', type: 'text' },
      { key: 'hero_video_url', label: 'Hero — Vidéo (URL mp4)', type: 'media' },
      { key: 'hero_poster_image', label: 'Hero — Image poster (URL)', type: 'media' },
      { key: 'hero_background_image', label: 'Hero — Image de fond (URL)', type: 'media' },
      { key: 'page_title', label: 'Titre de la page', type: 'text' },
      { key: 'intro_text', label: 'Texte introduction', type: 'textarea' },
    ],
  },
};

const SETTINGS_GROUPS: Record<string, { label: string; emoji: string }> = {
  general:    { label: 'Général',         emoji: '🌐' },
  appearance:{ label: 'Apparence',      emoji: '🎨' },
  social:    { label: 'Réseaux sociaux', emoji: '📱' },
  seo:       { label: 'SEO',            emoji: '🔍' },
  footer:   { label: 'Footer',          emoji: '📄' },
};

// Paramètres d’apparence (couleurs, logo, favicon)
const APPEARANCE_SETTINGS = [
  { key: 'site_logo',        label: 'Logo du site (PNG/SVG)',      type: 'media' },
  { key: 'site_favicon',    label: 'Favicon (32x32, PNG/ICO)',   type: 'media' },
  // Couleurs du site
  { key: 'color_primary',   label: 'Couleur primaire',         type: 'color' },
  { key: 'color_secondary', label: 'Couleur secondaire',       type: 'color' },
  { key: 'color_accent',    label: 'Couleur d\'accent',         type: 'color' },
  { key: 'color_background',label: 'Couleur de fond',          type: 'color' },
  { key: 'color_text',      label: 'Couleur du texte',           type: 'color' },
  // Couleurs des héros
  { key: 'hero_overlay_color', label: 'Hero — Couleur de overlay', type: 'color' },
  { key: 'hero_overlay_opacity', label: 'Hero — Opacité overlay (0-100)', type: 'text' },
  // Couleurs des boutons
  { key: 'button_primary_bg', label: 'Bouton principal — Fond', type: 'color' },
  { key: 'button_primary_text', label: 'Bouton principal — Texte', type: 'color' },
  { key: 'button_secondary_bg', label: 'Bouton secondaire — Fond', type: 'color' },
  { key: 'button_secondary_text', label: 'Bouton secondaire — Texte', type: 'color' },
  // Typographie
  { key: 'font_heading',    label: 'Police des titres (Google Fonts)',           type: 'text' },
  { key: 'font_body',      label: 'Police du texte (Google Fonts)',             type: 'text' },
  { key: 'font_size_base', label: 'Taille de base (ex: 16px)', type: 'text' },
  // Layout
  { key: 'container_max_width', label: 'Largeur max container (ex: 1280px)', type: 'text' },
  { key: 'header_sticky', label: 'Header fixe (true/false)', type: 'text' },
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
  // Note: categoryFilter is already defined at line ~511
  const [selectedArticles, setSelectedArticles] = useState<Set<number>>(new Set());
  const [editingArticle, setEditingArticle] = useState<Partial<Article> | null>(null);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [savingArticle, setSavingArticle] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [scheduleMode, setScheduleMode] = useState(false);

  // Toggle article selection for bulk actions
  const toggleArticleSelection = (id: number) => {
    setSelectedArticles(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Select/deselect all articles
  const toggleSelectAll = () => {
    if (selectedArticles.size === articles.length) {
      setSelectedArticles(new Set());
    } else {
      setSelectedArticles(new Set(articles.map(a => a.id)));
    }
  };

  // Bulk publish selected articles
  const bulkPublish = async () => {
    if (selectedArticles.size === 0) return;
    if (!confirm(`Publier ${selectedArticles.size} article(s)?`)) return;
    setLoadingArticles(true);
    try {
      await Promise.all([...selectedArticles].map(id =>
        fetch(`/api/cms/articles/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ published: true, published_at: new Date().toISOString() }),
        })
      ));
      showToast(`✓ ${selectedArticles.size} article(s) publié(s)`);
      setSelectedArticles(new Set());
      loadArticles();
    } catch {
      showToast('Erreur lors de la publication');
    } finally {
      setLoadingArticles(false);
    }
  };

  // Bulk unpublish selected articles
  const bulkUnpublish = async () => {
    if (selectedArticles.size === 0) return;
    if (!confirm(`Dépublier ${selectedArticles.size} article(s)?`)) return;
    setLoadingArticles(true);
    try {
      await Promise.all([...selectedArticles].map(id =>
        fetch(`/api/cms/articles/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ published: false }),
        })
      ));
      showToast(`${selectedArticles.size} article(s) dépublié(s)`);
      setSelectedArticles(new Set());
      loadArticles();
    } catch {
      showToast('Erreur lors de la dépublication');
    } finally {
      setLoadingArticles(false);
    }
  };

  // Bulk delete selected articles
  const bulkDelete = async () => {
    if (selectedArticles.size === 0) return;
    if (!confirm(`Supprimer ${selectedArticles.size} article(s)? Cette action est irréversible!`)) return;
    setLoadingArticles(true);
    try {
      await Promise.all([...selectedArticles].map(id =>
        fetch(`/api/cms/articles/${id}`, { method: 'DELETE' })
      ));
      showToast(`🗑 ${selectedArticles.size} article(s) supprimé(s)`);
      setSelectedArticles(new Set());
      loadArticles();
    } catch {
      showToast('Erreur lors de la suppression');
    } finally {
      setLoadingArticles(false);
    }
  };

  // Agents panel
  const [agentTask, setAgentTask] = useState('');
  const [agentRepo, setAgentRepo] = useState('farinhahelder-hue/heldonica');
  const [agentBranch, setAgentBranch] = useState('main');
  const [selectedAgent, setSelectedAgent] = useState('allhands');
  const [sendingTask, setSendingTask] = useState(false);
  const [agentMessage, setAgentMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [taskHistory, setTaskHistory] = useState<{date: string; agent: string; task: string; repo: string; branch: string}[]>([]);

  // Load task history from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('agent-task-history');
      if (saved) {
        try {
          setTaskHistory(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse task history:', e);
        }
      }
    }
  }, []);

  // Send task to agent (n8n or Jules API)
  const sendAgentTask = async () => {
    if (!agentTask.trim()) {
      setAgentMessage({ type: 'error', text: 'Veuillez décrivez une tâche à effectuer.' });
      return;
    }

    setSendingTask(true);
    setAgentMessage(null);

    try {
      let res: Response;
      
      if (selectedAgent === 'jules') {
        // Use Jules API directly
        res = await fetch('/api/jules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: agentTask,
            title: agentTask.slice(0, 50),
            source: `sources/github/${agentRepo}`,
          }),
        });
      } else {
        // Use n8n webhook for other agents
        const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
        if (!webhookUrl) {
          setAgentMessage({ type: 'error', text: 'URL du webhook n8n non configurée.' });
          setSendingTask(false);
          return;
        }
        
        res = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agent: selectedAgent,
            task: agentTask,
            repo: agentRepo,
            branch: agentBranch,
          }),
        });
      }

      if (res.ok) {
        const agentLabels: Record<string, string> = {
          allhands: 'OpenHands (AllHands)',
          jules: 'Jules (Google)',
          gemini: 'Gemini (Google)',
          perplexity: 'Perplexity',
        };
        const label = agentLabels[selectedAgent] || selectedAgent;
        
        // Get Jules URL if available
        let responseData: any = {};
        try { responseData = await res.json(); } catch {}
        
        const successMsg = selectedAgent === 'jules' && responseData.url 
          ? `Tâche envoyée à ${label}! Voir: ${responseData.url}`
          : `Tâche envoyée à ${label} avec succès!`;
          
        setAgentMessage({ type: 'success', text: successMsg });

        // Add to history
        const newEntry = {
          date: new Date().toLocaleString('fr-FR'),
          agent: selectedAgent,
          task: agentTask,
          repo: agentRepo,
          branch: agentBranch,
        };
        const updatedHistory = [newEntry, ...taskHistory].slice(0, 10);
        setTaskHistory(updatedHistory);
        localStorage.setItem('agent-task-history', JSON.stringify(updatedHistory));

        // Clear task field
        setAgentTask('');
      } else {
        setAgentMessage({ type: 'error', text: `Erreur lors de l'envoi de la tâche (${res.status})` });
      }
    } catch (err) {
      console.error('Failed to send task:', err);
      setAgentMessage({ type: 'error', text: 'Erreur réseau. Le webhook est-il accessible?' });
    } finally {
      setSendingTask(false);
    }
  };

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
  const [savingPageKey, setSavingPageKey] = useState('');
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
    let payload = {
      ...editingArticle,
      slug: editingArticle.slug || slug(editingArticle.title || ''),
      published_at: editingArticle.published && !editingArticle.published_at
        ? new Date().toISOString() : editingArticle.published_at,
      ...(scheduleMode && editingArticle?.scheduled_published_at ?
        { scheduled_published_at: new Date(editingArticle.scheduled_published_at).toISOString() } : {}),
    };
    // Auto-fix empty featured image with category-based fallback
    if (!payload.featured_image) {
      payload.featured_image = getFallbackImageUrl(payload.category, payload.title);
    }
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

  // Auto-save draft every 30 seconds
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (tab !== 'new' || !editingArticle?.title?.trim() || savingArticle) {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
        autoSaveTimer.current = null;
      }
      return;
    }
    autoSaveTimer.current = setTimeout(async () => {
      if (editingArticle?.title?.trim() && !savingArticle) {
        console.log('[CMS] Auto-saving draft...');
        showToast('💾 Brouillon auto-sauvegardé');
        await saveArticle();
      }
    }, 30000);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, editingArticle?.title, savingArticle, saveArticle]);

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
  const duplicateArticle = async (article: Article) => {
    try {
      const res = await fetch('/api/cms/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...article,
          id: undefined,
          title: `${article.title} (copie)`,
          slug: `${article.slug}-copy-${Date.now()}`,
          published: false,
          published_at: null,
          created_at: undefined,
          updated_at: undefined,
        }),
      });
      if (handleUnauthorized(res)) return;
      if (res.ok) { showToast('📋 Article dupliqué'); loadArticles(); }
    } catch {
      showToast('Impossible de dupliquer cet article.');
    }
  };

  // Export articles to CSV
  const exportToCsv = () => {
    const headers = ['id', 'title', 'slug', 'category', 'excerpt', 'content', 'published', 'published_at', 'created_at'];
    const rows = articles.map(a => [
      a.id,
      a.title,
      a.slug,
      a.category || '',
      a.excerpt || '',
      a.content?.replace(/<[^>]*>/g, '') || '',
      a.published ? 'yes' : 'no',
      a.published_at || '',
      a.created_at || '',
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `articles-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('📥 Export CSV réussi');
  };

  // Import articles from CSV (concurrent ~20x perf improvement)
  const importFromCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) { showToast('Fichier CSV invalide'); return; }
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    
    // Parse all rows first
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(v => v.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
      const articleData: Record<string, string> = {};
      headers.forEach((h, idx) => { articleData[h] = values[idx] || ''; });
      rows.push(articleData);
    }
    
    // Concurrent import with batching to avoid overwhelming the server
    const BATCH_SIZE = 10;
    let imported = 0;
    for (let batchStart = 0; batchStart < rows.length; batchStart += BATCH_SIZE) {
      const batch = rows.slice(batchStart, batchStart + BATCH_SIZE);
      const results = await Promise.allSettled(
        batch.map(articleData =>
          fetch('/api/cms/articles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: articleData.title || 'sans-titre',
              slug: articleData.slug || slug(articleData.title || 'sans-titre'),
              category: articleData.category || '',
              excerpt: articleData.excerpt || '',
              content: articleData.content || '',
              published: articleData.published === 'yes',
            }),
          })
        )
      );
      imported += results.filter(r => r.status === 'fulfilled').length;
    }
    
    showToast(`📤 ${imported} article(s) importé(s)`);
    loadArticles();
    e.target.value = '';
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
    { id: 'pages',    icon: <Folder size={16} />, label: 'Pages', count: null },
    { id: 'demandes',icon: <Plane size={16} />, label: 'Travel Planning', count: demandes.length },
    // eslint-disable-next-line jsx-a11y/alt-text -- Image is a lucide-react icon, not an <img> element
    { id: 'media',   icon: <Image size={16} aria-hidden="true" />, label: 'Médiatèque', count: null },
    { id: 'carousel',icon: <Car size={16} />,  label: 'Carrousel', count: null },
    { id: 'settings',icon: <Settings size={16} />,label: 'Paramètres', count: null },
    { id: 'analytics',icon: <BarChart3 size={16} />,label: 'Analytics', count: null },
    { id: 'search',  icon: <Search size={16} />, label: 'Search', count: null },
    { id: 'agents',  icon: <Bot size={16} />,   label: 'Agents', count: null },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f5f3ef', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
      <style>{`
        .cms-grid-kpi { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
        .cms-layout-sidebar { display: grid; grid-template-columns: 220px 1fr; gap: 1.5rem; align-items: start; }
        .cms-mobile-tabs { display: flex; }
        .cms-mobile-sidebar-panel { position: fixed; top: 0; left: 0; bottom: 0; width: 280px; background: white; z-index: 50; padding: 2rem 1rem; box-shadow: 2px 0 12px rgba(0,0,0,0.15); display: flex; flex-direction: column; gap: 0.5rem; transform: translateX(-100%); transition: transform 0.3s ease; overflow-y: auto; }
        .cms-mobile-sidebar-panel.open { transform: translateX(0); }
        .cms-top-actions { display: flex; gap: 1rem; flex-wrap: wrap; }

        @media (max-width: 767px) {
          .cms-layout-sidebar { grid-template-columns: 1fr; }
          .cms-mobile-tabs { display: none !important; }
        }

        @media (min-width: 768px) {
          [data-mobile-only="true"] { display: none !important; }
          .cms-mobile-sidebar-panel { display: none !important; }
        }
      `}</style>
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }}
          data-mobile-only="true"
        />
      )}
      <div className={`cms-mobile-sidebar-panel ${sidebarOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', padding: '0 0.5rem' }}>
          <span style={{ fontWeight: 700, fontSize: '1.2rem', color: '#6b2a1a' }}>🌍 Menu CMS</span>
          <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b2a1a' }}>✕</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {TABS.map(t => (
            <button key={t.id}
              onClick={() => { handleTabChange(t.id); setSidebarOpen(false); }}
              style={{
                padding: '1rem', border: 'none', background: tab === t.id ? '#f0e8e4' : 'transparent', cursor: 'pointer',
                fontWeight: tab === t.id ? 700 : 500,
                color: tab === t.id ? '#6b2a1a' : '#444',
                borderRadius: '0.5rem',
                fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', textAlign: 'left'
              }}
            >
              {t.icon} {t.label}
              {t.count !== null && t.count > 0 && (
                <span style={{ background: '#6b2a1a', color: 'white', borderRadius: '9999px', padding: '.1rem .55rem', fontSize: '.75rem', fontWeight: 700, marginLeft: 'auto' }}>{t.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: '#6b2a1a', color: 'white', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 45, boxShadow: '0 2px 12px rgba(0,0,0,.15)' }}>
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

      <div className="cms-mobile-tabs" style={{ background: 'white', borderBottom: '1.5px solid #e8e3dc', padding: '0 2rem', display: 'flex', gap: '.25rem', overflowX: 'auto' }}>
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
            {/* 4 Widget Dashboard */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              {/* Widget 1: Brouillons */}
              <div 
                onClick={() => { setStatusFilter('draft'); setTab('articles'); }}
                style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,.06)', cursor: 'pointer', transition: 'transform .15s' }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '2rem' }}>📝</span>
                  <span style={{ background: '#ffc107', color: '#333', padding: '.25rem .5rem', borderRadius: '.25rem', fontSize: '.75rem', fontWeight: 600 }}>
                    {articles.filter(a => !a.published).length}
                  </span>
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#333', marginBottom: '.25rem' }}>Brouillons</h3>
                <p style={{ fontSize: '.8rem', color: '#888' }}>Articles non publiés</p>
              </div>
              
              {/* Widget 2: Demandes Travel */}
              <div 
                onClick={() => setTab('demandes')}
                style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,.06)', cursor: 'pointer', transition: 'transform .15s' }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '2rem' }}>✈️</span>
                  <span style={{ background: '#01696f', color: 'white', padding: '.25rem .5rem', borderRadius: '.25rem', fontSize: '.75rem', fontWeight: 600 }}>
                    {demandes.length}
                  </span>
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#333', marginBottom: '.25rem' }}>Demandes Travel</h3>
                <p style={{ fontSize: '.8rem', color: '#888' }}>Demandes en attente</p>
              </div>
              
              {/* Widget 3: Planifiés */}
              <div 
                onClick={() => { setCategoryFilter('all'); setTab('articles'); }}
                style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,.06)', cursor: 'pointer', transition: 'transform .15s' }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '2rem' }}>📅</span>
                  <span style={{ background: '#9333ea', color: 'white', padding: '.25rem .5rem', borderRadius: '.25rem', fontSize: '.75rem', fontWeight: 600 }}>
                    {articles.filter(a => a.scheduled_published_at && !a.published).length}
                  </span>
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#333', marginBottom: '.25rem' }}>Planifiés</h3>
                <p style={{ fontSize: '.8rem', color: '#888' }}>Articles programmés</p>
              </div>
              
              {/* Widget 4: KPIs */}
              <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#333', marginBottom: '1rem' }}>📊 KPIs</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
                  <div style={{ textAlign: 'center', padding: '.5rem', background: '#f8f6f4', borderRadius: '.5rem' }}>
                    <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#28a745' }}>{articles.filter(a => a.published).length}</p>
                    <p style={{ fontSize: '.65rem', color: '#888' }}>Publiés</p>
                  </div>
                  <div style={{ textAlign: 'center', padding: '.5rem', background: '#f8f6f4', borderRadius: '.5rem' }}>
                    <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffc107' }}>{articles.filter(a => !a.published).length}</p>
                    <p style={{ fontSize: '.65rem', color: '#888' }}>Brouillons</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#6b2a1a', marginBottom: '1rem' }}>⚡ Actions rapides</h2>
              <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
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
            <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <input placeholder="Rechercher... (titre, contenu)" value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && loadArticles()}
                style={{ padding: '.6rem 1rem', border: '1.5px solid #ddd', borderRadius: '.5rem', flex: 1, minWidth: 180, fontSize: '.9rem' }}
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
              <button onClick={loadArticles} style={{ padding: '.6rem 1rem', background: '#6b2a1a', color: 'white', border: 'none', borderRadius: '.5rem', cursor: 'pointer', fontSize: '.9rem' }}>🔍</button>
              <button onClick={() => openArticleEditor({})} style={{ padding: '.6rem 1rem', background: '#01696f', color: 'white', border: 'none', borderRadius: '.5rem', cursor: 'pointer', fontSize: '.9rem' }}>+ Nouvel</button>
              <button onClick={exportToCsv} title="Exporter CSV" style={{ padding: '.5rem .75rem', border: '1px solid #ddd', borderRadius: '.4rem', background: 'white', cursor: 'pointer', fontSize: '.8rem' }}>📥</button>
              <label title="Importer CSV" style={{ padding: '.5rem .75rem', border: '1px solid #ddd', borderRadius: '.4rem', background: 'white', cursor: 'pointer', fontSize: '.8rem' }}>
                <input type="file" accept=".csv" onChange={importFromCsv} style={{ display: 'none' }} />
                📤
              </label>
            </div>
            
            {/* Bulk Actions Bar */}
            {articles.length > 0 && (
              <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1rem', padding: '.75rem', background: '#f8f6f4', borderRadius: '.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <button onClick={toggleSelectAll} style={{ padding: '.5rem .75rem', border: '1px solid #ddd', borderRadius: '.4rem', background: 'white', cursor: 'pointer', fontSize: '.85rem', display: 'flex', alignItems: 'center', gap: '.35rem' }}>
                  {selectedArticles.size === articles.length ? <CheckSquare size={16} /> : <Square size={16} />} 
                  Tout ({articles.length})
                </button>
                <span style={{ color: '#888', fontSize: '.85rem' }}>|</span>
                <button onClick={bulkPublish} disabled={selectedArticles.size === 0 || loadingArticles} style={{ padding: '.5rem .75rem', border: '1px solid #28a745', borderRadius: '.4rem', background: selectedArticles.size > 0 ? '#28a745' : 'white', color: selectedArticles.size > 0 ? 'white' : '#28a745', cursor: selectedArticles.size > 0 ? 'pointer' : 'not-allowed', fontSize: '.85rem', opacity: loadingArticles ? .6 : 1 }}>
                  📤 Publier ({selectedArticles.size})
                </button>
                <button onClick={bulkUnpublish} disabled={selectedArticles.size === 0 || loadingArticles} style={{ padding: '.5rem .75rem', border: '1px solid #ffc107', borderRadius: '.4rem', background: selectedArticles.size > 0 ? '#ffc107' : 'white', color: selectedArticles.size > 0 ? 'white' : '#856404', cursor: selectedArticles.size > 0 ? 'pointer' : 'not-allowed', fontSize: '.85rem', opacity: loadingArticles ? .6 : 1 }}>
                  📥 Dépublier ({selectedArticles.size})
                </button>
                <button onClick={bulkDelete} disabled={selectedArticles.size === 0 || loadingArticles} style={{ padding: '.5rem .75rem', border: '1px solid #dc3545', borderRadius: '.4rem', background: selectedArticles.size > 0 ? '#dc3545' : 'white', color: selectedArticles.size > 0 ? 'white' : '#dc3545', cursor: selectedArticles.size > 0 ? 'pointer' : 'not-allowed', fontSize: '.85rem', opacity: loadingArticles ? .6 : 1 }}>
                  🗑 Supprimer ({selectedArticles.size})
                </button>
              </div>
            )}

            {loadingArticles ? <p style={{ textAlign: 'center', color: '#888', padding: '3rem' }}>Chargement…</p>
              : articles.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#aaa' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
                  <p>Aucun article trouvé</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                  {articles.filter(a => {
                    // Status filter
                    if (statusFilter === 'published' && !a.published) return false;
                    if (statusFilter === 'draft' && a.published) return false;
                    if (statusFilter === 'archived' && a.archived !== true) return false;
                    // Category filter
                    if (categoryFilter !== 'all' && a.category !== categoryFilter) return false;
                    // Search filter (fuzzy)
                    if (search) {
                      const q = search.toLowerCase();
                      const matchTitle = a.title?.toLowerCase().includes(q);
                      const matchContent = a.content?.toLowerCase().includes(q);
                      const matchCategory = a.category?.toLowerCase().includes(q);
                      if (!matchTitle && !matchContent && !matchCategory) return false;
                    }
                    return true;
                  }).map(a => (
                    <div key={a.id} style={{ background: 'white', borderRadius: '.75rem', padding: '.85rem 1rem', display: 'flex', alignItems: 'center', gap: '.75rem', boxShadow: '0 1px 4px rgba(0,0,0,.06)', flexWrap: 'wrap', borderLeft: selectedArticles.has(a.id) ? '3px solid #6b2a1a' : '3px solid transparent' }}>
                      <button onClick={() => toggleArticleSelection(a.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '.25rem', color: selectedArticles.has(a.id) ? '#6b2a1a' : '#ccc' }}>
                        {selectedArticles.has(a.id) ? <CheckSquare size={20} /> : <Square size={20} />}
                      </button>
                      {a.featured_image && <img src={a.featured_image} alt="" style={{ width: 56, height: 42, objectFit: 'cover', borderRadius: '.35rem', flexShrink: 0 }} />}
                      <div style={{ flex: 1, minWidth: 180 }}>
                        <div style={{ fontWeight: 600, fontSize: '.95rem', color: '#1a1a1a', marginBottom: '.15rem' }}>{a.title}</div>
                        <div style={{ fontSize: '.75rem', color: '#888', display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
                          <span>{a.category || '—'}</span>
                          <span>{fmt(a.created_at)}</span>
                          {a.views != null && <span>👁 {a.views}</span>}
                        </div>
                      </div>
                      <span style={{ padding: '.25rem .65rem', borderRadius: '9999px', fontSize: '.72rem', fontWeight: 600, background: a.published ? '#d4edda' : '#fff3cd', color: a.published ? '#155724' : '#856404' }}>
                        {a.published ? '✓ Publié' : '📝 Brouillon'}
                      </span>
                      <div style={{ display: 'flex', gap: '.35rem' }}>
                        <button onClick={() => openArticleEditor(a)} title="Éditer" style={{ padding: '.3rem .6rem', border: '1px solid #ddd', borderRadius: '.35rem', background: 'white', cursor: 'pointer', fontSize: '.78rem' }}>✏️</button>
                        <button onClick={() => togglePublish(a)} title={a.published ? 'Dépublier' : 'Publier'} style={{ padding: '.3rem .6rem', border: '1px solid #ddd', borderRadius: '.35rem', background: 'white', cursor: 'pointer', fontSize: '.78rem' }}>{a.published ? '📦' : '📤'}</button>
                        <button onClick={() => duplicateArticle(a)} title="Dupliquer" style={{ padding: '.3rem .6rem', border: '1px solid #ddd', borderRadius: '.35rem', background: 'white', cursor: 'pointer', fontSize: '.78rem' }}>📋</button>
                        <button onClick={() => deleteArticle(a.id)} title="Supprimer" style={{ padding: '.3rem .6rem', border: '1px solid #fcc', borderRadius: '.35rem', background: '#fff5f5', color: '#c0392b', cursor: 'pointer', fontSize: '.78rem' }}>🗑</button>
                      </div>
                    </div>
                  ))}
                  {(search || categoryFilter !== 'all' || statusFilter !== 'all') && (
                    <p style={{ textAlign: 'center', color: '#888', fontSize: '.85rem', padding: '.5rem' }}>
                      {articles.filter(a => {
                        if (statusFilter === 'published' && !a.published) return false;
                        if (statusFilter === 'draft' && a.published) return false;
                        if (categoryFilter !== 'all' && a.category !== categoryFilter) return false;
                        if (search) {
                          const q = search.toLowerCase();
                          if (!a.title?.toLowerCase().includes(q) && !a.content?.toLowerCase().includes(q)) return false;
                        }
                        return true;
                      }).length} résultat(s)
                    </p>
                  )}
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
                <textarea value={editingArticle?.excerpt || ''}
                  onChange={e => setEditingArticle(p => ({ ...p, excerpt: e.target.value }))}
                  style={{ ...inp, height: 80, resize: 'vertical' }}
                  placeholder="Résumé accrocheur pour les cards du blog…" />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Contenu</label>
                <RichEditor value={editingArticle?.content || ''}
                  onChange={html => setEditingArticle(p => ({ ...p, content: html }))}
                  placeholder="Commence à écrire ton article ici…" />
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
              <div className="cms-layout-sidebar">
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#6b2a1a' }}>✈️ Demandes Travel Planning</h2>
              <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
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
                <button onClick={loadDemandes} disabled={loadingDemandes} style={{ padding: '.5rem 1rem', background: 'white', border: '1.5px solid #ddd', borderRadius: '.5rem', cursor: loadingDemandes ? 'wait' : 'pointer', fontSize: '.85rem', opacity: loadingDemandes ? .7 : 1 }}>{loadingDemandes ? '⏳' : '🔄'}</button>
              </div>
            </div>
            {loadingDemandes ? <p style={{ textAlign: 'center', color: '#888', padding: '3rem' }}>Chargement…</p>
              : demandes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#aaa' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✉️</div>
                  <p>Aucune demande pour le moment</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {demandes.filter(d => demandesStatusFilter === 'all' || d.statut === demandesStatusFilter).map(d => (
                    <div key={d.id} style={{ background: 'white', borderRadius: '.75rem', padding: '1.25rem 1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.75rem', flexWrap: 'wrap', gap: '.5rem' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1a1a1a' }}>{d.prenom} {d.nom}</div>
                          <div style={{ fontSize: '.85rem', color: '#888' }}>{d.email} {d.telephone && `· ${d.telephone}`}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                          <span style={{ fontSize: '.75rem', color: '#aaa' }}>{fmt(d.created_at)}</span>
                          <select value={d.statut || 'nouvelle'} onChange={e => updateStatut(d.id, e.target.value)} disabled={updatingDemandeId === d.id}
                            style={{ padding: '.3rem .7rem', border: '1.5px solid #ddd', borderRadius: '.4rem', fontSize: '.82rem' }}>
                            <option value="nouvelle">🆕 Nouvelle</option>
                            <option value="en_cours">🔍 En cours</option>
                            <option value="devis_envoye">📨 Devis envoyé</option>
                            <option value="accepte">✅ Acceptée</option>
                            <option value="terminee">🏁 Terminée</option>
                            <option value="annulee">❌ Annulée</option>
                          </select>
                        </div>
                      </div>
                      {d.notes && (
                        <div style={{ marginTop: '.75rem', padding: '.75rem', background: '#faf8f5', borderRadius: '.5rem', fontSize: '.85rem', color: '#666' }}>💬 {d.notes}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}

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
              <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 1px 4px rgba(0,0,0,.06)', maxWidth: '960px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#6b2a1a', margin: 0 }}>📊 Analytics GA4</h2>
                  <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center' }}>
                    {analyticsData?.period && <span style={{ fontSize: '.75rem', color: '#888', background: '#f5f5f5', padding: '.25rem .75rem', borderRadius: '1rem' }}>{analyticsData.period.startDate} → {analyticsData.period.endDate}</span>}
                    <button onClick={async () => {
                      setLoadingAnalytics(true);
                      try {
                        const res = await fetch('/api/cms/analytics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ startDate: '30daysAgo', endDate: 'today' }) });
                        const data = await res.json();
                        setAnalyticsData(data);
                      } catch (e) { console.error(e); }
                      setLoadingAnalytics(false);
                    }} disabled={loadingAnalytics}
                    style={{ padding: '.5rem 1.25rem', background: '#6b2a1a', color: 'white', border: 'none', borderRadius: '.5rem', fontWeight: 600, cursor: 'pointer', fontSize: '.85rem' }}>
                      {loadingAnalytics ? '⏳ Chargement…' : '🔄 Actualiser'}
                    </button>
                  </div>
                </div>

                {/* KPIs principaux - ligne 1 */}
                <div className="cms-grid-kpi">
                  {([
                    { key: 'sessions', label: 'Sessions', icon: '📈', fmt: (v: number) => v.toLocaleString('fr') },
                    { key: 'users', label: 'Utilisateurs', icon: '👥', fmt: (v: number) => v.toLocaleString('fr') },
                    { key: 'newUsers', label: 'Nv. utilisateurs', icon: '✨', fmt: (v: number) => v.toLocaleString('fr') },
                    { key: 'screenPageViews', label: 'Pages vues', icon: '📄', fmt: (v: number) => v.toLocaleString('fr') },
                  ] as const).map(({ key, label, icon, fmt }) => {
                    const val = analyticsData?.totals?.[key]?.value ?? null;
                    return (
                      <div key={key} style={{ background: '#fdf8f6', padding: '1.25rem', borderRadius: '.75rem', textAlign: 'center', border: '1px solid #f0e8e4' }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '.25rem' }}>{icon}</div>
                        <p style={{ fontSize: '1.6rem', fontWeight: 700, color: '#6b2a1a', margin: '.25rem 0' }}>{val != null ? fmt(val) : '--'}</p>
                        <p style={{ fontSize: '.7rem', color: '#999', textTransform: 'uppercase', letterSpacing: '.05em', margin: 0 }}>{label}</p>
                      </div>
                    );
                  })}
                </div>

                {/* KPIs secondaires - ligne 2 */}
                <div className="cms-grid-kpi">
                  {([
                    { key: 'bounceRate', label: 'Taux rebond', icon: '↩️', fmt: (v: number) => `${(v*100).toFixed(1)}%` },
                    { key: 'engagementRate', label: 'Taux engagement', icon: '💡', fmt: (v: number) => `${(v*100).toFixed(1)}%` },
                    { key: 'avgSessionDuration', label: 'Durée moy. session', icon: '⏱️', fmt: (v: number) => { const m = Math.floor(v/60); const s = Math.round(v%60); return `${m}m${s < 10 ? '0' : ''}${s}s`; } },
                    { key: 'pagesPerSession', label: 'Pages / session', icon: '📑', fmt: (v: number) => v.toFixed(2) },
                  ] as const).map(({ key, label, icon, fmt }) => {
                    const val = analyticsData?.totals?.[key]?.value ?? null;
                    return (
                      <div key={key} style={{ background: '#f6f9fd', padding: '1.25rem', borderRadius: '.75rem', textAlign: 'center', border: '1px solid #e4ecf5' }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '.25rem' }}>{icon}</div>
                        <p style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1a4a6b', margin: '.25rem 0' }}>{val != null ? fmt(val) : '--'}</p>
                        <p style={{ fontSize: '.7rem', color: '#999', textTransform: 'uppercase', letterSpacing: '.05em', margin: 0 }}>{label}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Top pages + Sources de trafic */}
                <div className="cms-grid-kpi">
                  {/* Top pages */}
                  <div style={{ background: '#fafafa', borderRadius: '.75rem', padding: '1.25rem', border: '1px solid #eee' }}>
                    <h3 style={{ fontSize: '.9rem', fontWeight: 700, color: '#333', margin: '0 0 1rem' }}>🏆 Top pages</h3>
                    {analyticsData?.topPages?.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                        {analyticsData.topPages.slice(0, 7).map((p: any, i: number) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '.8rem' }}>
                            <span style={{ color: '#555', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }}>
                              <span style={{ color: '#aaa', marginRight: '.4rem' }}>#{i+1}</span>{p.path}
                            </span>
                            <span style={{ fontWeight: 700, color: '#6b2a1a', marginLeft: '.5rem' }}>{p.views}</span>
                          </div>
                        ))}
                      </div>
                    ) : <p style={{ fontSize: '.8rem', color: '#bbb', textAlign: 'center', margin: '1rem 0' }}>Cliquez Actualiser</p>}
                  </div>

                  {/* Sources de trafic */}
                  <div style={{ background: '#fafafa', borderRadius: '.75rem', padding: '1.25rem', border: '1px solid #eee' }}>
                    <h3 style={{ fontSize: '.9rem', fontWeight: 700, color: '#333', margin: '0 0 1rem' }}>🌐 Sources de trafic</h3>
                    {analyticsData?.trafficSources?.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                        {analyticsData.trafficSources.map((s: any, i: number) => {
                          const total = analyticsData.trafficSources.reduce((acc: number, x: any) => acc + x.sessions, 0);
                          const pct = total > 0 ? Math.round((s.sessions / total) * 100) : 0;
                          return (
                            <div key={i} style={{ fontSize: '.8rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.2rem' }}>
                                <span style={{ color: '#555' }}>{s.channel}</span>
                                <span style={{ fontWeight: 700, color: '#333' }}>{s.sessions} <span style={{ color: '#aaa', fontWeight: 400 }}>({pct}%)</span></span>
                              </div>
                              <div style={{ background: '#e8e8e8', borderRadius: '4px', height: '4px' }}>
                                <div style={{ width: `${pct}%`, background: '#6b2a1a', borderRadius: '4px', height: '4px' }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : <p style={{ fontSize: '.8rem', color: '#bbb', textAlign: 'center', margin: '1rem 0' }}>Cliquez Actualiser</p>}
                  </div>
                </div>

                {/* Appareils */}
                {analyticsData?.devices?.length > 0 && (
                  <div style={{ background: '#fafafa', borderRadius: '.75rem', padding: '1.25rem', border: '1px solid #eee' }}>
                    <h3 style={{ fontSize: '.9rem', fontWeight: 700, color: '#333', margin: '0 0 1rem' }}>📱 Appareils</h3>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                      {analyticsData.devices.map((d: any, i: number) => {
                        const total = analyticsData.devices.reduce((acc: number, x: any) => acc + x.sessions, 0);
                        const pct = total > 0 ? Math.round((d.sessions / total) * 100) : 0;
                        const icons: Record<string,string> = { desktop: '🖥️', mobile: '📱', tablet: '📲' };
                        return (
                          <div key={i} style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem' }}>{icons[d.device] ?? '💻'}</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#333' }}>{pct}%</div>
                            <div style={{ fontSize: '.7rem', color: '#999', textTransform: 'capitalize' }}>{d.device}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
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
              <div className="cms-layout-sidebar">
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
                      if (settingsGroup === 'appearance') return true; // Show all appearance settings
                      if (settingsGroup === 'social') return s.key.startsWith('social_');
                      if (settingsGroup === 'seo') return s.key.startsWith('seo_');
                      if (settingsGroup === 'footer') return s.key.startsWith('footer_');
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
                        <button onClick={async () => {
                            setSavingSettings(true);
                            try {
                                const res = await fetch('/api/cms/fix-empty-images', { method: 'POST', headers: { 'x-cms-auth': localStorage.getItem('cms_password') || '' } });
                                const data = await res.json();
                                alert(data.message || data.error);
                            } catch(e) {
                                alert("Erreur lors de la réparation des images vides");
                            } finally {
                                setSavingSettings(false);
                            }
                        }} disabled={savingSettings}
                          style={{ marginTop: '1.75rem', marginLeft: '1rem', padding: '.7rem 2rem', background: '#eab308', color: 'white', border: 'none', borderRadius: '.5rem', fontWeight: 700, cursor: 'pointer', fontSize: '.9rem', opacity: savingSettings ? .7 : 1 }}
                        >{savingSettings ? '⏳ Réparation…' : '🛠 Réparer images vides'}</button>

                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'agents' && (
          <div>
            <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 1px 4px rgba(0,0,0,.06)', maxWidth: 800, marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#6b2a1a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                <Bot size={24} /> Envoyer une tâche à un agent IA
              </h2>
              
              {/* Agent select */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={lbl}>Agent</label>
                <select value={selectedAgent} onChange={e => setSelectedAgent(e.target.value)}
                  style={{ width: '100%', padding: '.65rem .9rem', border: '1.5px solid #e0dbd5', borderRadius: '.5rem', fontSize: '.9rem', outline: 'none', background: '#faf9f7', color: '#1a1a1a', cursor: 'pointer' }}>
                  <option value="allhands">OpenHands (AllHands)</option>
                  <option value="jules">Jules (Google)</option>
                  <option value="gemini">Gemini (Google)</option>
                  <option value="perplexity">Perplexity</option>
                </select>
              </div>

              {/* Task textarea */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={lbl}>Tâche</label>
                <textarea value={agentTask} onChange={e => setAgentTask(e.target.value)}
                  placeholder="Décrivez la tâche à effectuer..."
                  rows={4}
                  style={{ width: '100%', padding: '.65rem .9rem', border: '1.5px solid #e0dbd5', borderRadius: '.5rem', fontSize: '.9rem', outline: 'none', background: '#faf9f7', color: '#1a1a1a', resize: 'vertical', fontFamily: 'inherit' }} />
              </div>

              {/* Repo input */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={lbl}>Repo</label>
                <input value={agentRepo} onChange={e => setAgentRepo(e.target.value)}
                  placeholder="farinhahelder-hue/heldonica"
                  style={inp} />
              </div>

              {/* Branch input */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={lbl}>Branche</label>
                <input value={agentBranch} onChange={e => setAgentBranch(e.target.value)}
                  placeholder="main"
                  style={inp} />
              </div>

              {/* Send button */}
              <button onClick={sendAgentTask} disabled={sendingTask}
                style={{ padding: '.75rem 2rem', background: '#6b2a1a', color: 'white', border: 'none', borderRadius: '.5rem', fontWeight: 700, cursor: 'pointer', fontSize: '1rem', opacity: sendingTask ? .7 : 1 }}>
                {sendingTask ? '⏳ Envoi...' : '📤 Envoyer la tâche'}
              </button>

              {/* Success/error message */}
              {agentMessage && (
                <div style={{ 
                  marginTop: '1rem', 
                  padding: '.75rem 1rem', 
                  borderRadius: '.5rem', 
                  background: agentMessage.type === 'success' ? '#d4edda' : '#f8d7da',
                  color: agentMessage.type === 'success' ? '#155724' : '#721c24',
                  fontSize: '.9rem'
                }}>
                  {agentMessage.type === 'success' ? '✓' : '✕'} {agentMessage.text}
                </div>
              )}
            </div>

            {/* Task History */}
            <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 1px 4px rgba(0,0,0,.06)', maxWidth: 800 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#6b2a1a', marginBottom: '1rem' }}>Historique des 10 dernières tâches</h3>
              {taskHistory.length === 0 ? (
                <p style={{ color: '#888', fontSize: '.9rem', textAlign: 'center', padding: '1.5rem' }}>Aucune tâche envoyée récemment.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                  {taskHistory.map((entry, i) => {
                    const agentLabels: Record<string, string> = {
                      allhands: 'OpenHands',
                      jules: 'Jules',
                      gemini: 'Gemini',
                      perplexity: 'Perplexity',
                    };
                    return (
                      <div key={i} style={{ padding: '.75rem', background: '#f8f6f4', borderRadius: '.5rem', borderLeft: '3px solid #6b2a1a' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.35rem', flexWrap: 'wrap', gap: '.5rem' }}>
                          <span style={{ fontWeight: 600, color: '#333', fontSize: '.9rem' }}>{agentLabels[entry.agent] || entry.agent}</span>
                          <span style={{ fontSize: '.75rem', color: '#888' }}>{entry.date}</span>
                        </div>
                        <div style={{ fontSize: '.85rem', color: '#555', marginBottom: '.35rem' }}>
                          {entry.task.length > 100 ? entry.task.substring(0, 100) + '...' : entry.task}
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '.75rem', color: '#888' }}>
                          <span>📁 {entry.repo}</span>
                          <span>🌿 {entry.branch}</span>
                          <span style={{ color: '#28a745', fontWeight: 600 }}>✓ Envoyé</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
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
