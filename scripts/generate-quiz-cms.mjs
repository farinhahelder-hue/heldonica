// Migration de la page /quiz vers le CMS 3.0.
// Client component : InlineEditProvider sans initialZones (pattern app/merci).
// Valeurs actuelles en fallback (aucun changement visible attendu).
// Extrait depuis `git show HEAD:app/quiz/page.tsx` (readOriginal).
//
// Usage : node scripts/generate-quiz-cms.mjs

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

const PAGE = 'quiz'
const FILE = 'app/quiz/page.tsx'

function readOriginal(relPath) {
  try {
    return execSync(`git show HEAD:${relPath}`, { cwd: ROOT, encoding: 'utf8' })
  } catch {
    return readFileSync(join(ROOT, relPath), 'utf8')
  }
}

/** Source JS (const = [ ... ] / const = { ... }) → JSON. */
function parseJsBlock(body) {
  const re = /"(?:[^"\\]|\\.)*"|'((?:[^'\\]|\\.)*)'/g
  const singles = []
  const doubles = []
  let out = ''
  let last = 0
  let m
  while ((m = re.exec(body)) !== null) {
    out += body.slice(last, m.index)
    if (m[1] !== undefined) {
      singles.push(m[1])
      out += `\u0000${singles.length - 1}\u0000`
    } else {
      doubles.push(m[0])
      out += `\u0001${doubles.length - 1}\u0001`
    }
    last = m.index + m[0].length
  }
  out += body.slice(last)
  out = out.replace(/(^|[{,]\s*)([A-Za-z_$][\w$]*)\s*:/g, '$1"$2":')
  out = out.replace(/\u0001(\d+)\u0001/g, (_, i) => doubles[+i])
  out = out.replace(/\u0000(\d+)\u0000/g, (_, i) => JSON.stringify(singles[+i].replace(/\\'/g, "'")))
  return JSON.parse(out.replace(/,\s*([}\]])/g, '$1'))
}

// ═══════════════════════════ Extraction ═══════════════════════════

function getQuestions(content) {
  const m = content.match(/const QUESTIONS = (\[[\s\S]*?\n\])/)
  if (!m) return []
  try {
    return parseJsBlock(m[1])
  } catch (e) {
    console.log(`  ⚠ QUESTIONS: ${e.message}`)
    return []
  }
}

function getProfiles(content) {
  const m = content.match(/const PROFILES: Record<string, \{[\s\S]*?\}> = (\{[\s\S]*?\n\})/)
  if (!m) return {}
  try {
    return parseJsBlock(m[1])
  } catch (e) {
    console.log(`  ⚠ PROFILES: ${e.message}`)
    return {}
  }
}

const collapse = (s) => decodeEntities(s).replace(/<\/?[^>]+>/g, '').replace(/\s+/g, ' ').trim()

function getHero(content) {
  return {
    badge: collapse(content.match(/<span className="text-eucalyptus text-xs font-bold tracking-\[0\.2em\] uppercase">\s*([\s\S]*?)\s*<\/span>/)?.[1] || ''),
    title: collapse(content.match(/<h1 className="text-4xl md:text-5xl font-serif font-light text-stone-900 mt-4 mb-6">\s*([\s\S]*?)\s*<\/h1>/)?.[1] || ''),
    description: collapse(content.match(/<p className="text-stone-600 text-lg leading-relaxed max-w-xl mx-auto">\s*([\s\S]*?)\s*<\/p>/)?.[1] || ''),
  }
}

function getResults(content) {
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
  return {
    badge: collapse(content.match(/<span className="text-xs font-bold tracking-\[0\.15em\] uppercase" style=\{\{ color: profile\.color \}\}>\s*([\s\S]*?)\s*<\/span>/)?.[1] || ''),
    destinationsTitle: collapse(content.match(/<h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-4">\s*([\s\S]*?)\s*<\/h3>/)?.[1] || ''),
    cta: collapse(textBeforeTag('Créer mon voyage sur mesure', '</Link>')).replace(/^✈️\s*/, ''),
    retry: collapse(textBeforeTag('Refaire le quiz', '</button>')),
    trust: collapse(content.match(/<p className="text-stone-500 text-sm">\s*([\s\S]*?)\s*<\/p>/)?.[1] || ''),
  }
}

// ═══════════════════════════ Zone SQL ═══════════════════════════

function buildZones(rows, data) {
  const add = (key, type, value, label) =>
    rows.push([`'${PAGE}'`, `'${key}'`, `'${type}'`, `'${sqlEscape(value)}'`, `'${sqlEscape(label)}'`])

  add('hero_badge', 'text', data.hero.badge, 'Badge du hero')
  add('hero_title', 'text', data.hero.title, 'Titre du hero')
  add('hero_description', 'textarea', data.hero.description, 'Description du hero')
  data.questions.forEach((qq, i) => {
    add(`question_${i + 1}`, 'textarea', qq.question, `Question ${i + 1}`)
    qq.options.forEach((opt, j) => {
      add(`question_${i + 1}_opt_${j + 1}_emoji`, 'text', opt.emoji, `Question ${i + 1} — option ${j + 1} emoji`)
      add(`question_${i + 1}_opt_${j + 1}_label`, 'textarea', opt.label, `Question ${i + 1} — option ${j + 1}`)
    })
  })
  Object.entries(data.profiles).forEach(([slug, p]) => {
    add(`profile_${slug}_title`, 'text', p.title, `Profil ${slug} — titre`)
    add(`profile_${slug}_description`, 'textarea', p.description, `Profil ${slug} — description`)
    p.vibes.forEach((v, i) => add(`profile_${slug}_vibe_${i + 1}`, 'text', v, `Profil ${slug} — vibe ${i + 1}`))
  })
  add('result_badge', 'text', data.results.badge, "Badge du résultat (Ton profil voyage)")
  add('result_destinations_title', 'text', data.results.destinationsTitle, 'Titre bloc destinations recommandées')
  add('result_cta', 'text', data.results.cta, 'CTA résultat (créer mon voyage)')
  add('result_retry', 'text', data.results.retry, 'Bouton refaire le quiz')
  add('trust_text', 'textarea', data.results.trust, 'Ligne de confiance (pied de page)')
}

function buildSql(rows) {
  return [
    '-- ============================================================================',
    '-- Page /quiz : contenu piloté par le CMS',
    '-- Date: 2026-08-01 — généré par scripts/generate-quiz-cms.mjs',
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
  const questionsConst = data.questions
    .map(
      (qq) => `  {
    id: ${qq.id},
    question: ${q(qq.question)},
    options: [
${qq.options.map((opt) => `      { value: ${q(opt.value)}, label: ${q(opt.label)}, emoji: ${q(opt.emoji)} },`).join('\n')}
    ],
  },`
    )
    .join('\n')

  const profilesConst = Object.entries(data.profiles)
    .map(
      ([slug, p]) => `  ${q(slug)}: {
    title: ${q(p.title)},
    emoji: ${q(p.emoji)},
    description: ${q(p.description)},
    destinations: [${p.destinations.map((d) => q(d)).join(', ')}],
    vibes: [${p.vibes.map((v) => q(v)).join(', ')}],
    color: ${q(p.color)},
  },`
    )
    .join('\n')

  return `'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import EditableZone from '@/components/inline-edit/EditableZone'

const PAGE = ${q(PAGE)};

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\\u0300-\\u036f]/g, '')
    .replace(/\\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

const QUESTIONS = [
${questionsConst}
]

const PROFILES: Record<string, {
  title: string
  emoji: string
  description: string
  destinations: string[]
  vibes: string[]
  color: string
}> = {
${profilesConst}
}

export default function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [result, setResult] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)

  const q = QUESTIONS[currentQuestion]
  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [q.id]: value }
    setAnswers(newAnswers)

    if (currentQuestion < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300)
    } else {
      calculateResult(newAnswers)
    }
  }

  const calculateResult = (finalAnswers: Record<number, string>) => {
    const counts: Record<string, number> = {}
    Object.values(finalAnswers).forEach((v) => {
      counts[v] = (counts[v] || 0) + 1
    })
    const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
    setResult(dominant)
    setShowResult(true)

    // Store result in sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('quiz-result', dominant)
    }
  }

  const profile = result ? PROFILES[result] : null

  const Z = (zone: string, type: 'text' | 'textarea' | 'html', fallback: string, className?: string, as?: any) => (
    <EditableZone page={PAGE} zone={zone} type={type} fallback={fallback} className={className} as={as} />
  )

  return (
    <InlineEditProvider page={PAGE}>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-stone-50 via-cloud-dancer/40 to-white">
        {/* Hero */}
        <section className="py-16 md:py-24 text-center px-6">
          <div className="max-w-2xl mx-auto">
            <span className="text-eucalyptus text-xs font-bold tracking-[0.2em] uppercase">
              {Z('hero_badge', 'text', ${q(data.hero.badge)}, undefined, 'span')}
            </span>
            <h1 className="text-4xl md:text-5xl font-serif font-light text-stone-900 mt-4 mb-6">
              {Z('hero_title', 'text', ${q(data.hero.title)}, undefined, 'span')}
            </h1>
            <p className="text-stone-600 text-lg leading-relaxed max-w-xl mx-auto">
              {Z('hero_description', 'textarea', ${q(data.hero.description)}, undefined, 'span')}
            </p>
          </div>
        </section>

        {/* Quiz */}
        <section className="pb-24 px-6">
          <div className="max-w-xl mx-auto">
            {!showResult ? (
              <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
                {/* Progress */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-eucalyptus">
                      Question {currentQuestion + 1} / {QUESTIONS.length}
                    </span>
                    <span className="text-sm text-stone-500">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2">
                    <div
                      className="bg-eucalyptus h-2 rounded-full transition-all duration-500"
                      style={{ width: \`\${progress}%\` }}
                    />
                  </div>
                </div>

                {/* Question */}
                <h2 className="text-xl md:text-2xl font-serif font-light text-stone-900 mb-8 text-center">
                  {Z('question_' + (currentQuestion + 1), 'textarea', q?.question || '', undefined, 'span')}
                </h2>

                {/* Options */}
                <div className="space-y-3">
                  {q.options.map((opt, j) => (
                    <button
                      key={opt.value}
                      onClick={() => handleAnswer(opt.value)}
                      className="w-full text-left p-4 rounded-xl border-2 border-stone-100 hover:border-eucalyptus/40 transition-all group hover:shadow-md"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">
                          {Z('question_' + (currentQuestion + 1) + '_opt_' + (j + 1) + '_emoji', 'text', opt.emoji, undefined, 'span')}
                        </span>
                        <span className="text-stone-700 group-hover:text-stone-900 leading-snug">
                          {Z('question_' + (currentQuestion + 1) + '_opt_' + (j + 1) + '_label', 'textarea', opt.label, undefined, 'span')}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Result */
              <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 text-center">
                {profile && (
                  <>
                    <div
                      className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
                      style={{ backgroundColor: \`\${profile.color}15\` }}
                    >
                      <span className="text-4xl">{profile.emoji}</span>
                    </div>

                    <span className="text-xs font-bold tracking-[0.15em] uppercase" style={{ color: profile.color }}>
                      {Z('result_badge', 'text', ${q(data.results.badge)}, undefined, 'span')}
                    </span>
                    <h2 className="text-3xl font-serif font-light text-stone-900 mt-2 mb-4">
                      {Z('profile_' + result + '_title', 'text', profile.title, undefined, 'span')}
                    </h2>
                    <p className="text-stone-600 leading-relaxed mb-8 max-w-md mx-auto">
                      {Z('profile_' + result + '_description', 'textarea', profile.description, undefined, 'span')}
                    </p>

                    {/* Destinations recommandées */}
                    <div className="bg-stone-50 rounded-xl p-6 mb-8 text-left">
                      <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-4">
                        {Z('result_destinations_title', 'text', ${q(data.results.destinationsTitle)}, undefined, 'span')}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.destinations.map((dest) => (
                          <Link
                            key={dest}
                            href={'/destinations/' + slugify(dest)}
                            className="px-4 py-2 bg-white rounded-full text-sm font-medium text-stone-700 border border-stone-200 hover:border-eucalyptus hover:text-eucalyptus transition-colors"
                          >
                            {dest}
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Vibe tags */}
                    <div className="flex flex-wrap justify-center gap-2 mb-10">
                      {profile.vibes.map((vibe, v) => (
                        <span
                          key={vibe}
                          className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{ backgroundColor: \`\${profile.color}15\`, color: profile.color }}
                        >
                          {Z('profile_' + result + '_vibe_' + (v + 1), 'text', vibe, undefined, 'span')}
                        </span>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="space-y-4">
                      <Link
                        href="/travel-planning#formulaire"
                        className="inline-block w-full py-4 bg-mahogany hover:brightness-110 text-white font-semibold rounded-xl transition-all shadow-lg"
                      >
                        ✈️ {Z('result_cta', 'text', ${q(data.results.cta)}, undefined, 'span')}
                      </Link>
                      <button
                        onClick={() => {
                          setCurrentQuestion(0)
                          setAnswers({})
                          setResult(null)
                          setShowResult(false)
                        }}
                        className="text-stone-500 hover:text-stone-700 text-sm underline"
                      >
                        {Z('result_retry', 'text', ${q(data.results.retry)}, undefined, 'span')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Trust */}
        <section className="pb-16 px-6">
          <div className="max-w-xl mx-auto text-center">
            <p className="text-stone-500 text-sm">
              {Z('trust_text', 'textarea', ${q(data.results.trust)}, undefined, 'span')}
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </InlineEditProvider>
  )
}
`
}

// ═══════════════════════════ Exécution ═══════════════════════════

const content = readOriginal(FILE)

const data = {
  questions: getQuestions(content),
  profiles: getProfiles(content),
  hero: getHero(content),
  results: getResults(content),
}

const page = buildPage(data)
const rows = []
buildZones(rows, data)
writeFileSync(join(ROOT, FILE), page, 'utf8')

console.log(`✔ ${PAGE}: ${rows.length} zones — page réécrite`)
console.log(`  questions: ${data.questions.length} | profils: ${Object.keys(data.profiles).join(', ')} | hero: "${data.hero.title}" | cta: "${data.results.cta}" | trust: ${data.results.trust.length} chars`)

const sqlPath = join(ROOT, 'supabase/migrations/20260801_cms_quiz_zones.sql')
writeFileSync(sqlPath, buildSql(rows), 'utf8')
console.log(`✔ Migration écrite : ${sqlPath.replace(ROOT + '\\', '')}`)
