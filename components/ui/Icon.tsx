'use client'

// Un seul endroit décide à quoi ressemble une icône.
//
// Le site portait ses pictos en emojis, jusque dans `cms_editable_zones` : le
// rendu dépendait donc de la police système de chaque visiteur, en couleur, à
// côté d'une direction artistique en Cloud Dancer et Warm Mahogany. On ne
// remplace pas les valeurs en base — on les traduit au rendu. Un emoji inconnu
// retombe sur lui-même plutôt que sur un carré vide, et un champ CMS qui
// contient déjà un emoji continue de fonctionner tel quel.

import {
  AlarmClock,
  Bath,
  BookOpen,
  Building2,
  CableCar,
  CalendarDays,
  Car,
  Castle,
  CheckCircle2,
  Clock,
  Coffee,
  Compass,
  Drama,
  Euro,
  Flag,
  Flame,
  Footprints,
  Gem,
  Gift,
  Globe,
  Grape,
  Heart,
  HeartHandshake,
  Hourglass,
  House,
  Landmark,
  Leaf,
  Lightbulb,
  Link,
  Mail,
  MailCheck,
  Map,
  MapPin,
  MessageCircle,
  Mountain,
  MountainSnow,
  NotebookPen,
  Palette,
  PersonStanding,
  Phone,
  Plane,
  Recycle,
  Search,
  Ship,
  Snail,
  Sparkles,
  Star,
  Sun,
  Sunrise,
  Target,
  Tent,
  TriangleAlert,
  Utensils,
  Waves,
  Wine,
  XCircle,
  Zap,
  type LucideIcon,
} from 'lucide-react'

/** Trait de dessin commun. 2 px (défaut Lucide) est trop lourd en 24 px éditorial. */
const STROKE = 1.5

/** Les emojis stockés en base peuvent porter un sélecteur de variante (U+FE0F). */
function normaliser(valeur: string): string {
  return valeur.replace(/\uFE0F/g, '').trim()
}

const PAR_EMOJI: Record<string, LucideIcon> = {
  '🏔': MountainSnow,
  '⛰': Mountain,
  '🏛': Landmark,
  '🗿': Landmark,
  '🌿': Leaf,
  '🍃': Leaf,
  '🌱': Leaf,
  '🧘': PersonStanding,
  '⏰': AlarmClock,
  '🚶': Footprints,
  '🏃': Footprints,
  '🐢': Snail,
  '☀': Sun,
  '🌅': Sunrise,
  '🏕': Tent,
  '🏰': Castle,
  '🏡': House,
  '🏠': House,
  '🏘': Building2,
  '🛁': Bath,
  '🎯': Target,
  '💬': MessageCircle,
  '✨': Sparkles,
  '📖': BookOpen,
  '📝': NotebookPen,
  '🌍': Globe,
  '🌎': Globe,
  '🌐': Globe,
  '🇪🇺': Flag,
  '💝': Heart,
  '💛': Heart,
  '💚': Heart,
  '💙': Heart,
  '🗺': Map,
  '📍': MapPin,
  '📅': CalendarDays,
  '💰': Euro,
  '💶': Euro,
  '💡': Lightbulb,
  '⭐': Star,
  '✈': Plane,
  '💑': HeartHandshake,
  '🧭': Compass,
  '🥂': Wine,
  '🍷': Wine,
  '💍': Gem,
  '💎': Gem,
  '🎭': Drama,
  '♻': Recycle,
  '🕯': Flame,
  '🕰': Clock,
  '📞': Phone,
  '✉': Mail,
  '📬': MailCheck,
  '🌊': Waves,
  '🏊': Waves,
  '🎨': Palette,
  '☕': Coffee,
  '🚡': CableCar,
  '🔗': Link,
  '🔍': Search,
  '⚡': Zap,
  '⚠': TriangleAlert,
  '⏳': Hourglass,
  '✅': CheckCircle2,
  '❌': XCircle,
  '🎁': Gift,
  '🌯': Utensils,
  '🚗': Car,
  '🚌': Car,
  '🍇': Grape,
  '🚢': Ship,
}

/**
 * Noms sémantiques, pour le code qui n'a jamais eu d'emoji et n'en veut pas.
 * `iconFor('leaf')` évite d'écrire un emoji dans une source neuve.
 */
const PAR_NOM: Record<string, LucideIcon> = {
  montagne: MountainSnow,
  mountain: MountainSnow,
  patrimoine: Landmark,
  landmark: Landmark,
  nature: Leaf,
  leaf: Leaf,
  bienetre: PersonStanding,
  personne: PersonStanding,
  temps: Clock,
  clock: Clock,
  rythme: AlarmClock,
  marche: Footprints,
  lenteur: Snail,
  soleil: Sun,
  saison: CalendarDays,
  calendrier: CalendarDays,
  budget: Euro,
  conseil: Lightbulb,
  avis: Star,
  etoile: Star,
  voyage: Plane,
  couple: HeartHandshake,
  boussole: Compass,
  carte: Map,
  adresse: MapPin,
  hebergement: House,
  gastronomie: Utensils,
  vin: Wine,
  email: Mail,
  telephone: Phone,
  lien: Link,
}

export function iconFor(valeur?: string | null): LucideIcon | null {
  if (!valeur) return null
  const brut = valeur.trim()
  const nu = normaliser(brut)
  return PAR_EMOJI[nu] ?? PAR_EMOJI[brut] ?? PAR_NOM[nu.toLowerCase()] ?? null
}

interface IconProps {
  /** Emoji historique, ou nom sémantique (`leaf`, `budget`…). */
  emoji?: string | null
  size?: number
  strokeWidth?: number
  className?: string
  /** Renseigné seulement si l'icône porte du sens : sinon elle est décorative. */
  label?: string
}

export function EmojiIcon({ emoji, size = 24, strokeWidth = STROKE, className = '', label }: IconProps) {
  const Picto = iconFor(emoji)

  if (!Picto) {
    if (!emoji) return null
    // Inconnu : on garde le glyphe plutôt que de laisser un trou.
    return (
      <span className={className} aria-hidden={label ? undefined : true} aria-label={label}>
        {emoji}
      </span>
    )
  }

  return (
    <Picto
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  )
}

interface StarsProps {
  value: number
  size?: number
  className?: string
}

/** Note en étoiles pleines, sans police emoji. */
export function Stars({ value, size = 14, className = '' }: StarsProps) {
  const note = Math.max(0, Math.min(5, Math.round(value)))

  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className}`}
      role="img"
      aria-label={`${note} sur 5`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={size}
          strokeWidth={STROKE}
          aria-hidden
          className={i < note ? 'fill-current' : 'opacity-25'}
        />
      ))}
    </span>
  )
}
