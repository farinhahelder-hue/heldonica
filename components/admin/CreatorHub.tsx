'use client'

import React, { useState } from 'react'
import {
  ExternalLink,
  BarChart3,
  Search,
  Bot,
  Database,
  Cloud,
  MapPin,
  Globe,
  Radio,
  ArrowUpRight,
  ShieldCheck,
  Zap, Rocket } from 'lucide-react'

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
)

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" />
  </svg>
)

export interface HubService {
  id: string
  name: string
  category: 'analytics' | 'social' | 'ai' | 'infra'
  description: string
  url: string
  icon: React.ElementType
  color: string
  badge?: string
  directAccessTip?: string
}

export const HUB_SERVICES: HubService[] = [
  {
    id: 'gsc',
    name: 'Google Search Console',
    category: 'analytics',
    description: 'Indexation, requêtes de recherche, impressions & clics Google',
    url: 'https://search.google.com/search-console?resource_id=https://www.heldonica.fr/',
    icon: Search,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    badge: 'SEO Google',
    directAccessTip: 'Connecté directement à votre compte Google Workspace/Gmail.',
  },
  {
    id: 'ga4',
    name: 'Google Analytics 4',
    category: 'analytics',
    description: 'Trafic temps réel, conversion travel-planning & comportement visiteurs',
    url: 'https://analytics.google.com/analytics/web/',
    icon: BarChart3,
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    badge: 'G-JDJNTZLBJS',
    directAccessTip: 'Ouverture directe du rapport d’engagement temps réel.',
  },
  {
    id: 'meta_business',
    name: 'Meta Business Suite',
    category: 'social',
    description: 'Planification Instagram & Facebook, boîte de réception et insights',
    url: 'https://business.facebook.com/latest/home',
    icon: Globe,
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    badge: 'Meta Suite',
    directAccessTip: 'Gestion centralisée du compte @heldonica sans mot de passe répété.',
  },
  {
    id: 'instagram',
    name: 'Instagram (@heldonica)',
    category: 'social',
    description: 'Profil public, carnets photos et interactions avec la communauté',
    url: 'https://www.instagram.com/heldonica/',
    icon: InstagramIcon,
    color: 'text-pink-600 bg-pink-50 border-pink-200',
    badge: '@heldonica',
  },
  {
    id: 'youtube_studio',
    name: 'YouTube Studio (Creator)',
    category: 'social',
    description: 'Médiathèque vidéo, statistiques d’audience, shorts et sous-titres',
    url: 'https://studio.youtube.com/',
    icon: YoutubeIcon,
    color: 'text-red-600 bg-red-50 border-red-200',
    badge: 'Creator Studio',
  },
  {
    id: 'jules',
    name: 'Google Jules Agent',
    category: 'ai',
    description: 'Console agentique officielle Google pour le dépôt GitHub Heldonica',
    url: 'https://jules.google.com/',
    icon: Bot,
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    badge: 'Sessions Actives',
    directAccessTip: 'Accès direct aux PRs et commits générés par Jules.',
  },
  {
    id: 'supabase',
    name: 'Supabase Dashboard',
    category: 'infra',
    description: 'Base de données PostgreSQL, Storage photos, RLS et migrations',
    url: 'https://supabase.com/dashboard/',
    icon: Database,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    badge: 'Production DB',
  },
  {
    id: 'vercel',
    name: 'Vercel Deployments',
    category: 'infra',
    description: 'Logs serveur Next.js, Edge Functions, vitesse d’affichage et CDN',
    url: 'https://vercel.com/farinhahelder-hues-projects/heldonica',
    icon: Cloud,
    color: 'text-stone-800 bg-stone-100 border-stone-200',
    badge: 'Déploiement Vercel',
  },
  {
    id: 'osm',
    name: 'OpenStreetMap Nominatim',
    category: 'analytics',
    description: 'Explorateur de coordonnées GPS, polygones et géocodage libre 0€',
    url: 'https://www.openstreetmap.org/',
    icon: MapPin,
    color: 'text-teal-600 bg-teal-50 border-teal-200',
    badge: 'Cartographie Libre',
  },
]

export default function CreatorHub() {
  const [selectedCat, setSelectedCat] = useState<'all' | 'analytics' | 'social' | 'ai' | 'infra'>('all')

  const filtered = HUB_SERVICES.filter(
    (s) => selectedCat === 'all' || s.category === selectedCat
  )

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#241D1A] font-serif flex items-center gap-2">
            <Rocket size={20} className="shrink-0" aria-hidden="true" /> Hub Créateur & Accès Direct aux Suites d&apos;Outils
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Accès direct sans ressaisie aux plateformes de pilotage : Google Search Console, Analytics, Meta Business, YouTube Creator, Jules &amp; Supabase.
          </p>
        </div>

        {/* Filtres par univers */}
        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl text-xs">
          {[
            { id: 'all', label: 'Tous' },
            { id: 'analytics', label: 'Google & SEO' },
            { id: 'social', label: 'Réseaux & Vidéo' },
            { id: 'ai', label: 'IA & Jules' },
            { id: 'infra', label: 'Infrastructure' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCat(cat.id as any)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                selectedCat === cat.id
                  ? 'bg-white text-charcoal shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grille des lanceurs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((s) => {
          const IconComp = s.icon
          return (
            <a
              key={s.id}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs hover:shadow-md hover:border-eucalyptus/50 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${s.color}`}>
                  <IconComp className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div className="flex items-center gap-1.5">
                  {s.badge && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200 font-mono">
                      {s.badge}
                    </span>
                  )}
                  <div className="w-6 h-6 rounded-lg bg-stone-50 group-hover:bg-eucalyptus group-hover:text-white flex items-center justify-center text-stone-400 transition-colors">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              <h3 className="text-sm font-bold text-charcoal group-hover:text-eucalyptus transition-colors font-serif">
                {s.name}
              </h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                {s.description}
              </p>

              {s.directAccessTip && (
                <div className="mt-3 pt-2.5 border-t border-stone-100 text-[11px] text-stone-400 flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-amber-600 shrink-0" />
                  <span className="truncate">{s.directAccessTip}</span>
                </div>
              )}
            </a>
          )
        })}
      </div>

      {/* Bannière de persistance de session */}
      <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#DED5C6] flex items-center justify-between text-xs text-charcoal/80">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-eucalyptus shrink-0" />
          <span>
            <strong>Astuce Session Permanente :</strong> Vos comptes Google, Meta et YouTube restent connectés dans votre navigateur Chrome. Les liens ci-dessus ouvrent directement les tableaux de bord authentifiés sans passer par la page de connexion.
          </span>
        </div>
      </div>
    </div>
  )
}
