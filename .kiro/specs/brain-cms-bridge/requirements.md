# Requirements Document

## Introduction

The Brain-CMS Bridge is a bidirectional communication layer between the Heldonica Brain (a local Python/FastAPI server running on port 8440) and the Heldonica CMS (a Next.js application deployed on Vercel at heldonica.fr, backed by Supabase).

The Brain runs locally and already pushes content to the CMS. The bridge extends this in both directions: the CMS (or any authenticated remote caller) can dispatch tasks to the Brain's orchestrator, receive results asynchronously, and monitor the Brain's status — without requiring direct network access to the local machine. The Brain polls a task queue persisted in Supabase (`agent_tasks` table) and processes instructions from it. Results and logs flow back to the same table, making them visible in the CMS admin dashboard.

The system must never require direct inbound connectivity to the Brain's local network: all communication is initiated outbound from the Brain (polling) or through the CMS API (dispatch).

---

## Glossary

- **Brain**: The local FastAPI server (`heldonica-brain`) running on the user's Windows machine at port 8440.
- **CMS**: The Next.js/Vercel application at heldonica.fr, with Supabase as its database.
- **Bridge**: The feature described in this document — the combination of CMS API routes, Supabase table, and Brain polling logic that connects the two systems.
- **Agent_Task**: A row in the Supabase `agent_tasks` table representing a unit of work dispatched to the Brain. Follows the existing vocabulary: `sent`, `in_progress`, `done`, `waiting_validation`, `blocked`.
- **Dispatcher**: The CMS-side component (Next.js API routes) that writes tasks into `agent_tasks` and reads back results.
- **Poller**: The Brain-side component (Python) that periodically reads pending tasks from the CMS, executes them, and writes results back.
- **Bridge_Token**: A shared secret (environment variable) used to authenticate the Brain's polling requests to the CMS. Distinct from `CMS_PASSWORD` and `CMS_SESSION_SECRET`.
- **Task_Type**: A string identifier that maps to a Brain capability (e.g., `"generate_carousel"`, `"generate_itinerary"`, `"run_task"`, `"chat"`, `"status"`).
- **Heartbeat**: A periodic record written by the Brain indicating it is online, with its current hardware and model status.

---

## Requirements

### Requirement 1: Task Dispatch from the CMS

**User Story:** As a CMS administrator, I want to dispatch tasks to the Heldonica Brain from the CMS interface, so that I can trigger AI content generation and Brain operations remotely without direct server access.

#### Acceptance Criteria

1. WHEN an authenticated CMS administrator sends a POST request to `/api/brain/tasks` with a valid `task_type` and optional `payload`, THE Dispatcher SHALL insert a new `agent_tasks` row with `status = 'sent'`, `agent = 'heldonica-brain'`, and return the new task `id`.
2. THE Dispatcher SHALL require valid CMS authentication (`x-cms-auth` header or session cookie) before accepting any task dispatch request, and SHALL return HTTP 401 if authentication is absent or invalid.
3. WHEN the `CMS_PASSWORD` environment variable is absent on the CMS, THE Dispatcher SHALL return HTTP 503 with a descriptive error message.
4. THE Dispatcher SHALL reject task dispatch requests whose `task_type` is not in the allowed set (`generate_carousel`, `generate_itinerary`, `run_task`, `chat`, `status`), and SHALL return HTTP 400 with a list of valid task types.
5. THE Dispatcher SHALL store the full `payload` JSON object in the `agent_tasks` row without modification, up to 64 KB.
6. WHEN a task is dispatched, THE Dispatcher SHALL set `created_at` to the current UTC timestamp and `claimed_by` to `null`.

---

### Requirement 2: Brain Polling and Task Execution

**User Story:** As a system operator, I want the Brain to automatically poll for pending tasks and execute them, so that dispatched tasks are processed without manual intervention.

#### Acceptance Criteria

