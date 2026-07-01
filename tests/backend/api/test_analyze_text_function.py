"""
covers: API contract for the `analyze-text` Supabase Edge Function.
does_not_cover: Deno runtime execution, live Supabase auth/DB, live Gemini calls, or provider JSON quality.
prerequisites: `supabase/functions/analyze-text/index.ts` exists and all network calls are mocked for runtime expansion.
"""


def test_analyze_text_requires_auth_and_environment(read_source, expect_snippets):
    source = read_source("supabase/functions/analyze-text/index.ts")

    expect_snippets(
        source,
        [
            'if (req.method === "OPTIONS")',
            'const authHeader = req.headers.get("Authorization")',
            'return new Response(JSON.stringify({ error: "Authorization required" })',
            'const supabaseUrl = Deno.env.get("SUPABASE_URL")!',
            'const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!',
            'const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")',
            'const apiKey = Deno.env.get("GEMINI_API_KEY") || Deno.env.get("LOVABLE_API_KEY")',
        ],
    )


def test_analyze_text_request_schema_and_statuses(read_source, expect_snippets):
    source = read_source("supabase/functions/analyze-text/index.ts")

    expect_snippets(
        source,
        [
            "const { text, media, language = 'en', generationOptions, n_questions, n_flashcards } = body;",
            'return new Response(JSON.stringify({ error: "No content provided" })',
            'return new Response(JSON.stringify({ error: "Daily limit reached. Upgrade for more." })',
            "status: 429",
        ],
    )


def test_analyze_text_response_schema_contains_educational_sections(read_source, expect_snippets):
    source = read_source("supabase/functions/analyze-text/index.ts")

    expect_snippets(
        source,
        [
            '"metadata": {"language":',
            '"three_bullet_summary": ["string", "string", "string"]',
            '"key_terms": [{"term": "string", "definition": "string", "importance": "high|medium|low"}]',
            '"lesson_sections": [{"title": "string", "summary": "string", "key_takeaway": "string"}]',
            '"quiz_questions": [{"question": "string"',
            '"flashcards": [{"front": "string", "back": "string"}]',
            '"knowledge_map": {"nodes":',
        ],
    )
