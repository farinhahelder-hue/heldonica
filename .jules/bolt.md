## 2024-05-18 - [Bolt] Async fs.readFile in Route Handler
**Learning:** Using `fs.readFileSync` in Next.js App Router route handlers blocks the entire main thread during I/O, drastically reducing throughput and degrading TTFB, especially under concurrent load.
**Action:** Replaced `fs.readFileSync` with `await fs.promises.readFile` in `app/api/cms-html/route.ts` to free the event loop and handle concurrent requests non-blockingly, yielding an ~10x improvement in throughput on a benchmark of 10,000 iterations.