1. WHILE the Brain is running, THE Poller SHALL query the CMS endpoint `GET /api/brain/tasks?status=sent&agent=heldonica-brain` at a configurable interval (default: 30 seconds).
2. WHEN THE Poller retrieves a task with `status = 'sent'`, THE Poller SHALL immediately update the task's `status` to `'in_progress'` and set `claimed_by = 'heldonica-brain'` and `claimed_at` to the current UTC timestamp before beginning execution.
3. WHEN a task with `task_type = 'generate_carousel'` is in_progress, THE Brain SHALL invoke `social_creator.generate_carousel` with parameters from `payload` and SHALL write the result to `agent_tasks.actions_done`.
4. WHEN a task with `task_type = 'generate_itinerary'` is in_progress, THE Brain SHALL invoke `travel_concierge.generate_itinerary` with parameters from `payload` and SHALL write the result to `agent_tasks.actions_done`.
5. WHEN a task with `task_type = 'run_task'` is in_progress, THE Brain SHALL invoke `orchestrator.execute_task` with `task_id` from `payload` and SHALL write the result to `agent_tasks.actions_done`.
6. WHEN a task with `task_type = 'chat'` is in_progress, THE Brain SHALL invoke `llm.generate` with `message` from `payload` and SHALL write the reply to `agent_tasks.actions_done`.
7. WHEN a task with `task_type = 'status'` is in_progress, THE Brain SHALL collect current hardware metrics, Ollama status, and active task count, and SHALL write them to `agent_tasks.actions_done`.
8. WHEN a task execution completes successfully, THE Poller SHALL set the task `status` to `'done'` and populate `actions_done` with the structured result JSON.
9. IF a task execution raises an exception, THEN THE Poller SHALL set the task `status` to `'blocked'`, write the error message to `actions_done`, and log the failure via `log_event`.
10. THE Poller SHALL NOT process a task whose `status` is not `'sent'` at the moment of claiming, to prevent double-execution.

---

### Requirement 3: Bridge Authentication

**User Story:** As a system architect, I want all Bridge traffic to be authenticated, so that neither the CMS endpoints nor the Brain's polling are accessible by unauthorized parties.

#### Acceptance Criteria

1. THE CMS Bridge endpoints (`/api/brain/tasks`, `/api/brain/status`, `/api/brain/heartbeat`) SHALL require either a valid `x-cms-auth` header or a valid `Bridge_Token` via `Authorization: Bearer <token>` header.
2. THE Brain Poller SHALL include `Authorization: Bearer <Bridge_Token>` in every HTTP request it sends to the CMS Bridge endpoints.
3. THE Bridge_Token SHALL be read exclusively from the `BRAIN_BRIDGE_TOKEN` environment variable on both the CMS and the Brain; it SHALL never be hard-coded or logged.
4. IF the `BRAIN_BRIDGE_TOKEN` environment variable is absent on either side, THEN THE Bridge component on that side SHALL refuse to start and SHALL log a `CRITICAL` level event with a descriptive message.
5. THE CMS SHALL validate the `Bridge_Token` using a constant-time comparison to prevent timing attacks.
6. THE CMS Bridge endpoints SHALL return HTTP 401 for requests presenting an invalid token and HTTP 503 when `BRAIN_BRIDGE_TOKEN` is not configured.

---

### Requirement 4: Heartbeat and Brain Status Visibility

**User Story:** As a CMS administrator, I want to see whether the Brain is online and healthy directly from the CMS dashboard, so that I know whether dispatched tasks will be processed.

#### Acceptance Criteria

1. WHILE the Brain is running, THE Poller SHALL send a heartbeat to `POST /api/brain/heartbeat` every 60 seconds containing CPU usage percentage, RAM usage percentage, Ollama status, and active model name.
2. THE CMS SHALL store the most recent heartbeat data in the `brain_status` record of the `site_settings` Supabase table (or a dedicated `brain_heartbeats` row), overwriting the previous value.
3. WHEN a GET request is sent to `/api/brain/status`, THE Dispatcher SHALL return the most recent heartbeat data including `last_seen` timestamp.
4. WHEN no heartbeat has been received in the past 120 seconds, THE Dispatcher SHALL include `"online": false` in the status response.
5. WHEN a heartbeat has been received within the past 120 seconds, THE Dispatcher SHALL include `"online": true` in the status response.
6. THE heartbeat endpoint SHALL accept `Bridge_Token` authentication only (not CMS session cookies, since the Brain has no browser session).

