'use client'

import React, { useMemo } from 'react'
import type { Article } from '@/app/panel-manager/CmsAdminClient'

interface EeaatScoreProps {
  article: Partial<Article> | null
}

interface CheckItem {
  label: string
  passed: boolean
  detail?: string
}

interface ScoreResult {
  score: number        // 0-100
  grade: string        // A, B, C, D
  gradeColor: string   // Tailwind color
  checks: CheckItem[]
}

function stripHtml(html: string): string {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function checkMetaTitle(article: Partial<Article>): CheckItem {
  const t = article.seo_title?.trim() ?? ''
  const title = article.title?.trim() ?? ''
  if (!t) return { label: 'Meta title défini', passed: false, detail: 'Champ SEO Title vide' }
  if (t.length > 60) return { label: 'Meta title ≤ 60 caractères', passed: false, detail: `${t.length}/60 caractères` }
  if (t.length < 30) return { label: 'Meta title assez long (30-60)', passed: t.length >= 30, detail: `${t.length}/60 caractères` }
  const hasKeyword = title.length > 0 && t.toLowerCase().includes(title.split(' ')[0]?.toLowerCase() ?? '')
  return { label: 'Meta title optimisé', passed: hasKeyword, detail: hasKeyword ? 'Mot-clé présent' : 'Intégrer le mot-clé principal' }
}

function checkMetaDescription(article: Partial<Article>): CheckItem {
  const d = article.seo_description?.trim() ?? ''
  if (!d) return { label: 'Meta description définie', passed: false, detail: 'Champ SEO Description vide' }
  if (d.length > 160) return { label: 'Meta description ≤ 160 caractères', passed: false, detail: `${d.length}/160 caractères` }
  if (d.length < 70) return { label: 'Meta description assez longue (70-160)', passed: d.length >= 70, detail: `${d.length}/160 caractères` }
  return { label: 'Meta description optimisée', passed: true, detail: `${d.length}/160 caractères` }
}

function checkAuthor(article: Partial<Article>): CheckItem {
  const a = article.author?.trim()
  if (!a) return { label: 'Auteur mentionné', passed: false, detail: 'Champ Auteur vide' }
  return { label: 'Auteur défini', passed: true, detail: a }
}

function checkExcerpt(article: Partial<Article>): CheckItem {
  const e = article.excerpt?.trim()
  if (!e) return { label: 'Extrait (résumé) présent', passed: false, detail: 'Champ Extrait vide' }
  if (e.length < 50) return { label: 'Extrait assez descriptif', passed: false, detail: `${e.length} caractères — minimum 50` }
  return { label: 'Extrait complet', passed: true, detail: `${e.length} caractères` }
}

function checkFeaturedImage(article: Partial<Article>): CheckItem {
  const img = article.featured_image?.trim()
  if (!img) return { label: 'Image à la une', passed: false, detail: 'Pas d\'image à la une' }
  return { label: 'Image à la une', passed: true, detail: 'Image définie' }
}

function checkTags(article: Partial<Article>): CheckItem {
  const tags = article.tags
  if (!tags || tags.length === 0) return { label: 'Tags (mots-clés)', passed: false, detail: 'Aucun tag défini' }
  if (tags.length < 2) return { label: 'Tags ≥ 2', passed: false, detail: `${tags.length} tag — minimum 2` }
  return { label: 'Tags définis', passed: true, detail: tags.join(', ') }
}

function checkPublishDate(article: Partial<Article>): CheckItem {
  const d = article.published_at
  if (!d) return { label: 'Date de publication', passed: false, detail: 'Article non programmé' }
  const date = new Date(d)
  const now = new Date()
  const age = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (age > 365) return { label: 'Contenu récent (< 1 an)', passed: false, detail: `Publié il y a ${Math.floor(age / 30)} mois` }
  return { label: 'Date de publication', passed: true, detail: `Il y a ${age} jours` }
}

function checkContentLength(article: Partial<Article>): CheckItem {
  const plain = stripHtml(article.content ?? '')
  const wc = wordCount(plain)
  const minWords = 300
  const goodWords = 800
  if (wc < minWords) return { label: `Contenu ≥ ${minWords} mots`, passed: false, detail: `${wc} mots — insuffisant pour GEO` }
  if (wc < goodWords) return { label: 'Contenu substantiel (≥ 800 mots)', passed: false, detail: `${wc} mots — ajouter du contenu` }
  return { label: 'Contenu substantiel', passed: true, detail: `${wc} mots` }
}

function checkCategory(article: Partial<Article>): CheckItem {
  const c = article.category?.trim()
  if (!c) return { label: 'Catégorie définie', passed: false, detail: 'Pas de catégorie' }
  return { label: 'Catégorie définie', passed: true, detail: c }
}

function computeEeaatScore(article: Partial<Article> | null): ScoreResult {
  if (!article) {
    return { score: 0, grade: 'N/A', gradeColor: 'text-gray-400', checks: [] }
  }

  const checks: CheckItem[] = [
    checkMetaTitle(article),
    checkMetaDescription(article),
    checkAuthor(article),
    checkExcerpt(article),
    checkFeaturedImage(article),
    checkTags(article),
    checkPublishDate(article),
    checkContentLength(article),
    checkCategory(article),
  ]

  const passedCount = checks.filter(c => c.passed).length
  const score = Math.round((passedCount / checks.length) * 100)

  let grade: string
  let gradeColor: string
  if (score >= 90) { grade = 'A'; gradeColor = 'text-green-600' }
  else if (score >= 70) { grade = 'B'; gradeColor = 'text-emerald-600' }
  else if (score >= 50) { grade = 'C'; gradeColor = 'text-amber-600' }
  else if (score >= 30) { grade = 'D'; gradeColor = 'text-orange-600' }
  else { grade = 'E'; gradeColor = 'text-red-600' }

  return { score, grade, gradeColor, checks }
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-emerald-500' : score >= 40 ? 'bg-amber-500' : score >= 20 ? 'bg-orange-500' : 'bg-red-500'
  return (
    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${score}%` }}
      />
    </div>
  )
}

function GradeBadge({ grade, color }: { grade: string; color: string }) {
  return (
    <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg ${color} bg-opacity-10 border-2 ${color.replace('text-', 'border-')}`}>
      {grade}
    </span>
  )
}

export default function EeaatScore({ article }: EeaatScoreProps) {
  const result = useMemo(() => computeEeaatScore(article), [article])

  if (!article) return null

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-center gap-3 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">Score E-E-A-T GEO</h3>
          <p className="text-xs text-gray-400 mt-0.5">Expertise · Expérience · Autorité · Confiance</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <GradeBadge grade={result.grade} color={result.gradeColor} />
          <span className={`text-2xl font-bold ${result.gradeColor}`}>{result.score}<span className="text-sm text-gray-400">%</span></span>
        </div>
      </div>

      <ScoreBar score={result.score} />

      <div className="mt-4 space-y-2">
        {result.checks.map((check, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <span className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${check.passed ? 'bg-green-500' : 'bg-gray-300'}`}>
              {check.passed ? '✓' : '○'}
            </span>
            <div className="min-w-0">
              <span className={`text-xs font-medium ${check.passed ? 'text-gray-700' : 'text-gray-400'}`}>
                {check.label}
              </span>
              {check.detail && (
                <span className="block text-xs text-gray-400">{check.detail}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs text-gray-400 border-t border-gray-100 pt-3">
        💡 Un score ≥ 70% améliore la citabilité par Perplexity, ChatGPT et Google AI Overviews.
      </p>
    </div>
  )
}