import { NextResponse } from 'next/server'
import {
  clearCmsSessionResponse,
  createCmsSessionResponse,
  getCmsAuthStatus,
  isValidCmsPassword,
} from '@/lib/cms-auth'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  if (!rateLimit(getClientIp(req), 5, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }
  const { password } = await req.json()

  if (!process.env.CMS_PASSWORD?.trim()) {
    return NextResponse.json(
      { error: 'CMS non configuré : variable CMS_PASSWORD manquante.' },
      { status: 503 }
    )
  }

  if (!await isValidCmsPassword(password)) {
    return clearCmsSessionResponse(401, { error: 'Mot de passe incorrect' })
  }

  return createCmsSessionResponse()
}

export async function GET(req: Request) {
  const status = await getCmsAuthStatus(req)

  if (status === 'misconfigured') {
    return NextResponse.json(
      { ok: false, error: 'CMS non configuré : variable CMS_PASSWORD manquante.' },
      { status: 503 }
    )
  }

  const ok = status === 'ok'
  return NextResponse.json({ ok }, { status: ok ? 200 : 401 })
}

export async function DELETE() {
  return clearCmsSessionResponse()
}
