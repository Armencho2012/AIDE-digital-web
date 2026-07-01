# Backend Թեստերի Արդյունքներ

Աղբյուր՝ օգտատիրոջ տրամադրած `python3 -m pytest tests/backend` հրամանի ելք։

Կարևոր նշում՝ այս արդյունքները գրանցվել են օգտատիրոջ աշխատացրած pytest ելքի հիման վրա։ Agent-ը pytest չի աշխատացրել։

## Ինչպես են այս ֆայլերը աշխատում

Թեստային ֆայլերը պարզապես Python ֆայլեր են, բայց pytest-ը դրանք ավտոմատ ճանաչում է հետևյալ կանոններով.

- Ֆայլի անունը սկսվում է `test_`-ով, օրինակ՝ `test_content_chat_function.py`։
- Ֆայլի ներսում ֆունկցիայի անունը սկսվում է `test_`-ով, օրինակ՝ `test_content_chat_requires_auth_question_and_content`։
- Երբ աշխատացնում եք `python3 -m pytest tests/backend`, pytest-ը մտնում է `tests/backend` թղթապանակ, գտնում է բոլոր `test_*.py` ֆայլերը, հետո հերթով կանչում է դրանց մեջ եղած `test_*` ֆունկցիաները։
- `read_source` և `expect_snippets` անուններով արժեքները գալիս են `tests/conftest.py` ֆայլից։ Դրանք pytest fixtures են՝ փոքր օգնականներ, որոնք test ֆունկցիաներին տալիս են source ֆայլեր կարդալու և սպասվող տեքստեր ստուգելու հնարավորություն։
- Այս scaffold-ի test-երը հիմնականում source contract ստուգումներ են։ Այսինքն՝ չեն կանչում Gemini, ElevenLabs, Supabase, Gumroad կամ real DB։ Դրանք կարդում են source code-ը և ստուգում՝ կարևոր պայմանները դեռ տեղում են։

## Ընդհանուր Արդյունք

| Չափանիշ | Արդյունք |
| --- | --- |
| Հավաքված test-եր | 62 |
| Անցած | 59 |
| Սպասված ձախողում `xfail` | 3 |
| Իրական ձախողում | 0 |
| Տևողություն | 0.27 վրկ |

## Յուրաքանչյուր Test-ի Արդյունքը

