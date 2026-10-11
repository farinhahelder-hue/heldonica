💡 **What:** The optimization implemented replaces the sequential `for (const file of files)` media upload loop in `app/api/cms/mobile-publish/route.ts` with a concurrent execution map using `Promise.all`.

🎯 **Why:** When users post a carnet with multiple photos or media items, they are uploaded sequentially to Supabase storage. This means the total upload time is the sum of each individual file's upload time. For instance, uploading 5 files with an average 150ms network delay each would take ~750ms. Concurrency reduces this network bottleneck significantly.

📊 **Measured Improvement:** In a local benchmark simulation involving 5 files and an artificial 150ms delay per file upload (simulating network roundtrip), the concurrent approach was measured to be approximately ~80% faster:
- **Baseline (Sequential)**: ~750ms
- **Optimized (Concurrent)**: ~150ms

By utilizing `Promise.all`, the API wait time for the client is drastically reduced. The implementation also securely returns any early validation errors without attempting to process remaining uploads.
