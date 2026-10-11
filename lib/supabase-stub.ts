export function createSafeSupabaseStub(): any {
  const handler: any = {
    get: function(target: any, prop: any) {
      if (['then', 'catch', 'finally'].includes(prop)) {
        const p = Promise.resolve({ data: null, error: null });
        return (p as any)[prop].bind(p);
      }
      return new Proxy(() => {}, handler);
    },
    apply: function() {
      return new Proxy(() => {}, handler);
    }
  };
  return new Proxy({}, handler);
}
