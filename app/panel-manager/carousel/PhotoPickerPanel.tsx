'use client'

import { useCallback, useEffect, useState } from 'react'

/**
 * Choix et upload d'une photo de fond pour une diapositive de carrousel.
 *
 * Permet :
 * 1. L'upload direct depuis l'appareil (galerie / appareil photo Android & mobile).
 * 2. La saisie d'une URL d'image directe.
 * 3. La sélection depuis la médiathèque (Supabase Storage destinations / articles).
 */

type Media = { nom: string; url: string; date?: string }

type Props = {
  valeur?: string
  onChoisir: (url: string | undefined) => void
  onAttribuerToutes?: (urls: string[]) => void
}

const DESTINATIONS = ['Toutes', 'Suisse', 'Madère', 'Roumanie', 'Monténégro']

export default function PhotoPickerPanel({ valeur, onChoisir, onAttribuerToutes }: Props) {
  const [ouvert, setOuvert] = useState(false)
  const [medias, setMedias] = useState<Media[]>([])
  const [dossier, setDossier] = useState<'destinations' | 'articles'>('destinations')
  const [chargement, setChargement] = useState(false)
  const [uploadEnCours, setUploadEnCours] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)
  const [urlSaisie, setUrlSaisie] = useState('')
  
  // Nouveaux états pour le filtrage, tri et recherche
  const [filtreDestination, setFiltreDestination] = useState('Toutes')
  const [recherche, setRecherche] = useState('')
  const [triPlusRecent, setTriPlusRecent] = useState(true)

  const charger = useCallback(async (prefixe: string) => {
    setChargement(true)
    setErreur(null)
    try {
      const res = await fetch(`/api/cms/media?prefix=${prefixe}`)
      if (!res.ok) throw new Error(`Médiathèque indisponible (${res.status})`)
      const data = await res.json()
      const fichiers: any[] = data.files ?? data.media ?? []

      setMedias(
        fichiers
          // Les vidéos du même dossier ne peuvent pas servir de fond fixe.
          .filter(f => /\.(jpe?g|png|webp|avif)$/i.test(f.name ?? f.filename ?? ''))
          .map(f => ({ nom: f.name ?? f.filename, url: f.url, date: f.lastModified }))
      )
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Chargement impossible')
    } finally {
      setChargement(false)
    }
  }, [])

  useEffect(() => {
    if (ouvert) charger(dossier)
  }, [ouvert, dossier, charger])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setUploadEnCours(true)
    setErreur(null)

    try {
      for (const file of files) {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('folder', dossier)

        const res = await fetch('/api/cms/media-upload', {
          method: 'POST',
          body: fd,
        })

        const data = await res.json().catch(() => ({}))
        if (!res.ok || !data.url) {
          throw new Error(data.error || `Erreur d'envoi pour ${file.name}`)
        }

        // Ajouter aux médias connus et sélectionner automatiquement
        const nouveauMedia = { nom: file.name, url: data.url, date: new Date().toISOString() }
        setMedias(prev => [nouveauMedia, ...prev.filter(m => m.url !== data.url)])
        onChoisir(data.url)
      }
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Impossible d'envoyer la photo")
    } finally {
      setUploadEnCours(false)
      e.target.value = ''
    }
  }

  const appliquerUrl = () => {
    const clean = urlSaisie.trim()
    if (!clean) return
    onChoisir(clean)
    setUrlSaisie('')
  }
  
  // Calculer les médias filtrés et triés
  const mediasAffiches = medias
    .filter(m => {
      // Filtre destination
      if (filtreDestination !== 'Toutes') {
        // Enlève les accents pour comparer ou utilise une recherche simple
        const dest = filtreDestination.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        const nom = m.nom.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        const url = m.url.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        if (!nom.includes(dest) && !url.includes(dest)) {
          return false
        }
      }
      
      // Filtre recherche rapide (nom ou date)
      if (recherche.trim() !== '') {
        const query = recherche.toLowerCase()
        const nom = m.nom.toLowerCase()
        const dateStr = m.date ? m.date.toLowerCase() : ''
        if (!nom.includes(query) && !dateStr.includes(query)) {
          return false
        }
      }
      
      return true
    })
    .sort((a, b) => {
      // Tri par date
      const dateA = a.date ? new Date(a.date).getTime() : 0
      const dateB = b.date ? new Date(b.date).getTime() : 0
      
      return triPlusRecent ? dateB - dateA : dateA - dateB
    })

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setOuvert(o => !o)}
          className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:border-eucalyptus hover:text-eucalyptus transition flex items-center gap-2"
        >
          📷 {valeur ? 'Changer la photo' : 'Ajouter / Photo de fond'}
        </button>

        {valeur && (
          <div className="flex items-center gap-2">
            <a
              href={`/panel-manager/brain?url=${encodeURIComponent(valeur)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition flex items-center gap-1.5"
            >
              🧠 Analyser avec le Brain
            </a>
            <button
              type="button"
              onClick={() => onChoisir(undefined)}
              className="text-sm text-stone-500 underline hover:text-stone-700"
            >
              Retirer
            </button>
          </div>
        )}
      </div>

      {ouvert && (
        <div className="mt-3 rounded-2xl border border-stone-200 bg-white p-4 space-y-4">
          {/* Section 1 : Upload direct depuis l'appareil (Mobile Android / Camera / Galerie) */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
            <p className="text-xs font-semibold text-stone-700 mb-2">📱 Depuis votre appareil (Android / Galerie)</p>
            <label className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition cursor-pointer ${
              uploadEnCours ? 'bg-stone-400 cursor-wait' : 'bg-[#6b2a1a] hover:bg-[#522014]'
            }`}>
              {uploadEnCours ? '⏳ Transfert en cours…' : '⬆️ Uploader des photos de votre téléphone'}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                disabled={uploadEnCours}
                className="hidden"
              />
            </label>
          </div>

          {/* Section 2 : Coller une URL */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
            <p className="text-xs font-semibold text-stone-700 mb-2">🔗 Ou par URL d&apos;image</p>
            <div className="flex gap-2">
              <input
                type="url"
                value={urlSaisie}
                onChange={e => setUrlSaisie(e.target.value)}
                placeholder="https://..."
                className="flex-1 px-3 py-1.5 text-xs border border-stone-300 rounded-lg"
              />
              <button
                type="button"
                onClick={appliquerUrl}
                disabled={!urlSaisie.trim()}
                className="px-3 py-1.5 bg-stone-800 text-white text-xs rounded-lg disabled:opacity-50"
              >
                Appliquer
              </button>
            </div>
          </div>

          {/* Section 3 : Médiathèque Supabase */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-stone-700">🖼️ Médiathèque du site</p>
              <div className="flex gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setDossier('destinations')}
                  className={`px-2 py-1 rounded ${dossier === 'destinations' ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600'}`}
                >
                  Destinations
                </button>
                <button
                  type="button"
                  onClick={() => setDossier('articles')}
                  className={`px-2 py-1 rounded ${dossier === 'articles' ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600'}`}
                >
                  Articles
                </button>
              </div>
            </div>

            {chargement && <p className="text-xs text-stone-500">Chargement des photos…</p>}

            {erreur && (
              <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">{erreur}</p>
            )}

            {/* Barre de filtres et recherche */}
            {medias.length > 0 && (
              <div className="mb-4 space-y-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
                {/* Destinations */}
                <div className="flex flex-wrap gap-2">
                  {DESTINATIONS.map(dest => (
                    <button
                      key={dest}
                      type="button"
                      onClick={() => setFiltreDestination(dest)}
                      className={`px-3 py-1 text-xs font-medium rounded-full border transition ${
                        filtreDestination === dest
                          ? 'bg-eucalyptus text-white border-eucalyptus'
                          : 'bg-white text-stone-600 border-stone-300 hover:border-eucalyptus hover:text-eucalyptus'
                      }`}
                    >
                      {dest}
                    </button>
                  ))}
                </div>
                
                {/* Recherche et Tri */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={recherche}
                    onChange={e => setRecherche(e.target.value)}
                    placeholder="🔍 Rechercher (nom, date)..."
                    className="flex-1 px-3 py-1.5 text-xs border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-eucalyptus/50"
                  />
                  <button
                    type="button"
                    onClick={() => setTriPlusRecent(!triPlusRecent)}
                    className="px-3 py-1.5 bg-white border border-stone-300 text-stone-600 text-xs font-medium rounded-lg hover:border-eucalyptus hover:text-eucalyptus transition whitespace-nowrap"
                  >
                    {triPlusRecent ? '⬇️ Plus récent' : '⬆️ Plus ancien'}
                  </button>
                </div>
              </div>
            )}

            {!chargement && !erreur && medias.length === 0 && (
              <p className="text-xs text-stone-500">
                Aucune photo dans ce dossier. Utilisez le bouton d&apos;upload ci-dessus pour en ajouter depuis votre téléphone.
              </p>
            )}
            
            {!chargement && !erreur && medias.length > 0 && mediasAffiches.length === 0 && (
              <p className="text-xs text-stone-500">
                Aucune photo ne correspond à vos filtres.
              </p>
            )}

            {mediasAffiches.length > 0 && (
              <>
                {onAttribuerToutes && (
                  <button
                    type="button"
                    onClick={() => {
                      onAttribuerToutes(mediasAffiches.map(m => m.url))
                      setOuvert(false)
                    }}
                    className="mb-2 w-full text-center text-xs font-semibold text-[#6b2a1a] bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition"
                  >
                    ✨ Distribuer 1 photo par diapositive ({mediasAffiches.length} disponible{mediasAffiches.length > 1 ? 's' : ''})
                  </button>
                )}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-56 overflow-y-auto">
                {mediasAffiches.map(m => (
                  <button
                    key={m.url}
                    type="button"
                    onClick={() => { onChoisir(m.url); setOuvert(false) }}
                    title={m.nom}
                    className={`aspect-square rounded-lg bg-cover bg-center border-2 transition ${
                      valeur === m.url ? 'border-eucalyptus ring-2 ring-eucalyptus/30' : 'border-transparent hover:border-stone-300'
                    }`}
                    style={{ backgroundImage: `url(${m.url})` }}
                  />
                ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
