# Codebase Map

## Backend/API Routes

| File path | Method and path | Auth requirement | Request schema | Response schema | Purpose |
| --- | --- | --- | --- | --- | --- |
| `app/api/generate-audio/route.ts` | `POST /api/generate-audio` | No explicit user auth; requires server env keys | JSON with `topic` or `knowledgeGap`, optional `voiceId` | `audio/mpeg` stream on success; JSON error on failure | Generates a short Gemini script and converts it to ElevenLabs audio. |
| `supabase/functions/analyze-text/index.ts` | `POST /functions/v1/analyze-text`, `OPTIONS` | `Authorization` header required; verifies user with Supabase auth despite `verify_jwt = false` in config | JSON with `text`, optional `media`, `language`, `generationOptions`, `n_questions`, `n_flashcards` | JSON analysis with `metadata`, `three_bullet_summary`, `key_terms`, `lesson_sections`, optional `quiz_questions`, `flashcards`, `knowledge_map`; errors 400/401/429/5xx | Main educational analysis endpoint using Gemini, subscription limits, and usage logging. |
| `supabase/functions/content-chat/index.ts` | `POST /functions/v1/content-chat`, `OPTIONS` | `Authorization` header required; verifies user with Supabase auth | JSON with `question`, `contentText`, optional `analysisData`, `language`, `chatHistory`, `activeNodeContext` | `text/plain` streaming response; JSON error on failure | Streams contextual chat answers from Gemini. |
| `supabase/functions/delete-account/index.ts` | `POST /functions/v1/delete-account`, `OPTIONS` | `Authorization` header required; verifies user with Supabase auth | No required JSON body | JSON `{ success, message }` or JSON error | Deletes the authenticated user through Supabase admin API. |
| `supabase/functions/generate-podcast/index.ts` | `POST /functions/v1/generate-podcast`, `OPTIONS` | No explicit user auth in function source; requires server env keys | JSON with `topic`, `knowledgeGap`, or `prompt`; frontend may also send `language` and `contentId` | JSON `{ podcast_url }` or JSON error | Generates a Gemini podcast script, converts with ElevenLabs, stores audio in Supabase Storage bucket `podcasts`. |
| `supabase/functions/gumroad-checkout/index.ts` | `POST /functions/v1/gumroad-checkout`, `OPTIONS` | `Authorization` header required; verifies user with Supabase auth | JSON with optional `plan` of `pro` or `class` | JSON `{ product_url, checkout_url }` or JSON error | Resolves Gumroad checkout URL and appends user email/success URL. |
| `supabase/functions/gumroad-webhook/index.ts` | `POST /functions/v1/gumroad-webhook`, `OPTIONS` | Public webhook; validates sale with Gumroad API and service role | Form data including `email`, `sale_id`, `product_id`, `event`, plus whitelisted optional fields | Plain text `OK`, `Invalid request`, `Too many requests`, or processing errors | Validates Gumroad sales/refunds and updates `subscriptions`. |
| `supabase/functions/scan-knowledge-map/index.ts` | `POST /functions/v1/scan-knowledge-map`, `OPTIONS` | `Authorization` header required; verifies user with Supabase auth | JSON with `text`, `knowledge_map`, optional `language` | JSON with `ghost_nodes` and `ghost_edges` or JSON error | Uses Gemini to identify missing concepts in a knowledge map. |

## Database Models

| File path | Model | Fields | Relationships and constraints | Purpose |
| --- | --- | --- | --- | --- |
| `src/integrations/supabase/types.ts`; `supabase/migrations/*subscriptions*.sql` | `subscriptions` | `id`, `user_id`, `gumroad_sale_id`, `gumroad_email`, `status`, `plan_type`, `purchased_at`, `expires_at`, `created_at`, `updated_at` | `user_id` unique; migrations reference `auth.users(id)` with cascade; RLS limits users to own rows and service role to management | Tracks free/pro/class plans and Gumroad purchases. |
| `src/integrations/supabase/types.ts`; `supabase/migrations/*profiles*.sql` | `profiles` | `id`, `user_id`, `email`, `full_name`, `created_at`, `updated_at` | `user_id` unique; migrations reference `auth.users(id)` with cascade; RLS own-row policies | Stores user profile metadata. |
| `src/integrations/supabase/types.ts`; `supabase/migrations/*usage*.sql` | `usage_logs` | `id`, `user_id`, `action_type`, `created_at` | Migrations reference `auth.users(id)` with cascade; RLS own-row select/insert | Counts daily analysis usage. |
| `src/integrations/supabase/types.ts`; `supabase/migrations/*user_content*.sql` | `user_content` | `id`, `user_id`, `title`, `original_text`, `analysis_data`, `language`, `created_at`, `content_type`, `generation_status`, `podcast_url`, `course_data` | Migrations reference `auth.users(id)` with cascade; indexed by `user_id` and `created_at`; RLS own-row CRUD | Persists analysis, chat sessions, generated study tools, podcasts, and courses. |

## RPCs And Database Functions

