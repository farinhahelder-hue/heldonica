'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Sparkles,
  FileText,
  Compass,
  LayoutTemplate,
  Layers,
  ArrowRight,
  FolderOpen,
  Camera,
  History,
  Bot,
  Eye,
  Sliders,
  CornerDownLeft,
  CheckCircle,
  HelpCircle,
  Tag,
  MapPin,
  Heading,
  Type,
  Image as ImageIcon,
  Images,
  Video,
  MousePointerClick,
  ListOrdered,
  ListTree,
  Home,
} from 'lucide-react';
import { getAllVaultSpots, type VaultSpotRecord } from '@/lib/cms-vault-spots';
import type { BlockType } from '@/types/cms-blocks';

export interface OmnisearchArticleItem {
  id: number | string;
  title: string;
  slug: string;
  status?: string;
  category?: string;
  excerpt?: string;
  updated_at?: string;
}

export type OmnisearchCategory = 'all' | 'actions' | 'articles' | 'vault' | 'blocks';

export interface OmnisearchItem {
  id: string;
  type: 'action' | 'article' | 'vault' | 'block';
  title: string;
  subtitle: string;
  badge?: string;
  icon: React.ElementType;
  iconColor?: string;
  onSelect: () => void;
}

interface OmnisearchPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  articles?: OmnisearchArticleItem[];
  onSelectArticle?: (article: OmnisearchArticleItem) => void;
  onNavigateSection?: (sectionId: string) => void;
  onAddBlock?: (type: BlockType) => void;
  onInsertVaultSpot?: (spot: VaultSpotRecord) => void;
  onOpenRevisions?: () => void;
  onOpenAgents?: () => void;
  activeArticleTitle?: string;
  navItems?: { id: string; label: string; icon?: React.ReactNode }[];
}

const BLOCK_DEFINITIONS: { type: BlockType; label: string; icon: React.ElementType; desc: string }[] = [
  { type: 'heading', label: 'Titre H1-H4', icon: Heading, desc: 'Hiérarchie de titres avec police serif' },
  { type: 'text', label: 'Paragraphe', icon: Type, desc: 'Texte narratif et prose slow travel' },
  { type: 'image', label: 'Photo & Hotspot', icon: ImageIcon, desc: 'Cadrage intelligent et proportions' },
  { type: 'photo_evidence', label: 'Preuve photo', icon: Camera, desc: 'Photo de terrain vérifiée avec date et lieu' },
  { type: 'gallery', label: 'Galerie / Carrousel', icon: Images, desc: 'Diaporama plein écran ou grille' },
  { type: 'vault_spot', label: 'Pépite RAG du Coffre', icon: Sparkles, desc: 'Fiche vécue issue des 78 fiches du Coffre' },
  { type: 'map', label: 'Carte d’étapes', icon: MapPin, desc: 'Balade et repères géolocalisés' },
  { type: 'table_of_contents', label: 'Sommaire interactif', icon: ListTree, desc: 'Table des matières basée sur les titres' },
  { type: 'hospitality_spot', label: 'Hébergement Éthique', icon: Home, desc: 'Hôtel slow travel ou chambre d’hôtes' },
  { type: 'video', label: 'Vidéo & Shorts', icon: Video, desc: 'Format paysage ou vertical 9:16' },
  { type: 'list', label: 'Liste & Checklist', icon: ListOrdered, desc: 'Points clés ou préparatifs' },
  { type: 'button', label: 'Bouton d’action', icon: MousePointerClick, desc: 'Lien externe ou appel à l’action' },
];

