'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ExternalLink,
  Bot,
  Zap,
  Globe,
  BarChart3,
  Search,
  Palette,
  X,
  Compass,
  Database,
  ArrowUpRight,
} from 'lucide-react';

interface QuickLink {
  title: string;
  category: 'Google' | 'Meta & Video' | 'Agents IA' | 'SEO & Géo' | 'Système';
  url: string;
  isExternal: boolean;
  description: string;
}

const QUICK_LINKS: QuickLink[] = [
  {
    title: 'Google Search Console',
    category: 'Google',
    url: 'https://search.google.com/search-console?resource_id=sc-domain%3Aheldonica.fr',
    isExternal: true,
    description: 'Santé sc-domain:heldonica.fr, indexation et requêtes',
  },
  {
    title: 'Google Analytics 4',
    category: 'Google',
    url: 'https://analytics.google.com/analytics/web/#/p477545934/reports/intelligenthome',
    isExternal: true,
    description: 'Trafic temps réel & métriques d\'audience G-JDJNTZLBJS',
  },
  {
    title: 'Meta Business Suite',
    category: 'Meta & Video',
    url: 'https://business.facebook.com/latest/home?asset_id=1073841119139682',
    isExternal: true,
    description: 'Publication & messagerie Instagram @heldonica',
  },
  {
    title: 'Instagram @heldonica',
    category: 'Meta & Video',
    url: 'https://www.instagram.com/heldonica/',
    isExternal: true,
    description: 'Profil slow travel, stories et publications',
  },
  {
    title: 'YouTube Studio (Creator)',
    category: 'Meta & Video',
    url: 'https://studio.youtube.com/channel/UCheldonica',
    isExternal: true,
    description: 'Gestion des vidéos, shorts et analyses d\'audience',
  },
  {
    title: 'Google Jules (Agent IA)',
    category: 'Agents IA',
    url: 'https://jules.google.com/',
    isExternal: true,
    description: 'Console agent async Google Cloud & dépôts',
  },
  {
    title: 'Donneur de tâches Jules & APIs',
    category: 'Agents IA',
    url: '/admin/task-giver',
    isExternal: false,
    description: 'Délégation de tâches vers Jules, Groq et Brain local',
  },
  {
    title: 'Moteur SEO & Géo OpenStreetMap',
    category: 'SEO & Géo',
    url: '/admin/seo-geo',
    isExternal: false,
    description: 'Coordonnées GPS, GeoJSON, altimétrie et balises Schema.org',
  },
  {
    title: 'Identité & Générateur de Logo',
    category: 'SEO & Géo',
    url: '/admin/branding',
    isExternal: false,
    description: 'Palette carnet, export vectoriel SVG et pack d\'icônes',
  },
  {
    title: 'Console Supabase',
    category: 'Système',
    url: 'https://supabase.com/dashboard/project/qgffqglzobzscvevhwlc',
    isExternal: true,
    description: 'PostgreSQL, Storage et authentification',
  },
  {
    title: 'Déploiements Vercel',
    category: 'Système',
    url: 'https://vercel.com/heldonica',
    isExternal: true,
    description: 'Builds Next.js de production et logs serveur',
  },
];

export function CreatorQuickDock() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Raccourci clavier Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const filteredLinks = QUICK_LINKS.filter((item) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
    );
  });

  return (
    <>
      {/* Bouton dock discret en bas à droite */}
      <aside aria-label="Lanceur rapide Créateur" className="fixed bottom-5 right-5 z-40">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-2 rounded-full border border-stone-300 bg-stone-900 text-stone-100 px-4 py-2.5 shadow-xl hover:bg-stone-800 active:scale-95 transition-all text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-eucalyptus"
          title="Accès rapide Créateur (Ctrl+K)"
        >
          <Compass className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>Hub Créateur</span>
          <span className="hidden sm:inline bg-stone-800 text-stone-300 px-1.5 py-0.5 rounded text-[10px] font-mono border border-stone-700">
            Ctrl+K
          </span>
        </button>
      </aside>

      {/* Modal Quick Dock */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-fadeIn">
          <div
            className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header recherche */}
            <div className="p-4 border-b border-stone-100 flex items-center gap-3 bg-stone-50/50">
              <Search className="w-5 h-5 text-stone-400 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher Search Console, Analytics, Meta, Jules, SEO..."
                className="w-full bg-transparent text-sm text-stone-900 placeholder-stone-400 focus:outline-none"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg hover:bg-stone-100 transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Liste des outils */}
            <div className="p-3 overflow-y-auto divide-y divide-stone-100 space-y-1">
              {filteredLinks.length === 0 ? (
                <div className="py-8 text-center text-stone-400 text-sm">
                  Aucun outil trouvé pour &laquo;&nbsp;{search}&nbsp;&raquo;.
                </div>
              ) : (
                filteredLinks.map((item) => {
                  const content = (
                    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-stone-100/80 transition-colors group cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors shrink-0">
                          {item.category === 'Google' && <BarChart3 className="w-4 h-4" />}
                          {item.category === 'Meta & Video' && <Globe className="w-4 h-4" />}
                          {item.category === 'Agents IA' && <Bot className="w-4 h-4" />}
                          {item.category === 'SEO & Géo' && <Zap className="w-4 h-4" />}
                          {item.category === 'Système' && <Database className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-stone-900 group-hover:text-emerald-800">
                              {item.title}
                            </span>
                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200">
                              {item.category}
                            </span>
                          </div>
                          <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-stone-400 group-hover:text-emerald-700">
                        {item.isExternal ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <span className="text-xs font-semibold">Ouvrir &rarr;</span>
                        )}
                      </div>
                    </div>
                  );

                  return item.isExternal ? (
                    <a
                      key={item.title}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsOpen(false)}
                      className="block"
                    >
                      {content}
                    </a>
                  ) : (
                    <Link
                      key={item.title}
                      href={item.url}
                      onClick={() => setIsOpen(false)}
                      className="block"
                    >
                      {content}
                    </Link>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Sessions Google &amp; Meta actives sans reconnexion
              </span>
              <span className="font-mono text-stone-400">Échap pour fermer</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
