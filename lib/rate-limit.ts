/**
 * Rate limit in-memory (suffisant pour trafic actuel, pas de Redis)
 * Clé = IP, fenêtre glissante 60s
 */
const rateMap = new Map<string, { count: number; reset: number }>()

export function rateLimit(ip: string, max = 20, windowMs = 60_000): boolean {
  const now = Date.now()
  const entry = rateMap.get(ip)
  if (!entry || now > entry.reset) {
    rateMap.set(ip, { count: 1, reset: now + windowMs })
    return true
  }
  if (entry.count >= max) return false
  entry.count++
  return true
}

export function getClientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
}

// Nettoyage périodique (évite fuite mémoire)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [k, v] of rateMap.entries()) if (now > v.reset) rateMap.delete(k)
  }, 5 * 60_000).unref?.()
}