| File path | Function | Purpose |
| --- | --- | --- |
| `supabase/migrations/20260110130635_d4d800e4-5fed-4c33-9401-622c15fad56d.sql` | `get_daily_usage_count(p_user_id)` | Counts daily usage and rejects calls for other users. |
| `supabase/migrations/20260122201428_07951cd3-6e66-4b49-b379-ff0aabf3ed93.sql` | `is_pro_user(p_user_id)` | Checks active `pro` or `class` subscription for the calling user. |
| `supabase/migrations/20260119123702_82944a8b-4bf6-40d0-9cbe-9ae50972d7fa.sql` | `get_user_plan(p_user_id)` | Returns `class`, `pro`, or `free` from active subscriptions. |
| `supabase/migrations/20251108000001_fix_profile_creation.sql` | `ensure_user_profile(...)` | Upserts profile metadata for authenticated users. |
| `supabase/migrations/20251108000000_auto_create_profile.sql` | `handle_new_user()` trigger | Creates a profile when an auth user is inserted. |

## Backend Services And External Calls

| File path | Service | External calls | Purpose |
| --- | --- | --- | --- |
| `supabase/functions/analyze-text/index.ts` | Gemini text generation | `https://generativelanguage.googleapis.com/...:generateContent` | Generates summaries, key terms, lesson sections, quiz questions, flashcards, maps, and course data. |
| `supabase/functions/content-chat/index.ts` | Gemini streaming generation | `https://generativelanguage.googleapis.com/...:streamGenerateContent?alt=sse` | Streams markdown chat responses. |
| `supabase/functions/scan-knowledge-map/index.ts` | Gemini text generation | `https://generativelanguage.googleapis.com/...:generateContent` | Generates ghost nodes and edges. |
| `supabase/functions/generate-podcast/index.ts` | Gemini plus ElevenLabs plus Supabase Storage | Gemini generateContent; ElevenLabs text-to-speech; Supabase Storage upload/public URL | Creates hosted podcast audio. |
| `app/api/generate-audio/route.ts` | Gemini plus ElevenLabs | Gemini generateContent; ElevenLabs text-to-speech | Returns audio stream directly from API route. |
| `supabase/functions/gumroad-checkout/index.ts` | Gumroad API | Gumroad product lookup endpoints when direct URLs are absent | Resolves checkout URLs. |
| `supabase/functions/gumroad-webhook/index.ts` | Gumroad API plus Supabase Admin | Gumroad sale verification; Supabase auth admin and table updates | Validates purchases/refunds and changes plan status. |

## Middleware, Validation, And Error Handling

| File path | Purpose |
| --- | --- |
| `supabase/config.toml` | Lists all Edge Functions with `verify_jwt = false`; auth is enforced manually in most function code. |
| `supabase/functions/*/_shared-index.ts` | CORS headers for Edge Functions. |
| `supabase/functions/analyze-text/index.ts` | Validates auth, env vars, text/media input, plan limits, AI retryability, timeout, JSON shape, and usage logging. |
| `supabase/functions/gumroad-webhook/index.ts` | Implements whitelist parsing, input sanitizers, sale/product/email validators, and in-memory webhook rate limiting. |
| `src/pages/Auth.tsx` | Uses Zod schemas for signup/signin form validation. |
| `src/lib/analyzeText.ts` | Client-side analysis payload size guard, retry/backoff, error normalization, and media byte limit. |
| `src/hooks/useUsageLimit.ts` | Client-side plan/usage state from subscriptions, usage logs, and `get_user_plan` fallback. |

## Environment Variables

Name-only inventory: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `LOVABLE_API_KEY`, `GEMINI_API_VERSION`, `GEMINI_TEXT_MODEL`, `GEMINI_MAX_ATTEMPTS`, `GEMINI_RETRY_BASE_MS`, `GEMINI_REQUEST_TIMEOUT_MS`, `ELEVEN_LABS_API_KEY`, `ELEVEN_LABS_VOICE_ID`, `GUMROAD_ACCESS_TOKEN`, `GUMROAD_PRODUCT_ID`, `GUMROAD_CLASS_ID`, `GUMROAD_PRO_FULL_URL`, `GUMROAD_PRO_URL`, `GUMROAD_CLASS_FULL_URL`, `GUMROAD_CLASS_URL`, `VITE_GUMROAD_PRO_FULL_URL`, `VITE_GUMROAD_PRO_URL`, `VITE_GUMROAD_CLASS_FULL_URL`, `VITE_GUMROAD_CLASS_URL`, `NODE_ENV`.

## Frontend Routes

