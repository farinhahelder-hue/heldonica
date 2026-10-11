export function createSafeSupabaseStub() {
  const handler: ProxyHandler<any> = {
    get(target, prop) {
      if (prop === 'then' || prop === 'catch' || prop === 'finally') {
        return (callback: any) => {
          if (prop === 'then') {
            return Promise.resolve(callback({ data: null, error: null }));
          }
          return Promise.resolve(target);
        };
      }
      return new Proxy(() => {}, handler);
    },
    apply() {
      return new Proxy(() => {}, handler);
    },
  };
  return new Proxy(() => {}, handler);
}
