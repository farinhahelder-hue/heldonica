'use client'

import { useEffect, useState } from 'react'

interface Testimonial {
  id: string
  name: string
  location: string
  quote: string
  destination: string
  rating: number
  avatar_url: string
  source: string
  display_order: number
  is_active: boolean
}

export default function TestimonialsAdminPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formName, setFormName] = useState('')
  const [formLocation, setFormLocation] = useState('')
  const [formQuote, setFormQuote] = useState('')
  const [formDestination, setFormDestination] = useState('')
  const [formRating, setFormRating] = useState(5)
  const [formAvatarUrl, setFormAvatarUrl] = useState('')
  const [formSource, setFormSource] = useState('email')
  const [formOrder, setFormOrder] = useState(0)
  const [formActive, setFormActive] = useState(true)

  const fetchTestimonials = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/cms/testimonials?all=true')
      const data = await res.json()
      if (data.testimonials) {
        setTestimonials(data.testimonials)
      } else {
        setError(data.error || 'Erreur lors du chargement des temoignages')
      }
    } catch {
      setError('Impossible de se connecter a l\'API')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const resetForm = () => {
    setEditingId(null)
    setFormName('')
    setFormLocation('')
    setFormQuote('')
    setFormDestination('')
    setFormRating(5)
    setFormAvatarUrl('')
    setFormSource('email')
    setFormOrder(0)
    setFormActive(true)
  }

  const handleEdit = (t: Testimonial) => {
    setEditingId(t.id)
    setFormName(t.name || '')
    setFormLocation(t.location || '')
    setFormQuote(t.quote || '')
    setFormDestination(t.destination || '')
    setFormRating(t.rating || 5)
    setFormAvatarUrl(t.avatar_url || '')
    setFormSource(t.source || 'email')
    setFormOrder(t.display_order || 0)
    setFormActive(t.is_active !== undefined ? t.is_active : true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    if (!formName || !formQuote) {
      setError('L\'auteur et le message sont requis')
      return
    }

    const payload = {
      id: editingId,
      name: formName.trim(),
      location: formLocation.trim(),
      quote: formQuote.trim(),
      destination: formDestination.trim(),
      rating: formRating,
      avatar_url: formAvatarUrl.trim(),
      source: formSource,
      display_order: formOrder,
      is_active: formActive
    }

    try {
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch('/api/cms/testimonials', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (data.success || data.testimonial) {
        setSuccessMsg(editingId ? 'Temoignage mis a jour avec succes !' : 'Temoignage cree avec succes !')
        resetForm()
        fetchTestimonials()
      } else {
        setError(data.error || 'Erreur lors de l\'enregistrement')
      }
    } catch {
      setError('Erreur reseau')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Es-tu sur de vouloir supprimer ce temoignage ?')) return
    setError(null)
    setSuccessMsg(null)

    try {
      const res = await fetch(`/api/cms/testimonials?id=${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        setSuccessMsg('Temoignage supprime avec succes !')
        fetchTestimonials()
      } else {
        setError(data.error || 'Erreur lors de la suppression')
      }
    } catch {
      setError('Erreur reseau')
    }
  }

  const handleToggleActive = async (t: Testimonial) => {
    setError(null)
    setSuccessMsg(null)

    try {
      const res = await fetch('/api/cms/testimonials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: t.id,
          is_active: !t.is_active
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccessMsg(t.is_active ? 'Temoignage desactive !' : 'Temoignage active !')
        fetchTestimonials()
      } else {
        setError(data.error || 'Erreur lors de la modification du statut')
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
            Gestionnaire de Témoignages
          </h2>
          <p className="text-stone-500 text-sm mt-1">
            Gérer les avis clients affichés sur les différentes pages de vente d'Heldonica.
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

      {/* Form Card */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm max-w-2xl">
        <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-4">
          {editingId ? 'Modifier le témoignage' : 'Ajouter un nouveau témoignage'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Nom du voyageur / auteur *</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-eucalyptus text-stone-900"
                placeholder="Ex: Sophie & Marc"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Localisation / Voyage</label>
              <input
                type="text"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-eucalyptus text-stone-900"
                placeholder="Ex: Voyage de 9 jours en Sicile"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-stone-600 mb-1">Citation / Avis *</label>
              <textarea
                value={formQuote}
                onChange={(e) => setFormQuote(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-eucalyptus text-stone-900"
                rows={3}
                placeholder="Le message ou retour d'expérience laissé par le client..."
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Destination associée</label>
              <input
                type="text"
                value={formDestination}
                onChange={(e) => setFormDestination(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-eucalyptus text-stone-900"
                placeholder="Ex: Sicile"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Note (Étoiles)</label>
              <select
                value={formRating}
                onChange={(e) => setFormRating(parseInt(e.target.value) || 5)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-eucalyptus text-stone-900 bg-white"
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                <option value={3}>⭐⭐⭐ (3/5)</option>
                <option value={2}>⭐⭐ (2/5)</option>
                <option value={1}>⭐ (1/5)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Source du témoignage</label>
              <select
                value={formSource}
                onChange={(e) => setFormSource(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-eucalyptus text-stone-900 bg-white"
              >
                <option value="email">Email</option>
                <option value="google">Avis Google</option>
                <option value="instagram">Instagram</option>
                <option value="manual">Saisie manuelle</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Ordre d'affichage</label>
              <input
                type="number"
                value={formOrder}
                onChange={(e) => setFormOrder(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-eucalyptus text-stone-900 font-mono"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-stone-600 mb-1">URL Avatar (Optionnel)</label>
              <input
                type="text"
                value={formAvatarUrl}
                onChange={(e) => setFormAvatarUrl(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-eucalyptus text-stone-900 font-mono"
                placeholder="https://images.unsplash.com/photo-..."
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="active"
                checked={formActive}
                onChange={(e) => setFormActive(e.target.checked)}
                className="w-4 h-4 rounded text-eucalyptus focus:ring-eucalyptus"
              />
              <label htmlFor="active" className="text-xs font-semibold text-stone-700 select-none">
                Témoignage actif
              </label>
            </div>
          </div>
          <div className="pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg shadow transition"
            >
              {editingId ? 'Enregistrer les modifications' : 'Créer le témoignage'}
            </button>
          </div>
        </form>
      </div>

      {/* Testimonials Table */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider">
          Témoignages configurés ({testimonials.length})
        </h3>
        {loading ? (
          <p className="text-stone-400 text-sm italic">Chargement des témoignages…</p>
        ) : testimonials.length === 0 ? (
          <p className="text-stone-400 text-sm italic">Aucun témoignage configuré</p>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm min-w-[650px]">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold">
                    <th className="p-4 w-12 text-center">Note</th>
                    <th className="p-4">Auteur</th>
                    <th className="p-4">Localisation / Voyage</th>
                    <th className="p-4">Avis (Extrait)</th>
                    <th className="p-4 text-center">Ordre</th>
                    <th className="p-4 text-center">Statut</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {testimonials.map((t) => (
                    <tr key={t.id} className="hover:bg-stone-50/50 transition">
                      <td className="p-4 text-center font-mono text-xs text-amber-500 font-bold">
                        {'⭐'.repeat(t.rating)}
                      </td>
                      <td className="p-4 font-bold text-stone-900">{t.name}</td>
                      <td className="p-4 text-stone-600 text-xs">{t.location || '—'}</td>
                      <td className="p-4 text-stone-500 text-xs max-w-xs truncate" title={t.quote}>
                        {t.quote}
                      </td>
                      <td className="p-4 text-center font-mono text-xs">{t.display_order}</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleActive(t)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm transition ${
                            t.is_active
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                          }`}
                        >
                          {t.is_active ? 'Actif' : 'Inactif'}
                        </button>
                      </td>
                      <td className="p-4 text-right space-x-3">
                        <button
                          onClick={() => handleEdit(t)}
                          className="text-xs font-semibold text-eucalyptus hover:underline"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
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
