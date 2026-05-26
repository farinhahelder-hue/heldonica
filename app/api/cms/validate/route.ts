import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireCmsAuth } from '@/lib/cms-auth'
import { FORBIDDEN_WORDS } from '@/lib/brand-voice'

let _cached: ReturnType<typeof createClient> | null = null
function supabase() {
  if (!_cached) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
    _cached = url && key ? createClient(url, key) : null
  }
  return _cached
}

interface ValidationIssue {
  type: 'error' | 'warning'
  field: string
  message: string
  suggestion?: string  // For auto-fix suggestions
}

interface ValidationResult {
  valid: boolean
  score: number
  issues: ValidationIssue[]
  checked_at: string
}

// Required fields per content type
const REQUIRED_FIELDS = {
  title: { min: 5, max: 120 },
  excerpt: { min: 50, max: 160 },
  slug: { min: 3, max: 100 },
  featured_image: { required: true },
  category: { required: true },
  read_time: { min: 1 },
}

// Minimum content length
const MIN_CONTENT_LENGTH = 300

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse

  const sb = supabase()
  if (!sb) return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 })

  try {
    const { post_id } = await req.json()

    if (!post_id) {
      return NextResponse.json({ error: 'post_id requis' }, { status: 400 })
    }

    // Fetch the post
    const { data: post, error: fetchError } = await sb
      .from('articles')
      .select('*')
      .eq('id', post_id)
      .single()

    if (fetchError || !post) {
      return NextResponse.json({ error: 'Post introuvable' }, { status: 404 })
    }

    // Run validations
    const issues: ValidationIssue[] = []
    let score = 100

    // 1. Check required fields
    for (const [field, rules] of Object.entries(REQUIRED_FIELDS)) {
      const value = post[field]
      
      if ('required' in rules && rules.required && !value) {
        issues.push({
          type: 'error',
          field,
          message: `${field} est requis`
        })
        score -= 20
      }
      
      if ('min' in rules && typeof value === 'string' && value.length < rules.min) {
        issues.push({
          type: 'warning',
          field,
          message: `${field} trop court (min ${rules.min} caractères)`
        })
        score -= 5
      }
      
      if ('max' in rules && typeof value === 'string' && value.length > rules.max) {
        issues.push({
          type: 'warning',
          field,
          message: `${field} trop long (max ${rules.max} caractères)`
        })
        score -= 5
      }
    }

    // 2. Check content length
    const content = post.content || ''
    const cleanContent = content.replace(/<[^>]*>/g, '').trim()
    
    if (cleanContent.length < MIN_CONTENT_LENGTH) {
      issues.push({
        type: 'warning',
        field: 'content',
        message: `Contenu trop court (${cleanContent.length}/${MIN_CONTENT_LENGTH} chars)`
      })
      score -= 10
    } else if (cleanContent.length > 5000) {
      issues.push({
        type: 'warning',
        field: 'content',
        message: `Contenu très long - considérer un article plus court`
      })
    }

    // 3. Check forbidden words
    const allText = [
      post.title,
      post.excerpt,
      post.content,
    ].join(' ').toLowerCase()

    const foundForbidden: string[] = []
    const forbiddenSuggestions: string[] = []
    for (const word of FORBIDDEN_WORDS) {
      if (allText.includes(word.toLowerCase())) {
        foundForbidden.push(word)
        // Auto-fix suggestions
        const replacement = word === 'bons plans' ? 'pépites' 
          : word === 'bon plan' ? 'adresse secrète'
          : word === 'tips' ? "conseil d'initié"
          : word === 'circuit' ? 'itinéraire'
          : word === 'package' ? 'voyage sur mesure'
          : word === 'lieu incontournable' ? 'adresse favorite'
          : 'éviter ce mot'
        forbiddenSuggestions.push(`"${word}" → "${replacement}"`)
      }
    }

    if (foundForbidden.length > 0) {
      issues.push({
        type: 'error',
        field: 'content',
        message: `Mots interdits trouvés: ${foundForbidden.join(', ')}`,
        suggestion: forbiddenSuggestions.join(', ')
      })
      score -= 15 * foundForbidden.length
    }

    // 4. Check image URL validity (async, best effort)
    const imageUrl = post.featured_image
    if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)
        
        const response = await fetch(imageUrl, { 
          method: 'HEAD',
          signal: controller.signal 
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          issues.push({
            type: 'error',
            field: 'featured_image',
            message: `Image inaccessible (${response.status})`
          })
          score -= 15
        }
      } catch {
        // Timeout or network error - warn but don't fail
        issues.push({
          type: 'warning',
          field: 'featured_image',
          message: `Impossible de vérifier l'image`
        })
        score -= 5
      }
    }

    // 5. Check read_time calculation
    const calculatedReadTime = Math.ceil(cleanContent.length / 1000)
    const declaredReadTime = post.read_time
    
    if (!declaredReadTime) {
      issues.push({
        type: 'warning',
        field: 'read_time',
        message: 'read_time non défini - sera calculé automatiquement'
      })
    } else if (Math.abs(declaredReadTime - calculatedReadTime) > 3) {
      issues.push({
        type: 'warning',
        field: 'read_time',
        message: `read_time probablement inexact (donné: ${declaredReadTime}, estimé: ${calculatedReadTime} min)`
      })
    }

    // 5b. Check geo fields for destination articles
    if (post.category === 'destinations') {
      if (!post.country) {
        issues.push({
          type: 'warning',
          field: 'country',
          message: 'Pays manquant pour une destination'
        })
        score -= 5
      }
    }

    // 5c. Check personalization fields
    if (!post.travel_style) {
      issues.push({
        type: 'warning',
        field: 'travel_style',
        message: 'Style de voyage non défini'
      })
      score -= 3
    }

    // 6. Check slug format
    const slug = post.slug
    if (slug) {
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
      if (!slugRegex.test(slug)) {
        issues.push({
          type: 'error',
          field: 'slug',
          message: 'slug doit contenir uniquement lettres minuscules et tirets'
        })
        score -= 10
      }
    }

    // Final score clamp
    score = Math.max(0, Math.min(100, score))

    const result: ValidationResult = {
      valid: !issues.some(i => i.type === 'error'),
      score,
      issues,
      checked_at: new Date().toISOString(),
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Validation error:', error)
    return NextResponse.json({ 
      error: 'Erreur lors de la validation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Also export GET for batch validation
export async function GET(req: Request) {
  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse

  const sb = supabase()
  if (!sb) return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 })

  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'all'
    const limit = parseInt(searchParams.get('limit') || '10')

    let query = sb.from('articles').select('id, title, slug, published, featured')

    if (status === 'draft') {
      query = query.eq('published', false)
    } else if (status === 'published') {
      query = query.eq('published', true)
    }

    const { data: posts, error } = await query.limit(limit)

    if (error) throw error

    // Validate each post (simplified - no image checks in batch)
    const results = await Promise.all(
      (posts || []).map(async (post: any) => {
        const issues: ValidationIssue[] = []
        
        // Quick checks
        if (!post.title || post.title.length < 5) {
          issues.push({ type: 'error', field: 'title', message: 'Titre trop court' })
        }
        if (!post.slug) {
          issues.push({ type: 'error', field: 'slug', message: 'Slug manquant' })
        }

        return {
          id: post.id,
          title: post.title,
          slug: post.slug,
          issues,
          needs_review: issues.length > 0 || !post.published,
        }
      })
    )

    return NextResponse.json({
      posts: results,
      summary: {
        total: results.length,
        needs_review: results.filter(r => r.needs_review).length,
      }
    })

  } catch (error) {
    console.error('Batch validation error:', error)
    return NextResponse.json({ error: 'Erreur lors de la validation' }, { status: 500 })
  }
}