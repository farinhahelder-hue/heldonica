import { SupabaseClient } from '@supabase/supabase-js';

// Recursive proxy to mock Supabase client for build environments without env vars.
// Memory Context: To mock the Supabase client for safe Next.js static generation (SSG/ISR)
// when environment variables are missing, use a recursive JavaScript Proxy...

export function createSafeSupabaseStub(): SupabaseClient {
  const handler = {
    get(target: any, prop: string | symbol): any {
      if (prop === 'then' || prop === 'catch' || prop === 'finally') {
        // Stop chain for promises and resolve with empty payload
        // Dynamic adjust based on 'single' / 'maybeSingle' being called previously?
        // For simplicity, just returning an object matching `{ data: null, error: null }`
        return (callback?: any) => {
           if (prop === 'then') return Promise.resolve({ data: null, error: null }).then(callback);
           if (prop === 'catch') return Promise.resolve({ data: null, error: null });
           if (prop === 'finally') return Promise.resolve({ data: null, error: null }).finally(callback);
           return Promise.resolve({ data: null, error: null });
        }
      }

      if (prop === 'auth') {
        return {
          getUser: () => Promise.resolve({ data: { user: null }, error: null }),
          getSession: () => Promise.resolve({ data: { session: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        }
      }

      // Return proxy recursively for chainable methods
      return new Proxy(() => {}, handler);
    },
    apply(target: any, thisArg: any, argumentsList: any[]) {
      // Allows calling the proxy as a function (e.g. .from('table'))
      return new Proxy(() => {}, handler);
    }
  };

  return new Proxy({}, handler) as unknown as SupabaseClient;
}
