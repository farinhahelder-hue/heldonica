# Implementation Plan: Brain-CMS Bridge

## Overview

Implementation spans two codebases. Tasks on the CMS side (Next.js/TypeScript at `C:\Users\Work\heldonica`) include the database migration, authentication helper, four API route files, and their test suites. Tasks on the Brain side (Python/FastAPI at `C:\Users\Work\.gemini\antigravity-ide\scratch\heldonica-brain`) cover the `BridgePoller` engine module, its integration into the `main.py` lifespan handler, and the corresponding test suite. The migration must land before any route depends on the new columns; the `bridge-auth` helper must exist before any route imports it; `BridgePoller` must be complete before `main.py` wires it into the lifespan.

---

## Tasks

- [x] 1. Apply Supabase migration (CMS)
  - [x] 1.1 Write migration file `supabase/migrations/20260922000000_brain_bridge_agent_tasks.sql`
    - Add `task_type TEXT` and `payload JSONB` columns using `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` (non-destructive)
    - Add partial index `idx_agent_tasks_bridge_poll ON agent_tasks (agent, status) WHERE status = 'sent'`
    - Verify the file does not touch any existing column or constraint
    - _Requirements: 6.1, 6.2, 6.3, 6.5_

  - [ ]* 1.2 Write migration verification test `__tests__/migrations/brain_bridge_migration.test.ts`
    - Confirm `information_schema.columns` shows `task_type` and `payload` in `agent_tasks` after applying the migration
    - Confirm existing rows retain their `task`, `status`, and `actions_done` values
    - Gate with `INTEGRATION=true` env flag
    - _Requirements: 6.2, 6.5_

- [x] 2. Implement `lib/bridge-auth.ts` (CMS)
  - [x] 2.1 Create `lib/bridge-auth.ts` with `requireBridgeAuth(req: Request)`
    - Accept `x-cms-auth` header (delegate to existing CMS password check) OR `Authorization: Bearer <BRAIN_BRIDGE_TOKEN>`
    - Use constant-time comparison (`timingSafeEqual`) for `BRAIN_BRIDGE_TOKEN` — follow the pattern in `lib/cms-auth.ts`
    - Return `NextResponse` with HTTP 503 `{ error: 'BRAIN_BRIDGE_TOKEN not configured' }` when the env var is absent
    - Return `NextResponse` with HTTP 401 `{ error: 'Unauthorized' }` for any other invalid credential
    - Return `null` when auth passes (caller proceeds)
    - _Requirements: 3.1, 3.3, 3.5, 3.6_

  - [ ]* 2.2 Write unit tests `__tests__/api/brain/bridge-auth.test.ts`
    - Valid `x-cms-auth` header → returns `null`
    - Valid `Authorization: Bearer <token>` → returns `null`
    - Missing auth → HTTP 401
    - Invalid bearer token → HTTP 401
    - `BRAIN_BRIDGE_TOKEN` absent from env → HTTP 503
    - _Requirements: 3.1, 3.5, 3.6_

  - [ ]* 2.3 Write property test `__tests__/api/brain/bridge-auth.property.test.ts`
    - **Property 4: Authentication rejects all invalid tokens**
    - *For any* string that is not the exact `BRAIN_BRIDGE_TOKEN` value, a request bearing that string as `Authorization: Bearer <string>` SHALL receive HTTP 401 and SHALL NOT perform any DB access
    - Use `fast-check` with `fc.string()` filtered to exclude the real token; run ≥100 iterations
    - Tag: `Feature: brain-cms-bridge, Property 4: auth rejects invalid tokens`
    - **Validates: Requirements 3.1, 3.5, 3.6**

