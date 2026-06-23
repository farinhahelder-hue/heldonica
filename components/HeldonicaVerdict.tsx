interface VerdictItem {
  /** Nom du lieu ou de l’expérience */
  name: string
  /** Adresse complète (optionnel) */
  address?: string
  /** Horaires d’ouverture (optionnel) */
  hours?: string
  /** Prix constaté (optionnel, ex: "15€") */
  price?: string
  /** Date du test terrain */
  testDate: string
  /** Note sur 5 (1-5) */
  rating: number
  /** Commentaire terrain (optionnel) */
  comment?: string
}

interface HeldonicaVerdictProps {
  items: VerdictItem[]
  title?: string
}

/**
 * Composant Verdict Heldonica pour les recommandations terrain en fin d’article
 * Affiche les infos pratiques testées sur le terrain: adresse, horaires, prix, date, note
 */
export default function HeldonicaVerdict({ items, title = 'Le verdict Heldonica' }: HeldonicaVerdictProps) {
  if (!items || items.length === 0) return null

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
    
    return (
      <div className="flex items-center gap-1">
        {[...Array(fullStars)].map((_, i) => (
          <svg key={`full-${i}`} className="h-4 w-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        {hasHalfStar && (
          <svg className="h-4 w-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
            <defs>
              <linearGradient id="halfGradient">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="#e5e7eb" />
              </linearGradient>
            </defs>
            <path fill="url(#halfGradient)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <svg key={`empty-${i}`} className="h-4 w-4 text-stone-300" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    )
  }

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('fr-FR', { 
        month: 'long', 
        year: 'numeric' 
      })
    } catch {
      return dateStr
    }
  }

  return (
    <section className="my-12 rounded-[2rem] border-2 border-amber-200 bg-amber-50/50 px-6 py-8 md:px-10">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-white">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Testé sur le terrain</p>
          <h2 className="text-xl font-serif font-light text-stone-900 md:text-2xl">{title}</h2>
        </div>
      </div>

      {/* Items list */}
      <div className="space-y-6">
        {items.map((item, index) => (
          <div
            key={index}
            className="rounded-xl border border-amber-100 bg-white p-5"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              {/* Left: name and details */}
              <div className="flex-1">
                <h3 className="text-base font-semibold text-stone-900">{item.name}</h3>
                
                <div className="mt-2 space-y-1 text-sm text-stone-600">
                  {item.address && (
                    <div className="flex items-start gap-2">
                      <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{item.address}</span>
                    </div>
                  )}
                  {item.hours && (
                    <div className="flex items-start gap-2">
                      <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{item.hours}</span>
                    </div>
                  )}
                  {item.price && (
                    <div className="flex items-start gap-2">
                      <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Prix constaté : {item.price}</span>
                    </div>
                  )}
                </div>
                
                {item.comment && (
                  <p className="mt-3 text-sm italic text-stone-500">{item.comment}</p>
                )}
              </div>

              {/* Right: rating and date */}
              <div className="flex flex-col items-end gap-2 md:min-w-[120px]">
                <div className="flex items-center gap-1">
                  {renderStars(item.rating)}
                  <span className="ml-1 text-sm font-semibold text-amber-700">{item.rating}/5</span>
                </div>
                <p className="text-xs text-stone-400">Testé {formatDate(item.testDate)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <p className="mt-6 text-xs text-stone-400">
        Tous nos verdicts sont basés sur des visites terrain réels. Les prix et horaires peuvent évoluer — vérifiez avant de vous déplacer.
      </p>
    </section>
  )
}