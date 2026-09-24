'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'

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

type ItineraryStep = {
  day?: number
  title: string
  desc: string
}

type DestinationSummary = {
  id: string
  slug: string
  title: string
  country: string
  region?: string
  excerpt?: string
  intro_narrative?: string
  itinerary?: ItineraryStep[]
  faq?: Array<{ q: string; a: string }>
}

const MODES_ECRITURE: { id: ModeEcriture; label: string; tag: string; icon: string; desc: string; targetWords: string }[] = [
  { id: 'instagram', label: 'Légende Instagram', tag: 'Instagram', icon: '📸', desc: 'Accroche vécue, matière & lumière, question en « tu », hashtags sobres', targetWords: '80 à 150 mots' },
  { id: 'story', label: 'Story Instagram', tag: 'Story', icon: '⚡', desc: '1 à 3 lignes sensorielles + ligne Sticker sondage ou question', targetWords: '≤ 25 mots' },
  { id: 'blog', label: 'Article de blog', tag: 'Blog', icon: '📖', desc: 'Carnet de route Markdown en 5 sections H2, infos pratiques, méta', targetWords: '500 à 800 mots' },
  { id: 'newsletter', label: 'Email Newsletter', tag: 'Newsletter', icon: '💌', desc: 'Objet court, pré-en-tête, une seule histoire vécue, un appel doux', targetWords: '150 à 250 mots' },
]

const MODES_COACH: { id: ModeCoach; label: string; tag: string; icon: string; desc: string }[] = [
  { id: '1', label: 'Mode 1 — Contenu', tag: 'Coach 1', icon: '🎨', desc: 'Création : blog, carrousel, Reel, CMS, recyclage' },
  { id: '2', label: 'Mode 2 — Pilotage', tag: 'Coach 2', icon: '🧭', desc: 'Démarrage, planification, déblocage, bilan' },
  { id: '3', label: 'Mode 3 — Site & Dev', tag: 'Coach 3', icon: '🛠️', desc: 'Dev, audit, check, nettoyage, sécurité' },
]

const EXEMPLES: Record<Exclude<Mode, null>, string[]> = {
  instagram: [
    'Cour intérieure pavée à Timișoara, table en bois brut sous la tonnelle, eau fraîche infusée à la menthe. Cloches d’une église au loin, calme absolu.',
    'Bord de mer à Madère, galets volcaniques polis par les vagues, embruns frais sur le visage. Fin d’après-midi silencieuse sans aucune foule.',
  ],
  story: [
    'Timișoara, 16h : la chaleur des pavés sous nos pas et l’ombre bienvenue de la tonnelle. Sticker : Tu préfères l’ombre fraîche ou le soleil d’automne ?',
    'Fanal, Madère : la brume qui enveloppe les lauriers centenaires en silence. Sticker : Tu aimes voyager dans la brume ? (Oui tellement / Plutôt grand soleil)',
  ],
  blog: [
    'Hébergement : Pension traditionnelle en Maramureș. 3 nuits en mai. Vécu : plancher de chêne qui craque, odeur de foin séché, silence nocturne total. Accès : route goudronnée puis piste sur 500m. Moins aimé : eau chaude un peu lente à monter.',
    'Randonnée : Sentier côtier de São Lourenço. Durée : 3h30. Vécu : vent vif, falaises d’ocre rouge qui plongent dans l’Atlantique. Moins aimé : début du sentier exposé au vent sans abri.',
  ],
  newsletter: [
    'Retour de 10 jours en Roumanie. L’histoire : ce menuisier de village qui nous a montré ses outils sculptés à la main sans dire un mot. Le détail : l’odeur de résine et de copeaux frais. Appel doux : lire le carnet complet sur le blog.',
  ],
  '1': [
    'Je veux publier un carrousel aujourd’hui sur Instagram mais je n’ai pas d’idée d’angle.',
    'Comment recycler notre dernier carnet de route sur Madère en 3 formats courts ?',
  ],
  '2': [
    'Je ne sais pas par quoi commencer ce matin, je me sens dispersé.',
    'Faire le bilan de la semaine en trois points essentiels avec peu d’énergie.',
  ],
  '3': [
    'Vérifier que les garde-fous et les images du site sont tous opérationnels.',
    'Nettoyer les vieux brouillons d’articles sans risquer de supprimer des données.',
  ],
}

