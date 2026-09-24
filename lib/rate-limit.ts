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

/**
 * Même compteur, mais par usage et non par IP seule.
 *
 * Quatre routes appelaient cette fonction sous cette forme sans qu'elle existe :
 * la compilation échouait, et rien ne se déployait — ce qui a bloqué en passant
 * un correctif de sécurité. Elle est écrite ici pour correspondre aux appels
 * déjà en place plutôt que de les réécrire.
 *
 * `prefix` sépare les budgets : sans lui, une inscription à la newsletter
 * consommerait le quota du formulaire de voyage pour la même personne.
 *
 * La fenêtre reste d'une minute, comme le reste du fichier. Deux appelants
 * annoncent « par heure » en commentaire ; l'écart est signalé et leur revient.
 */
export function checkRateLimit(
  ip: string,
  options: { limit: number; prefix: string; windowMs?: number }
): { success: boolean; limit: number; remaining: number; reset: number } {
  const { limit, prefix, windowMs = 60_000 } = options
  const cle = `${prefix}:${ip}`
  const now = Date.now()
  const entree = rateMap.get(cle)

  if (!entree || now > entree.reset) {
    const reset = now + windowMs
    rateMap.set(cle, { count: 1, reset })
    return { success: true, limit, remaining: limit - 1, reset }
  }

  if (entree.count >= limit) {
    return { success: false, limit, remaining: 0, reset: entree.reset }
  }

  entree.count++
  return { success: true, limit, remaining: limit - entree.count, reset: entree.reset }
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
