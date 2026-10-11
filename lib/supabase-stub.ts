/**
 * lib/supabase-stub.ts
 *
 * Client Supabase « inerte » utilisé uniquement lorsque les variables
 * d'environnement manquent (build, CI, pré-rendu SSG/ISR, preview sans clés).
 *
 * Objectif : éviter qu'un `sb.from(...).select().eq(...)` plante au build
 * pendant le pré-rendu, sans jamais faire croire qu'une requête a réussi.
 * Toutes les méthodes renvoient une promesse résolue sur `{ data: null, error: null }`,
 * et tout accès chaîné renvoie le même proxy — le code appelant poursuit sa
 * route comme si la base était vide, ce qui est exactement le cas.
 */

const EMPTY_RESPONSE = { data: null, error: null } as const;

export function createSafeSupabaseStub(): never {
  const noop = () => proxy;

  const proxy: unknown = new Proxy(noop as unknown as Record<string, unknown>, {
    get(_target, prop) {
      // Un `await` sur le proxy le traite comme un thenable : on résout vide.
      if (prop === 'then') {
        return (resolve: (value: typeof EMPTY_RESPONSE) => void) => {
          resolve(EMPTY_RESPONSE);
          return proxy;
        };
      }
      if (prop === 'catch' || prop === 'finally') {
        return () => proxy;
      }
      if (prop === 'data') return null;
      if (prop === 'error') return null;
      // Chaînage : .from().select().eq().order().limit()… renvoie le proxy.
      return proxy;
    },
    apply() {
      return proxy;
    },
  });

  return proxy as never;
}
