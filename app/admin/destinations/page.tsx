'use client'

import { useEffect, useState } from 'react'

interface Destination {
  id: string
  slug: string
  title: string
  excerpt: string
  country: string
  continent: string
  region: string
  flag_emoji: string
  tagline: string
  teaser: string
  hero_unsplash_url: string
  featured_image: string
  link: string
  travel_style: string
  best_season: string
  avg_budget_couple_week: number
  status: 'draft' | 'coming_soon' | 'published' | 'starred'
  priority_score: number
  coming_soon_date: string
  latitude: number
  longitude: number
  published: boolean
}

export default function DestinationsAdminPage() {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Edit / Create Form states
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formSlug, setFormSlug] = useState('')
  const [formTitle, setFormTitle] = useState('')
  const [formExcerpt, setFormExcerpt] = useState('')
  const [formCountry, setFormCountry] = useState('')
  const [formContinent, setFormContinent] = useState('Europe')
  const [formRegion, setFormRegion] = useState('')
  const [formFlagEmoji, setFormFlagEmoji] = useState('🇪🇺')
  const [formTagline, setFormTagline] = useState('')
  const [formTeaser, setFormTeaser] = useState('')
  const [formHeroUrl, setFormHeroUrl] = useState('')
  const [formFeaturedImage, setFormFeaturedImage] = useState('')
  const [formLink, setFormLink] = useState('')
  const [formTravelStyle, setFormTravelStyle] = useState('slow-culture')
  const [formBestSeason, setFormBestSeason] = useState('')
  const [formBudget, setFormBudget] = useState(1000)
  const [formStatus, setFormStatus] = useState<'draft' | 'coming_soon' | 'published' | 'starred'>('draft')
  const [formPriority, setFormPriority] = useState(50)
  const [formComingSoonDate, setFormComingSoonDate] = useState('')
  const [formLatitude, setFormLatitude] = useState(0)
  const [formLongitude, setFormLongitude] = useState(0)
  const [formPublished, setFormPublished] = useState(false)

  const fetchDestinations = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/cms/destinations')
      const data = await res.json()
      if (data.success) {
        setDestinations(data.destinations || [])
      } else {
        setError(data.error || 'Erreur lors du chargement des destinations')
      }
    } catch {
      setError('Impossible de se connecter a l\'API')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDestinations()
  }, [])

  const resetForm = () => {
    setEditingId(null)
    setFormSlug('')
    setFormTitle('')
    setFormExcerpt('')
    setFormCountry('')
    setFormContinent('Europe')
    setFormRegion('')
    setFormFlagEmoji('🇪🇺')
    setFormTagline('')
    setFormTeaser('')
    setFormHeroUrl('')
    setFormFeaturedImage('')
    setFormLink('')
    setFormTravelStyle('slow-culture')
    setFormBestSeason('')
    setFormBudget(1000)
    setFormStatus('draft')
    setFormPriority(50)
    setFormComingSoonDate('')
    setFormLatitude(0)
    setFormLongitude(0)
    setFormPublished(false)
  }

  const handleEdit = (dest: Destination) => {
    setEditingId(dest.id)
    setFormSlug(dest.slug || '')
    setFormTitle(dest.title || '')
    setFormExcerpt(dest.excerpt || '')
    setFormCountry(dest.country || '')
    setFormContinent(dest.continent || 'Europe')
    setFormRegion(dest.region || '')
    setFormFlagEmoji(dest.flag_emoji || '🇪🇺')
    setFormTagline(dest.tagline || '')
    setFormTeaser(dest.teaser || '')
    setFormHeroUrl(dest.hero_unsplash_url || '')
    setFormFeaturedImage(dest.featured_image || '')
    setFormLink(dest.link || '')
    setFormTravelStyle(dest.travel_style || 'slow-culture')
    setFormBestSeason(dest.best_season || '')
    setFormBudget(dest.avg_budget_couple_week || 1000)
    setFormStatus(dest.status || 'draft')
    setFormPriority(dest.priority_score !== undefined ? dest.priority_score : 50)
    setFormComingSoonDate(dest.coming_soon_date || '')
    setFormLatitude(dest.latitude || 0)
    setFormLongitude(dest.longitude || 0)
    setFormPublished(dest.published || false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    if (!formSlug || !formTitle) {
      setError('Le slug et le titre sont requis')
      return
    }

    const payload = {
      id: editingId,
      slug: formSlug.trim(),
      title: formTitle.trim(),
      excerpt: formExcerpt.trim(),
      country: formCountry.trim(),
      continent: formContinent,
      region: formRegion.trim(),
      flag_emoji: formFlagEmoji.trim(),
      tagline: formTagline.trim(),
      teaser: formTeaser.trim(),
      hero_unsplash_url: formHeroUrl.trim(),
      featured_image: formFeaturedImage.trim(),
      link: formLink.trim(),
      travel_style: formTravelStyle,
      best_season: formBestSeason.trim(),
      avg_budget_couple_week: formBudget,
      status: formStatus,
      priority_score: formPriority,
      coming_soon_date: formComingSoonDate.trim(),
      latitude: formLatitude,
      longitude: formLongitude,
      published: formPublished,
    }

    try {
      const method = editingId ? 'PATCH' : 'POST'
      const res = await fetch('/api/cms/destinations', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (data.success) {
        setSuccessMsg(editingId ? 'Destination mise a jour avec succes !' : 'Destination creee avec succes !')
        resetForm()
        fetchDestinations()
      } else {
        setError(data.error || 'Erreur lors de l\'enregistrement')
      }
    } catch {
      setError('Erreur reseau')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Es-tu sur de vouloir supprimer cette destination ? Cette action est irreversible.')) return
    setError(null)
    setSuccessMsg(null)

    try {
      const res = await fetch(`/api/cms/destinations?id=${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        setSuccessMsg('Destination supprimee avec succes !')
        fetchDestinations()
      } else {
        setError(data.error || 'Erreur lors de la suppression')
      }
    } catch {
      setError('Erreur reseau')
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-serif font-bold text-stone-900">
            Gestionnaire de Destinations
          </h2>
          <p className="text-stone-500 text-sm mt-1">
            Créer et configurer les destinations slow travel présentées sur Heldonica.
          </p>
        </div>
        {editingId && (
          <button
            onClick={resetForm}
            className="px-4 py-2 border border-stone-300 text-stone-600 rounded-lg text-xs font-semibold hover:bg-stone-50 transition"
          >
            Annuler l'édition
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">
          {successMsg}
        </div>
      )}

      {/* Form Section */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-6">
          {editingId ? 'Modifier la destination' : 'Créer une nouvelle destination'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Titre / Nom *</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => {
                  setFormTitle(e.target.value)
                  if (!editingId) {
                    setFormSlug(
                      e.target.value
                        .toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)/g, '')
                    )
                  }
                }}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-eucalyptus text-stone-900"
                placeholder="Ex: Madère"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Slug URL *</label>
              <input
                type="text"
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-eucalyptus text-stone-900 font-mono"
                placeholder="Ex: madere"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Pays</label>
              <input
                type="text"
                value={formCountry}
                onChange={(e) => setFormCountry(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-eucalyptus text-stone-900"
                placeholder="Ex: Portugal"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Continent</label>
              <select
                value={formContinent}
                onChange={(e) => setFormContinent(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-eucalyptus text-stone-900 bg-white"
              >
                <option value="Europe">Europe</option>
                <option value="Afrique">Afrique</option>
                <option value="Asie">Asie</option>
                <option value="Amérique du Nord">Amérique du Nord</option>
                <option value="Amérique du Sud">Amérique du Sud</option>
                <option value="Océanie">Océanie</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Région</label>
              <input
                type="text"
                value={formRegion}
                onChange={(e) => setFormRegion(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-eucalyptus text-stone-900"
                placeholder="Ex: Atlantique"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Drapeau Emoji</label>
              <input
                type="text"
                value={formFlagEmoji}
                onChange={(e) => setFormFlagEmoji(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-eucalyptus text-stone-900"
                placeholder="Ex: 🇵🇹"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-stone-600 mb-1">Description courte (Extrait)</label>
              <textarea
                value={formExcerpt}
                onChange={(e) => setFormExcerpt(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-eucalyptus text-stone-900"
                rows={2}
                placeholder="Description sommaire de la destination pour les cartes..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Teaser accrocheur</label>
              <input
                type="text"
                value={formTeaser}
                onChange={(e) => setFormTeaser(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-eucalyptus text-stone-900"
                placeholder="Ex: Randonnées sauvages, fajas oubliés"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Style de voyage</label>
              <select
                value={formTravelStyle}
                onChange={(e) => setFormTravelStyle(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-eucalyptus text-stone-900 bg-white"
              >
                <option value="slow-culture">Slow Culture</option>
                <option value="slow-nature">Slow Nature</option>
                <option value="roadtrip">Roadtrip lent</option>
                <option value="city">Weekend urbain</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Meilleure saison</label>
              <input
                type="text"
                value={formBestSeason}
                onChange={(e) => setFormBestSeason(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-eucalyptus text-stone-900"
                placeholder="Ex: Mai à Octobre"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Budget moyen couple / sem. (€)</label>
              <input
                type="number"
                value={formBudget}
                onChange={(e) => setFormBudget(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-eucalyptus text-stone-900 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Priorité (Score d'affichage)</label>
              <input
                type="number"
                value={formPriority}
                onChange={(e) => setFormPriority(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-eucalyptus text-stone-900 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Statut éditorial</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-eucalyptus text-stone-900 bg-white"
              >
                <option value="draft">Brouillon (Draft)</option>
                <option value="coming_soon">Bientôt disponible</option>
                <option value="published">Publié</option>
                <option value="starred">Mise en avant (Starred)</option>
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-stone-600 mb-1">URL Image Unsplash (Hero)</label>
              <input
                type="text"
                value={formHeroUrl}
                onChange={(e) => setFormHeroUrl(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-eucalyptus text-stone-900 font-mono"
                placeholder="https://images.unsplash.com/photo-..."
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-stone-600 mb-1">URL Image vignette (Featured)</label>
              <input
                type="text"
                value={formFeaturedImage}
                onChange={(e) => setFormFeaturedImage(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-eucalyptus text-stone-900 font-mono"
                placeholder="Format carré ou paysage..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Lien de redirection alternatif</label>
              <input
                type="text"
                value={formLink}
                onChange={(e) => setFormLink(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-eucalyptus text-stone-900 font-mono"
                placeholder="Ex: /destinations/madere"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                value={formLatitude}
                onChange={(e) => setFormLatitude(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-eucalyptus text-stone-900 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                value={formLongitude}
                onChange={(e) => setFormLongitude(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-eucalyptus text-stone-900 font-mono"
              />
            </div>
            <div className="flex items-center gap-2 pt-4">
              <input
                type="checkbox"
                id="published"
                checked={formPublished}
                onChange={(e) => setFormPublished(e.target.checked)}
                className="w-4 h-4 rounded text-eucalyptus focus:ring-eucalyptus"
              />
              <label htmlFor="published" className="text-xs font-semibold text-stone-700 select-none">
                Publié sur le site
              </label>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Date estimée de sortie (Si Bientôt)</label>
              <input
                type="text"
                value={formComingSoonDate}
                onChange={(e) => setFormComingSoonDate(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-eucalyptus text-stone-900"
                placeholder="Ex: Septembre 2026"
              />
            </div>
          </div>
          <div className="pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg shadow transition"
            >
              {editingId ? 'Enregistrer les modifications' : 'Créer la destination'}
            </button>
          </div>
        </form>
      </div>

      {/* Destinations Table */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider">
          Destinations configurées ({destinations.length})
        </h3>
        {loading ? (
          <p className="text-stone-400 text-sm italic">Chargement des destinations…</p>
        ) : destinations.length === 0 ? (
          <p className="text-stone-400 text-sm italic">Aucune destination configuree</p>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm min-w-[700px]">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold">
                    <th className="p-4 w-12 text-center">Icon</th>
                    <th className="p-4">Titre (Title)</th>
                    <th className="p-4">Slug</th>
                    <th className="p-4">Pays (Country)</th>
                    <th className="p-4 text-center">Score</th>
                    <th className="p-4 text-center">Statut</th>
                    <th className="p-4 text-center">Publié</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {destinations.map((dest) => (
                    <tr key={dest.id} className="hover:bg-stone-50/50 transition">
                      <td className="p-4 text-center text-lg">{dest.flag_emoji}</td>
                      <td className="p-4 font-serif font-bold text-stone-900">{dest.title}</td>
                      <td className="p-4 font-mono text-xs text-stone-500">{dest.slug}</td>
                      <td className="p-4 text-stone-700">{dest.country || '—'}</td>
                      <td className="p-4 text-center font-mono text-xs">{dest.priority_score}</td>
                      <td className="p-4 text-center">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            dest.status === 'starred'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : dest.status === 'published'
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : dest.status === 'coming_soon'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-stone-50 text-stone-500 border border-stone-200'
                          }`}
                        >
                          {dest.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`inline-block w-2.5 h-2.5 rounded-full ${
                            dest.published ? 'bg-green-500' : 'bg-stone-300'
                          }`}
                          title={dest.published ? 'Publié' : 'Brouillon'}
                        />
                      </td>
                      <td className="p-4 text-right space-x-3">
                        <button
                          onClick={() => handleEdit(dest)}
                          className="text-xs font-semibold text-eucalyptus hover:underline"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(dest.id)}
                          className="text-xs font-semibold text-red-600 hover:underline"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
