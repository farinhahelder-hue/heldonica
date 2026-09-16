'use client'

import { useState } from 'react'

type ModeCoach = '1' | '2' | '3'
type ModeEcriture = 'instagram' | 'story' | 'blog' | 'newsletter'
type Mode = ModeCoach | ModeEcriture | null

type Controle = {
  niveau: 'complet' | 'essentiel'
  score: number | null
  passed: boolean
  forbiddenFound: string[]
  checks: { id: string; ok: boolean; weight: number; message: string }[]
}

type Generation = {
  id: string
  mode: string
  prompt: string
  result: string
  score: number | null
  forbidden_found: string[]
  created_at: string
}

// Deux familles : le coach (une action, un temps, une version energie basse)
// et l'ecriture (un texte public dans la voix Heldonica, controle a la sortie).
const MODES_COACH: { id: ModeCoach; label: string; desc: string }[] = [
  { id: '1', label: 'Mode 1 — Contenu', desc: 'blog, carrousel, Reel, CMS, recycle' },
  { id: '2', label: 'Mode 2 — Pilotage', desc: 'démarrage, planification, déblocage, bilan' },
  { id: '3', label: 'Mode 3 — Site', desc: 'dev, audit, check, nettoyage' },
]

const MODES_ECRITURE: { id: ModeEcriture; label: string; desc: string }[] = [
  { id: 'instagram', label: 'Légende Instagram', desc: 'fil, photo ou carrousel — 80 à 150 mots' },
  { id: 'story', label: 'Story', desc: '25 mots, un sticker — 15 secondes' },
  { id: 'blog', label: 'Article de blog', desc: 'carnet de route, 5 sections, infos pratiques' },
  { id: 'newsletter', label: 'Newsletter', desc: 'objet, une histoire, un seul appel doux' },
]

// Des trames a remplir, pas des faits : le Copilote n'invente rien, l'exemple
// non plus. Les crochets disent quoi noter ; ce qui reste vide devient [À TOI].
const EXEMPLES: Record<Exclude<Mode, null>, string[]> = {
  '1': ['je veux publier quelque chose aujourd’hui mais je ne sais pas quoi', 'recycler un article en carrousel'],
  '2': ['je ne sais pas par quoi commencer', 'bilan de la semaine en trois lignes'],
  '3': ['vérifier que rien n’est cassé sur le site', 'faire le tri dans les brouillons'],
  instagram: [
    'Lieu : [ville, quartier]. Ce qu’on a vu / entendu / touché : [matière, lumière, son]. Ce qu’on a moins aimé : [une chose].',
    'Carrousel de [N] photos à [lieu] : photo 1 [ce qu’elle montre], photo 2 [...]. Moment : [heure, saison].',
  ],
  story: [
    '[Lieu], [heure] : [une scène en une phrase]. Question pour le sticker : [choix A] ou [choix B] ?',
  ],
  blog: [
    'Hébergement / lieu : [nom, village]. Nuits : [N] en [mois]. Vécu : [3 détails concrets]. Accès : [route, durée]. Prix : [ou laisser vide]. Moins aimé : [une chose honnête].',
  ],
  newsletter: [
    'Retour de [destination] : [durée]. L’histoire à raconter : [une seule]. Le détail qui reste : [sensoriel]. Ce qu’on partage : [carnet en ligne / photo / question].',
  ],
}

function estEcriture(m: Mode): m is ModeEcriture {
  return m === 'instagram' || m === 'story' || m === 'blog' || m === 'newsletter'
}

function libelleMode(m: string) {
  return [...MODES_COACH, ...MODES_ECRITURE].find((x) => x.id === m)?.label ?? m
}

