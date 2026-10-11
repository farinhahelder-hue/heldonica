export function createSafeSupabaseStub() {
  const handler = {
    get(target: any, prop: string | symbol): any {
      if (prop === 'then') return undefined; // Avoid proxy being treated as a Promise
      return new Proxy(function() {}, handler);
    },
    apply() { return new Proxy(function() {}, handler); }
  };
  return new Proxy(function() {}, handler) as any;
}
