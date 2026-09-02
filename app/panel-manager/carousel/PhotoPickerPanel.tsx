'use client'

import { useCallback, useEffect, useState } from 'react'

/**
 * Choix d'une photo de fond pour une diapositive, depuis les médias rapatriés
 * de Google Photos.
 *
 * Le champ `image` de SlideData était rendu partout — aperçu, pellicule et
 * export — mais aucune interface ne permettait de le renseigner : les
 * carrousels restaient donc sans photo. Ce panneau comble ce manque.
 */

type Media = { nom: string; url: string }

type Props = {
  valeur?: string
  onChoisir: (url: string | undefined) => void
}

export default function PhotoPickerPanel({ valeur, onChoisir }: Props) {
  const [ouvert, setOuvert] = useState(false)
  const [medias, setMedias] = useState<Media[]>([])
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  const charger = useCallback(async () => {
    setChargement(true)
    setErreur(null)
    try {
      const res = await fetch('/api/cms/media?folder=destinations')
      if (!res.ok) throw new Error(`Médiathèque indisponible (${res.status})`)
      const data = await res.json()
      const fichiers: any[] = data.files ?? data.media ?? []

      setMedias(
        fichiers
          // Les vidéos du même dossier ne peuvent pas servir de fond fixe.
          .filter(f => /\.(jpe?g|png|webp|avif)$/i.test(f.name ?? f.filename ?? ''))
          .map(f => ({ nom: f.name ?? f.filename, url: f.url }))
      )
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Chargement impossible')
    } finally {
      setChargement(false)
    }
  }, [])

  useEffect(() => {
    if (ouvert && medias.length === 0 && !erreur) charger()
  }, [ouvert, medias.length, erreur, charger])

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOuvert(o => !o)}
          className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:border-eucalyptus hover:text-eucalyptus transition"
        >
          🌿 {valeur ? 'Changer la photo' : 'Photo de fond'}
        </button>

        {valeur && (
          <button
            type="button"
            onClick={() => onChoisir(undefined)}
            className="text-sm text-stone-500 underline hover:text-stone-700"
          >
            Retirer
          </button>
        )}
      </div>

      {ouvert && (
        <div className="mt-3 rounded-2xl border border-stone-200 bg-white p-3">
          {chargement && <p className="text-sm text-stone-500">Chargement des photos…</p>}

          {erreur && (
            <div className="text-sm text-red-700">
              <p>{erreur}</p>
              <p className="mt-1 text-xs text-stone-500">
                Importe d&apos;abord tes photos depuis /panel-manager/photos.
              </p>
            </div>
          )}

          {!chargement && !erreur && medias.length === 0 && (
            <p className="text-sm text-stone-500">
              Aucune photo importée. Passe par /panel-manager/photos pour en récupérer
              depuis Google Photos.
            </p>
          )}

          {medias.length > 0 && (
            <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
              {medias.map(m => (
                <button
                  key={m.url}
                  type="button"
                  onClick={() => { onChoisir(m.url); setOuvert(false) }}
                  title={m.nom}
                  className={`aspect-square rounded-lg bg-cover bg-center border-2 transition ${
                    valeur === m.url ? 'border-eucalyptus' : 'border-transparent hover:border-stone-300'
                  }`}
                  style={{ backgroundImage: `url(${m.url})` }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
