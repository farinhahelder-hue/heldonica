'use client'

import { Star, MapPin, Heart, ThumbsUp } from 'lucide-react'

interface HeldonicaProofProps {
  type: 'tested' | 'pepite' | 'verdict'
  location?: string
  rating?: number
  size?: 'sm' | 'md' | 'lg'
}

export default function HeldonicaProof({ type, location, rating = 5, size = 'md' }: HeldonicaProofProps) {
  const sizes = { sm: 'text-xs px-2 py-1', md: 'text-sm px-3 py-1.5', lg: 'text-base px-4 py-2' }
  const iconSizes = { sm: 12, md: 14, lg: 16 }
  const starSizes = { sm: 10, md: 12, lg: 14 }

  if (type === 'tested') {
    return (
      <span className={`inline-flex items-center gap-1.5 bg-teal/10 text-eucalyptus font-medium rounded-full ${sizes[size]}`}>
        <MapPin size={iconSizes[size]} />
        <span>Testé par Heldonica {location && ` • ${location}`}</span>
      </span>
    )
  }

  if (type === 'pepite' || type === 'verdict') {
    const stars = type === 'verdict' ? Array.from({ length: 5 }, (_, i) => i < rating) : []
    return (
      <span className={`inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 font-medium rounded-full ${sizes[size]}`}>
        {type === 'pepite' ? <Heart size={iconSizes[size]} className="fill-amber-500" /> : <ThumbsUp size={iconSizes[size]} />}
        <span>{type === 'pepite' ? 'Pépite' : 'Verdict Heldonica'}{location && ` • ${location}`}</span>
        {type === 'verdict' && (
          <span className="flex gap-0.5 ml-1">
            {stars.map((filled, i) => (
              <Star key={i} size={starSizes[size]} className={filled ? 'fill-eucalyptus text-eucalyptus' : 'text-stone-300'} />
            ))}
          </span>
        )}
      </span>
    )
  }

  return null
}