| Test | Ինչի համար է | Արդյունք | Նշում |
| --- | --- | --- | --- |
| `tests/backend/api/test_analyze_text_function.py::test_analyze_text_requires_auth_and_environment` | Ստուգում է, որ `analyze-text` ֆունկցիան պահանջում է auth header և անհրաժեշտ env vars։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/api/test_analyze_text_function.py::test_analyze_text_request_schema_and_statuses` | Ստուգում է `analyze-text` request դաշտերը, դատարկ content-ի սխալը և daily limit status-ը։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/api/test_analyze_text_function.py::test_analyze_text_response_schema_contains_educational_sections` | Ստուգում է, որ analysis response-ը նախատեսում է summary, key terms, lesson sections, quiz, flashcards և map բաժիններ։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/api/test_content_chat_function.py::test_content_chat_requires_auth_question_and_content` | Ստուգում է, որ `content-chat`-ը պահանջում է auth, question և contentText։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/api/test_content_chat_function.py::test_content_chat_builds_privacy_aware_context` | Ստուգում է, որ chat prompt-ը հաշվի է առնում privacy կանոնները, node context-ը և վերջին chat history-ն։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/api/test_content_chat_function.py::test_content_chat_streams_plain_text_from_gemini_sse` | Ստուգում է, որ `content-chat`-ը օգտագործում է Gemini SSE streaming և վերադարձնում է plain text stream։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/api/test_delete_account_function.py::test_delete_account_requires_authorization_header_and_env` | Ստուգում է, որ account deletion-ը պահանջում է Authorization և Supabase env vars։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/api/test_delete_account_function.py::test_delete_account_verifies_current_user_before_admin_delete` | Ստուգում է, որ user-ը նախ verify է արվում, հետո միայն admin delete է կատարվում։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/api/test_delete_account_function.py::test_delete_account_success_and_failure_contract` | Ստուգում է delete-account endpoint-ի success/failure status contract-ը։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/api/test_generate_audio_route.py::test_generate_audio_route_declares_edge_post_handler` | Ստուգում է, որ `/api/generate-audio` route-ը ունի Edge runtime և POST handler։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/api/test_generate_audio_route.py::test_generate_audio_route_validates_env_topic_and_voice_before_provider_calls` | Ստուգում է, որ audio route-ը մինչև Gemini/ElevenLabs կանչերը ստուգում է API keys, topic և voiceId։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/api/test_generate_audio_route.py::test_generate_audio_route_returns_audio_stream_from_tts` | Ստուգում է, որ audio route-ը ElevenLabs-ից ստացած audio stream-ն է վերադարձնում։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/api/test_generate_podcast_function.py::test_generate_podcast_accepts_post_only_and_validates_env` | Ստուգում է, որ `generate-podcast`-ը ընդունում է միայն POST և ստուգում է Gemini/ElevenLabs/Supabase env vars։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/api/test_generate_podcast_function.py::test_generate_podcast_request_schema_supports_topic_variants` | Ստուգում է, որ podcast request-ը կարող է ընդունել `topic`, `knowledgeGap` կամ `prompt`։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/api/test_generate_podcast_function.py::test_generate_podcast_response_contract_is_public_url_json` | Ստուգում է, որ podcast-ը վերջում վերադարձնում է `{ podcast_url }` JSON։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/api/test_gumroad_checkout_function.py::test_gumroad_checkout_requires_post_auth_and_supabase_env` | Ստուգում է, որ checkout-ը պահանջում է POST, auth և Supabase env vars։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/api/test_gumroad_checkout_function.py::test_gumroad_checkout_plan_schema_and_url_resolution` | Ստուգում է checkout plan logic-ը՝ `pro` կամ `class`, և Gumroad URL resolution-ը։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/api/test_gumroad_checkout_function.py::test_gumroad_checkout_response_appends_email_and_safe_success_origin` | Ստուգում է, որ checkout URL-ին ավելացվում են user email և անվտանգ success URL։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/api/test_gumroad_webhook_function.py::test_gumroad_webhook_accepts_post_form_data_only` | Ստուգում է, որ Gumroad webhook-ը ընդունում է միայն POST form data։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/api/test_gumroad_webhook_function.py::test_gumroad_webhook_validates_env_and_sale_before_mutation` | Ստուգում է, որ webhook-ը մինչև subscription update-ը validate է անում env-ը և Gumroad sale-ը։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/api/test_gumroad_webhook_function.py::test_gumroad_webhook_handles_purchase_pending_and_cancel_paths` | Ստուգում է webhook-ի purchase, pending user և cancellation/refund flows։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/api/test_scan_knowledge_map_function.py::test_scan_knowledge_map_requires_auth_and_payload` | Ստուգում է, որ `scan-knowledge-map`-ը պահանջում է auth, text և knowledge_map։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/api/test_scan_knowledge_map_function.py::test_scan_knowledge_map_prompt_contract_returns_ghost_graph` | Ստուգում է, որ gap scan prompt-ը սպասում է `ghost_nodes` և `ghost_edges` graph response։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/api/test_scan_knowledge_map_function.py::test_scan_knowledge_map_response_and_error_contract` | Ստուգում է scan endpoint-ի JSON response և Gemini error handling contract-ը։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/integration/test_analyze_text_supabase_flow.py::test_analyze_text_flow_authenticates_before_limits_and_provider_call` | Ստուգում է order-ը՝ auth, usage limit, հետո միայն Gemini provider call։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/integration/test_analyze_text_supabase_flow.py::test_analyze_text_flow_uses_admin_client_for_subscription_and_usage_log` | Ստուգում է, որ analyze flow-ը օգտագործում է admin client subscription lookup-ի և usage logging-ի համար։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/integration/test_analyze_text_supabase_flow.py::test_analyze_text_flow_maps_generation_options_to_response_sections` | Ստուգում է, որ generation options-ը map է արվում համապատասխան response բաժինների վրա։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/integration/test_billing_webhook_subscription_flow.py::test_checkout_requires_authenticated_user_before_returning_checkout_url` | Ստուգում է, որ checkout URL վերադարձնելուց առաջ user-ը authenticated է։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/integration/test_billing_webhook_subscription_flow.py::test_webhook_updates_subscription_after_gumroad_verification` | Ստուգում է, որ subscription-ը update է լինում միայն Gumroad verification-ից հետո։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/integration/test_billing_webhook_subscription_flow.py::test_subscription_schema_supports_pending_active_and_canceled_states` | Ստուգում է, որ subscription schema/logic-ը ունի pending, active և canceled states։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/integration/test_podcast_storage_flow.py::test_generate_podcast_calls_gemini_before_elevenlabs_before_storage` | Ստուգում է podcast order-ը՝ Gemini script, հետո ElevenLabs audio, հետո Supabase Storage upload։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/integration/test_podcast_storage_flow.py::test_generate_podcast_returns_public_podcast_url` | Ստուգում է, որ Storage upload-ից հետո public podcast URL է վերադարձվում։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/integration/test_podcast_storage_flow.py::test_content_detail_updates_user_content_after_podcast_generation` | Ստուգում է frontend content detail logic-ը՝ podcast URL-ը պահվում է `user_content`-ում։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/resilience/test_external_ai_failure.py::test_analyze_text_maps_gemini_failures_to_specific_statuses` | Ստուգում է `analyze-text`-ի Gemini failure handling-ը՝ rate limit, invalid JSON, empty response։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/resilience/test_external_ai_failure.py::test_content_chat_handles_gemini_rate_limit_and_provider_errors` | Ստուգում է `content-chat`-ի Gemini rate limit և provider error handling-ը։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/resilience/test_external_ai_failure.py::test_audio_generation_paths_handle_gemini_and_elevenlabs_failures` | Ստուգում է, որ audio/podcast paths-ը handle են անում Gemini և ElevenLabs failures։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/resilience/test_external_ai_failure.py::test_gumroad_paths_handle_verification_and_lookup_failures` | Ստուգում է Gumroad checkout/webhook failure handling-ը։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/resilience/test_timeouts.py::test_analyze_text_wraps_gemini_fetch_with_abort_timeout` | Ստուգում է, որ `analyze-text` Gemini call-ը ունի explicit AbortController timeout։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/resilience/test_timeouts.py::test_content_chat_should_have_explicit_provider_timeout` | Ստուգում է ցանկալի behavior՝ `content-chat`-ը պետք է ունենա explicit provider timeout։ | XFAILED | Սպասված բաց է․ այս պահին `content-chat`-ը Gemini-ին կանչում է առանց explicit `AbortController` timeout-ի։ |
| `tests/backend/resilience/test_timeouts.py::test_generate_podcast_should_have_explicit_provider_timeouts` | Ստուգում է ցանկալի behavior՝ `generate-podcast`-ը պետք է timeout դնի Gemini և ElevenLabs calls-ի վրա։ | XFAILED | Սպասված բաց է․ այս պահին explicit timeout guards չկան։ |
| `tests/backend/resilience/test_timeouts.py::test_generate_audio_route_should_have_explicit_provider_timeouts` | Ստուգում է ցանկալի behavior՝ `/api/generate-audio` route-ը պետք է timeout դնի Gemini և ElevenLabs calls-ի վրա։ | XFAILED | Սպասված բաց է․ այս պահին explicit timeout guards չկան։ |
| `tests/backend/security/test_auth_boundaries.py::test_config_disables_platform_jwt_verification_for_all_functions` | Ստուգում է, որ Supabase config-ում Edge Function-ների `verify_jwt = false` վիճակը փաստաթղթավորված է։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/security/test_auth_boundaries.py::test_user_identity_functions_check_authorization_and_get_user` | Ստուգում է, որ user-specific functions-ը կարդում են Authorization և կանչում են Supabase `getUser()`։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/security/test_auth_boundaries.py::test_user_content_queries_are_scoped_to_current_user` | Ստուգում է, որ frontend content queries-ը սահմանափակվում են user_id-ով։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/security/test_auth_boundaries.py::test_public_functions_are_explicitly_identified_for_followup_review` | Ստուգում է, որ public-like functions-ը, օրինակ podcast/webhook, առանձին review-ի համար նշված են։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/security/test_input_validation.py::test_auth_page_has_zod_signin_and_signup_validation` | Ստուգում է Auth page-ի Zod validation-ը email/password/name դաշտերի համար։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/security/test_input_validation.py::test_analysis_inputs_are_required_and_media_is_limited_client_side` | Ստուգում է analysis input requirement-ը և client-side media size limit-ը։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/security/test_input_validation.py::test_webhook_rejects_invalid_form_fields_before_processing` | Ստուգում է, որ webhook-ը մերժում է սխալ sale_id/product_id/text fields-ը։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/security/test_input_validation.py::test_chat_and_map_endpoints_require_minimum_payloads` | Ստուգում է chat և map scan endpoints-ի minimum payload validation-ը։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/security/test_rate_limiting.py::test_analyze_text_enforces_daily_usage_by_plan` | Ստուգում է free/pro/class daily usage limit logic-ը analyze-text-ում։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/security/test_rate_limiting.py::test_usage_limit_hook_mirrors_free_pro_class_limits` | Ստուգում է, որ frontend usage hook-ը mirror է անում free/pro/class limits-ը։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/security/test_rate_limiting.py::test_gumroad_webhook_has_in_memory_rate_limit` | Ստուգում է, որ Gumroad webhook-ը ունի in-memory rate limiting։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/unit/test_analyze_text_helper_contracts.py::test_analyze_text_has_retry_timeout_and_provider_error_helpers` | Ստուգում է analyze-text helper-ները՝ retry, timeout և provider error parsing։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/unit/test_analyze_text_helper_contracts.py::test_analyze_text_normalizes_model_json_before_response` | Ստուգում է Gemini JSON normalization/parsing helper logic-ը։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/unit/test_analyze_text_helper_contracts.py::test_analyze_text_clamps_generation_counts_by_plan` | Ստուգում է quiz/flashcard count clamp-ը ըստ plan-ի։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/unit/test_gumroad_webhook_validators.py::test_webhook_whitelists_and_sanitizes_form_fields` | Ստուգում է webhook form field whitelist-ը և sanitization-ը։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/unit/test_gumroad_webhook_validators.py::test_webhook_validates_email_sale_product_and_text_fields` | Ստուգում է email, sale_id, product_id և text field validators-ը։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/unit/test_gumroad_webhook_validators.py::test_webhook_requires_remote_sale_verification_before_subscription_update` | Ստուգում է, որ subscription update-ից առաջ պահանջվում է Gumroad remote sale verification։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/unit/test_supabase_schema_contract.py::test_generated_database_types_include_core_tables` | Ստուգում է, որ generated Supabase types-ը ներառում է հիմնական tables-ը։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/unit/test_supabase_schema_contract.py::test_generated_database_types_include_plan_and_usage_rpcs` | Ստուգում է generated Supabase types-ում plan/usage RPC definitions-ը։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/unit/test_supabase_schema_contract.py::test_migrations_define_rls_for_user_owned_tables` | Ստուգում է, որ migrations-ում RLS կա user-owned tables-ի համար։ | PASSED | Source contract-ը համապատասխանում է։ |
| `tests/backend/unit/test_supabase_schema_contract.py::test_usage_count_rpc_enforces_calling_user` | Ստուգում է, որ usage count RPC-ը թույլ չի տալիս ուրիշ user-ի տվյալներ ստանալ։ | PASSED | Source contract-ը համապատասխանում է։ |

## Ինչ է նշանակում XFAILED

`XFAILED` նշանակում է սպասված ձախողում։ Այս test-երը հատուկ նշված են որպես known gaps, որպեսզի QA report-ը ցույց տա՝ ինչն է դեռ պետք լավացնել։

Այս պահին known gaps-ը հետևյալն են.

- `content-chat`-ին պետք է explicit provider timeout։
- `generate-podcast`-ին պետք է explicit Gemini և ElevenLabs timeout handling։
- `/api/generate-audio` route-ին պետք է explicit Gemini և ElevenLabs timeout handling։

Այս 3-ը իրական regression չեն այս run-ի մեջ։ Դրանք intentional նշված տեխնիկական պարտքեր են։
