import { clearCmsSessionResponse } from '@/lib/cms-auth'

export const dynamic = 'force-dynamic'

export async function POST() {
  return clearCmsSessionResponse(200, { ok: true })
}