| File path | Route | Purpose |
| --- | --- | --- |
| `src/App.tsx` | `/` | Landing page. |
| `src/App.tsx`; `src/pages/Auth.tsx` | `/auth` | Signup, signin, password reset entry. |
| `src/App.tsx`; `src/pages/Dashboard.tsx` | `/dashboard` | Main input and analysis/chat workflow. |
| `src/App.tsx`; `src/pages/Library.tsx` | `/library` | Saved content list. |
| `src/App.tsx`; `src/pages/ContentDetail.tsx` | `/library/:id` | Analysis detail and study tools. |
| `src/App.tsx`; `src/pages/CourseDetail.tsx` | `/library/course/:id` | Course view. |
| `src/App.tsx`; `src/pages/Quiz.tsx` | `/library/:id/quiz` | Quiz flow. |
| `src/App.tsx`; `src/pages/FlashcardsPage.tsx` | `/library/:id/flashcards` | Flashcard flow. |
| `src/App.tsx`; `src/pages/ChatPage.tsx` | `/library/:id/chat` | Content/general chat. |
| `src/App.tsx`; `src/pages/Billing.tsx` | `/billing` | Plan selection and checkout. |
| `src/App.tsx`; `src/pages/Settings.tsx` | `/settings` | User settings and sign out. |
| `src/App.tsx`; `src/pages/Help.tsx` | `/help` | Help page. |
| `src/App.tsx`; `src/pages/NotFound.tsx` | `*` | Not found route. |

## Frontend State And API Client Layer

| File path | Purpose |
| --- | --- |
| `src/integrations/supabase/client.ts` | Creates Supabase client with env fallback and browser auth persistence. |
| `src/hooks/useAuth.ts` and `src/contexts/AuthContext.tsx` | Tracks auth session, signout, and current user. |
| `src/hooks/useContent.ts` | Fetches, selects, deletes, and refetches `user_content`. |
| `src/hooks/usePodcast.ts` | Invokes `generate-podcast` and manages audio playback state. |
| `src/hooks/useUsageLimit.ts` | Loads subscriptions, usage counts, and lock state. |
| `src/hooks/useSettings.ts`; `src/lib/settings.ts`; `src/lib/i18n.ts` | Language/theme/settings state. |
| `src/lib/analyzeText.ts` | Client wrapper for `analyze-text` Edge Function with retry and payload guards. |
| `src/pages/ChatPage.tsx`; `src/components/ChatPanel.tsx`; `src/components/ContentChat.tsx` | Chat function clients using fetch or Supabase function invoke. |
| `src/pages/Billing.tsx` | Direct Gumroad URL fallback and `gumroad-checkout` function invoke. |
| `src/components/KnowledgeMap/KnowledgeMap.tsx` | Persists map outline data and invokes `scan-knowledge-map`. |

## User Input Flows

| Flow | File paths | Purpose |
| --- | --- | --- |
| Signup/signin/reset | `src/pages/Auth.tsx`, `src/integrations/supabase/client.ts` | Validates credentials, calls Supabase auth, creates profile, redirects to dashboard. |
| Analysis creation | `src/pages/Dashboard.tsx`, `src/components/BottomInputBar/*`, `src/lib/analyzeText.ts`, `supabase/functions/analyze-text/index.ts` | Accepts text/media, chooses generated assets, calls AI analysis, saves `user_content`. |
| General chat creation | `src/pages/Dashboard.tsx`, `src/pages/ChatPage.tsx`, `supabase/functions/content-chat/index.ts` | Saves a chat content row and streams assistant response. |
| Study tools | `src/pages/ContentDetail.tsx`, `src/pages/Quiz.tsx`, `src/pages/FlashcardsPage.tsx`, `src/components/KnowledgeMap/*` | Presents summaries, quiz, flashcards, maps, course, and exports. |
| Missing asset regeneration | `src/pages/ContentDetail.tsx`, `src/lib/analyzeText.ts`, `supabase/functions/generate-podcast/index.ts` | Regenerates selected missing tools and merges into `analysis_data`. |
| Billing/upgrade | `src/pages/Billing.tsx`, `supabase/functions/gumroad-checkout/index.ts`, `supabase/functions/gumroad-webhook/index.ts` | Starts checkout and updates subscription from webhook. |
| Account deletion | `src/components/SettingsModal.tsx`, `supabase/functions/delete-account/index.ts` | Verifies session, invokes delete, signs out. |

## Infrastructure And Config

| File path | Purpose |
| --- | --- |
| `package.json` | Vite scripts: `dev`, `build`, `build:dev`, `lint`, `preview`; no test script declared. |
| `vite.config.ts` | Vite configuration for React app. |
| `tailwind.config.ts`, `postcss.config.js`, `components.json` | Styling and shadcn/ui setup. |
| `eslint.config.js` | Lint configuration. |
| `vercel.json` | Vercel deployment configuration. |
| `supabase/config.toml` | Supabase project/function configuration. |
| `supabase/migrations/*.sql` | Database schema, RLS, policies, RPCs, and seed-like plan grants. |

## Existing Tests And Coverage Gaps

No existing `tests/` directory or package test script was found before this scaffold. Primary gaps are runtime Deno Edge Function tests, frontend component tests, browser E2E tests, SQL/RLS integration tests against a disposable Supabase instance, provider contract mocks, webhook signature/verification tests, and performance/load tests.

## Third-Party Dependencies

Primary third-party systems and libraries include Supabase Auth/PostgREST/Storage/Edge Functions, Google Gemini, ElevenLabs, Gumroad, React, React Router, TanStack Query, Radix/shadcn UI, React Flow, jsPDF, html-to-image/html2canvas, Framer Motion, GSAP, Zod, and Tailwind CSS.