- [x] 3. Implement `app/api/brain/tasks/route.ts` — GET + POST (CMS)
  - [x] 3.1 Create `app/api/brain/tasks/route.ts`
    - `export const dynamic = 'force-dynamic'`
    - Call `requireBridgeAuth` at the top of both handlers; short-circuit on non-null return
    - **POST**: validate `task_type` against allowlist `['generate_carousel', 'generate_itinerary', 'run_task', 'chat', 'status']`; return HTTP 400 with `{ error: 'Invalid task_type', valid: [...] }` on mismatch; check `payload` size ≤ 64 KB (return HTTP 413 on violation); insert into `agent_tasks` (`agent='heldonica-brain'`, `status='sent'`, `task_type`, `payload`, `task` from optional `description`, `created_at=now()`, `claimed_by=null`); return `{ id }`
    - **GET**: read `status` (default all), `page` (default 1), `limit` (default 20) from query params; SELECT from `agent_tasks WHERE agent='heldonica-brain'` with optional `status` filter; return array ordered by `created_at DESC` with pagination metadata
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 5.1, 5.3_

  - [ ]* 3.2 Write unit tests `__tests__/api/brain/tasks.test.ts`
    - POST each valid `task_type` → HTTP 200 + `{ id }`
    - POST invalid `task_type` → HTTP 400 with `valid` list
    - POST missing `task_type` → HTTP 400
    - POST oversized payload (>64 KB) → HTTP 413
    - POST missing auth → HTTP 401
    - GET with `status=sent` filter → returns only `sent` rows
    - GET with pagination params → correct page slice
    - GET with no rows → empty array, no error
    - _Requirements: 1.1, 1.4, 1.5, 5.1, 5.3_

  - [ ]* 3.3 Write property tests `__tests__/api/brain/tasks.property.test.ts`
    - **Property 1: Task dispatch stores payload without modification**
    - *For any* valid `task_type` and arbitrary JSON payload up to 64 KB, dispatching then retrieving the task SHALL return a `payload` field structurally equal to the submitted one
    - Use `fast-check` with `fc.jsonValue()` and `fc.constantFrom(...allowlist)` ; run ≥100 iterations
    - Tag: `Feature: brain-cms-bridge, Property 1: payload round-trip`
    - **Validates: Requirements 1.5**
    - **Property 3: Task type allowlist is exhaustive**
    - *For any* string not in the allowlist, POST SHALL return HTTP 400 and SHALL NOT insert a row
    - Use `fc.string()` filtered to exclude valid task types; run ≥100 iterations
    - Tag: `Feature: brain-cms-bridge, Property 3: task type allowlist`
    - **Validates: Requirements 1.4**

- [~] 4. Checkpoint — ensure migration and auth compile cleanly
  - Ensure `supabase/migrations/20260922000000_brain_bridge_agent_tasks.sql` is valid SQL, `lib/bridge-auth.ts` type-checks without errors, and `app/api/brain/tasks/route.ts` compiles. Ask the user if questions arise.

- [x] 5. Implement `app/api/brain/tasks/[id]/route.ts` — GET + PATCH (CMS)
  - [x] 5.1 Create `app/api/brain/tasks/[id]/route.ts`
    - Call `requireBridgeAuth`; short-circuit on non-null return
    - **GET**: SELECT from `agent_tasks WHERE id=:id AND agent='heldonica-brain'`; return full row including `actions_done`; return HTTP 404 if not found or agent mismatch
    - **PATCH**: support two operations:
      - *Claim*: `{ status: 'in_progress', claimed_by: string, claimed_at: string }` — issue `UPDATE agent_tasks SET status='in_progress', claimed_by=..., claimed_at=... WHERE id=:id AND status='sent'`; if `rowsAffected === 0` return HTTP 409 `{ success: false, conflict: true }`
      - *Close*: `{ status: 'done' | 'blocked', actions_done: object }` — UPDATE unconditionally (task already claimed)
    - _Requirements: 2.2, 2.8, 2.9, 2.10, 5.2, 5.4, 5.5, 6.4_

  - [ ]* 5.2 Write unit tests `__tests__/api/brain/tasks-id.test.ts`
    - GET existing task → full row with `actions_done`
    - GET task belonging to different agent → HTTP 404
    - GET non-existent id → HTTP 404
    - PATCH claim success (status was `sent`) → HTTP 200, `status` becomes `in_progress`
    - PATCH claim conflict (status already `in_progress`) → HTTP 409 `{ conflict: true }`
    - PATCH close to `done` with `actions_done` → HTTP 200
    - PATCH close to `blocked` with error message → HTTP 200
    - _Requirements: 2.2, 2.10, 5.2, 5.5, 6.4_

  - [ ]* 5.3 Write property test — claim atomicity (append to `tasks.property.test.ts`)
    - **Property 2: Claim atomicity — at most one claimer**
    - *For any* task in `status='sent'`, when multiple concurrent PATCH callers attempt to claim it, exactly one SHALL succeed and all others SHALL receive HTTP 409; the task SHALL NOT be claimed twice
    - Use `fast-check` with `fc.integer({ min: 2, max: 10 })` for concurrency count; run ≥100 iterations with mocked DB to test conditional-update logic
    - Tag: `Feature: brain-cms-bridge, Property 2: claim atomicity`
    - **Validates: Requirements 2.2, 6.4**

