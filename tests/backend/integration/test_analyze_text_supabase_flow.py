"""
covers: Static integration contract for auth, subscription lookup, usage counting, Gemini call, and usage logging in analyze-text.
does_not_cover: Live Supabase auth, database reads/writes, Gemini calls, or Deno execution.
prerequisites: External calls must be mocked if these tests are expanded into runtime tests.
"""


def test_analyze_text_flow_authenticates_before_limits_and_provider_call(read_source):
    source = read_source("supabase/functions/analyze-text/index.ts")

    auth_header_index = source.index('const authHeader = req.headers.get("Authorization")')
    get_user_index = source.index("await supabase.auth.getUser()")
    usage_index = source.index('await supabase.rpc("get_daily_usage_count"')
    provider_index = source.index("const endpoint = `https://generativelanguage.googleapis.com")

    assert auth_header_index < get_user_index < usage_index < provider_index


def test_analyze_text_flow_uses_admin_client_for_subscription_and_usage_log(read_source, expect_snippets):
    source = read_source("supabase/functions/analyze-text/index.ts")

    expect_snippets(
        source,
        [
            "const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);",
            ".from('subscriptions')",
            ".select('plan_type, status')",
            'supabaseAdmin.from("usage_logs").insert({ user_id: user.id, action_type: "analysis" }).then();',
        ],
    )


def test_analyze_text_flow_maps_generation_options_to_response_sections(read_source, expect_snippets):
    source = read_source("supabase/functions/analyze-text/index.ts")

    expect_snippets(
        source,
        [
            "generationOptions",
            "quiz: true",
            "flashcards: true",
            "map: false",
            "course: false",
            "podcast: false",
            "if (!opts.quiz) analysis.quiz_questions = [];",
            "if (!opts.flashcards) analysis.flashcards = [];",
            "if (!opts.map) analysis.knowledge_map = { nodes: [], edges: [] };",
        ],
    )
