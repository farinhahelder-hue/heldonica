'use client'

import React, { useState } from 'react'
import {
  Bot,
  Zap,
  Cpu,
  Brain,
  Send,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  GitBranch,
  ShieldCheck,
  AlertCircle,
  FileText,
} from 'lucide-react'

export type AgentTarget = 'jules' | 'gemini' | 'groq' | 'brain'

export interface TaskPreset {
  id: string
  label: string
  defaultTarget: AgentTarget
  title: string
  prompt: string
}

const TASK_PRESETS: TaskPreset[] = [
  {
    id: 'seo_geo',
    label: 'Audit SEO Géo & Schema.org',
    defaultTarget: 'gemini',
    title: 'Audit sémantique et géo-balisage',
    prompt:
      'Analyse les signaux SEO et Schema.org de notre page destination. Vérifie la présence des coordonnées GPS (lat/lng), du lien OpenStreetMap, du balisage TouristTrip / Offer et propose 3 suggestions de mots-clés slow travel.',
  },
  {
    id: 'brand_voice',
    label: 'Chasse aux Mots Bannis & Voix',
    defaultTarget: 'gemini',
    title: 'Purification éditoriale voix de marque',
    prompt:
      'Passe au crible ce texte pour traquer les tics sensationnalistes et mots bannis ("parfait", "incroyable", "magique", "incontournable", "bons plans"). Reformule dans la voix stricte Heldonica (« on » pour le duo, « tu » pour le voyageur, sobre et vécue).',
  },
  {
    id: 'itinerary',
    label: 'Confection Itinéraire 7j Couple',
    defaultTarget: 'gemini',
    title: 'Itinéraire slow travel 7 jours',
    prompt:
      'Génère un itinéraire slow travel de 7 jours pour un couple sans enfant. Applique strictement le principe de la double ancre (2 hébergements maximum), au moins deux demi-journées libres, et des temps de route multipliés par 1,3.',
  },
  {
    id: 'jules_repo',
    label: 'Mission Code & PR (Jules)',
    defaultTarget: 'jules',
    title: 'Amélioration ou correction de code',
    prompt:
      'Sur le dépôt Heldonica, effectue les ajustements nécessaires en respectant les 13 garde-fous du projet. Assure-toi que les tests vitest passent et que la voix de marque reste intacte.',
  },
]

