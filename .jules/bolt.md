2024-05-21 / Performance Learnings / Replaced sequential database updates inside `app/api/publish-podgorica/route.ts` with parallel `Promise.all` batches.

Issue: N+1 database queries occurred when iterating over `noImageArticles` and `noExcerptArticles`, slowing down API endpoints dealing with missing data.

Impact: Batching all operations inside `Promise.all()` allowed Supabase updates to run concurrently over the network rather than serially. A baseline benchmark of a 20-item update array demonstrated a speedup from 1009ms to 51ms (~95% faster) after optimizing to parallel promises.
