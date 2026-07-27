import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

// Rate limiting: 10 requests per IP per hour
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 10
const RATE_WINDOW = 60 * 60 * 1000

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW })
    return true
  }

  if (entry.count >= RATE_LIMIT) {
    return false
  }

  entry.count++
  return true
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!checkRateLimit(clientIp)) {
    return NextResponse.json(
      { error: 'Trop de requetes. Veuillez patienter.' },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()
    const { email, source = 'guide-madere' } = body

    if (!email) {
      return NextResponse.json({ error: 'Email manquant' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const { error } = await supabase
      .from('newsletter_subscribers')
      .upsert({ email, source }, { onConflict: 'email' })

    if (error) {
      console.error('Erreur Supabase:', error)
      return NextResponse.json({ error: 'Erreur lors de l\'inscription' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Inscription réussie' }, { status: 200 })

  } catch (error) {
    console.error('Erreur API subscribe:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
