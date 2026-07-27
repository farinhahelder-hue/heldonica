import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  // Rate limiting: 10 requests per IP per hour
  const result = checkRateLimit(getClientIp(request), { limit: 10, prefix: 'brevo-subscribe' })
  if (!result.success) {
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
