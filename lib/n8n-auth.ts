import { NextRequest, NextResponse } from 'next/server'

/**
 * Garde des routes d'automatisation (n8n, webhooks sortants).
 *
 * Ces routes manient le client de service Supabase, qui contourne la RLS :
 * un appel anonyme y vaut un acces complet en ecriture sur le contenu du
 * site. L'audit du 27/07/2026 relevait deja que /api/webhook/trigger
 * n'avait « AUCUNE » protection (docs/archive/AUDIT_APPROFONDI_2026-07-27.md) ;
 * elle est restee ouverte trois mois, et le PATCH de /api/n8n/articles avec
 * elle.
 *
 * La garde echoue FERMEE : si N8N_WEBHOOK_SECRET n'est pas pose, la route
 * repond 503 au lieu de s'ouvrir. Une garde qui s'efface quand sa variable
 * manque ne garde rien.
 *
 * Renvoie la reponse a retourner telle quelle, ou null si l'appelant est
 * legitime.
 */
export function requireN8nSecret(request: NextRequest): NextResponse | null {
  const attendu = process.env.N8N_WEBHOOK_SECRET?.trim()
  if (!attendu) {
    return NextResponse.json(
      { error: 'Service unavailable - N8N_WEBHOOK_SECRET not configured' },
      { status: 503 }
    )
  }

  const fourni = request.headers.get('x-n8n-secret')
  if (!fourni || fourni !== attendu) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return null
}
