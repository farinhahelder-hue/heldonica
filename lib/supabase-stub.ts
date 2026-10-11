
export const createSafeSupabaseStub = (): any => {
  const proxy: any = new Proxy(() => {}, {
    get: (target, prop) => {
      if (prop === 'then') return (resolve: any) => resolve({ data: null, error: null });
      if (prop === 'catch') return () => proxy;
      if (prop === 'finally') return () => proxy;
      return proxy;
    },
    apply: () => proxy
  });
  return proxy;
};