export default function AgentTaskGiver() {
  const [target, setTarget] = useState<AgentTarget>('jules')
  const [title, setTitle] = useState('')
  const [prompt, setPrompt] = useState('')
  const [branch, setBranch] = useState('main')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{
    success: boolean
    result?: string
    sessionUrl?: string
    sessionId?: string
    provider?: string
    model?: string
  } | null>(null)
  const [copied, setCopied] = useState(false)

  const handleSelectPreset = (p: TaskPreset) => {
    setTarget(p.defaultTarget)
    setTitle(p.title)
    setPrompt(p.prompt)
    setError(null)
    setResult(null)
  }

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/admin/agent-task-giver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target,
          title: title.trim() || prompt.slice(0, 40),
          prompt,
          branch,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors du traitement')
      }

      setResult(data)
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyResult = async () => {
    if (!result?.result) return
    await navigator.clipboard.writeText(result.result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#241D1A] font-serif flex items-center gap-2">
            <span>⚡</span> Donneur de Tâches IA &amp; Pilotage Jules
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Distribuez des tâches autonomes à Google Jules (GitHub) ou aux modèles gratuits de votre environnement (Gemini 2.5 Flash, Groq, Cerveau Local).
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-stone-500 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Tier Gratuit 0€ &amp; Jules API Connecté</span>
        </div>
      </div>

      {/* Sélection rapide de Presets */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-stone-400 block">
          Modèles de Tâches Fréquentes
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {TASK_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectPreset(p)}
              className="p-3 rounded-xl border border-stone-200 hover:border-eucalyptus/60 hover:bg-stone-50 text-left transition-all group"
            >
              <div className="text-xs font-semibold text-charcoal group-hover:text-eucalyptus flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-stone-400 group-hover:text-eucalyptus" />
                <span>{p.label}</span>
              </div>
              <div className="text-[11px] text-stone-400 mt-1 line-clamp-2">
                {p.prompt}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Formulaire de distribution */}
      <form onSubmit={handleDispatch} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-6">
        {/* Choix de l'agent / API */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-stone-400 block mb-3">
            Sélectionner l&apos;Agent ou Modèle Exécutant
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() => setTarget('jules')}
              className={`p-4 rounded-xl border text-left transition-all ${
                target === 'jules'
                  ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
                  <Bot className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-charcoal">Google Jules</span>
              </div>
              <span className="text-[11px] text-stone-500 block">
                Agent officiel Google, actions GitHub directes et PRs.
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTarget('gemini')}
              className={`p-4 rounded-xl border text-left transition-all ${
                target === 'gemini'
                  ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-800">
                  <Zap className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-charcoal">Gemini 2.5 Flash</span>
              </div>
              <span className="text-[11px] text-stone-500 block">
                Tier gratuit Google, vitesse éclair &amp; audits complets.
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTarget('groq')}
              className={`p-4 rounded-xl border text-left transition-all ${
                target === 'groq'
                  ? 'border-amber-600 bg-amber-50/40 ring-1 ring-amber-600'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800">
                  <Cpu className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-charcoal">Groq (GPT-OSS-120B)</span>
              </div>
              <span className="text-[11px] text-stone-500 block">
                Inférence ultra-rapide 0 latence, tier gratuit.
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTarget('brain')}
              className={`p-4 rounded-xl border text-left transition-all ${
                target === 'brain'
                  ? 'border-purple-600 bg-purple-50/40 ring-1 ring-purple-600'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center text-purple-800">
                  <Brain className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-charcoal">Heldonica Brain Local</span>
              </div>
              <span className="text-[11px] text-stone-500 block">
                Serveur local GPU (GTX 1660 Ti) avec 55 fiches RAG.
              </span>
            </button>
          </div>
        </div>

        {/* Détails de la tâche */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-stone-600 mb-1">
              Titre / Intention de la tâche
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Audit sémantique de la page Madère..."
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-eucalyptus/30 focus:border-eucalyptus"
            />
          </div>

          {target === 'jules' && (
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1 flex items-center gap-1">
                <GitBranch className="w-3.5 h-3.5" />
                <span>Branche GitHub de départ</span>
              </label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="main"
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-eucalyptus/30 focus:border-eucalyptus"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">
            Prompt / Instructions détaillées
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            required
            placeholder="Décrivez précisément ce que vous souhaitez que l'agent réalise..."
            className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-eucalyptus/30 focus:border-eucalyptus"
          />
        </div>

        {/* Erreurs éventuelles */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Bouton de soumission */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] text-stone-400">
            {target === 'jules'
              ? '✨ Créera une session Google Jules et enregistrera la tâche dans le registre agent_tasks.'
              : '⚡ Traitement immédiat avec retour direct dans la console.'}
          </span>

          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="px-6 py-2.5 rounded-xl bg-eucalyptus hover:bg-eucalyptus/90 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Traitement en cours...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Lancer la tâche</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Résultat d'exécution */}
      {result && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Résultat de la Tâche
              </span>
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                {result.provider} ({result.model})
              </span>
            </div>

            <div className="flex items-center gap-2">
              {result.sessionUrl && (
                <a
                  href={result.sessionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ouvrir dans Jules</span>
                </a>
              )}
              {result.result && (
                <button
                  type="button"
                  onClick={handleCopyResult}
                  className="px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copié !' : 'Copier'}</span>
                </button>
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-100 text-sm text-charcoal whitespace-pre-wrap leading-relaxed font-sans max-h-96 overflow-y-auto">
            {result.result}
          </div>
        </div>
      )}
    </div>
  )
}
