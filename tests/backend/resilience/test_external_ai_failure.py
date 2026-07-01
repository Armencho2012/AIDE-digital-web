"""
covers: Static failure-handling contracts for Gemini, ElevenLabs, Gumroad, and Supabase Storage integrations.
does_not_cover: Real provider outage simulation, network retries outside source, or alerting/observability.
prerequisites: Source files are available; all external calls remain mocked/unexecuted.
"""


def test_analyze_text_maps_gemini_failures_to_specific_statuses(read_source, expect_snippets):
    source = read_source("supabase/functions/analyze-text/index.ts")

    expect_snippets(
        source,
        [
            "Rate limits exceeded, please try again later.",
            "The model is currently experiencing high demand. Please try again shortly.",
            "Gemini API error",
            "Gemini returned an invalid JSON payload",
            "Gemini returned an empty response",
            "Gemini returned invalid analysis JSON",
        ],
    )


def test_content_chat_handles_gemini_rate_limit_and_provider_errors(read_source, expect_snippets):
    source = read_source("supabase/functions/content-chat/index.ts")

    expect_snippets(
        source,
        [
            "Rate limits exceeded, please try again later.",
            "Gemini API error",
            "status: 502",
            "Content chat error",
        ],
    )


def test_audio_generation_paths_handle_gemini_and_elevenlabs_failures(read_source, expect_snippets):
    edge = read_source("supabase/functions/generate-podcast/index.ts")
    route = read_source("app/api/generate-audio/route.ts")

    expect_snippets(
        edge + route,
        [
            "Gemini generation failed",
            "Gemini returned empty script",
            "ElevenLabs TTS failed",
            "Missing API keys",
        ],
    )


def test_gumroad_paths_handle_verification_and_lookup_failures(read_source, expect_snippets):
    checkout = read_source("supabase/functions/gumroad-checkout/index.ts")
    webhook = read_source("supabase/functions/gumroad-webhook/index.ts")

    expect_snippets(
        checkout + webhook,
        [
            "Unable to query Gumroad products",
            "Checkout URL could not be resolved for configured product",
            "Verification failed",
            "Processing error",
        ],
    )
