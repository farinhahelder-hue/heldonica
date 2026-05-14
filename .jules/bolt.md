
## 2024-05-14 - Optimizing N+1 queries in Supabase REST loops
**Learning:** When executing batch updates via Supabase REST API loops, doing sequential `await fetch()` causes a significant N+1 performance bottleneck. Using `Promise.all` executes them in parallel while preserving exact per-item logging and error state tracking, which a PostgREST bulk update (`id=in.()`) would obscure.
**Action:** Next time I see `for(const item of array) { await fetch(...) }`, immediately replace it with an array of promises using `.map` and `await Promise.all()`, ensuring `try/catch` is inside the mapping function so a single error doesn't reject the entire batch.
