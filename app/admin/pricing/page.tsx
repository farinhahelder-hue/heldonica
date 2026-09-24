'use client'

import { useEffect, useState } from 'react'

interface PricingPlan {
  id: string
  slug: string
  name: string
  price: string
  description: string
  features: string[]
  is_popular: boolean
  display_order: number
  active: boolean
}

export default function PricingAdminPage() {
  const [plans, setPlans] = useState<PricingPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formSlug, setFormSlug] = useState('')
  const [formName, setFormName] = useState('')
  const [formPrice, setFormPrice] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formFeaturesText, setFormFeaturesText] = useState('')
  const [formIsPopular, setFormIsPopular] = useState(false)
  const [formOrder, setFormOrder] = useState(0)
  const [formActive, setFormActive] = useState(true)

  const fetchPlans = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/cms/pricing?all=true')
      const data = await res.json()
      if (data.plans) {
        setPlans(data.plans)
      } else {
        setError(data.error || 'Erreur lors du chargement des tarifs')
      }
    } catch {
      setError('Impossible de charger les tarifs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  const resetForm = () => {
    setEditingId(null)
    setFormSlug('')
    setFormName('')
    setFormPrice('')
    setFormDesc('')
    setFormFeaturesText('')
    setFormIsPopular(false)
    setFormOrder(0)
    setFormActive(true)
  }

  const handleEdit = (plan: PricingPlan) => {
    setEditingId(plan.id)
    setFormSlug(plan.slug || '')
    setFormName(plan.name || '')
    setFormPrice(plan.price || '')
    setFormDesc(plan.description || '')
    setFormFeaturesText(plan.features ? plan.features.join('\n') : '')
    setFormIsPopular(plan.is_popular || false)
    setFormOrder(plan.display_order || 0)
    setFormActive(plan.active !== undefined ? plan.active : true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    if (!formSlug || !formName || !formPrice) {
      setError('Le slug, le nom et le prix sont obligatoires')
      return
    }

    const features = formFeaturesText
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0)

    const payload = {
      id: editingId,
      slug: formSlug.trim(),
      name: formName.trim(),
      price: formPrice.trim(),
      description: formDesc.trim(),
      features,
      is_popular: formIsPopular,
      display_order: formOrder,
      active: formActive,
    }

    try {
      const method = editingId ? 'PATCH' : 'POST'
      const res = await fetch('/api/cms/pricing', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (data.success) {
        setSuccessMsg(editingId ? 'Tarif mis a jour !' : 'Tarif cree avec succes !')
        resetForm()
        fetchPlans()
      } else {
        setError(data.error || 'Erreur lors de l\'enregistrement')
      }
    } catch {
      setError('Erreur reseau')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous supprimer ce plan tarifaire ?')) return
    setError(null)
    setSuccessMsg(null)

    try {
      const res = await fetch(`/api/cms/pricing?id=${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        setSuccessMsg('Plan tarifaire supprime !')
        fetchPlans()
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
            Gestionnaire de Tarifs
          </h2>
          <p className="text-stone-500 text-sm mt-1">
            Gérer les offres commerciales de Travel Planning d'Heldonica.
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

      {/* Cards Display */}
      {loading ? (
        <p className="text-stone-400 text-sm italic">Chargement des formules tarifaires…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-3xl p-6 border transition shadow-sm flex flex-col justify-between relative ${
                plan.is_popular ? 'border-eucalyptus ring-2 ring-eucalyptus/20' : 'border-stone-200'
              } ${!plan.active ? 'opacity-50' : ''}`}
            >
              {plan.is_popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-eucalyptus text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                  Le plus populaire
                </span>
              )}
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <h4 className="font-serif font-bold text-stone-900 text-lg">{plan.name}</h4>
                  <span className="text-2xl font-light text-eucalyptus font-mono">{plan.price}</span>
                </div>
                <p className="text-xs text-stone-500 mb-4 italic">{plan.description}</p>
                <ul className="space-y-2 mb-6 border-t border-stone-100 pt-4">
                  {plan.features?.map((f, i) => (
                    <li key={i} className="text-xs text-stone-600 flex items-start gap-2">
                      <span className="text-eucalyptus font-bold">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex gap-2 border-t border-stone-100 pt-4">
                <button
                  onClick={() => handleEdit(plan)}
                  className="flex-1 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold shadow transition"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(plan.id)}
                  className="px-3 py-2 border border-red-200 hover:bg-red-50 text-red-600 rounded-xl text-xs font-semibold transition"
                  title="Supprimer"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Form */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm max-w-xl">
        <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-4">
          {editingId ? 'Modifier l\'offre' : 'Ajouter une nouvelle formule'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Nom de la formule *</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => {
                  setFormName(e.target.value)
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
                placeholder="Ex: Essentielle"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Slug unique *</label>
              <input
                type="text"
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-eucalyptus text-stone-900 font-mono"
                placeholder="Ex: essentielle"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Prix de l'offre *</label>
              <input
                type="text"
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-eucalyptus text-stone-900 font-mono"
                placeholder="Ex: 250€ ou Sur devis"
                required
              />
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
              <label className="block text-xs font-semibold text-stone-600 mb-1">Description succincte</label>
              <input
                type="text"
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-eucalyptus text-stone-900"
                placeholder="Ex: Pour ceux qui veulent l'itinéraire clé en main"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Avantages / Caractéristiques (Une ligne par élément)
              </label>
              <textarea
                value={formFeaturesText}
                onChange={(e) => setFormFeaturesText(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-eucalyptus text-stone-900 font-sans"
                rows={4}
                placeholder="Itinéraire jour par jour personnalisé&#10;Carnet de route PDF complet&#10;Suivi WhatsApp..."
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isPopular"
                checked={formIsPopular}
                onChange={(e) => setFormIsPopular(e.target.checked)}
                className="w-4 h-4 rounded text-eucalyptus focus:ring-eucalyptus"
              />
              <label htmlFor="isPopular" className="text-xs font-semibold text-stone-700 select-none">
                Marquer comme "Le plus populaire"
              </label>
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
                Offre active
              </label>
            </div>
          </div>
          <div className="pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg shadow transition"
            >
              {editingId ? 'Enregistrer les modifications' : 'Créer la formule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
