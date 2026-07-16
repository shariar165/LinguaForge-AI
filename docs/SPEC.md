# LinguaVerse AI — System Specification

Version 1.1 · 2026-07-12

LinguaVerse AI teaches English (CEFR A1–B1) with structured lessons, instant pronunciation
scoring, an AI chat tutor, AI-generated practice quizzes, and gamification (streaks, XP,
achievements). Version 1 is English-only and runs entirely on free tiers.

---

## 1. Architecture

```
┌────────────────────┐   Supabase JS (RLS-protected)   ┌──────────────────┐
│  frontend/         │◄───────────────────────────────►│  Supabase        │
│  Next.js 16        │                                 │  Postgres + Auth │
│  React 19, TW v4   │        Bearer <supabase JWT>    └──────────────────┘
│  shadcn (Base UI)  │   ┌──────────────────┐                  ▲
│                    │──►│  backend/        │──────────────────┘
└────────────────────┘   │  FastAPI (3.13)  │   service-role key (ai_usage)
                         │                  │──► Groq API (OpenAI-compatible)
                         └──────────────────┘        primary + fallback model
```

- **Frontend** owns auth, all Supabase reads/writes, lesson rendering, and speech
  (browser `speechSynthesis` + Web Speech API recognition — no paid speech services).
- **Backend** owns everything that needs a secret: AI calls (tutor chat, explain, quiz
  generation), deterministic pronunciation scoring, and the daily AI usage cap.
- **Auth handshake:** the frontend sends its Supabase access token (`Authorization:
  Bearer`); the backend verifies it with the project's JWT secret (HS256, audience
  `authenticated`).

## 2. Features & acceptance criteria

### 2.1 Authentication
Files: `frontend/src/app/(auth)/*`, `src/app/auth/callback/route.ts`, `src/proxy.ts`
- Email/password signup (username captured into `auth.users.raw_user_meta_data`) and login;
  Google OAuth via `/auth/callback` code exchange with a safe relative-redirect guard.
- Signup triggers `handle_new_user()` in Postgres → creates `profiles` + `streaks` rows.
- `proxy.ts` (Next 16 middleware) refreshes sessions, redirects signed-out users from
  protected prefixes to `/login?next=…`, and signed-in users away from auth pages.
- Accepts: a new user can sign up, land on `/dashboard`, and has profile + streak rows.

### 2.2 Lessons & course map
Files: `src/app/(app)/lessons/*`, `src/data/lessons.ts`, `scripts/seed.ts`
- 9 seeded lessons (3 units × 3), levels A1–A2, stored in the `lessons` table
  (`content` JSONB). Sequential unlock: a lesson is available once all earlier ones
  (by unit, then `order`) are completed.
- Lesson player stages: **vocabulary → grammar → listening → quiz → review → done**.
  Vocabulary cards have TTS audio, AI explain, and Word Bank bookmarking; grammar has an
  "Ask AI for more" explain dialog; listening plays TTS (with slow speed and a read-it
  fallback when TTS is unsupported) then asks comprehension questions; the quiz is
  single-select with explanations; review recaps and awards XP.
- Completion calls the `complete_lesson` RPC (atomic: progress upsert, first-time-only XP,
  streak advance), then `syncAchievements()`.
- Accepts: completing a lesson updates progress/XP/streak exactly once, unlocks the next
  lesson, and shows earned achievements as toasts.

### 2.3 Pronunciation Studio
Files: `src/app/(app)/practice/speak/page.tsx`, `src/components/speech/*`,
`backend/app/services/scoring.py`
- Practice pools: all lesson vocabulary (words) + speaking sentences, or free text.
  US/GB accent, 3 playback speeds. Recording uses Web Speech recognition (Chrome/Edge);
  other browsers get listen-and-repeat messaging.
- Scoring is deterministic (no AI): normalized word alignment via `difflib`, per-word
  similarity (match threshold 0.8), score = mean similarity × 100, up to 3 tips.
- Accepts: recording a matching sentence scores 100 with all words green; a partial match
  highlights missed words and shows tips.

### 2.4 AI tutor chat
Files: `src/app/(app)/tutor/page.tsx`, `src/components/tutor/tutor-chat.tsx`,
`backend/app/routers/tutor.py`, `backend/app/services/ai.py`
- SSE-streamed chat with the "Lingua" persona, rolling 12-message window, abort button,
  markdown rendering, suggestion chips.
- Model fallback (primary → fallback) happens only before the first streamed token; a
  mid-stream provider failure ends with an SSE error frame (never duplicated output).