- [x] 6. Implement `app/api/brain/heartbeat/route.ts` and `app/api/brain/status/route.ts` (CMS)
  - [x] 6.1 Create `app/api/brain/heartbeat/route.ts`
    - `export const dynamic = 'force-dynamic'`
    - Accept `Authorization: Bearer <BRAIN_BRIDGE_TOKEN>` **only** (no `x-cms-auth` — Brain has no session)
    - Validate Bearer token using constant-time comparison; return HTTP 401 / 503 as appropriate
    - On valid auth: UPSERT into `site_settings` where `key = 'brain_heartbeat'`, setting `value` to the full request body JSON plus `last_seen = new Date().toISOString()`
    - Return `{ ok: true }`
    - _Requirements: 4.1, 4.2, 4.6, 3.1, 3.6_

  - [x] 6.2 Create `app/api/brain/status/route.ts`
    - `export const dynamic = 'force-dynamic'`
    - Call `requireBridgeAuth`
    - SELECT `value` from `site_settings WHERE key = 'brain_heartbeat'`
    - Parse JSON from `value`; compute `online = (now - last_seen) < 120_000` (milliseconds)
    - Return `{ online, last_seen, cpu_percent, ram_percent, ollama_running, active_model, active_tasks }`
    - When no heartbeat row exists yet, return `{ online: false, last_seen: null }`
    - _Requirements: 4.3, 4.4, 4.5_

  - [ ]* 6.3 Write unit tests `__tests__/api/brain/heartbeat-status.test.ts`
    - POST heartbeat with valid Bearer → `{ ok: true }`, row upserted in `site_settings`
    - POST heartbeat with `x-cms-auth` instead of Bearer → HTTP 401 (Bearer-only endpoint)
    - POST heartbeat missing auth → HTTP 401
    - GET status: last_seen within 120s → `{ online: true }`
    - GET status: last_seen older than 120s → `{ online: false }`
    - GET status: no heartbeat row yet → `{ online: false, last_seen: null }`
    - _Requirements: 4.2, 4.3, 4.4, 4.5, 4.6_

  - [ ]* 6.4 Write property test `__tests__/api/brain/status.property.test.ts`
    - **Property 5: Online/offline determination is a function of recency**
    - *For any* `last_seen` timestamp T and current time N: `online = true` iff `N - T < 120 seconds`; must hold for all values including the exact 120-second boundary
    - Use `fast-check` with `fc.integer()` to generate `T` and `N` offsets; verify boundary at exactly ±1 ms; run ≥100 iterations
    - Tag: `Feature: brain-cms-bridge, Property 5: online/offline determination`
    - **Validates: Requirements 4.4, 4.5**

- [~] 7. Checkpoint — CMS routes complete
  - Run `tsc --noEmit` in the CMS project to confirm all four route files and the auth helper type-check without errors. Run the full `__tests__/api/brain/` unit test suite with `jest --testPathPattern="__tests__/api/brain"`. Fix any failures before continuing. Ask the user if questions arise.

