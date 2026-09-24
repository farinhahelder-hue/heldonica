'use client'

import { useEffect, useState } from 'react'

interface BlogCategory {
  id: string
  slug: string
  label: string
  db_value: string
  display_order: number
}

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [normalizing, setNormalizing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Form states
  const [formSlug, setFormSlug] = useState('')
  const [formLabel, setFormLabel] = useState('')
  const [formDbValue, setFormDbValue] = useState('')
  const [formOrder, setFormOrder] = useState(0)
  const [editingId, setEditingId] = useState<string | null>(null)

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/cms/blog-categories')
      const data = await res.json()
      if (data.success) {
        setCategories(data.categories || [])
      } else {
        setError(data.error || 'Erreur lors du chargement des categories')
      }
    } catch (err) {
      setError('Impossible de se connecter a l\'API')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    if (!formSlug || !formLabel || !formDbValue) {
      setError('Veuillez remplir tous les champs obligatoires')
      return
    }

    try {
      const method = editingId ? 'PATCH' : 'POST'
      const body = editingId
        ? { id: editingId, slug: formSlug, label: formLabel, db_value: formDbValue, display_order: formOrder }
        : { slug: formSlug, label: formLabel, db_value: formDbValue, display_order: formOrder }

      const res = await fetch('/api/cms/blog-categories', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()

      if (data.success) {
        setSuccessMsg(editingId ? 'Categorie modifiee !' : 'Categorie creee !')
        resetForm()
        fetchCategories()
      } else {
        setError(data.error || 'Erreur lors de l\'enregistrement')
      }
    } catch {
      setError('Erreur reseau')
    }
  }

  const handleEdit = (cat: BlogCategory) => {
    setEditingId(cat.id)
    setFormSlug(cat.slug)
    setFormLabel(cat.label)
    setFormDbValue(cat.db_value)
    setFormOrder(cat.display_order)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Es-tu sur de vouloir supprimer cette categorie ?')) return
    setError(null)
    setSuccessMsg(null)

    try {
      const res = await fetch(`/api/cms/blog-categories?id=${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        setSuccessMsg('Categorie supprimee')
        fetchCategories()
      } else {
        setError(data.error || 'Erreur lors de la suppression')
      }
    } catch {
      setError('Erreur reseau')
    }
  }

  const handleNormalize = async () => {
    setNormalizing(true)
    setError(null)
    setSuccessMsg(null)

    try {
      const res = await fetch('/api/cms/blog-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'normalize' }),
      })
      const data = await res.json()

      if (data.success) {
        setSuccessMsg(`Normalisation reussie ! ${data.normalizedCount} articles mis a jour.`)
      } else {
        setError(data.error || 'Erreur lors de la normalisation')
      }
    } catch {
      setError('Erreur reseau')
    } finally {
      setNormalizing(false)
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setFormSlug('')
    setFormLabel('')
    setFormDbValue('')
    setFormOrder(0)
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-serif font-bold text-stone-900">
          Gestion des catégories de blog
        </h2>
        <button
          onClick={handleNormalize}
          disabled={normalizing}
          className="px-4 py-2 bg-eucalyptus text-white font-semibold rounded-lg hover:brightness-110 transition disabled:opacity-50 text-sm shadow"
        >
          {normalizing ? 'Normalisation…' : 'Normaliser en masse 🔄'}
        </button>
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

      <div className="grid md:grid-cols-3 gap-8">
        {/* Table List */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider">
            Catégories existantes
          </h3>
          {loading ? (
            <p className="text-stone-400 text-sm italic">Chargement des categories…</p>
          ) : categories.length === 0 ? (
            <p className="text-stone-400 text-sm italic">Aucune categorie configuree</p>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold">
                    <th className="p-4">Label</th>
                    <th className="p-4">Valeur DB</th>
                    <th className="p-4">Slug</th>
                    <th className="p-4 text-center">Ordre</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-stone-50/50 transition">
                      <td className="p-4 font-medium text-stone-900">{cat.label}</td>
                      <td className="p-4 font-mono text-xs text-stone-500">{cat.db_value}</td>
                      <td className="p-4 font-mono text-xs text-stone-500">{cat.slug}</td>
                      <td className="p-4 text-center text-stone-600">{cat.display_order}</td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleEdit(cat)}
                          className="text-xs font-semibold text-eucalyptus hover:underline"
                        >
                          Éditer
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
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
          )}
        </div>

        {/* Form panel */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm h-fit space-y-4">
          <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider">
            {editingId ? 'Modifier la catégorie' : 'Ajouter une catégorie'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Label (affichage)
              </label>
              <input
                type="text"
                value={formLabel}
                onChange={(e) => setFormLabel(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-eucalyptus text-stone-900"
                placeholder="Ex: Pépites locales"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Valeur en base de données
              </label>
              <input
                type="text"
                value={formDbValue}
                onChange={(e) => setFormDbValue(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-eucalyptus text-stone-900"
                placeholder="Ex: Découvertes Locales"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Slug (URL filtre)
              </label>
              <input
                type="text"
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-eucalyptus text-stone-900"
                placeholder="Ex: pepites"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Ordre d'affichage
              </label>
              <input
                type="number"
                value={formOrder}
                onChange={(e) => setFormOrder(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-eucalyptus text-stone-900"
                required
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800 transition"
              >
                {editingId ? 'Enregistrer' : 'Créer'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-stone-300 text-stone-600 text-xs font-semibold rounded-lg hover:bg-stone-50 transition"
                >
                  Annuler
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