- Missing API key → HTTP 503 `ai_not_configured` **before** the stream starts.
- Accepts: a question streams an answer; at the daily cap the user sees the friendly
  429 message; with no key configured the UI shows a clean error, not a broken stream.

### 2.5 AI explain (word / grammar / sentence)
Files: `src/components/tutor/explain-dialog.tsx`, `backend/app/routers/tutor.py:/explain`
- Available on lesson vocabulary cards, the grammar stage, and Word Bank rows.
- Word Bank: when a word has no definition, the dialog offers **Save as definition**,
  which writes the explanation to `saved_words.definition`.
- Accepts: opening the dialog fetches one explanation (cached per dialog); errors map to
  toasts; saving fills the definition in place.

### 2.6 AI practice quiz
Files: `src/app/(app)/practice/quiz/page.tsx`, `src/components/quiz/ai-quiz.tsx`,
`backend/app/routers/quiz.py`
- User picks a topic (free text or suggestion chip) and level (A1/A2/B1); the backend
  generates 5 multiple-choice questions as strict JSON, validated server-side
  (`answer_index` in range, 2–5 options) — invalid AI output → 502 `ai_bad_output`.
- Reuses the lesson `QuizQuestion` component; ends with a score screen and
  regenerate/new-topic actions.
- Accepts: generating a quiz consumes 1 daily AI message; answering all questions shows
  a percentage score.

### 2.7 Word Bank
Files: `src/app/(app)/words/page.tsx`, `src/components/words/word-bank.tsx`, `src/lib/actions.ts`
- Save words from lessons (with definition/example) or free text (empty definition);
  duplicates detected via the `(user_id, word)` unique constraint (Postgres 23505 → info
  toast). Inserts return the created row directly (`.select().single()` — no refetch).
- Rows offer audio, AI explain (+ save-as-definition), and delete.
- Accepts: adding, explaining, and removing a word all update the list without reload.

### 2.8 Gamification: streaks, XP, achievements
Files: `src/lib/actions.ts:syncAchievements`, `src/app/(app)/profile/page.tsx`, SQL trigger/RPC
- XP awarded once per lesson (`xp_reward`); level curve computed client-side on the profile
  page. Streak advances at most once per UTC day inside `complete_lesson`.
- 6 seeded achievements over `lessons_completed`, `streak_days` (max of current/longest),
  `xp_total`, `words_saved`; unlocked client-side after lesson completion / checks.
- Accepts: finishing the first lesson unlocks "first-lesson"; the profile grid shows
  locked vs. unlocked states.

### 2.9 Dashboard, profile, settings
- Dashboard: greeting, 4 stat tiles, next-lesson card with course %, quick links
  (Pronunciation Studio, AI Tutor, AI Practice Quiz). Empty DB shows a "run `npm run seed`"
  card instead of a broken page.
- Settings: username (unique, 23505 → friendly error), daily goal minutes, theme
  (system/light/dark, hydration-safe).

### 2.10 Daily AI usage cap
Files: `backend/app/services/usage.py`, `supabase/migrations/0002_ai_usage_increment.sql`
- Every AI request (chat, explain, quiz) consumes one unit of `DAILY_AI_MESSAGE_LIMIT`
  (default 30) per user per UTC day, stored in `ai_usage`.
- Primary path: atomic `increment_ai_usage(p_user_id, p_limit)` RPC (insert-or-increment
  guarded by the limit in one statement). If the RPC is missing, the backend logs a warning
  and falls back to read-then-upsert. All Supabase calls run in a worker thread
  (`asyncio.to_thread`) — the event loop is never blocked.
- Pronunciation scoring is free (no AI, no cap). Config check happens before the cap, so
  a 503 never consumes quota.

## 3. API contract (backend)

Base URL: `NEXT_PUBLIC_API_URL` (default `http://localhost:8000`). All endpoints except
`/api/health` require `Authorization: Bearer <supabase access token>`.

Error envelope (all non-2xx): `{"error": {"code": string, "message": string}}`

| Code | Meaning |
|---|---|
| `unauthorized` 401 | missing token · `token_expired` 401 · `invalid_token` 401 |
| `validation_error` 422 | request body failed validation |
| `daily_limit_reached` 429 | daily AI cap hit |
| `ai_unavailable` / `ai_bad_output` 502 | all models failed / invalid AI JSON |
| `ai_not_configured` / `auth_not_configured` 503 | missing server config |
| `internal_error` 500 | catch-all (logged) |

### GET /api/health
→ `{"status": "ok"}` (public; used by the docker-compose healthcheck).

