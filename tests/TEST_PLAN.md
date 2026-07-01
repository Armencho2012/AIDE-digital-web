# Test Plan

| module | test_type | planned_test_filename |
| --- | --- | --- |
| Supabase generated schema and migrations | unit | `tests/backend/unit/test_supabase_schema_contract.py` |
| Analyze Edge Function helper contracts | unit | `tests/backend/unit/test_analyze_text_helper_contracts.py` |
| Gumroad webhook validators | unit | `tests/backend/unit/test_gumroad_webhook_validators.py` |
| Analyze text to Supabase usage logging | integration | `tests/backend/integration/test_analyze_text_supabase_flow.py` |
| Gumroad webhook to subscription updates | integration | `tests/backend/integration/test_billing_webhook_subscription_flow.py` |
| Podcast generation to Supabase Storage | integration | `tests/backend/integration/test_podcast_storage_flow.py` |
| `/api/generate-audio` | api_contract | `tests/backend/api/test_generate_audio_route.py` |
| `analyze-text` Edge Function | api_contract | `tests/backend/api/test_analyze_text_function.py` |
| `content-chat` Edge Function | api_contract | `tests/backend/api/test_content_chat_function.py` |
| `delete-account` Edge Function | api_contract | `tests/backend/api/test_delete_account_function.py` |
| `generate-podcast` Edge Function | api_contract | `tests/backend/api/test_generate_podcast_function.py` |
| `gumroad-checkout` Edge Function | api_contract | `tests/backend/api/test_gumroad_checkout_function.py` |
| `gumroad-webhook` Edge Function | api_contract | `tests/backend/api/test_gumroad_webhook_function.py` |
| `scan-knowledge-map` Edge Function | api_contract | `tests/backend/api/test_scan_knowledge_map_function.py` |
| Cross-endpoint input validation | security | `tests/backend/security/test_input_validation.py` |
| Edge Function auth boundaries | auth_authorization | `tests/backend/security/test_auth_boundaries.py` |
| Usage and webhook rate limiting | security | `tests/backend/security/test_rate_limiting.py` |
| AI/provider failure handling | error_resilience | `tests/backend/resilience/test_external_ai_failure.py` |
| Timeout handling | error_resilience | `tests/backend/resilience/test_timeouts.py` |
| Backend load and quota behavior | performance_flag_only | Flag only: add load tests after disposable Supabase/provider mocks exist. |
| React auth and dashboard flows | frontend_e2e_flag_only | Flag only: see `tests/frontend/README.md`; use Playwright/Cypress. |
| React component and hook behavior | frontend_e2e_flag_only | Flag only: see `tests/frontend/README.md`; use Vitest and React Testing Library. |
