function getSubtle(): SubtleCrypto {
  const c = globalThis.crypto
  if (!c || !c.subtle) throw new Error('Web Crypto API not available')
  return c.subtle
}

function getSecret(): string {
  return process.env.CMS_SESSION_SECRET || process.env.CMS_PASSWORD || 'heldonica-preview-secret'
}

function hexEncode(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function hexDecode(hex: string): Uint8Array | null {
  if (hex.length % 2 !== 0) return null
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    const byte = parseInt(hex.slice(i, i + 2), 16)
    if (isNaN(byte)) return null
    bytes[i / 2] = byte
  }
  return bytes
}

export async function signToken(payload: string): Promise<string> {
  const subtle = getSubtle()
  const key = await subtle.importKey(
    'raw',
    new TextEncoder().encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  return hexEncode(sig)
}

export async function verifyToken(payload: string, sig: string): Promise<boolean> {
  const sigBytes = hexDecode(sig)
  if (!sigBytes) return false
  const subtle = getSubtle()
  const key = await subtle.importKey(
    'raw',
    new TextEncoder().encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  )
  // SubtleCrypto verify expects BufferSource. Cast as unknown as BufferSource.
  return subtle.verify('HMAC', key, sigBytes as unknown as BufferSource, new TextEncoder().encode(payload))
}

export async function verifyPreviewToken(token: string): Promise<{ slug: string } | null> {
  try {
    const [dataB64, sig] = token.split('.')
    if (!dataB64 || !sig) return null
    const data = atob(dataB64)
    const valid = await verifyToken(data, sig)
    if (!valid) return null
    const payload = JSON.parse(data)
    if (!payload.exp || payload.exp < Date.now()) return null
    return { slug: payload.slug }
  } catch {
    return null
  }
}
