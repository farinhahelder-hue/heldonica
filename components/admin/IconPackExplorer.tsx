'use client'

import React, { useState, useMemo } from 'react'
import {
  Search,
  Copy,
  Check,
  Compass,
  Hotel,
  BedDouble,
  Home,
  DoorOpen,
  Bath,
  Train,
  Bike,
  Footprints,
  Car,
  MapPin,
  Map,
  Navigation,
  Wine,
  Coffee,
  Utensils,
  Grape,
  Croissant,
  Wheat,
  Fish,
  Leaf,
  Mountain,
  Sun,
  CloudRain,
  Snowflake,
  Flower2,
  TreePine,
  Droplet,
  ShieldCheck,
  Heart,
  HeartHandshake,
  Award,
  Sparkles,
  CheckCircle2,
  Calendar,
  Clock,
  Camera,
  BookOpen,
  Bookmark,
  Sparkle,
  type LucideIcon,
} from 'lucide-react'

interface IconItem {
  name: string
  label: string
  category: 'hospitality' | 'mobility' | 'terroir' | 'nature' | 'assurance'
  component: LucideIcon
  keywords: string[]
}

const ICONS_CATALOG: IconItem[] = [
  // Hospitalité & Hébergement
  { name: 'Hotel', label: 'Hôtel Singulier', category: 'hospitality', component: Hotel, keywords: ['hotel', 'chambre', 'hebergement', 'relais', 'chateau'] },
  { name: 'BedDouble', label: 'Lit & Suite', category: 'hospitality', component: BedDouble, keywords: ['lit', 'chambre', 'sommeil', 'repos', 'nuit'] },
  { name: 'Home', label: 'Maison d’hôtes', category: 'hospitality', component: Home, keywords: ['maison', 'hotes', 'terroir', 'gite'] },
  { name: 'DoorOpen', label: 'Accueil / Porte', category: 'hospitality', component: DoorOpen, keywords: ['porte', 'accueil', 'arrivee', 'entree'] },
  { name: 'Bath', label: 'Bain & Détente', category: 'hospitality', component: Bath, keywords: ['bain', 'spa', 'eau', 'douche', 'relaxation'] },

  // Mobilité douce & Itinéraire
  { name: 'Train', label: 'Train & Rail', category: 'mobility', component: Train, keywords: ['train', 'gare', 'rail', 'slow travel', 'sncf', 'voyage'] },
  { name: 'Compass', label: 'Boussole', category: 'mobility', component: Compass, keywords: ['boussole', 'orientation', 'direction', 'nord', 'guide'] },
  { name: 'Bike', label: 'Vélo & Mobilité', category: 'mobility', component: Bike, keywords: ['velo', 'bicyclette', 'piste', 'cyclable'] },
  { name: 'Footprints', label: 'Marche & Sentier', category: 'mobility', component: Footprints, keywords: ['marche', 'pas', 'sentier', 'randonnee', 'flanerie'] },
  { name: 'MapPin', label: 'Point d’intérêt', category: 'mobility', component: MapPin, keywords: ['lieu', 'geo', 'position', 'adresse', 'spot'] },
  { name: 'Map', label: 'Carte & Relief', category: 'mobility', component: Map, keywords: ['carte', 'itineraire', 'territoire', 'topo'] },
  { name: 'Navigation', label: 'Navigation douce', category: 'mobility', component: Navigation, keywords: ['gps', 'cap', 'trajet', 'etape'] },
  { name: 'Car', label: 'Route panoramique', category: 'mobility', component: Car, keywords: ['voiture', 'route', 'panoramique', 'corniche'] },

  // Terroir & Gastronomie
  { name: 'Wine', label: 'Vignoble & Vin', category: 'terroir', component: Wine, keywords: ['vin', 'vignoble', 'degustation', 'cave', 'verre'] },
  { name: 'Grape', label: 'Raisin & Terroir', category: 'terroir', component: Grape, keywords: ['raisin', 'vigne', 'vendange', 'terroir'] },
  { name: 'Coffee', label: 'Café & Torréfaction', category: 'terroir', component: Coffee, keywords: ['cafe', 'pause', 'matin', 'artisan'] },
  { name: 'Utensils', label: 'Table d’auteur', category: 'terroir', component: Utensils, keywords: ['restaurant', 'repas', 'diner', 'artisanat'] },
  { name: 'Croissant', label: 'Petit-déjeuner', category: 'terroir', component: Croissant, keywords: ['pain', 'viennoiserie', 'boulangerie', 'matin'] },
  { name: 'Wheat', label: 'Céréale & Moisson', category: 'terroir', component: Wheat, keywords: ['ble', 'champs', 'agriculture', 'farine'] },
  { name: 'Fish', label: 'Criée & Pêche', category: 'terroir', component: Fish, keywords: ['poisson', 'mer', 'peche', 'cote'] },

  // Nature & Éléments
  { name: 'Leaf', label: 'Feuille & Végétal', category: 'nature', component: Leaf, keywords: ['feuille', 'nature', 'eucalyptus', 'plante', 'bio'] },
  { name: 'TreePine', label: 'Forêt & Pins', category: 'nature', component: TreePine, keywords: ['arbre', 'foret', 'pin', 'montagne', 'boise'] },
  { name: 'Mountain', label: 'Relief & Sommet', category: 'nature', component: Mountain, keywords: ['montagne', 'alpes', 'sommet', 'vallee', 'altitude'] },
  { name: 'Sun', label: 'Soleil & Clarté', category: 'nature', component: Sun, keywords: ['soleil', 'climat', 'lumiere', 'ete', 'chaleur'] },
  { name: 'CloudRain', label: 'Pluie & Saison', category: 'nature', component: CloudRain, keywords: ['pluie', 'nuage', 'meteo', 'automne'] },
  { name: 'Snowflake', label: 'Hiver & Neige', category: 'nature', component: Snowflake, keywords: ['neige', 'hiver', 'froid', 'glace'] },
  { name: 'Flower2', label: 'Flore locale', category: 'nature', component: Flower2, keywords: ['fleur', 'flore', 'printemps', 'jardin'] },
  { name: 'Droplet', label: 'Source & Eau', category: 'nature', component: Droplet, keywords: ['eau', 'source', 'purete', 'riviere'] },

  // Réassurance & Carnet
  { name: 'ShieldCheck', label: 'Vérification Terrain', category: 'assurance', component: ShieldCheck, keywords: ['verifie', 'terrain', 'garantie', 'audit', 'confiance'] },
  { name: 'HeartHandshake', label: 'Regard Bienveillant', category: 'assurance', component: HeartHandshake, keywords: ['couple', 'partenaire', 'confiance', 'harmonie'] },
  { name: 'Heart', label: 'Coup de Cœur', category: 'assurance', component: Heart, keywords: ['amour', 'couple', 'passion', 'slow travel'] },
  { name: 'Award', label: 'Distinction d’Hôte', category: 'assurance', component: Award, keywords: ['prix', 'label', 'excellence', 'qualite'] },
  { name: 'Sparkles', label: 'Singularité', category: 'assurance', component: Sparkles, keywords: ['secret', 'magie', 'pepite', 'authentique'] },
  { name: 'CheckCircle2', label: 'Validé en personne', category: 'assurance', component: CheckCircle2, keywords: ['valide', 'fait', 'verifie', 'exif'] },
  { name: 'Calendar', label: 'Saisonnalité', category: 'assurance', component: Calendar, keywords: ['date', 'saison', 'planning', 'periode'] },
  { name: 'Clock', label: 'Rythme & Temps doux', category: 'assurance', component: Clock, keywords: ['temps', 'heure', 'rythme', 'ralentir', 'matin'] },
  { name: 'Camera', label: 'Preuve Photographique', category: 'assurance', component: Camera, keywords: ['photo', 'exif', 'cliche', 'pellicule', 'reel'] },
  { name: 'BookOpen', label: 'Carnet de route', category: 'assurance', component: BookOpen, keywords: ['carnet', 'guide', 'lecture', 'recit'] },
]

