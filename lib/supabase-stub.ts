export const createSafeSupabaseStub = (): any => new Proxy({}, {
  get: function(target, prop, receiver) {
    if (prop === 'then' || prop === 'catch' || prop === 'finally') return undefined;
    if (prop === 'single' || prop === 'maybeSingle') {
      return () => Promise.resolve({ data: null, error: null });
    }
    return function() { return receiver; };
  }
});