export function OmnisearchPalette({
  isOpen,
  onClose,
  articles = [],
  onSelectArticle,
  onNavigateSection,
  onAddBlock,
  onInsertVaultSpot,
  onOpenRevisions,
  onOpenAgents,
  activeArticleTitle,
  navItems = [],
}: OmnisearchPaletteProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<OmnisearchCategory>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Focus automatique à l'ouverture
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setCategory('all');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Tous les spots du Coffre des Savoirs RAG
  const allVaultSpots = useMemo(() => getAllVaultSpots(), []);

  // Construction de la liste des éléments trouvés
  const items: OmnisearchItem[] = useMemo(() => {
    const q = query.toLowerCase().trim();
    const result: OmnisearchItem[] = [];

    // 1. Actions rapides & Navigation
    if (category === 'all' || category === 'actions') {
      // Actions spéciales
      const specialActions: OmnisearchItem[] = [
        ...(onOpenRevisions
          ? [
              {
                id: 'action_revisions',
                type: 'action' as const,
                title: 'Time Machine & Diff visuel',
                subtitle: activeArticleTitle
                  ? `Historique des versions pour « ${activeArticleTitle} »`
                  : 'Historique des versions',
                badge: 'Time Machine',
                icon: History,
                iconColor: 'text-amber-700',
                onSelect: () => {
                  onOpenRevisions();
                  onClose();
                },
              },
            ]
          : []),
        ...(onOpenAgents
          ? [
              {
                id: 'action_agents',
                type: 'action' as const,
                title: 'Tour de Contrôle Agents IA',
                subtitle: 'Registre agent_tasks, coordination Claude / Gemini',
                badge: 'Multi-agents',
                icon: Bot,
                iconColor: 'text-indigo-700',
                onSelect: () => {
                  onOpenAgents();
                  onClose();
                },
              },
            ]
          : []),
        {
          id: 'action_new_article',
          type: 'action' as const,
          title: 'Créer un nouveau carnet de route',
          subtitle: 'Rédiger un nouvel article slow travel avec blocs modulaires',
          badge: 'Nouveau',
          icon: FileText,
          iconColor: 'text-emerald-700',
          onSelect: () => {
            onNavigateSection?.('new-article');
            onClose();
          },
        },
      ];

      // Sections de navigation standards
      const navActions: OmnisearchItem[] = navItems.map((n) => ({
        id: `nav_${n.id}`,
        type: 'action' as const,
        title: `Aller à : ${n.label}`,
        subtitle: `Section d’administration /panel-manager?section=${n.id}`,
        badge: 'Navigation',
        icon: Compass,
        iconColor: 'text-stone-600',
        onSelect: () => {
          onNavigateSection?.(n.id);
          onClose();
        },
      }));

      const allActions = [...specialActions, ...navActions];
      if (!q) {
        result.push(...allActions.slice(0, 6));
      } else {
        result.push(
          ...allActions.filter(
            (a) => a.title.toLowerCase().includes(q) || a.subtitle.toLowerCase().includes(q)
          )
        );
      }
    }

    // 2. Articles & Carnets de route
    if (category === 'all' || category === 'articles') {
      const filteredArticles = articles.filter(
        (a) =>
          !q ||
          a.title.toLowerCase().includes(q) ||
          a.slug.toLowerCase().includes(q) ||
          (a.excerpt && a.excerpt.toLowerCase().includes(q)) ||
          (a.category && a.category.toLowerCase().includes(q))
      );

      result.push(
        ...filteredArticles.slice(0, category === 'articles' ? 25 : 6).map((a) => ({
          id: `article_${a.id}`,
          type: 'article' as const,
          title: a.title,
          subtitle: `/${a.slug} ${a.category ? `• ${a.category}` : ''}`,
          badge: a.status === 'published' ? 'Publié' : 'Brouillon',
          icon: FileText,
          iconColor: a.status === 'published' ? 'text-emerald-600' : 'text-amber-600',
          onSelect: () => {
            onSelectArticle?.(a);
            onClose();
          },
        }))
      );
    }

    // 3. Pépites du Coffre des Savoirs RAG
    if (category === 'all' || category === 'vault') {
      const filteredSpots = allVaultSpots.filter(
        (s) =>
          !q ||
          s.title.toLowerCase().includes(q) ||
          s.location.toLowerCase().includes(q) ||
          s.livedExperience.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q))
      );

      result.push(
        ...filteredSpots.slice(0, category === 'vault' ? 30 : 6).map((s) => ({
          id: `spot_${s.id}`,
          type: 'vault' as const,
          title: s.title,
          subtitle: `${s.location} — ${s.livedExperience.slice(0, 90)}…`,
          badge: 'RAG Coffre',
          icon: Sparkles,
          iconColor: 'text-amber-700',
          onSelect: () => {
            onInsertVaultSpot?.(s);
            onClose();
          },
        }))
      );
    }

    // 4. Blocs CMS modulaires
    if (category === 'all' || category === 'blocks') {
      const filteredBlocks = BLOCK_DEFINITIONS.filter(
        (b) => !q || b.label.toLowerCase().includes(q) || b.desc.toLowerCase().includes(q)
      );

      result.push(
        ...filteredBlocks.map((b) => ({
          id: `block_${b.type}`,
          type: 'block' as const,
          title: `Insérer : ${b.label}`,
          subtitle: b.desc,
          badge: 'Bloc CMS',
          icon: b.icon,
          iconColor: 'text-stone-700',
          onSelect: () => {
            onAddBlock?.(b.type);
            onClose();
          },
        }))
      );
    }

    return result;
  }, [
    query,
    category,
    articles,
    allVaultSpots,
    navItems,
    onOpenRevisions,
    onOpenAgents,
    activeArticleTitle,
    onNavigateSection,
    onSelectArticle,
    onInsertVaultSpot,
    onAddBlock,
    onClose,
  ]);

  // Réinitialise la sélection quand la liste change
  useEffect(() => {
    setSelectedIndex(0);
  }, [items.length]);

  // Gestion du clavier (Flèches, Entrée, Échap)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (items.length > 0 ? (prev + 1) % items.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (items.length > 0 ? (prev - 1 + items.length) % items.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (items[selectedIndex]) {
        items[selectedIndex].onSelect();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-start justify-center pt-16 md:pt-24 p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Barre de recherche Omnisearch */}
        <div className="p-3.5 border-b border-stone-100 flex items-center gap-3 bg-stone-50/70">
          <Search size={18} className="text-amber-800 shrink-0 ml-1" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher partout… (ex: Stoos, Madère, RAG, image, time machine)"
            className="w-full bg-transparent text-sm text-stone-900 placeholder-stone-400 focus:outline-none font-sans"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/60"
            >
              <X size={14} />
            </button>
          )}
          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono text-stone-400 bg-stone-200/60 border border-stone-300">
            ESC
          </span>
        </div>

        {/* Filtres par onglets */}
        <div className="flex items-center gap-1.5 px-3 py-2 border-b border-stone-100 bg-white overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setCategory('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0 ${
              category === 'all'
                ? 'bg-amber-100 text-amber-900 font-semibold'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Tous ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setCategory('actions')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0 ${
              category === 'actions'
                ? 'bg-amber-100 text-amber-900 font-semibold'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            ⚡ Actions
          </button>
          <button
            type="button"
            onClick={() => setCategory('articles')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0 ${
              category === 'articles'
                ? 'bg-amber-100 text-amber-900 font-semibold'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            📄 Articles & Carnets
          </button>
          <button
            type="button"
            onClick={() => setCategory('vault')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0 ${
              category === 'vault'
                ? 'bg-amber-100 text-amber-900 font-semibold'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            💎 Coffre RAG
          </button>
          <button
            type="button"
            onClick={() => setCategory('blocks')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0 ${
              category === 'blocks'
                ? 'bg-amber-100 text-amber-900 font-semibold'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            🧩 Blocs CMS
          </button>
        </div>

        {/* Liste des résultats */}
        <div
          ref={resultsContainerRef}
          className="flex-1 overflow-y-auto p-2 space-y-1 max-h-[50vh]"
        >
          {items.length === 0 ? (
            <div className="py-12 text-center text-stone-500 text-xs">
              <Compass size={28} className="mx-auto text-stone-300 mb-2" />
              <p className="font-semibold text-stone-700">Aucun résultat trouvé pour « {query} »</p>
              <p className="text-stone-400 mt-1">
                Essayez un nom de lieu (ex: Stoos), un type de bloc (ex: image), ou une action.
              </p>
            </div>
          ) : (
            items.map((item, index) => {
              const Icon = item.icon;
              const isSelected = selectedIndex === index;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.onSelect}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-amber-50/80 border border-amber-300/80 shadow-2xs'
                      : 'hover:bg-stone-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-amber-100 text-amber-900' : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      <Icon size={16} className={item.iconColor || ''} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-stone-900 truncate">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-semibold shrink-0 ${
                              item.type === 'vault'
                                ? 'bg-amber-100 text-amber-900'
                                : item.type === 'article'
                                ? 'bg-emerald-100 text-emerald-900'
                                : 'bg-stone-100 text-stone-700'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500 truncate mt-0.5">{item.subtitle}</p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="shrink-0 flex items-center gap-1 text-stone-400 text-[10px] font-mono">
                      <span>Entrée</span>
                      <CornerDownLeft size={12} className="text-amber-800" />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Pied de page avec raccourcis */}
        <div className="px-4 py-2.5 border-t border-stone-100 bg-stone-50/70 flex items-center justify-between text-[11px] text-stone-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-stone-200/80 rounded font-mono text-[9px] text-stone-700">↑↓</kbd>
              <span>Naviguer</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-stone-200/80 rounded font-mono text-[9px] text-stone-700">↵</kbd>
              <span>Exécuter</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-stone-200/80 rounded font-mono text-[9px] text-stone-700">ESC</kbd>
              <span>Fermer</span>
            </span>
          </div>
          <span className="font-semibold text-stone-600">
            {items.length} résultat{items.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
}

export default OmnisearchPalette;