export default function IconPackExplorer() {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [copiedIcon, setCopiedIcon] = useState<string | null>(null)
  const [colorTone, setColorTone] = useState<'eucalyptus' | 'mahogany' | 'charcoal'>('eucalyptus')
  const [iconSize, setIconSize] = useState<number>(24)

  const filteredIcons = useMemo(() => {
    return ICONS_CATALOG.filter((item) => {
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory
      if (!matchCat) return false
      if (!search.trim()) return true
      const q = search.toLowerCase().trim()
      return (
        item.name.toLowerCase().includes(q) ||
        item.label.toLowerCase().includes(q) ||
        item.keywords.some((k) => k.includes(q))
      )
    })
  }, [search, selectedCategory])

  const copyToClipboard = async (name: string, format: 'name' | 'jsx') => {
    const text = format === 'name' ? name : `<CmsIcon name="${name}" size={${iconSize}} />`
    await navigator.clipboard.writeText(text)
    setCopiedIcon(name)
    setTimeout(() => setCopiedIcon(null), 2000)
  }

  const colorClass =
    colorTone === 'eucalyptus'
      ? 'text-eucalyptus'
      : colorTone === 'mahogany'
      ? 'text-mahogany'
      : 'text-charcoal'

  return (
    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#241D1A] font-serif flex items-center gap-2">
            <Compass size={20} className="shrink-0" aria-hidden="true" /> Pack d&apos;Icônes Voyage Slow Travel
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Collection de pictogrammes nobles intégrés au CMS. Cliquez sur une icône pour copier son identifiant.
          </p>
        </div>

        {/* Contrôles de prévisualisation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setColorTone('eucalyptus')}
              className={`px-2.5 py-1 rounded transition-colors ${
                colorTone === 'eucalyptus' ? 'bg-white text-eucalyptus font-semibold shadow-2xs' : 'text-stone-500'
              }`}
            >
              Eucalyptus
            </button>
            <button
              type="button"
              onClick={() => setColorTone('mahogany')}
              className={`px-2.5 py-1 rounded transition-colors ${
                colorTone === 'mahogany' ? 'bg-white text-mahogany font-semibold shadow-2xs' : 'text-stone-500'
              }`}
            >
              Terre cuite
            </button>
            <button
              type="button"
              onClick={() => setColorTone('charcoal')}
              className={`px-2.5 py-1 rounded transition-colors ${
                colorTone === 'charcoal' ? 'bg-white text-charcoal font-semibold shadow-2xs' : 'text-stone-500'
              }`}
            >
              Charbon
            </button>
          </div>

          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg text-xs">
            {[18, 24, 32].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setIconSize(s)}
                className={`px-2 py-1 rounded transition-colors ${
                  iconSize === s ? 'bg-white text-charcoal font-semibold shadow-2xs' : 'text-stone-500'
                }`}
              >
                {s}px
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Barre de recherche et catégories */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une icône (ex: train, vin, boussole, lit, arbre)..."
            className="w-full pl-9 pr-4 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-eucalyptus/30 focus:border-eucalyptus"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'Tout' },
            { id: 'hospitality', label: 'Hospitalité' },
            { id: 'mobility', label: 'Mobilité' },
            { id: 'terroir', label: 'Terroir' },
            { id: 'nature', label: 'Nature' },
            { id: 'assurance', label: 'Réassurance' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-eucalyptus text-white font-medium'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grille d'icônes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filteredIcons.map((item) => {
          const IconComp = item.component
          const isCopied = copiedIcon === item.name

          return (
            <div
              key={item.name}
              className="group relative p-4 rounded-xl border border-stone-100 bg-[#FAF7F2]/60 hover:bg-white hover:border-eucalyptus/40 transition-all flex flex-col items-center justify-center text-center cursor-pointer shadow-2xs hover:shadow-xs"
              onClick={() => copyToClipboard(item.name, 'name')}
            >
              <div className="h-10 flex items-center justify-center mb-2">
                <IconComp
                  size={iconSize}
                  strokeWidth={1.25}
                  className={`${colorClass} transition-transform group-hover:scale-110`}
                />
              </div>

              <span className="text-xs font-semibold text-charcoal truncate w-full">
                {item.name}
              </span>
              <span className="text-[10px] text-stone-400 truncate w-full mt-0.5">
                {item.label}
              </span>

              {/* Notification Copié */}
              {isCopied && (
                <div className="absolute inset-0 rounded-xl bg-eucalyptus/95 text-white flex flex-col items-center justify-center text-xs font-semibold animate-in fade-in zoom-in-95 duration-150">
                  <Check className="w-5 h-5 mb-1" />
                  <span>Copié !</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filteredIcons.length === 0 && (
        <div className="text-center py-12 text-stone-400 text-sm">
          Aucune icône ne correspond à votre recherche « {search} ».
        </div>
      )}

      {/* Guide d'utilisation CMS */}
      <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#DED5C6] flex items-center justify-between text-xs text-charcoal/75">
        <div className="flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-eucalyptus" />
          <span>
            <strong>Astuce CMS :</strong> Pour utiliser une icône dans une zone modifiable (ex: <code>destination_badge_icon</code>), copiez simplement son nom (ex: <code>Compass</code>).
          </span>
        </div>
      </div>
    </div>
  )
}
