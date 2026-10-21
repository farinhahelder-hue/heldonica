import type { LucideIcon } from 'lucide-react'
import { FALLBACK_ICON, resolveIconName } from '@/lib/cms-icons'
import { ICON_REGISTRY } from '@/lib/icon-registry'

/**
 * Icône d'une zone CMS.
 *
 * Les zones `*_emoji` / `*_icon` / `*_badge` portaient un emoji en guise
 * d'icône. Comme `EditableZone` affiche la valeur de la base telle quelle,
 * l'emoji gagnait toujours sur le fallback JSX : changer le composant ne
 * changeait rien à l'écran. La base a été nettoyée par migration versionnée,
 * et ce composant traduit ce qui s'y trouve désormais — un nom d'icône lucide.
 *
 * Aucun emoji n'est jamais rendu : une valeur non reconnue retombe sur
 * `FALLBACK_ICON`. C'est le garde-fou visuel de la direction « carnet ».
 *
 * Rendu côté serveur, sans état : l'icône est dans le HTML initial.
 */
export default function CmsIcon({
  value,
  size = 24,
  className = '',
  strokeWidth = 1.25,
}: {
  /** Valeur brute de la zone (« Leaf », « Sparkles », ou un emoji résiduel). */
  value: string | null | undefined
  size?: number
  className?: string
  strokeWidth?: number
}) {
  const name = resolveIconName(value) ?? FALLBACK_ICON
  const Icon: LucideIcon = ICON_REGISTRY[name] ?? ICON_REGISTRY[FALLBACK_ICON]

  return (
    <Icon
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden="true"
      focusable="false"
    />
  )
}
