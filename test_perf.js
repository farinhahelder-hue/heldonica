function benchmark() {
  const ARTICLES = Array.from({ length: 50 }, (_, i) => ({ slug: "art" + i }));

  // mock for supabase call
  function mockSupabaseCall(articleOrArticles) {
    return new Promise(resolve => setTimeout(resolve, 50));
  }

  async function runSequential() {
    const start = Date.now();
    for (const art of ARTICLES) {
      await mockSupabaseCall(art);
    }
    const end = Date.now();
    return end - start;
  }

  async function runBatch() {
    const start = Date.now();
    await mockSupabaseCall(ARTICLES);
    const end = Date.now();
    return end - start;
  }

  async function run() {
    console.log("Sequential:", await runSequential(), "ms");
    console.log("Batch:", await runBatch(), "ms");
  }

  run();
}
benchmark();
