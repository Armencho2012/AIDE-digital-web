# Aide Test Scaffold

This directory contains additive QA scaffolding only. No test in this suite has been executed by the agent; execution is reserved for the human operator.

## Install

```bash
pip install -r tests/requirements-test.txt
```

## Run Commands

```bash
pytest tests/backend/unit
pytest tests/backend/integration
pytest tests/backend/api
pytest tests/backend/security
pytest tests/backend/resilience
```

Frontend coverage is intentionally documented in `tests/frontend/README.md` because this project uses a TypeScript React/Vite frontend and should be tested with Vitest, React Testing Library, Cypress, or Playwright rather than Python UI tests.

## Mocking And Environment Notes

All backend tests are source-level contract tests and must keep external calls mocked or unexecuted. Do not run Supabase, Gemini, ElevenLabs, Gumroad, browser, storage, or database calls from this suite.

Environment variable names referenced by planned tests include `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `LOVABLE_API_KEY`, `GEMINI_API_VERSION`, `GEMINI_TEXT_MODEL`, `GEMINI_MAX_ATTEMPTS`, `GEMINI_RETRY_BASE_MS`, `GEMINI_REQUEST_TIMEOUT_MS`, `ELEVEN_LABS_API_KEY`, `ELEVEN_LABS_VOICE_ID`, `GUMROAD_ACCESS_TOKEN`, `GUMROAD_PRODUCT_ID`, `GUMROAD_CLASS_ID`, `GUMROAD_PRO_FULL_URL`, `GUMROAD_PRO_URL`, `GUMROAD_CLASS_FULL_URL`, `GUMROAD_CLASS_URL`, `VITE_GUMROAD_PRO_FULL_URL`, `VITE_GUMROAD_PRO_URL`, `VITE_GUMROAD_CLASS_FULL_URL`, and `VITE_GUMROAD_CLASS_URL`.

Use mock credentials only. Never place secret values in tests or result files.
