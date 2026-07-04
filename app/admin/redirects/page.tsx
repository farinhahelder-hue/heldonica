'use client'

import { useEffect, useState } from 'react'

interface RedirectRule {
  id: string
  from_path: string
  to_path: string
  redirect_type: number
  active: boolean
}

export default function RedirectRulesAdminPage() {
  const [redirects, setRedirects] = useState<RedirectRule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Form states
  const [formFromPath, setFormFromPath] = useState('')
  const [formToPath, setFormToPath] = useState('')
  const [formType, setFormType] = useState(301)

  const fetchRedirects = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/cms/redirects')
      const data = await res.json()
      if (data.success) {
        setRedirects(data.redirects || [])
      } else {
        setError(data.error || 'Erreur lors du chargement des redirections')
      }
    } catch {
      setError('Impossible de se connecter a l\'API')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRedirects()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    // Quick formatting checks: paths should start with a slash
    let formattedFrom = formFromPath.trim()
    let formattedTo = formToPath.trim()

    if (formattedFrom && !formattedFrom.startsWith('/')) {
      formattedFrom = '/' + formattedFrom
    }
    if (formattedTo && !formattedTo.startsWith('/') && !formattedTo.startsWith('http')) {
      formattedTo = '/' + formattedTo
    }

    if (!formattedFrom || !formattedTo) {
      setError('Veuillez remplir tous les champs obligatoires')
      return
    }

    try {
      const res = await fetch('/api/cms/redirects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_path: formattedFrom,
          to_path: formattedTo,
          redirect_type: formType,
          active: true,
        }),
      })
      const data = await res.json()

      if (data.success) {
        setSuccessMsg('Redirection creee avec succes !')
        setFormFromPath('')
        setFormToPath('')
        setFormType(301)
        fetchRedirects()
      } else {
        setError(data.error || 'Erreur lors de l\'enregistrement')
      }
    } catch {
      setError('Erreur reseau')
    }
  }

  const handleToggleActive = async (rule: RedirectRule) => {
    setError(null)
    setSuccessMsg(null)

    try {
      const res = await fetch('/api/cms/redirects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: rule.id,
          active: !rule.active,
        }),
      })
      const data = await res.json()

      if (data.success) {
        setSuccessMsg(rule.active ? 'Redirection desactivee !' : 'Redirection activee !')
        fetchRedirects()
      } else {
        setError(data.error || 'Erreur lors de la modification')
      }
    } catch {
      setError('Erreur reseau')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Es-tu sur de vouloir supprimer cette redirection ?')) return
    setError(null)
    setSuccessMsg(null)

    try {
      const res = await fetch(`/api/cms/redirects?id=${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        setSuccessMsg('Redirection supprimee avec succes !')
        fetchRedirects()
      } else {
        setError(data.error || 'Erreur lors de la suppression')
      }
    } catch {
      setError('Erreur reseau')
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-serif font-bold text-stone-900">
          Gestionnaire de redirections URL
        </h2>
        <p className="text-stone-500 text-sm mt-1">
          Ajoute des redirections 301 (permanente) ou 302 (temporaire) lues au build-time pour eviter les erreurs 404.
        </p>
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

      {/* Table list */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider">
          Redirections actives et inactives
        </h3>
        {loading ? (
          <p className="text-stone-400 text-sm italic">Chargement des redirections…</p>
        ) : redirects.length === 0 ? (
          <p className="text-stone-400 text-sm italic">Aucune redirection configuree</p>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold">
                  <th className="p-4">Depuis (Source URL)</th>
                  <th className="p-4">Vers (Destination URL)</th>
                  <th className="p-4 text-center">Type</th>
                  <th className="p-4 text-center">Statut</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {redirects.map((rule) => (
                  <tr key={rule.id} className="hover:bg-stone-50/50 transition">
                    <td className="p-4 font-mono text-xs text-stone-700 font-medium">{rule.from_path}</td>
                    <td className="p-4 font-mono text-xs text-stone-500">{rule.to_path}</td>
                    <td className="p-4 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          rule.redirect_type === 301
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {rule.redirect_type}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleToggleActive(rule)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm transition ${
                          rule.active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                        }`}
                      >
                        {rule.active ? 'Actif' : 'Inactif'}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(rule.id)}
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
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm max-w-xl">
        <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-4">
          Créer une nouvelle redirection
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              URL Source (Depuis - doit commencer par /)
            </label>
            <input
              type="text"
              value={formFromPath}
              onChange={(e) => setFormFromPath(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-eucalyptus text-stone-900 font-mono"
              placeholder="Ex: /bons-plans"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              URL Cible (Vers - commence par / ou http)
            </label>
            <input
              type="text"
              value={formToPath}
              onChange={(e) => setFormToPath(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-eucalyptus text-stone-900 font-mono"
              placeholder="Ex: /guides-pratiques"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Type de redirection
            </label>
            <select
              value={formType}
              onChange={(e) => setFormType(parseInt(e.target.value) || 301)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-eucalyptus text-stone-900 bg-white"
            >
              <option value={301}>301 (Permanente - conseillée)</option>
              <option value={302}>302 (Temporaire)</option>
            </select>
          </div>
          <div className="md:col-span-2 pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800 transition shadow"
            >
              Créer la redirection
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