export default function CopilotePage() {
  const [mode, setMode] = useState<Mode>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [reply, setReply] = useState<string | null>(null)
  const [controle, setControle] = useState<Controle | null>(null)
  const [enregistre, setEnregistre] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const [historiqueOuvert, setHistoriqueOuvert] = useState(false)
  const [historique, setHistorique] = useState<Generation[] | null>(null)
  const [historiqueNote, setHistoriqueNote] = useState<string | null>(null)

  const canLaunch = !!mode && message.trim().length > 0 && !loading

  async function lancer() {
    if (!canLaunch || !mode) return
    setLoading(true)
    setError(null)
    setReply(null)
    setControle(null)
    setEnregistre(null)
    try {
      const res = await fetch('/api/ai/gemini-gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, message: message.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')
      setReply(data.reply)
      setControle(data.controle ?? null)
      setEnregistre(typeof data.enregistre === 'boolean' ? data.enregistre : null)
      // L'historique affiche est perime des qu'une generation s'ajoute.
      setHistorique(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  function recommencer() {
    setMode(null)
    setMessage('')
    setReply(null)
    setControle(null)
    setEnregistre(null)
    setError(null)
    setCopied(false)
  }

  async function copier() {
    if (!reply) return
    await navigator.clipboard.writeText(reply)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function ouvrirHistorique() {
    const ouvrir = !historiqueOuvert
    setHistoriqueOuvert(ouvrir)
    if (!ouvrir || historique) return
    try {
      const res = await fetch('/api/ai/gemini-gallery?limit=10')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`)
      setHistorique(Array.isArray(data.generations) ? data.generations : [])
      setHistoriqueNote(data.indisponible ?? null)
    } catch (e) {
      setHistorique([])
      setHistoriqueNote(e instanceof Error ? e.message : String(e))
    }
  }

  function reprendre(g: Generation) {
    const m = g.mode as Exclude<Mode, null>
    setMode(m)
    setMessage(g.prompt)
    setReply(g.result)
    setControle(null)
    setEnregistre(true)
    setError(null)
    setHistoriqueOuvert(false)
  }

  const carte = (m: { id: Exclude<Mode, null>; label: string; desc: string }) => (
    <button
      key={m.id}
      onClick={() => { setMode(m.id); setReply(null); setControle(null); setError(null) }}
      className={`p-4 rounded-xl border-2 text-left transition-all ${
        mode === m.id
          ? 'border-[#2D8B7A] bg-[#2D8B7A]/10'
          : 'border-stone-200 bg-white hover:border-stone-300'
      }`}
    >
      <div className="text-sm font-semibold text-stone-800">{m.label}</div>
      <div className="text-xs text-stone-500 mt-1">{m.desc}</div>
    </button>
  )

  const ecriture = estEcriture(mode)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#6B2D1F]">Copilote Heldonica</h1>
        <p className="text-sm text-stone-500 mt-1">Une seule action à la fois — 5/15/30 min — version énergie basse</p>
      </div>

      {/* Sélection mode */}
      <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-2">Avancer</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {MODES_COACH.map(carte)}
      </div>
      <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-2">Écrire</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {MODES_ECRITURE.map(carte)}
      </div>

      {/* Champ message */}
      {mode && (
        <div className="mb-6">
          <label className="text-sm font-medium text-stone-700">
            {ecriture ? 'Tes notes de terrain' : 'Ton message'}
          </label>
          {ecriture && (
            <p className="text-xs text-stone-500 mt-0.5">
              Ce qui n&apos;est pas dans tes notes n&apos;existera pas dans le texte : le Copilote écrit [À TOI] à la place.
            </p>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {EXEMPLES[mode].map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setMessage(ex)}
                className="text-xs px-3 py-1.5 rounded-full border border-stone-200 bg-stone-50 text-stone-600 hover:border-[#2D8B7A] hover:text-stone-800 text-left"
                title="Remplir avec cette trame"
              >
                {ex.length > 70 ? ex.slice(0, 70) + '…' : ex}
              </button>
            ))}
          </div>
          {ecriture ? (
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder="Lieu, ce que tu as vu, entendu, touché, ce que tu as moins aimé…"
              className="mt-2 w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8B7A] focus:border-transparent"
            />
          ) : (
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && canLaunch && lancer()}
              placeholder="ex: je ne sais pas quoi faire"
              className="mt-2 w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8B7A] focus:border-transparent"
            />
          )}
        </div>
      )}

      {/* Bouton lancer */}
      {mode && (
        <button
          onClick={lancer}
          disabled={!canLaunch}
          className="w-full py-3 bg-[#2D8B7A] text-white rounded-xl font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#257a6a] transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              En cours...
            </>
          ) : ecriture ? (
            'Écrire'
          ) : (
            'Lancer'
          )}
        </button>
      )}

      {/* Erreur */}
      {error && <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">{error}</div>}

      {/* Réponse */}
      {reply && (
        <div className="mt-8 p-5 bg-white border border-stone-200 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-stone-800">{ecriture ? 'Ton texte' : 'Ta prochaine action'}</h2>
            <div className="flex gap-2">
              <button
                onClick={copier}
                className="text-xs px-3 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
              >
                {copied ? 'Copié ✓' : 'Copier'}
              </button>
              <button onClick={recommencer} className="text-xs px-3 py-1.5 text-stone-500 hover:text-stone-700">
                Recommencer
              </button>
            </div>
          </div>

          {/* Contrôle de voix — une mesure, pas un badge decoratif */}
          {controle && (
            <div className={`mb-3 p-3 rounded-lg text-xs ${controle.passed ? 'bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-900'}`}>
              <div className="font-semibold">
                {controle.passed ? 'Voix Heldonica : rien à signaler' : 'Voix Heldonica : à relire'}
                {controle.score !== null && <span className="font-normal"> — {controle.score}/100 sur les 7 garde-fous</span>}
                {controle.niveau === 'essentiel' && <span className="font-normal"> — pronoms et lexique seulement (format court)</span>}
              </div>
              {controle.forbiddenFound.length > 0 && (
                <p className="mt-1">Mots bannis trouvés : <strong>{controle.forbiddenFound.join(', ')}</strong></p>
              )}
              {controle.checks.filter((c) => !c.ok).map((c) => (
                <p key={c.id} className="mt-1">· {c.message}</p>
              ))}
            </div>
          )}

          <div className="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed">{reply}</div>

          {enregistre === false && (
            <p className="mt-3 text-[11px] text-stone-400">Non enregistré dans l&apos;historique (base indisponible ou migration non appliquée).</p>
          )}
        </div>
      )}

      {/* Historique */}
      <div className="mt-10">
        <button onClick={ouvrirHistorique} className="text-xs text-stone-500 hover:text-stone-800 underline">
          {historiqueOuvert ? 'Masquer les dernières générations' : 'Dernières générations'}
        </button>
        {historiqueOuvert && (
          <div className="mt-3 space-y-2">
            {historique === null && <p className="text-xs text-stone-400">Chargement…</p>}
            {historiqueNote && <p className="text-xs text-amber-800">{historiqueNote}</p>}
            {historique && historique.length === 0 && !historiqueNote && (
              <p className="text-xs text-stone-400">Rien encore.</p>
            )}
            {historique?.map((g) => (
              <button
                key={g.id}
                onClick={() => reprendre(g)}
                className="w-full text-left p-3 rounded-lg border border-stone-200 bg-white hover:border-[#2D8B7A]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-stone-700">{libelleMode(g.mode)}</span>
                  <span className="text-[10px] text-stone-400">
                    {new Date(g.created_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    {g.score !== null && ` · ${g.score}/100`}
                    {g.forbidden_found?.length > 0 && ` · ${g.forbidden_found.length} mot(s) banni(s)`}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-1 line-clamp-2">{g.result}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
