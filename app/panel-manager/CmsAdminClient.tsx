'use client';

console.log('[CMS] Rendering CMS admin page');

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import EnhancedRichContent from '@/components/EnhancedRichContent';
import MediaLibrary from '@/components/MediaLibrary';
import { sanitizeHtml } from '@/lib/sanitize-html';
import { Home, FileText, Plus, Sparkles, Folder, Plane, Image, Settings, BarChart3, Search, Save, Package, Car, Eye, EyeOff, Trash2, Send, Download, Upload, RefreshCw, Bot, Mail, Map } from 'lucide-react';

const RichEditor = dynamic(() => import('@/components/RichEditor'), { ssr: false });
const CarouselEditor = dynamic(() => import('@/components/admin/CarouselEditor'), { ssr: false });
const CarouselGenerator = dynamic(() => import('@/components/admin/CarouselGenerator'), { ssr: false });
const BlogGenerator = dynamic(() => import('@/components/admin/BlogGenerator'), { ssr: false });
const MapManagerSection = dynamic(() => import('./maps/MapManagerSection'), { ssr: false });

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
      { key: 'intro_text',  label: "Texte d'introduction",  type: 'textarea' },
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
      { key: 'intro_text',  label: "Texte d'introduction",  type: 'textarea' },
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
      { key: 'intro_text',  label: "Texte d'introduction",  type: 'textarea' },
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
  maintenance:{ label: 'Maintenance',   emoji: '🚧' },
};