function estEcriture(m: Mode): m is ModeEcriture {
  return m === 'instagram' || m === 'story' || m === 'blog' || m === 'newsletter'
}

function libelleMode(m: string) {
  const item = [...MODES_ECRITURE, ...MODES_COACH].find((x) => x.id === m)
  return item ? `${item.icon} ${item.label}` : m
}

function compterMots(texte: string): number {
  const trimmed = texte.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).filter(Boolean).length
}

function separerLegendeEtHashtags(texte: string): { caption: string; hashtags: string } {
  const lignes = texte.split('\n')
  const lignesHashtags: string[] = []
  const lignesCorps: string[] = []

  let dansHashtags = false
  for (let i = lignes.length - 1; i >= 0; i--) {
    const l = lignes[i].trim()
    if (!l && !dansHashtags) continue
    if (l.startsWith('#') || /^(#[a-zA-Z0-9_\u00C0-\u017F]+\s*)+$/.test(l)) {
      dansHashtags = true
      lignesHashtags.unshift(lignes[i])
    } else {
      lignesCorps.unshift(...lignes.slice(0, i + 1))
      break
    }
  }

  if (lignesHashtags.length > 0) {
    return {
      caption: lignesCorps.join('\n').trim(),
      hashtags: lignesHashtags.join('\n').trim(),
    }
  }

  return { caption: texte.trim(), hashtags: '' }
}

export default function CopilotePage() {
  const [mode, setMode] = useState<Mode>('instagram')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [reply, setReply] = useState<string | null>(null)
  const [controle, setControle] = useState<Controle | null>(null)
  const [enregistre, setEnregistre] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Destinations réelles de la base Supabase (41 destinations)
  const [destinations, setDestinations] = useState<DestinationSummary[]>([])
  const [chargementDestinations, setChargementDestinations] = useState(false)
  const [destinationSlug, setDestinationSlug] = useState<string>('')
  const [etapeIndex, setEtapeIndex] = useState<string>('all')
  const [injecteFeedback, setInjecteFeedback] = useState(false)

  // Recherche sémantique par ambiance (pgvector)
  const [modeSelectionDestination, setModeSelectionDestination] = useState<'liste' | 'semantique'>('liste')
  const [requeteSemantique, setRequeteSemantique] = useState('')
  const [resultatsSemantiques, setResultatsSemantiques] = useState<Array<{
    type: string;
    id: string | number;
    slug: string;
    title: string;
    subtitle: string;
    excerpt: string;
    similarity: number;
    matchScorePercent: number;
  }>>([])
  const [rechercheEnCours, setRechercheEnCours] = useState(false)

  // Historique en direct depuis la base de données
  const [historiqueOuvert, setHistoriqueOuvert] = useState(true)
  const [historique, setHistorique] = useState<Generation[] | null>(null)
  const [chargementHistorique, setChargementHistorique] = useState(false)
  const [historiqueNote, setHistoriqueNote] = useState<string | null>(null)
  const [filtreHistorique, setFiltreHistorique] = useState<string>('tous')

  const canLaunch = !!mode && message.trim().length > 0 && !loading
  const ecriture = estEcriture(mode)

  // Chargement des destinations réelles depuis Supabase
  useEffect(() => {
    async function chargerDestinations() {
      setChargementDestinations(true)
      try {
        const res = await fetch('/api/cms/destinations')
        const data = await res.json()
        if (data.success && Array.isArray(data.destinations)) {
          setDestinations(data.destinations)
        }
      } catch (err) {
        console.warn('[Copilote] Erreur chargement destinations:', err)
      } finally {
        setChargementDestinations(false)
      }
    }
    chargerDestinations()
  }, [])

  // Chargement de l'historique depuis Supabase
  const chargerHistorique = useCallback(async () => {
    setChargementHistorique(true)
    try {
      const res = await fetch('/api/ai/gemini-gallery?limit=25')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`)
      setHistorique(Array.isArray(data.generations) ? data.generations : [])
      setHistoriqueNote(data.indisponible ?? null)
    } catch (e) {
      setHistorique([])
      setHistoriqueNote(e instanceof Error ? e.message : String(e))
    } finally {
      setChargementHistorique(false)
    }
  }, [])

  useEffect(() => {
    chargerHistorique()
  }, [chargerHistorique])

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
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la génération')
      setReply(data.reply)
      setControle(data.controle ?? null)
      setEnregistre(typeof data.enregistre === 'boolean' ? data.enregistre : null)

      // Actualise l'historique en base
      chargerHistorique()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  function recommencer() {
    setMessage('')
    setReply(null)
    setControle(null)
    setEnregistre(null)
    setError(null)
    setCopiedId(null)
  }

  async function copierTexte(texte: string, identifiant: string) {
    if (!texte) return
    try {
      await navigator.clipboard.writeText(texte)
      setCopiedId(identifiant)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Erreur copie:', err)
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
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Regroupement des destinations par pays
  const destinationsParPays = useMemo(() => {
    const map = new Map<string, DestinationSummary[]>()
    for (const d of destinations) {
      const pays = d.country || 'Autres'
      if (!map.has(pays)) map.set(pays, [])
      map.get(pays)!.push(d)
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [destinations])

  const destinationSelectionnee = useMemo(() => {
    return destinations.find((d) => d.slug === destinationSlug) || null
  }, [destinations, destinationSlug])

  // Injection du vécu réel dans le champ de notes
  function injecterDestination(slugOverride?: string) {
    const slug = slugOverride || destinationSlug
    if (!slug || destinations.length === 0) return
    const d = destinations.find((x) => x.slug === slug)
    if (!d) return

    let texte = ''
    if (etapeIndex !== 'all' && d.itinerary && d.itinerary[Number(etapeIndex)]) {
      const etape = d.itinerary[Number(etapeIndex)]
      texte = `Lieu : ${etape.title} (${d.country}) — étape du carnet ${d.title}.
Ce qu'on a vécu : ${etape.desc}
Contexte terrain : ${d.intro_narrative || d.excerpt || ''}
Nuance honnête : [À TOI : le petit détail d'ambiance ou la météo].`
    } else {
      const etapesList = (d.itinerary || []).slice(0, 4).map((e) => `- ${e.title}: ${e.desc}`).join('\n')
      texte = `Destination : ${d.title} (${d.country}).
Récit de terrain : ${d.intro_narrative || d.excerpt || ''}
${etapesList ? `Moments forts vécus :\n${etapesList}\n` : ''}
Nuance / ce qu'on a moins aimé : [À TOI : détail ou route étroite].`
    }

    setMessage(texte)
    setInjecteFeedback(true)
    setTimeout(() => setInjecteFeedback(false), 2500)
  }

  // Recherche sémantique via l'endpoint /api/ai/search
  const lancerRechercheSemantique = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const q = requeteSemantique.trim()
    if (!q) return
    setRechercheEnCours(true)
    try {
      const res = await fetch(`/api/ai/search?type=destinations&q=${encodeURIComponent(q)}&limit=4`)
      const data = await res.json()
      if (data.success && Array.isArray(data.results)) {
        setResultatsSemantiques(data.results)
      }
    } catch (err) {
      console.warn('[Copilote] Erreur recherche sémantique:', err)
    } finally {
      setRechercheEnCours(false)
    }
  }

  // Filtrage de l'historique
  const historiqueFiltre = useMemo(() => {
    if (!historique) return []
    if (filtreHistorique === 'tous') return historique
    if (filtreHistorique === 'coach') return historique.filter((g) => ['1', '2', '3'].includes(g.mode))
    return historique.filter((g) => g.mode === filtreHistorique)
  }, [historique, filtreHistorique])

  // Découpage automatique de la réponse pour Instagram
  const partiesReponse = useMemo(() => {
    if (!reply) return null
    return separerLegendeEtHashtags(reply)
  }, [reply])

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* En-tête Heldonica */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#6B2D1F]">Copilote Heldonica</h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#2D8B7A]/15 text-[#2D8B7A]">
              Gemini 2.5 Flash
            </span>
          </div>
          <p className="text-sm text-stone-500 mt-1">
            Génération slow travel & coaching neuroatypique (ADHD/TSA) — ancré dans le réel des 41 destinations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/panel-manager/analytics"
            className="text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 hover:border-[#2D8B7A] text-stone-600 hover:text-[#2D8B7A] transition-colors flex items-center gap-1.5 font-medium shadow-2xs"
            title="Surveiller la consommation des clés IA et quotas"
          >
            <span>📊</span>
            <span>Analytics IA</span>
          </a>
          <button
            onClick={recommencer}
            type="button"
            className="text-xs px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-800 transition-colors"
          >
            Effacer tout
          </button>
        </div>
      </div>

      {/* Sélecteur de modes : Catégorie 1 - Rédaction de contenu */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
            Écrire du contenu slow travel
          </p>
          <span className="text-[11px] text-stone-400">Voix « on » + « tu » complice</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {MODES_ECRITURE.map((m) => {
            const actif = mode === m.id
            return (
              <button
                key={m.id}
                onClick={() => { setMode(m.id); setReply(null); setControle(null); setError(null) }}
                className={`p-3.5 rounded-xl border text-left transition-all relative ${
                  actif
                    ? 'border-[#2D8B7A] bg-[#2D8B7A]/10 shadow-sm ring-1 ring-[#2D8B7A]'
                    : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-stone-800 flex items-center gap-1.5">
                    <span>{m.icon}</span>
                    <span>{m.label}</span>
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                    {m.targetWords}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">{m.desc}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Sélecteur de modes : Catégorie 2 - Coach & Pilotage */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
            Coaching & Avancement (ADHD/TSA)
          </p>
          <span className="text-[11px] text-stone-400">1 seule action · 5/15/30 min</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {MODES_COACH.map((m) => {
            const actif = mode === m.id
            return (
              <button
                key={m.id}
                onClick={() => { setMode(m.id); setReply(null); setControle(null); setError(null) }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  actif
                    ? 'border-[#6B2D1F] bg-[#6B2D1F]/10 shadow-sm ring-1 ring-[#6B2D1F]'
                    : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/50'
                }`}
              >
                <span className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                  <span>{m.icon}</span>
                  <span>{m.label}</span>
                </span>
                <p className="text-[11px] text-stone-500 mt-1 line-clamp-1">{m.desc}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Zone de saisie */}
      {mode && (
        <div className="mb-6 bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-semibold text-stone-800">
              {ecriture ? 'Tes notes de terrain réelles' : 'Quelle est la situation ou la question ?'}
            </label>
            <span className="text-xs text-stone-400">
              {compterMots(message)} mot(s) · {message.length} car.
            </span>
          </div>

          {ecriture && (
            <p className="text-xs text-stone-500 mb-2.5 leading-relaxed">
              « On n&apos;invente rien. On raconte ce qu&apos;on a vécu. » Note les matières, les sons, les odeurs et ce que tu as moins aimé.
            </p>
          )}

          {/* Injecteur de vécu terrain basé sur les 41 destinations en base */}
          {ecriture && destinations.length > 0 && (
            <div className="mb-3.5 p-3 bg-[#2D8B7A]/5 border border-[#2D8B7A]/25 rounded-xl">
              {/* Onglets Mode Liste vs Recherche Sémantique */}
              <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-[#2D8B7A]/15">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setModeSelectionDestination('liste')}
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-md transition-colors ${
                      modeSelectionDestination === 'liste'
                        ? 'bg-[#2D8B7A] text-white shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    🗺️ Liste ({destinations.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setModeSelectionDestination('semantique')}
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-md transition-colors flex items-center gap-1 ${
                      modeSelectionDestination === 'semantique'
                        ? 'bg-[#2D8B7A] text-white shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <span>🧠 Recherche sémantique</span>
                    <span className="text-[9px] bg-emerald-700/20 px-1 rounded font-mono">IA</span>
                  </button>
                </div>
                {chargementDestinations && <span className="text-[10px] text-stone-400 animate-pulse">Chargement…</span>}
              </div>

              {/* Affichage Mode Liste déroulante */}
              {modeSelectionDestination === 'liste' ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <select
                      value={destinationSlug}
                      onChange={(e) => {
                        setDestinationSlug(e.target.value)
                        setEtapeIndex('all')
                      }}
                      className="text-xs px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-stone-700 focus:outline-none focus:ring-1 focus:ring-[#2D8B7A]"
                    >
                      <option value="">Sélectionner une destination…</option>
                      {destinationsParPays.map(([pays, liste]) => (
                        <optgroup key={pays} label={pays}>
                          {liste.map((d) => (
                            <option key={d.slug} value={d.slug}>
                              {d.title}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>

                    {destinationSelectionnee && destinationSelectionnee.itinerary && destinationSelectionnee.itinerary.length > 0 ? (
                      <select
                        value={etapeIndex}
                        onChange={(e) => setEtapeIndex(e.target.value)}
                        className="text-xs px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-stone-700 focus:outline-none focus:ring-1 focus:ring-[#2D8B7A]"
                      >
                        <option value="all">🌟 Toute la destination (ambiance globale)</option>
                        {destinationSelectionnee.itinerary.map((it, idx) => (
                          <option key={idx} value={String(idx)}>
                            📍 {it.day ? `Jour ${it.day} : ` : ''}{it.title}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-[11px] text-stone-400 flex items-center px-2">
                        {destinationSelectionnee ? 'Récit global prêt' : 'Choisis un lieu pour voir les étapes'}
                      </div>
                    )}
                  </div>

                  {destinationSlug && (
                    <button
                      type="button"
                      onClick={() => injecterDestination()}
                      className="w-full text-xs py-2 px-3 bg-[#2D8B7A] hover:bg-[#257567] text-white rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 shadow-xs active:scale-[0.99]"
                    >
                      <span>{injecteFeedback ? '✓ Notes de terrain injectées avec succès !' : '⚡ Injecter ce vécu dans mes notes'}</span>
                    </button>
                  )}
                </div>
              ) : (
                /* Affichage Mode Recherche Sémantique */
                <div className="space-y-2">
                  <form onSubmit={lancerRechercheSemantique} className="flex gap-1.5">
                    <input
                      type="text"
                      value={requeteSemantique}
                      onChange={(e) => setRequeteSemantique(e.target.value)}
                      placeholder="ex: crique secrète sans vent, randonnée en crête, vieux village..."
                      className="flex-1 text-xs px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#2D8B7A]"
                    />
                    <button
                      type="submit"
                      disabled={rechercheEnCours || !requeteSemantique.trim()}
                      className="text-xs px-3 py-1.5 bg-[#2D8B7A] hover:bg-[#257567] text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      {rechercheEnCours ? 'Recherche...' : 'Chercher'}
                    </button>
                  </form>

                  {resultatsSemantiques.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block">
                        Lieux correspondants par similarité :
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {resultatsSemantiques.map((res) => (
                          <button
                            key={res.slug}
                            type="button"
                            onClick={() => {
                              setDestinationSlug(res.slug)
                              setEtapeIndex('all')
                              injecterDestination(res.slug)
                            }}
                            className="p-2 bg-white hover:bg-stone-50 border border-stone-200 hover:border-[#2D8B7A] rounded-lg text-left transition-all shadow-2xs"
                          >
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <span className="font-semibold text-xs text-stone-800 truncate">
                                {res.title}
                              </span>
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                                🎯 {res.matchScorePercent}%
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-500 line-clamp-1">
                              {res.subtitle}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Trames prêtes à l'emploi */}
          <div className="mb-3">
            <span className="text-[11px] font-medium text-stone-400 block mb-1.5">Ou utiliser une trame type :</span>
            <div className="flex flex-col gap-1.5">
              {EXEMPLES[mode].map((ex, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setMessage(ex)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50/80 text-stone-600 hover:border-[#2D8B7A] hover:bg-[#2D8B7A]/5 hover:text-stone-900 text-left transition-colors font-mono text-[11px]"
                  title="Utiliser cette trame"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {ecriture ? (
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder="Lieu, ce qu'on a vu, touché, entendu, dégusté, et une nuance honnête..."
              className="w-full px-3.5 py-2.5 border border-stone-300 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#2D8B7A] focus:border-transparent font-sans leading-relaxed"
            />
          ) : (
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && canLaunch && lancer()}
              placeholder="ex: par quoi commencer ce matin / recycler un article..."
              className="w-full px-3.5 py-2.5 border border-stone-300 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#6B2D1F] focus:border-transparent"
            />
          )}

          {/* Bouton de génération principal */}
          <div className="mt-3 flex items-center justify-between">
            <div className="text-[11px] text-stone-400">
              {ecriture ? 'Génération avec contrôle des 7 garde-fous' : 'Action rapide sans surcharge cognitive'}
            </div>
            <button
              onClick={lancer}
              disabled={!canLaunch}
              className={`px-5 py-2.5 text-white text-sm rounded-lg font-medium transition-all flex items-center gap-2 shadow-sm ${
                !canLaunch
                  ? 'bg-stone-300 cursor-not-allowed opacity-60'
                  : ecriture
                  ? 'bg-[#2D8B7A] hover:bg-[#257567] active:scale-[0.98]'
                  : 'bg-[#6B2D1F] hover:bg-[#582419] active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Génération en cours...</span>
                </>
              ) : (
                <>
                  <span>✨</span>
                  <span>{ecriture ? 'Rédiger le contenu' : 'Obtenir l’action'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-800 flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Résultat généré */}
      {reply && (
        <div className="mb-8 p-5 bg-white border-2 border-[#2D8B7A]/40 rounded-xl shadow-md transition-all">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-stone-800 flex items-center gap-1.5">
                <span>{libelleMode(mode || '')}</span>
              </h2>
              <span className="text-xs text-stone-400">
                ({compterMots(reply)} mots · {reply.length} car.)
              </span>
            </div>

            {/* Barre de boutons de copie ciblés + Meta Business Suite */}
            <div className="flex flex-wrap items-center gap-1.5">
              {partiesReponse && partiesReponse.hashtags && (
                <>
                  <button
                    onClick={() => copierTexte(partiesReponse.caption, 'main-caption')}
                    className="text-xs px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md font-medium transition-colors"
                    title="Copier uniquement le corps du texte sans les hashtags"
                  >
                    {copiedId === 'main-caption' ? '✓ Légende copiée' : '📝 Légende seule'}
                  </button>

                  <button
                    onClick={() => copierTexte(partiesReponse.hashtags, 'main-hashtags')}
                    className="text-xs px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md font-medium transition-colors"
                    title="Copier uniquement les hashtags"
                  >
                    {copiedId === 'main-hashtags' ? '✓ Hashtags copiés' : '🏷️ Hashtags seuls'}
                  </button>
                </>
              )}

              <button
                onClick={() => copierTexte(reply, 'main-all')}
                className="text-xs px-3 py-1.5 bg-[#2D8B7A] hover:bg-[#257567] text-white rounded-md font-semibold transition-all shadow-sm flex items-center gap-1"
                title="Copier l'intégralité du texte généré"
              >
                {copiedId === 'main-all' ? (
                  <>
                    <span>✓</span>
                    <span>Copié dans le presse-papier !</span>
                  </>
                ) : (
                  <>
                    <span>📋</span>
                    <span>Copier tout</span>
                  </>
                )}
              </button>

              {/* Raccourci vers Meta Business Suite */}
              {mode === 'instagram' && (
                <a
                  href="https://business.facebook.com/latest/composer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-2.5 py-1.5 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 text-purple-800 rounded-md font-medium transition-colors border border-purple-200 flex items-center gap-1"
                  title="Ouvrir l'éditeur de publication officiel Meta Business Suite dans un nouvel onglet"
                >
                  <span>↗️</span>
                  <span>Meta Business Suite</span>
                </a>
              )}
            </div>
          </div>

          {/* Contrôle de conformité de voix Heldonica */}
          {controle && (
            <div className={`mb-4 p-3 rounded-lg text-xs ${controle.passed ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-amber-50 text-amber-900 border border-amber-200'}`}>
              <div className="font-semibold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span>{controle.passed ? '✅' : '⚠️'}</span>
                  <span>{controle.passed ? 'Voix Heldonica : 100% Conforme' : 'Voix Heldonica : points à vérifier'}</span>
                </span>
                {controle.score !== null && (
                  <span className="px-2 py-0.5 bg-emerald-200/60 rounded font-bold">
                    Score : {controle.score}/100
                  </span>
                )}
              </div>

              {controle.forbiddenFound.length > 0 && (
                <p className="mt-1.5 text-rose-700">
                  Mots bannis détectés : <strong>{controle.forbiddenFound.join(', ')}</strong>
                </p>
              )}

              <div className="mt-2 space-y-1">
                {controle.checks.map((c) => (
                  <div key={c.id} className="flex items-center gap-1.5 text-[11px]">
                    <span>{c.ok ? '✓' : '✗'}</span>
                    <span className={c.ok ? 'text-emerald-800' : 'text-amber-800 font-medium'}>{c.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Texte de la réponse */}
          <div className="text-sm text-stone-800 whitespace-pre-wrap leading-relaxed bg-stone-50/60 p-3.5 rounded-lg border border-stone-100 font-sans">
            {reply}
          </div>

          {/* Note sur la persistance en base */}
          <div className="mt-3 flex items-center justify-between text-[11px] text-stone-400">
            <span>
              {enregistre === true
                ? '✅ Enregistré automatiquement dans la table Supabase `copilot_generations`.'
                : enregistre === false
                ? '⚠️ Non persisté dans l’historique.'
                : ''}
            </span>
          </div>
        </div>
      )}

      {/* Section Historique dynamique */}
      <div className="mt-8 border-t border-stone-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-stone-800 flex items-center gap-1.5">
              <span>🗄️</span>
              <span>Historique en base de données</span>
            </h3>
            {historique && (
              <span className="text-xs px-2 py-0.5 bg-stone-100 text-stone-600 rounded-full font-medium">
                {historiqueFiltre.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={chargerHistorique}
              disabled={chargementHistorique}
              className="text-xs px-2.5 py-1 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded transition-colors flex items-center gap-1"
              title="Actualiser l'historique"
            >
              <span className={chargementHistorique ? 'animate-spin' : ''}>🔄</span>
              <span>Actualiser</span>
            </button>
            <button
              onClick={() => setHistoriqueOuvert(!historiqueOuvert)}
              className="text-xs text-stone-500 hover:text-stone-800 underline ml-1"
            >
              {historiqueOuvert ? 'Réduire' : 'Afficher'}
            </button>
          </div>
        </div>

        {historiqueOuvert && (
          <div>
            {/* Onglets de filtres */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {[
                { id: 'tous', label: 'Tous' },
                { id: 'instagram', label: '📸 Instagram' },
                { id: 'story', label: '⚡ Story' },
                { id: 'blog', label: '📖 Blog' },
                { id: 'newsletter', label: '💌 Newsletter' },
                { id: 'coach', label: '🧭 Coachs' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFiltreHistorique(f.id)}
                  className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                    filtreHistorique === f.id
                      ? 'bg-[#2D8B7A] text-white font-medium shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Note d'information éventuelle */}
            {historiqueNote && (
              <div className="p-3 mb-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                {historiqueNote}
              </div>
            )}

            {/* État de chargement */}
            {chargementHistorique && !historique && (
              <p className="text-xs text-stone-400 py-4 text-center">Chargement des générations depuis Supabase…</p>
            )}

            {/* Liste vide */}
            {historiqueFiltre.length === 0 && !chargementHistorique && (
              <p className="text-xs text-stone-400 py-4 text-center bg-stone-50 rounded-lg border border-dashed border-stone-200">
                Aucune génération trouvée pour ce filtre.
              </p>
            )}

            {/* Cartes d'historique */}
            <div className="space-y-2.5">
              {historiqueFiltre.map((g) => {
                const estActif = reply === g.result
                const cardCopied = copiedId === `hist-${g.id}`
                return (
                  <div
                    key={g.id}
                    className={`p-3.5 rounded-xl border transition-all bg-white ${
                      estActif
                        ? 'border-[#2D8B7A] ring-1 ring-[#2D8B7A]/50 shadow-xs'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-stone-800">
                          {libelleMode(g.mode)}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {new Date(g.created_at).toLocaleString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {g.score !== null && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            {g.score}/100
                          </span>
                        )}
                        {g.forbidden_found && g.forbidden_found.length > 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                            {g.forbidden_found.length} mot(s) banni(s)
                          </span>
                        )}

                        <button
                          onClick={() => copierTexte(g.result, `hist-${g.id}`)}
                          className="text-[11px] px-2 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition-colors"
                          title="Copier directement ce texte"
                        >
                          {cardCopied ? '✓ Copié' : '📋 Copier'}
                        </button>

                        <button
                          onClick={() => reprendre(g)}
                          className="text-[11px] px-2 py-1 rounded bg-[#2D8B7A]/10 hover:bg-[#2D8B7A]/20 text-[#2D8B7A] font-semibold transition-colors"
                          title="Recharger dans l'éditeur"
                        >
                          ↩ Reprendre
                        </button>
                      </div>
                    </div>

                    <div className="text-[11px] text-stone-400 italic line-clamp-1 mb-1">
                      « {g.prompt} »
                    </div>

                    <p className="text-xs text-stone-700 line-clamp-2 leading-relaxed bg-stone-50 p-2 rounded border border-stone-100">
                      {g.result}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
