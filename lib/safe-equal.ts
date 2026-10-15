/**
 * Comparaison de chaînes à temps constant.
 *
 * Une comparaison `===` s'arrête au premier octet différent : le temps de
 * réponse révèle combien d'octets sont corrects, ce qui permet de reconstituer
 * un secret octet par octet. `timingSafeEqual` compare toujours la totalité.
 *
 * Utilisé par `lib/cms-auth.ts` et `lib/bridge-auth.ts` : la comparaison doit
 * être identique des deux côtés, d'où ce module unique.
 */
export async function safeEqual(a: string, b: string): Promise<boolean> {
  if (typeof a !== 'string' || typeof b !== 'string') return false;

  const aBytes = new TextEncoder().encode(a);
  const bBytes = new TextEncoder().encode(b);

  // `timingSafeEqual` exige des longueurs égales (il lève sinon). La longueur
  // d'un secret n'est pas considérée comme secrète.
  if (aBytes.byteLength !== bBytes.byteLength) {
    return false;
  }

  try {
    const { timingSafeEqual } = await import('crypto');
    return timingSafeEqual(aBytes, bBytes);
  } catch {
    return a === b;
  }
}