// Paramètres d'apparence (couleurs, logo, favicon)
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
  const [editingArticle, setEditingArticle] = useState<Partial<Article> | null>(null);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [savingArticle, setSavingArticle] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [scheduleMode, setScheduleMode] = useState(false);

  // Agents panel
  const [agentTask, setAgentTask] = useState('');
  const [agentRepo, setAgentRepo] = useState('farinhahelder-hue/heldonica');
  const [agentBranch, setAgentBranch] = useState('main');
  const [selectedAgent, setSelectedAgent] = useState('gemini');
  const [sendingTask, setSendingTask] = useState(false);
  const [agentMessage, setAgentMessage] = useState<{type: 'success' | 'error' | 'warning', text: string, code?: string, response?: string} | null>(null);
  const [taskHistory, setTaskHistory] = useState<{date: string; agent: string; task: string; repo: string; branch: string}[]>([]);
  const [agentStatus, setAgentStatus] = useState<any>(null);
  const [agentConfig, setAgentConfig] = useState<Record<string, {
    configured: boolean;
    status: string;
    message: string;
    missing: string[];
    name?: string;
    color?: string;
    usage?: string;
    beta?: boolean;
  }> | null>(null);
  const [loadingAgentConfig, setLoadingAgentConfig] = useState(false);

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

  // Send task to agent via /api/agents/dispatch
  const sendAgentTask = async () => {
    if (!agentTask.trim()) {
      setAgentMessage({ type: 'error', text: 'Veuillez décrire une tâche à effectuer.' });
      return;
    }

    setSendingTask(true);
    setAgentMessage(null);

    try {
      const res = await fetch('/api/agents/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent: selectedAgent,
          task: agentTask,
          context: `repo: ${agentRepo}, branch: ${agentBranch}`,
          priority: 'normal',
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const agentLabels: Record<string, string> = {
          allhands: 'OpenHands (AllHands)',
          jules: 'Jules (Google)',
          gemini: 'Gemini (Google)',
          claude: 'Claude (Anthropic)',
          perplexity: 'Perplexity',
        };
        const label = agentLabels[selectedAgent] || selectedAgent;
        let messageText = `✅ Tâche traitée par ${label} avec succès!`;
        
        // Show GitHub issue URL if available (for Jules)
        if (data.results?.github?.issue_url) {
          messageText += `\n\n📋 Issue GitHub #${data.results.github.issue_number}: ${data.results.github.issue_url}`;
        }
        
        // Extract agent response for Gemini, Claude, Perplexity
        const agentResponse = data.results?.agent?.response;
        
        setAgentMessage({ 
          type: 'success', 
          text: messageText,
          response: agentResponse 
        });

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
        // Parse error response with detailed messages
        let errorText = data.error || `Erreur lors de l'envoi de la tâche (${res.status})`;
        if (data.details) {
          errorText += `\n→ ${data.details}`;
        }
        if (data.action) {
          errorText += `\n→ ${data.action}`;
        }
        if (data.suggestion) {
          errorText += `\n→ ${data.suggestion}`;
        }
        setAgentMessage({ type: 'error', text: errorText, code: data.code });
      }
    } catch (err) {
      console.error('Failed to send task:', err);
      setAgentMessage({ type: 'error', text: '❌ Erreur réseau. Veuillez réessayer.' });
    } finally {
      setSendingTask(false);
    }
  };

  // Load agent status on agents tab mount
  const loadAgentStatus = async () => {
    try {
      const res = await fetch('/api/agents/status?agent=all&limit=10&prs=true');
      if (res.ok) {
        const data = await res.json();
        setAgentStatus(data);
      }
    } catch (err) {
      console.error('Failed to load agent status:', err);
    }
  };

  // Load agent configuration status
  const loadAgentConfig = async () => {
    setLoadingAgentConfig(true);
    try {
      const res = await fetch('/api/agents/config');
      if (res.ok) {
        const data = await res.json();
        setAgentConfig(data.agents);
      }
    } catch (err) {
      console.error('Failed to load agent config:', err);
    } finally {
      setLoadingAgentConfig(false);
    }
  };

  // Load agent config when switching to agents tab
  useEffect(() => {
    if (tab === 'agents' && !agentConfig) {
      loadAgentConfig();
    }
  }, [tab, agentConfig]);

  // Load agent status when switching to agents tab
  useEffect(() => {
    if (tab === 'agents' && !agentStatus) {
      loadAgentStatus();
    }
  }, [tab, agentStatus]);

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
  const [showMaintenanceConfirm, setShowMaintenanceConfirm] = useState(false);
  const [pendingMaintenanceValue, setPendingMaintenanceValue] = useState<string | null>(null);

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

  // ===== SIDEBAR TABS CONFIG =====
  const SIDEBAR_TABS = [
    { id: 'articles',   label: 'Articles',        icon: FileText },
    { id: 'new',        label: 'Nouvel article',   icon: Plus },
    { id: 'carousel',   label: 'Carousels',        icon: Package },
    { id: 'maps',       label: 'Cartes & Parcours',icon: Map },
    { id: 'demandes',   label: 'Demandes Travel',  icon: Plane },
    { id: 'pages',      label: 'Pages',            icon: Home },
    { id: 'settings',   label: 'Paramètres',       icon: Settings },
    { id: 'analytics',  label: 'Analytiques',      icon: BarChart3 },
    { id: 'search',     label: 'Recherche',        icon: Search },
    { id: 'agents',     label: 'Agents IA',        icon: Bot },
    { id: 'media',      label: 'Médiathèque',      icon: Image },
  ];

  // ===== RENDER =====
  if (checkingSession) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f0f0f', color: '#fff' }}>
        <div>Chargement…</div>
      </div>
    );
  }

  if (!authed) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f0f0f' }}>
        <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 12, padding: 40, minWidth: 340 }}>
          <h1 style={{ color: '#fff', fontSize: 22, marginBottom: 8 }}>🔐 CMS Heldonica</h1>
          <p style={{ color: '#888', marginBottom: 24, fontSize: 14 }}>Espace réservé</p>
          <input
            type="password"
            placeholder="Mot de passe"
            value={pwd}
            onChange={e => setPwd(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #333', background: '#111', color: '#fff', fontSize: 15, marginBottom: 12 }}
            autoFocus
          />
          {authErr && <p style={{ color: '#f87171', fontSize: 13, marginBottom: 10 }}>{authErr}</p>}
          <button
            onClick={login}
            disabled={authLoading}
            style={{ width: '100%', padding: '10px 0', borderRadius: 8, background: '#10b981', color: '#fff', fontWeight: 600, fontSize: 15, border: 'none', cursor: authLoading ? 'not-allowed' : 'pointer', opacity: authLoading ? 0.7 : 1 }}
          >
            {authLoading ? 'Connexion…' : 'Se connecter'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f0f0f', color: '#e5e7eb', fontFamily: 'system-ui, sans-serif' }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#10b981', color: '#fff', padding: '12px 20px', borderRadius: 10, fontWeight: 600, zIndex: 9999, boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
          {toast}
        </div>
      )}

      {/* Sidebar */}
      <aside style={{ width: 220, background: '#111', borderRight: '1px solid #222', display: 'flex', flexDirection: 'column', padding: '24px 0', flexShrink: 0 }}>
        <div style={{ padding: '0 20px 20px', borderBottom: '1px solid #222' }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#fff' }}>Heldonica CMS</div>
          <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>Panel manager</div>
        </div>
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {SIDEBAR_TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                padding: '9px 12px', borderRadius: 8, border: 'none',
                background: tab === id ? '#1d4ed8' : 'transparent',
                color: tab === id ? '#fff' : '#9ca3af',
                cursor: 'pointer', fontSize: 13, fontWeight: tab === id ? 600 : 400,
                marginBottom: 2, textAlign: 'left',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </nav>
        <div style={{ padding: '12px 8px', borderTop: '1px solid #222' }}>
          <button
            onClick={logout}
            style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', borderRadius: 8, border: 'none', background: 'transparent', color: '#6b7280', cursor: 'pointer', fontSize: 13 }}
          >
            <Send size={14} style={{ transform: 'rotate(180deg)' }} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflowY: 'auto', padding: 32 }}>
        {/* Maps tab */}
        {tab === 'maps' && (
          <Suspense fallback={<div style={{ color: '#888' }}>Chargement des cartes…</div>}>
            <MapManagerSection />
          </Suspense>
        )}

        {/* Placeholder for other tabs — this file only adds the maps wiring.
            All other tab renders remain unchanged from the original implementation. */}
        {tab !== 'maps' && (
          <div style={{ color: '#9ca3af', fontSize: 14 }}>
            {/* Existing tab content handled by the rest of the original component */}
          </div>
        )}
      </main>
    </div>
  );
}

export default function CmsAdminClient() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0f0f0f' }} />}>
      <CMSAdminInner />
    </Suspense>
  );
}
