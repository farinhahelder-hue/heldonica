export function createSafeSupabaseStub() {
  const dummyPayload = { data: null, error: null };
  const recursiveProxy: any = new Proxy(() => {}, {
    get(target, prop) {
      if (prop === 'then') {
        return (resolve: any) => { resolve(dummyPayload); return recursiveProxy; };
      }
      if (prop === 'catch' || prop === 'finally') {
        return () => recursiveProxy;
      }
      return recursiveProxy;
    },
    apply() {
      return recursiveProxy;
    }
  });
  return recursiveProxy;
}
