import { ICON_REGISTRY } from '@/lib/icon-registry'

/**
 * Notation en étoiles, rendue en icônes (et non en emoji ⭐).
 * L'étoile emoji s'affichait dans une couleur et une taille qu'on ne
 * maîtrisait pas ; ici elle hérite de la couleur du texte.
 */
export default function StarRating({
  value,
  max = 5,
  size = 14,
}: {
  value: number
  max?: number
  size?: number
}) {
  const Star = ICON_REGISTRY.Star
  const filled = Math.max(0, Math.min(max, Math.round(value)))
  return (
    <span
      className="inline-flex items-center gap-0.5 align-middle"
      role="img"
      aria-label={`${filled} sur ${max}`}
    >
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          size={size}
          strokeWidth={1.5}
          aria-hidden="true"
          className={i < filled ? 'fill-current text-amber-500' : 'text-stone-300'}
        />
      ))}
    </span>
  )
}
