import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { password } = await req.json()
  const valid = password === process.env.CMS_PASSWORD
  return NextResponse.json({ ok: valid }, { status: valid ? 200 : 401 })
}
