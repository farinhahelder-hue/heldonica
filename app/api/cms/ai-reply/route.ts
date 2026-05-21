import { NextResponse } from 'next/server'
import { requireCmsAuth } from '@/lib/cms-auth'
import { HELDONICA_SYSTEM_PROMPT } from '@/lib/brand-voice'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse

  try {
    const body = await req.json()
    const { demande } = body

    if (!demande) {
      return NextResponse.json({ error: 'Demande manquante' }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY

    // Build a personalized email draft without AI if no key available
    if (!apiKey) {
      const draft = generateFallbackReply(demande)
      return NextResponse.json({ reply: draft })
    }

    // Try OpenAI
    if (process.env.OPENAI_API_KEY) {
      const prompt = buildPrompt(demande)
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: HELDONICA_SYSTEM_PROMPT },
            { role: 'user', content: prompt }
          ],
          max_tokens: 600,
          temperature: 0.7,
        }),
      })
      const data = await res.json()
      const reply = data.choices?.[0]?.message?.content?.trim()
      if (reply) return NextResponse.json({ reply })
    }

    // Fallback to template
    return NextResponse.json({ reply: generateFallbackReply(demande) })
  } catch (e) {
    console.error('AI reply error:', e)
    return NextResponse.json({ error: 'Erreur génération' }, { status: 500 })
  }
}

function buildPrompt(d: any): string {
  return `Tu es Hélder, travel planner chez Heldonica (slow travel sur mesure, basé en France/Portugal).
Rédige un email de réponse chaleureux, personnalisé et professionnel en français à ${d.prenom || d.first_name || 'ce client'}.

Détails de leur demande :
- Destination : ${d.destination || ''} ${d.destination_detail || d.destinationDetail || ''}
- Type : ${d.style_voyage || d.trip_type || d.tripType || ''}
- Durée : ${d.duree_jours ? d.duree_jours + ' jours' : (d.duration || '')}
- Budget : ${d.budget_fourchette || d.budget || ''}
- Mois départ : ${d.mois_depart || d.departure_date || ''}
- Message : ${d.notes || d.message || '—'}

Instructions :
- Commence par "Bonjour ${d.prenom || d.first_name || ''},"
- Montre que tu as lu leur demande en détail (cite 1-2 éléments spécifiques)
- Propose un prochain appel de 20 min pour affiner le projet
- Signe "Hélder & Elena — Heldonica"
- Ton : chaleureux, expert, pas commercial
- Longueur : 150-200 mots max`
}

function generateFallbackReply(d: any): string {
  const prenom = d.prenom || d.first_name || 'vous'
  const destination = `${d.destination || ''} ${d.destination_detail || d.destinationDetail || ''}`.trim()
  const budget = d.budget_fourchette || d.budget || ''
  const duree = d.duree_jours ? `${d.duree_jours} jours` : (d.duration || '')

  return `Bonjour ${prenom},

Merci beaucoup pour votre demande — nous sommes vraiment enthousiastes à l'idée de construire ce voyage ${destination ? `vers ${destination}` : 'sur mesure'} avec vous.

${budget ? `Votre budget de ${budget} nous laisse de belles options à explorer.` : ''} ${duree ? `Pour un voyage de ${duree}, nous pouvons concevoir un itinéraire qui respire vraiment.` : ''}

Nous aimerions vous proposer un appel de 20 minutes pour mieux comprendre vos envies et vous présenter quelques premières idées. Seriez-vous disponible cette semaine ou la semaine prochaine ?

Il vous suffit de répondre à cet email avec vos disponibilités, et nous bloquerons un créneau.

À très vite,
Hélder & Elena — Heldonica
✉️ contact@heldonica.fr | 🌍 heldonica.fr`
}