- [x] 8. Implement `app/engine/bridge_poller.py` (Brain)
  - [x] 8.1 Create `app/engine/bridge_poller.py` with the `BridgePoller` class skeleton and `bridge_poller` singleton
    - Class members: `_stop_event: threading.Event`, `_executor: ThreadPoolExecutor(max_workers=5)`, `_futures: list[Future]`, `_base_url: str` (from `HELDONICA_SITE_URL`), `_token: str` (from `BRAIN_BRIDGE_TOKEN`)
    - `__init__`: read and validate env vars; raise `RuntimeError` with `CRITICAL` log if `BRAIN_BRIDGE_TOKEN` is absent
    - `_bridge_headers() -> dict`: return `{"Authorization": f"Bearer {self._token}"}`
    - `start()`: validate env again; spawn daemon thread running `_run_loop`
    - `stop()`: set `_stop_event`; shutdown executor with `wait=True`; join thread
    - `_run_loop()`: alternating poll (every 30s) and heartbeat (every 60s) with `try/except Exception` wrapping the entire loop body; sleep uses `_stop_event.wait(timeout=...)` for clean shutdown
    - _Requirements: 2.1, 3.2, 3.3, 3.4, 7.1_

  - [x] 8.2 Implement `_poll_and_execute` and `_patch_task` in `bridge_poller.py`
    - `_patch_task(task_id, payload)`: PATCH `{base_url}/api/brain/tasks/{task_id}` with `_bridge_headers()`; log `WARNING` on network failure; raise on HTTP 401/403 (triggers suspension)
    - `_poll_and_execute()`:
      - Count active (not-done) futures; if ≥5, skip this cycle (log DEBUG)
      - GET `{base_url}/api/brain/tasks?status=sent` with `_bridge_headers()`
      - For each task: call `_patch_task(id, {status:'in_progress', claimed_by:'heldonica-brain', claimed_at:...})`; if HTTP 409, skip (already claimed); otherwise submit `_execute_task(task)` to executor; store future
      - On HTTP 401/403: log `CRITICAL`, suspend polling for 300s
      - On network failure / 5xx: log `WARNING`, continue loop
    - _Requirements: 2.1, 2.2, 2.10, 7.1, 7.4, 7.5_

  - [x] 8.3 Implement `_execute_task` dispatch table and `_send_heartbeat` in `bridge_poller.py`
    - `_execute_task(task: dict) -> dict`:
      - Dispatch by `task['task_type']`:
        - `'generate_carousel'` → `social_creator.generate_carousel(**task['payload'])`
        - `'generate_itinerary'` → `travel_concierge.generate_itinerary(**task['payload'])`
        - `'run_task'` → `orchestrator.execute_task(task['payload']['task_id'])`
        - `'chat'` → `llm.generate(task['payload']['message'])`
        - `'status'` → inline `get_system_status()` (psutil CPU/RAM + Ollama process check)
      - On success: PATCH task to `status='done'` with `actions_done = {'result': result, 'corrige': [], 'verifie': [], 'non_verifie': [], 'reste_a_faire': []}`
      - On `KeyError`/`TypeError`: PATCH to `'blocked'` with descriptive message; log `ERROR`
      - On `TimeoutError` (from future.result(timeout=300)): PATCH to `'blocked'` with `"execution_timeout"`; log `ERROR`
      - On broad `Exception`: PATCH to `'blocked'`; log `ERROR`; do not re-raise
    - `_send_heartbeat()`: collect `cpu_percent`, `ram_percent`, `ollama_running`, `active_model`, `active_tasks`; POST to `{base_url}/api/brain/heartbeat`; log `WARNING` on failure (non-fatal)
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 4.1, 7.2, 7.3_

- [x] 9. Wire `BridgePoller` into `app/main.py` (Brain)
  - [x] 9.1 Edit `app/main.py` to import and start/stop `bridge_poller` in the lifespan handler
    - Add `from .engine.bridge_poller import bridge_poller` import
    - In the `lifespan` context manager, after `orchestrator.start()`: call `bridge_poller.start()`
    - In the shutdown block (after `yield`): call `bridge_poller.stop()` before `orchestrator.stop()`
    - _Requirements: 2.1, 3.4_

  - [x] 9.2 Add `BRAIN_BRIDGE_TOKEN` to Brain `.env`
    - Append `BRAIN_BRIDGE_TOKEN=` placeholder line to `heldonica-brain/.env` (value left blank; operator fills in the shared secret matching the CMS Vercel env)
    - _Requirements: 3.3, 3.4_

- [ ] 10. Write Brain test suite (Brain)
  - [ ]* 10.1 Write unit tests `tests/test_bridge_poller.py` — task dispatch routing
    - Mock each engine module (`social_creator`, `travel_concierge`, `orchestrator`, `llm`)
    - For each `task_type`, verify `_execute_task` calls the correct engine function with the correct arguments
    - Verify `actions_done` written to Supabase via `_patch_task` matches the `{'result': ..., 'corrige': [], ...}` envelope
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

  - [ ]* 10.2 Write unit tests `tests/test_bridge_poller.py` — concurrency cap and timeout
    - Concurrency cap: when 5 futures are running, a 6th task in the poll result is NOT claimed
    - Timeout: a future that does not resolve within 300s triggers `_patch_task` with `status='blocked'` and message `"execution_timeout"`
    - _Requirements: 7.3, 7.4_

  - [ ]* 10.3 Write unit tests `tests/test_bridge_poller.py` — error and auth paths
    - CMS returns HTTP 401 → `CRITICAL` log emitted, polling suspended for 300s (verify `_stop_event` or sleep call)
    - CMS network failure (requests timeout) → `WARNING` log, loop continues
    - Missing `BRAIN_BRIDGE_TOKEN` → `RuntimeError` raised in `start()`
    - Malformed task payload (missing key) → task patched to `'blocked'`, loop continues
    - _Requirements: 3.4, 7.1, 7.2, 7.5_

  - [ ]* 10.4 Write property test `tests/test_bridge_poller.py` — poller skips non-sent tasks
    - **Property 6: Poller never re-processes non-`sent` tasks**
    - *For any* task whose `status` is `'in_progress'`, `'done'`, or `'blocked'`, the Poller SHALL NOT call `_execute_task` nor issue a claim PATCH
    - Use `hypothesis` with `st.sampled_from(['in_progress', 'done', 'blocked'])` to generate task status; mock the GET response; run ≥100 examples
    - Tag: `Feature: brain-cms-bridge, Property 6: poller skips non-sent`
    - **Validates: Requirements 2.10**

