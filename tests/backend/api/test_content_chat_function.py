"""
covers: API contract for the `content-chat` Supabase Edge Function.
does_not_cover: Real streaming over the network, Gemini SSE behavior, auth server behavior, or UI rendering.
prerequisites: `supabase/functions/content-chat/index.ts` exists; fetch must be mocked for runtime tests.
"""


def test_content_chat_requires_auth_question_and_content(read_source, expect_snippets):
    source = read_source("supabase/functions/content-chat/index.ts")

    expect_snippets(
        source,
        [
            'const authHeader = req.headers.get("Authorization")',
            'return new Response(JSON.stringify({ error: "Authorization required" })',
            "await supabase.auth.getUser()",
            "const { question, contentText, analysisData, language, chatHistory, activeNodeContext } = body;",
            'return new Response(JSON.stringify({ error: "Question and content required" })',
        ],
    )


def test_content_chat_builds_privacy_aware_context(read_source, expect_snippets):
    source = read_source("supabase/functions/content-chat/index.ts")

    expect_snippets(
        source,
        [
            "activeNodeContext",
            "chatHistory",
            ".slice(-6)",
            "Do NOT mention filenames, file paths, URLs, or source metadata.",
            "If the user requests a source, cite only the relevant idea from the provided context",
        ],
    )


def test_content_chat_streams_plain_text_from_gemini_sse(read_source, expect_snippets):
    source = read_source("supabase/functions/content-chat/index.ts")

    expect_snippets(
        source,
        [
            "streamGenerateContent?alt=sse",
            "new TransformStream()",
            "response.body?.getReader()",
            "\"Content-Type\": \"text/plain; charset=utf-8\"",
            "\"Cache-Control\": \"no-cache\"",
        ],
    )
