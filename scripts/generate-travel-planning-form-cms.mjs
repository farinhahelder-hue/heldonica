// Migration de la page /travel-planning-form vers le CMS 3.0.
// Client component : InlineEditProvider sans initialZones (pattern app/merci).
//
// Règle de conception : les VALUES des options sont les données soumises à
// l'API (tripType, vibe, destination, duration, budget) — elles restent du
// code. Seuls les LIBELLÉS affichés (labels/emoji/questions/titres) passent
// en EditableZone. Les placeholders (attributs) ne peuvent pas recevoir de
// composant : ils restent du code.
//
// Usage : node scripts/generate-travel-planning-form-cms.mjs

import { readFileSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const sqlEscape = (v) => v.replace(/'/g, "''")
const q = (s) => JSON.stringify(s)
const decodeEntities = (s) =>
  (s || '')
    .replace(/&apos;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')

const PAGE = 'travel-planning-form'
const FILE = 'app/travel-planning-form/page.tsx'

function readOriginal(relPath) {
  try {
    return execSync(`git show HEAD:${relPath}`, { cwd: ROOT, encoding: 'utf8' })
  } catch {
    return readFileSync(join(ROOT, relPath), 'utf8')
  }
}

const collapse = (s) => decodeEntities(s).replace(/<\/?[^>]+>/g, '').replace(/\s+/g, ' ').trim()

// ═══════════════════════════ Extraction ═══════════════════════════

function getSteps(content) {
  const m = content.match(/const STEPS = \[([^\]]*)\]/)
  if (!m) return []
  return [...m[1].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((x) => decodeEntities(x[1].replace(/\\'/g, "'")).trim())
}

function getHero(content) {
  const h1 = content.match(/<h1 className="text-4xl font-serif font-light text-mahogany mb-4">\s*([\s\S]*?)\s*<\/h1>/)?.[1] || ''
  const [part1, part2] = h1.split(/<br\s*\/?>/)
  const description = content.match(/<p className="text-base text-charcoal\/60 mb-2">\s*([\s\S]*?)\s*<\/p>/)?.[1] || ''
  const note = content.match(/<p className="text-charcoal\/40 text-sm">\s*([\s\S]*?)\s*<\/p>/)?.[1] || ''
  return {
    title1: collapse(part1),
    title2: collapse(part2),
    description: collapse(description),
    note: collapse(note),
  }
}

function getStepTitles(content) {
  return [...content.matchAll(/<h2 className="text-2xl font-serif font-bold text-mahogany mb-6">\s*([\s\S]*?)\s*<\/h2>/g)].map((m) => collapse(m[1]))
}

function getQuestions(content) {
  return [...content.matchAll(/<p className="text-sm font-semibold text-charcoal\/70 mb-3">\s*([\s\S]*?)\s*<\/p>/g)].map((m) => collapse(m[1]))
}

/** Options { value, emoji } dans les tableaux inline JSX. */
function getEmojiOptions(content) {
  const out = []
  const re = /\{\s*value: '((?:[^'\\]|\\.)*)',\s*emoji: '((?:[^'\\]|\\.)*)'\s*\}/g
  let m
  while ((m = re.exec(content)) !== null) {
    out.push({ value: decodeEntities(m[1].replace(/\\'/g, "'")).trim(), emoji: m[2].trim() })
  }
  return out
}

/** Options string pures (durées). */
function getPlainOptions(content) {
  const m = content.match(/\[(\s*'Week-end[\s\S]*?)\]/)
  if (!m) return []
  return [...m[1].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((x) => decodeEntities(x[1].replace(/\\'/g, "'")).trim())
}

function getFieldLabel(content, htmlFor) {
  const m = content.match(new RegExp(`<label htmlFor="${htmlFor}"[^>]*>\\s*([\\s\\S]*?)\\s*(?:<span|</label>)`))
  return collapse(m?.[1] || '')
}

function getNav(content) {
  const textBeforeTag = (marker, closingTag) => {
    const idx = content.indexOf(marker)
    if (idx === -1) return ''
    const before = content.slice(0, idx)
    const gt = before.lastIndexOf('>')
    if (gt === -1) return ''
    const end = content.indexOf(closingTag, idx)
    if (end === -1) return ''
    return content.slice(gt + 1, end)
  }
  const quotedAfter = (marker) => {
    const idx = content.indexOf(marker)
    if (idx === -1) return ''
    const q2 = content.indexOf("'", idx)
    if (q2 === -1) return ''
    return content.slice(idx, q2)
  }
  return {
    back: collapse(textBeforeTag('← Retour', '</button>')).replace(/^←\s*/, ''),
    next: collapse(textBeforeTag('Suivant', '</button>').replace(/\s*→\s*$/, '')),
    submit: collapse(quotedAfter('Envoyer ma demande').replace(/🌍\s*$/, '').trim()),
    sending: collapse(quotedAfter('Envoi en cours')),
  }
}

// ═══════════════════════════ Zone SQL ═══════════════════════════

function buildZones(rows, data) {
  const add = (key, type, value, label) =>
    rows.push([`'${PAGE}'`, `'${key}'`, `'${type}'`, `'${sqlEscape(value)}'`, `'${sqlEscape(label)}'`])

  add('hero_title_1', 'text', data.hero.title1, 'Titre hero — ligne 1')
  add('hero_title_2', 'text', data.hero.title2, 'Titre hero — ligne 2')
  add('hero_description', 'textarea', data.hero.description, 'Description hero')
  add('hero_note', 'text', data.hero.note, 'Note hero (2 min · Sans engagement…)')
  data.steps.forEach((s, i) => add(`step_name_${i + 1}`, 'text', s, `Nom étape ${i + 1}`))
  data.stepTitles.forEach((t, i) => add(`step_${i + 1}_title`, 'text', t.replace(/^[^ ]+ /, ''), `Titre étape ${i + 1}`))
  const qNames = ['trip_type', 'vibe', 'destination', 'duration', 'budget']
  data.questions.forEach((qq, i) => add(`q_${qNames[i]}`, 'textarea', qq, `Question étape ${Math.min(i, 2) + 1} — ${qNames[i]}`))
  const groups = [
    { key: 'trip', count: 6, values: data.options.slice(0, 6) },
    { key: 'vibe', count: 5, values: data.options.slice(6, 11) },
    { key: 'dest', count: 3, values: data.options.slice(11, 14) },
    { key: 'budget', count: 5, values: data.options.slice(14, 19) },
  ]
  groups.forEach((g) => {
    g.values.forEach((opt, i) => {
      add(`${g.key}_${i + 1}_label`, 'textarea', opt.value, `${g.key} ${i + 1} — libellé`)
      add(`${g.key}_${i + 1}_emoji`, 'text', opt.emoji, `${g.key} ${i + 1} — emoji`)
    })
  })
  data.durations.forEach((d, i) => add(`duration_${i + 1}_label`, 'textarea', d, `Durée ${i + 1} — libellé`))
  add('date_label', 'text', data.dateLabel, 'Label date de départ')
  add('date_hint', 'text', data.dateHint, 'Aide date de départ')
  add('fname_label', 'text', data.fnameLabel, 'Label prénom')
  add('email_label', 'text', data.emailLabel, 'Label email')
  add('phone_label', 'text', data.phoneLabel, 'Label téléphone')
  add('msg_label', 'text', data.msgLabel, 'Label message')
  add('footnote', 'textarea', data.footnote, 'Note champs obligatoires')
  add('nav_back', 'text', data.nav.back, 'Bouton retour')
  add('nav_next', 'text', data.nav.next, 'Bouton suivant')
  add('nav_sending', 'text', data.nav.sending, 'Bouton envoi en cours')
  add('nav_submit', 'text', data.nav.submit, 'Bouton envoyer')
}

function buildSql(rows) {
  return [
    '-- ============================================================================',
    '-- Page /travel-planning-form : contenu piloté par le CMS',
    '-- Date: 2026-08-01 — généré par scripts/generate-travel-planning-form-cms.mjs',
    '--',
    '-- Idempotente : ON CONFLICT (page, zone_key) DO UPDATE.',
    '',
    'INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)',
    'VALUES',
    rows.map((r) => `  (${r.join(', ')})`).join(',\n'),
    `ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();`,
    '',
  ].join('\n')
}

// ═══════════════════════════ Template ═══════════════════════════

function buildPage(data) {
  const optConst = (name, arr) =>
    `const ${name} = [
${arr.map((o) => `  { value: ${q(o.value)}, emoji: ${q(o.emoji)}, zone: ${q(o.zone)} },`).join('\n')}
]`

  const tripConst = optConst('TRIP_TYPES', data.options.slice(0, 6).map((o, i) => ({ ...o, zone: `trip_${i + 1}` })))
  const vibeConst = optConst('VIBES', data.options.slice(6, 11).map((o, i) => ({ ...o, zone: `vibe_${i + 1}` })))
  const destConst = optConst('DEST_OPTIONS', data.options.slice(11, 14).map((o, i) => ({ ...o, zone: `dest_${i + 1}` })))
  const budgetConst = optConst('BUDGETS', data.options.slice(14, 19).map((o, i) => ({ ...o, zone: `budget_${i + 1}` })))
  const durConst = `const DURATIONS = [
${data.durations.map((d, i) => `  { value: ${q(d)}, zone: ${q(`duration_${i + 1}_label`)} },`).join('\n')}
]`

  const radioMap = (arr, name, state, field, hasEmoji = true) => `              {${arr}.map((opt) => (
                <RadioCard
                  key={opt.value}
                  name="${name}"
                  value={opt.value}
                  current={${state}}
                  onChange={(v) => set('${field}', v)}
                  ${hasEmoji ? `emoji={Z(opt.zone + '_emoji', 'text', opt.emoji, undefined, 'span')}` : ''}
                  label={Z(opt.zone + '_label', 'textarea', opt.value, undefined, 'span')}
                />
              ))}`

  return `'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import EditableZone from '@/components/inline-edit/EditableZone'

const PAGE = ${q(PAGE)};

type FormData = {
  // Étape 1
  tripType: string
  vibe: string
  destination: string
  destinationDetail: string
  // Étape 2
  duration: string
  budget: string
  departureDate: string
  // Étape 3
  firstName: string
  email: string
  phone: string
  message: string
  honeypot: string
}

const INITIAL_FORM: FormData = {
  tripType: '',
  vibe: '',
  destination: '',
  destinationDetail: '',
  duration: '',
  budget: '',
  departureDate: '',
  firstName: '',
  email: '',
  phone: '',
  message: '',
  honeypot: '',
}

const STEPS = [${data.steps.map((s) => q(s)).join(', ')}]

type RadioCardProps = {
  name: string
  value: string
  current: string
  onChange: (value: string) => void
  emoji?: React.ReactNode
  label: React.ReactNode
}

function RadioCard({ name, value, current, onChange, emoji, label }: RadioCardProps) {
  const selected = current === value
  return (
    <label
      className={\`flex items-center gap-3 p-4 rounded-full border-2 cursor-pointer transition-all \${
        selected
          ? 'border-mahogany bg-mahogany/5 text-mahogany font-semibold'
          : 'border-charcoal/10 hover:border-mahogany/40 text-charcoal/70'
      }\`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={selected}
        onChange={() => onChange(value)}
        className="sr-only"
      />
      {emoji && <span className="text-xl">{emoji}</span>}
      <span>{label}</span>
      {selected && (
        <span className="ml-auto text-mahogany">✓</span>
      )}
    </label>
  )
}

${tripConst}

${vibeConst}

${destConst}

${durConst}

${budgetConst}

export default function TravelPlanningForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(INITIAL_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (field: keyof FormData, value: string) =>
    setForm((f) => ({ ...f, [field]: value }))

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const destinationFromQuery = searchParams.get('destination')
    if (!destinationFromQuery) return

    const normalized = destinationFromQuery.trim()
    if (!normalized) return

    setForm((prev) => {
      if (prev.destinationDetail) {
        return prev
      }

      const formatted = normalized.charAt(0).toUpperCase() + normalized.slice(1)
  return {
        ...prev,
        destination: 'Destination précise',
        destinationDetail: formatted,
      }
    })
  }, [])

  const canGoNext = () => {
    if (step === 1) return form.tripType && form.vibe && form.destination
    if (step === 2) return form.duration && form.budget
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.firstName || !form.email) {
      setError('Ton prénom et ton email sont nécessaires pour te répondre.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/travel-planning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Erreur serveur')
      
      // GA4 — Événement formulaire_travel_soumis
      if (typeof window !== 'undefined' && (window as any).gtag) {
        ;(window as any).gtag('event', 'formulaire_travel_soumis', {
          event_category: 'Travel Planning',
          event_label: form.destination || 'Non précisé',
          value: 1,
        })
      }
      
      router.push('/merci')
    } catch {
      setError('Une erreur est survenue. Réessaie ou écris-nous directement à contact@heldonica.fr')
    } finally {
      setLoading(false)
    }
  }

  const progress = (step / 3) * 100

  const Z = (zone: string, type: 'text' | 'textarea' | 'html', fallback: string, className?: string, as?: any) => (
    <EditableZone page={PAGE} zone={zone} type={type} fallback={fallback} className={className} as={as} />
  )

  return (
    <InlineEditProvider page={PAGE}>
      <div className="min-h-screen bg-cloud-dancer py-12 px-4">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-serif font-light text-mahogany mb-4">
              {Z('hero_title_1', 'text', ${q(data.hero.title1)}, undefined, 'span')}<br />
              <em className="text-mahogany">{Z('hero_title_2', 'text', ${q(data.hero.title2)}, undefined, 'span')}</em>
            </h1>
            <p className="text-base text-charcoal/60 mb-2">
              {Z('hero_description', 'textarea', ${q(data.hero.description)}, undefined, 'span')}
            </p>
            <p className="text-charcoal/40 text-sm">{Z('hero_note', 'text', ${q(data.hero.note)}, undefined, 'span')}</p>
          </div>

          {/* Barre de progression */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-semibold text-mahogany">
                Étape {step} / 3 — {Z('step_name_' + step, 'text', STEPS[step - 1], undefined, 'span')}
              </span>
              <span className="text-sm text-charcoal/50">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-charcoal/10 rounded-full h-2">
              <div
                className="bg-mahogany h-2 rounded-full transition-all duration-500"
                style={{ width: \`\${progress}%\` }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8">

            {/* Honeypot anti-spam */}
            <input
              type="text"
              name="honeypot"
              value={form.honeypot}
              onChange={(e) => set('honeypot', e.target.value)}
              style={{ display: 'none' }}
              tabIndex={-1}
              autoComplete="off"
            />

            {/* ── ÉTAPE 1 — L’Inspiration ─────────────────────────── */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif font-bold text-mahogany mb-6">
                  🌍 {Z('step_1_title', 'text', ${q(data.stepTitles[0].replace(/^[^ ]+ /, ''))}, undefined, 'span')}
                </h2>

                <div>
                  <p className="text-sm font-semibold text-charcoal/70 mb-3">
                    {Z('q_trip_type', 'textarea', ${q(data.questions[0])}, undefined, 'span')}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
${radioMap('TRIP_TYPES', 'tripType', 'form.tripType', 'tripType')}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-charcoal/70 mb-3">
                    {Z('q_vibe', 'textarea', ${q(data.questions[1])}, undefined, 'span')}
                  </p>
                  <div className="space-y-2">
${radioMap('VIBES', 'vibe', 'form.vibe', 'vibe')}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-charcoal/70 mb-3">
                    {Z('q_destination', 'textarea', ${q(data.questions[2])}, undefined, 'span')}
                  </p>
                  <div className="space-y-2">
${radioMap('DEST_OPTIONS', 'destination', 'form.destination', 'destination')}
                  </div>
                  {form.destination && form.destination !== 'Suggestions Heldonica' && (
                    <input
                      type="text"
                      placeholder={
                        form.destination === 'Destination précise'
                          ? 'Ex : Madère, Sicile, Colombie…'
                          : 'Ex : Europe du Sud, Amérique Latine…'
                      }
                      value={form.destinationDetail}
                      onChange={(e) => set('destinationDetail', e.target.value)}
                      className="mt-3 w-full border border-charcoal/10 rounded-full px-4 py-3 text-charcoal/70 focus:outline-none focus:border-mahogany transition"
                    />
                  )}
                </div>
              </div>
            )}

            {/* ── ÉTAPE 2 — Ton Voyage ───────────────────────────── */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif font-bold text-mahogany mb-6">
                  📅 {Z('step_2_title', 'text', ${q(data.stepTitles[1].replace(/^[^ ]+ /, ''))}, undefined, 'span')}
                </h2>

                <div>
                  <p className="text-sm font-semibold text-charcoal/70 mb-3">
                    {Z('q_duration', 'textarea', ${q(data.questions[3])}, undefined, 'span')}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
${radioMap('DURATIONS', 'duration', 'form.duration', 'duration', false)}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-charcoal/70 mb-3">
                    {Z('q_budget', 'textarea', ${q(data.questions[4])}, undefined, 'span')}
                  </p>
                  <div className="space-y-2">
${radioMap('BUDGETS', 'budget', 'form.budget', 'budget')}
                  </div>
                </div>

                <div>
                  <label htmlFor="tpf-departureDate" className="block text-sm font-semibold text-charcoal/70 mb-2">
                    {Z('date_label', 'text', ${q(data.dateLabel)}, undefined, 'span')}
                  </label>
                  <input
                    id="tpf-departureDate"
                    type="month"
                    value={form.departureDate}
                    onChange={(e) => set('departureDate', e.target.value)}
                    className="w-full border border-charcoal/10 rounded-full px-4 py-3 text-charcoal/70 focus:outline-none focus:border-mahogany transition"
                  />
                  <p className="text-xs text-charcoal/40 mt-1">{Z('date_hint', 'text', ${q(data.dateHint)}, undefined, 'span')}</p>
                </div>
              </div>
            )}

            {/* ── ÉTAPE 3 — Tes Coordonnées ─────────────────────── */}
            {step === 3 && (
              <div className="space-y-5">
                <h2 className="text-2xl font-serif font-bold text-mahogany mb-6">
                  📬 {Z('step_3_title', 'text', ${q(data.stepTitles[2].replace(/^[^ ]+ /, ''))}, undefined, 'span')}
                </h2>

                <div>
                  <label htmlFor="tpf-firstName" className="block text-sm font-semibold text-charcoal/70 mb-2">
                    {Z('fname_label', 'text', ${q(data.fnameLabel)}, undefined, 'span')} <span className="text-mahogany">*</span>
                  </label>
                  <input
                    id="tpf-firstName"
                    type="text"
                    required
                    placeholder="Ex : Sophie"
                    value={form.firstName}
                    onChange={(e) => set('firstName', e.target.value)}
                    className="w-full border border-charcoal/10 rounded-full px-4 py-3 focus:outline-none focus:border-mahogany transition"
                  />
                </div>

                <div>
                  <label htmlFor="tpf-email" className="block text-sm font-semibold text-charcoal/70 mb-2">
                    {Z('email_label', 'text', ${q(data.emailLabel)}, undefined, 'span')} <span className="text-mahogany">*</span>
                  </label>
                  <input
                    id="tpf-email"
                    type="email"
                    required
                    placeholder="sophie@exemple.fr"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    className="w-full border border-charcoal/10 rounded-full px-4 py-3 focus:outline-none focus:border-mahogany transition"
                  />
                </div>

                <div>
                  <label htmlFor="tpf-phone" className="block text-sm font-semibold text-charcoal/70 mb-2">
                    {Z('phone_label', 'text', ${q(data.phoneLabel)}, undefined, 'span')}
                  </label>
                  <input
                    id="tpf-phone"
                    type="tel"
                    placeholder="+33 6 …"
                    value={form.phone}
                    onChange={(e) => set('phone', e.target.value)}
                    className="w-full border border-charcoal/10 rounded-full px-4 py-3 focus:outline-none focus:border-mahogany transition"
                  />
                </div>

                <div>
                  <label htmlFor="tpf-message" className="block text-sm font-semibold text-charcoal/70 mb-2">
                    {Z('msg_label', 'text', ${q(data.msgLabel)}, undefined, 'span')}
                  </label>
                  <textarea
                    id="tpf-message"
                    rows={4}
                    placeholder="Ce qui te fait rêver, des contraintes particulières, des envies précises… Tout est utile !"
                    value={form.message}
                    onChange={(e) => set('message', e.target.value)}
                    className="w-full border border-charcoal/10 rounded-full px-4 py-3 focus:outline-none focus:border-mahogany transition resize-none"
                  />
                </div>

                <p className="text-xs text-charcoal/40">
                  {Z('footnote', 'textarea', ${q(data.footnote)}, undefined, 'span')}
                </p>
              </div>
            )}

            {/* Erreur */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-full text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-5 py-3 rounded-full font-medium border border-charcoal/10 text-charcoal/60 hover:bg-cloud-dancer transition"
                >
                  ← {Z('nav_back', 'text', ${q(data.nav.back)}, undefined, 'span')}
                </button>
              )}
              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  disabled={!canGoNext()}
                  className="flex-1 py-3 rounded-full font-medium transition bg-mahogany text-white hover:bg-mahogany/90 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {Z('nav_next', 'text', ${q(data.nav.next)}, undefined, 'span')} →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-full font-medium transition bg-mahogany text-white hover:bg-mahogany/90 disabled:opacity-60"
                >
                  {loading ? Z('nav_sending', 'text', ${q(data.nav.sending)}, undefined, 'span') : Z('nav_submit', 'text', ${q(data.nav.submit)}, undefined, 'span') + ' 🌍'}
                </button>
              )}
            </div>
          </form>

        </div>
      </div>
    </InlineEditProvider>
  )
}
`
}

// ═══════════════════════════ Exécution ═══════════════════════════

const content = readOriginal(FILE)

const data = {
  steps: getSteps(content),
  hero: getHero(content),
  stepTitles: getStepTitles(content),
  questions: getQuestions(content),
  options: getEmojiOptions(content),
  durations: getPlainOptions(content),
  dateLabel: getFieldLabel(content, 'tpf-departureDate'),
  dateHint: collapse(content.match(/<p className="text-xs text-charcoal\/40 mt-1">\s*([\s\S]*?)\s*<\/p>/)?.[1] || ''),
  fnameLabel: getFieldLabel(content, 'tpf-firstName'),
  emailLabel: getFieldLabel(content, 'tpf-email'),
  phoneLabel: getFieldLabel(content, 'tpf-phone'),
  msgLabel: getFieldLabel(content, 'tpf-message'),
  footnote: collapse(content.match(/<p className="text-xs text-charcoal\/40">\s*([\s\S]*?)\s*<\/p>/)?.[1] || ''),
  nav: getNav(content),
}

const page = buildPage(data)
const rows = []
buildZones(rows, data)
writeFileSync(join(ROOT, FILE), page, 'utf8')

console.log(`✔ ${PAGE}: ${rows.length} zones — page réécrite`)
console.log(`  steps: ${data.steps.join(' | ')} | hero: "${data.hero.title1}" | questions: ${data.questions.length} | options: ${data.options.length} | durations: ${data.durations.length} | nav: ${data.nav.back}/${data.nav.next}/${data.nav.submit}/${data.nav.sending}`)
console.log(`  labels: date="${data.dateLabel}" fname="${data.fnameLabel}" email="${data.emailLabel}" phone="${data.phoneLabel}" msg="${data.msgLabel}" | footnote: ${data.footnote.length} chars | hint: "${data.dateHint}"`)

const sqlPath = join(ROOT, 'supabase/migrations/20260801_cms_travel_planning_form_zones.sql')
writeFileSync(sqlPath, buildSql(rows), 'utf8')
console.log(`✔ Migration écrite : ${sqlPath.replace(ROOT + '\\', '')}`)
