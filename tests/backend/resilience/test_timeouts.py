"""
covers: Static timeout contracts for provider calls.
does_not_cover: Wall-clock timing, abort behavior in a live runtime, retry jitter distribution, or browser timeouts.
prerequisites: Source files are available; provider requests remain mocked/unexecuted.
"""

# ASSUMPTION: Timeout handling is currently explicit for analyze-text; other provider paths are flagged for future timeout wrappers.

import pytest


def test_analyze_text_wraps_gemini_fetch_with_abort_timeout(read_source, expect_snippets):
    source = read_source("supabase/functions/analyze-text/index.ts")

    expect_snippets(
        source,
        [
            "const fetchWithTimeout = async",
            "const controller = new AbortController();",
            "const timeoutId = setTimeout(() => controller.abort(), timeoutMs);",
            "clearTimeout(timeoutId);",
            "GEMINI_REQUEST_TIMEOUT_MS",
            "Model provider request timed out.",
        ],
    )


@pytest.mark.xfail(reason="content-chat currently calls Gemini without an explicit AbortController timeout.")
def test_content_chat_should_have_explicit_provider_timeout(read_source):
    source = read_source("supabase/functions/content-chat/index.ts")
    assert "AbortController" in source


@pytest.mark.xfail(reason="generate-podcast currently calls Gemini and ElevenLabs without explicit timeout guards.")
def test_generate_podcast_should_have_explicit_provider_timeouts(read_source):
    source = read_source("supabase/functions/generate-podcast/index.ts")
    assert source.count("AbortController") >= 2


@pytest.mark.xfail(reason="generate-audio API route currently calls Gemini and ElevenLabs without explicit timeout guards.")
def test_generate_audio_route_should_have_explicit_provider_timeouts(read_source):
    source = read_source("app/api/generate-audio/route.ts")
    assert source.count("AbortController") >= 2