### POST /api/tutor/chat  (SSE)
Body: `{"messages": [{"role": "user"|"assistant", "content": str≤4000}] (1–40), "lesson_context"?: str≤2000}`
→ `text/event-stream`: `data: {"text": "..."}` chunks, then `data: [DONE]`;
on mid-stream failure `data: {"error": "..."}`.

### POST /api/tutor/explain
Body: `{"text": str≤500, "kind": "word"|"grammar"|"sentence"}` → `{"explanation": str}`

### POST /api/quiz/generate
Body: `{"topic": str≤200, "level": "A1"|"A2"|"B1", "count": 1–10 (default 5)}`
→ `{"questions": [{"question", "options"[2–5], "answer_index", "explanation"}]}`

### POST /api/pronunciation/score
Body: `{"target_text": str≤500, "transcript": str≤1000}`
→ `{"score": 0–100, "words": [{"word", "heard", "similarity", "matched"}], "tips": [str]}`

## 4. Database (Supabase Postgres)

Migrations: `supabase/migrations/0001_init.sql`, `0002_ai_usage_increment.sql`.
All tables have RLS enabled.

| Table | Purpose | RLS |
|---|---|---|
| `profiles` | id→auth.users, username (unique), avatar_url, xp, daily_goal_minutes | select/update own |
| `lessons` | text id, unit, unit_title, level, "order", title, description, xp_reward, content JSONB | select: authenticated |
| `user_progress` | (user_id, lesson_id) PK, status, quiz_score, completed_at | all: own |
| `streaks` | user_id PK, current_streak, longest_streak, last_active_date | all: own |
| `saved_words` | identity id, (user_id, word) unique, definition, example | all: own |
| `achievements` | text id, title, description, icon, requirement_kind, requirement_value | select: authenticated |
| `user_achievements` | (user_id, achievement_id) PK, unlocked_at | all: own |
| `ai_usage` | (user_id, date) PK, message_count | select own; writes only via service role |

Functions/triggers (all `security definer`, empty search_path):
- `handle_new_user()` — trigger on `auth.users` insert → creates profile + streak rows.
- `complete_lesson(p_lesson_id, p_quiz_score)` — atomic progress/XP/streak update; XP only
  on first completion; streak +1 only when last active date was yesterday (UTC).
- `increment_ai_usage(p_user_id, p_limit)` — atomic capped counter; returns new count or -1
  at cap; not executable by anon/authenticated roles.

Seeding: `cd frontend && npm run seed` (idempotent upserts; requires
`SUPABASE_SERVICE_ROLE_KEY`, read from `frontend/.env.local` or `backend/.env`).

## 5. Environment variables

| Where | Key | Notes |
|---|---|---|
| frontend | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | required |
| frontend | `NEXT_PUBLIC_API_URL` | backend base URL (default `http://localhost:8000`) |
| frontend (seed only) | `SUPABASE_SERVICE_ROLE_KEY` | optional here; seed also reads `backend/.env` |
| backend | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | usage-cap writes |
| backend | `SUPABASE_JWT_SECRET` | HS256 JWT verification |
| backend | `GROQ_API_KEY` | Groq API key (console.groq.com/keys); AI endpoints 503 without it |
| backend | `AI_BASE_URL` | default `https://api.groq.com/openai/v1` |
| backend | `AI_MODEL`, `AI_FALLBACK_MODEL` | defaults `llama-3.3-70b-versatile`, `llama-3.1-8b-instant` |
| backend | `FRONTEND_ORIGINS` | comma-separated CORS allowlist |
| backend | `DAILY_AI_MESSAGE_LIMIT` | default 30 |

## 6. Quality gates

```
cd frontend && npm run lint && npx tsc --noEmit && npm run build
cd backend  && .venv\Scripts\python -m ruff check . && .venv\Scripts\python -m pytest
```
Backend tests cover: JWT auth branches, pronunciation scoring, usage-cap logic (RPC,
fallback, 429, unconfigured), SSE streaming + model fallback semantics, quiz
generation happy/error paths, and 503-when-unconfigured for all AI endpoints.

## 7. Known limitations / V2 roadmap

- Speech recognition needs Chromium (Web Speech API); scoring compares transcripts, not
  audio, so recognition quality bounds accuracy. Server-side Whisper is a V2 item.
- The usage-cap fallback path (when migration 0002 isn't applied) is not concurrency-safe.
- Achievements are granted client-side; a malicious client could self-grant rows in
  `user_achievements` (cosmetic only — XP/streaks are server-side).
- No leaderboard, subscriptions, more languages, offline mode, or mobile apps in V1
  (see README roadmap).
