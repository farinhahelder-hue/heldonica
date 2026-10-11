export function createSafeSupabaseStub(): any {
  const handler = {
    get: function(target: any, prop: any): any {
      if (prop === 'then') return undefined; // Let it not be a promise
      return new Proxy(() => {}, handler);
    },
    apply: function() {
      return new Proxy(() => {}, handler);
    }
  };
  return new Proxy({}, handler);
}
