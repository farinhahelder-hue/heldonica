import { getCmsAuthStatus } from '@/lib/cms-auth'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const status = await getCmsAuthStatus(req)
  const authenticated = status === 'ok'
  return NextResponse.json({ ok: authenticated }, { status: authenticated ? 200 : 401 })
}
