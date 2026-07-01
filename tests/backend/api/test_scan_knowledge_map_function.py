"""
covers: API contract for the `scan-knowledge-map` Supabase Edge Function.
does_not_cover: Real Gemini calls, graph rendering, database persistence, or UI merge behavior.
prerequisites: Gemini fetch and Supabase auth calls must be mocked for runtime tests.
"""


def test_scan_knowledge_map_requires_auth_and_payload(read_source, expect_snippets):
    source = read_source("supabase/functions/scan-knowledge-map/index.ts")

    expect_snippets(
        source,
        [
            'const authHeader = req.headers.get("Authorization")',
            "await supabase.auth.getUser()",
            'const { text, knowledge_map, language = "en" } = body;',
            'return new Response(JSON.stringify({ error: "Missing text or knowledge_map" })',
        ],
    )


def test_scan_knowledge_map_prompt_contract_returns_ghost_graph(read_source, expect_snippets):
    source = read_source("supabase/functions/scan-knowledge-map/index.ts")

    expect_snippets(
        source,
        [
            '"ghost_nodes": [',
            '"ghost_edges": [',
            "Keep ghost_nodes to 3 items.",
            "Use types and directions that match the relationship.",
        ],
    )


def test_scan_knowledge_map_response_and_error_contract(read_source, expect_snippets):
    source = read_source("supabase/functions/scan-knowledge-map/index.ts")

    expect_snippets(
        source,
        [
            "responseMimeType: \"application/json\"",
            "Gemini returned an empty response",
            "Gemini API error",
            "return new Response(JSON.stringify(parsed)",
        ],
    )