---

### Requirement 5: Result Retrieval and Task Listing from the CMS

**User Story:** As a CMS administrator, I want to view dispatched tasks and their results from the CMS interface, so that I can monitor what the Brain has done and review generated content.

#### Acceptance Criteria

1. WHEN an authenticated CMS administrator sends a GET request to `/api/brain/tasks`, THE Dispatcher SHALL return the list of `agent_tasks` rows where `agent = 'heldonica-brain'`, ordered by `created_at` descending, with pagination (`page` and `limit` query parameters, default limit 20).
2. WHEN an authenticated CMS administrator sends a GET request to `/api/brain/tasks/:id`, THE Dispatcher SHALL return the full `agent_tasks` row for that task including `actions_done`.
3. THE Dispatcher SHALL support filtering by `status` query parameter (`sent`, `in_progress`, `done`, `blocked`, `all`).
4. WHEN `actions_done` contains a carousel object with a `slides` array, THE Dispatcher SHALL include it verbatim in the response without transformation.
5. THE Dispatcher SHALL return HTTP 404 when a requested task `id` does not exist or does not belong to `agent = 'heldonica-brain'`.

---

### Requirement 6: Supabase Schema

**User Story:** As a developer, I want the `agent_tasks` table to have the columns required by the bridge, so that task dispatch, execution tracking, and result storage work without schema errors.

#### Acceptance Criteria

1. THE `agent_tasks` table in Supabase SHALL contain at minimum the columns: `id` (uuid or bigint PK), `agent` (text), `task_type` (text), `payload` (jsonb), `status` (text), `created_at` (timestamptz), `claimed_by` (text nullable), `claimed_at` (timestamptz nullable), `actions_done` (jsonb nullable), `notes` (text nullable).
2. THE CMS migration SHALL add any missing columns via a versioned migration file in `supabase/migrations/` without dropping existing data.
3. THE `agent_tasks` table SHALL have a partial index on `(status, agent)` to support efficient polling queries.
4. WHEN the Brain attempts to claim a task, THE database SHALL enforce that only one claimer can set `status = 'in_progress'` for a given task row, using a conditional update (`UPDATE ... WHERE status = 'sent'`).
5. THE migration SHALL NOT modify or remove any existing columns already present in the `agent_tasks` table.

---

### Requirement 7: Error Handling and Resilience

**User Story:** As a system operator, I want the Bridge to handle network failures and malformed payloads gracefully, so that transient issues do not crash the Brain or corrupt the task queue.

#### Acceptance Criteria

1. IF THE Poller fails to reach the CMS (network timeout, 5xx response), THEN THE Poller SHALL log the failure via `log_event` at `WARNING` level and SHALL retry on the next polling interval without marking any task as failed.
2. IF THE Poller receives a malformed JSON payload in a task, THEN THE Brain SHALL set that task's `status` to `'blocked'` with a descriptive error and SHALL continue processing other pending tasks.
3. IF a task execution exceeds 300 seconds, THEN THE Brain SHALL abort the execution, set the task `status` to `'blocked'` with message `"execution_timeout"`, and SHALL continue the polling loop.
4. THE Poller SHALL enforce a maximum of 5 concurrent in-progress tasks at any given time; WHEN 5 tasks are already `in_progress`, THE Poller SHALL not claim additional tasks until one completes.
5. IF the CMS returns HTTP 401 or HTTP 403 for a polling request, THEN THE Poller SHALL log a `CRITICAL` event and SHALL suspend polling for 300 seconds before retrying.