- [ ] 11. Integration tests (CMS)
  - [ ]* 11.1 Write integration tests `__tests__/integration/brain-bridge.test.ts`
    - End-to-end: dispatch task via POST → mock Brain claims and closes via PATCH → GET returns `status='done'` with `actions_done`
    - Heartbeat persistence: POST heartbeat → GET `/api/brain/status` returns correct `last_seen` and `online: true`
    - Schema: confirm `task_type` and `payload` columns exist after migration (runs against `supabase start` test instance)
    - Gate behind `INTEGRATION=true` env flag
    - _Requirements: 1.1, 2.8, 4.2, 4.3, 6.1_

- [x] 12. Final checkpoint — all tests and CI garde-fous pass
  - Run `jest --testPathPattern="__tests__/api/brain"` (unit + property) in the CMS project.
  - Run `pytest tests/test_bridge_poller.py` in the Brain project.
  - Ensure `tsc --noEmit` passes in the CMS project.
  - Run all six CI garde-fous locally and confirm none are red:
    ```bash
    for g in cms-zones cms-drift api-auth erreurs-avalees content-coherence content-evidence; do npm run check:$g --silent || echo "ROUGE : $g"; done; npx tsc --noEmit
    ```
  - Pay special attention to `check:api-auth` (new Bridge routes use the service key via `_bridge_headers`) and `check:erreurs-avalees` (all Supabase writes in the route handlers must read the `error` field).
  - Fix any failures before considering the feature complete. Ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP; the implementation tasks (unmarked) are sufficient for a working bridge.
- The migration (task 1.1) must be applied before running any CMS route manually or in integration tests.
- `lib/bridge-auth.ts` (task 2.1) must exist before tasks 3.1, 5.1, 6.1, and 6.2 are implemented — follow the dependency order in the graph below.
- `bridge_poller.py` tasks 8.1 → 8.2 → 8.3 are strictly sequential; each sub-task builds on the previous.
- `main.py` wiring (task 9.1) must come after all three `bridge_poller.py` sub-tasks are complete.
- The `BRAIN_BRIDGE_TOKEN` shared secret must be identical on both sides; the `.env` placeholder (task 9.2) is a reminder, not a generated value.
- Property tests use `fast-check` on the CMS side and `hypothesis` on the Brain side; both require the respective packages to be installed (`npm install --save-dev fast-check` / `pip install hypothesis`).
- Integration tests (task 11.1) require `supabase start` and the `INTEGRATION=true` env flag; they should not run in normal CI unless that flag is set.
- Every Supabase write in the route handlers (INSERT, UPDATE, UPSERT) must destructure and check `{ data, error }` — not `const { data } = await ...`. The `check:erreurs-avalees` CI guard will fail on silent error swallowing.
- The `check:api-auth` guard inspects routes that use the service-role key. The Bridge routes authenticate callers but use the service key for DB writes — make sure the auth check happens before any DB call, not after.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "3.1", "8.1"] },
    { "id": 3, "tasks": ["3.2", "3.3", "5.1", "8.2"] },
    { "id": 4, "tasks": ["5.2", "5.3", "6.1", "6.2", "8.3"] },
    { "id": 5, "tasks": ["6.3", "6.4", "9.1", "9.2"] },
    { "id": 6, "tasks": ["10.1", "10.2", "10.3", "10.4"] },
    { "id": 7, "tasks": ["11.1"] }
  ]
}
```
