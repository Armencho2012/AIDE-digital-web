"""
covers: Source-level helper contracts inside the analyze-text Edge Function.
does_not_cover: Deno runtime imports, live Gemini calls, database writes, or actual JSON parsing execution.
prerequisites: `supabase/functions/analyze-text/index.ts` exists and external calls remain mocked/unexecuted.
"""


def test_analyze_text_has_retry_timeout_and_provider_error_helpers(read_source, expect_snippets):
    source = read_source("supabase/functions/analyze-text/index.ts")

    expect_snippets(
        source,
        [
            "const GEMINI_MAX_ATTEMPTS",
            "const GEMINI_RETRY_BASE_MS",
            "const GEMINI_REQUEST_TIMEOUT_MS",
            "const parseProviderError",
            "const isRetryableProviderFailure",
            "const fetchWithTimeout",
            "AbortController",
        ],
    )


def test_analyze_text_normalizes_model_json_before_response(read_source, expect_snippets):
    source = read_source("supabase/functions/analyze-text/index.ts")

    expect_snippets(
        source,
        [
            "const parseGeminiJson",
            '.replace(/^```json\\s*/i, "")',
            ".replace(/,\\s*([}\\]])/g, \"$1\")",
            "if (!analysis.metadata)",
            "if (!analysis.knowledge_map)",
        ],
    )


def test_analyze_text_clamps_generation_counts_by_plan(read_source, expect_snippets):
    source = read_source("supabase/functions/analyze-text/index.ts")

    expect_snippets(
        source,
        [
            "const QUIZ_LIMITS",
            "const FLASHCARD_LIMITS",
            "const requestedQuizCount",
            "const requestedFlashcardCount",
            "Math.min(Math.max(requestedQuizCount, quizLimits.min), quizLimits.max)",
            "Math.min(Math.max(requestedFlashcardCount, flashcardLimits.min), flashcardLimits.max)",
        ],
    )
