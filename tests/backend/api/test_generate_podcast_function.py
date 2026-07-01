"""
covers: API contract for the `generate-podcast` Supabase Edge Function.
does_not_cover: Real Gemini, ElevenLabs, Supabase Storage, audio validation, or bucket provisioning.
prerequisites: Provider and storage calls must be mocked for runtime tests.
"""

# ASSUMPTION: This function intentionally does not enforce user auth in source; access control is expected at deployment or caller level.


def test_generate_podcast_accepts_post_only_and_validates_env(read_source, expect_snippets):
    source = read_source("supabase/functions/generate-podcast/index.ts")

    expect_snippets(
        source,
        [
            "if (req.method !== 'POST')",
            "Deno.env.get('GEMINI_API_KEY')",
            "Deno.env.get('ELEVEN_LABS_API_KEY')",
            "Deno.env.get('ELEVEN_LABS_VOICE_ID')",
            "Deno.env.get('SUPABASE_URL')",
            "Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')",
        ],
    )


def test_generate_podcast_request_schema_supports_topic_variants(read_source, expect_snippets):
    source = read_source("supabase/functions/generate-podcast/index.ts")

    expect_snippets(
        source,
        [
            "body?.topic?.trim() || body?.knowledgeGap?.trim() || body?.prompt?.trim()",
            "Topic or knowledgeGap is required",
        ],
    )


def test_generate_podcast_response_contract_is_public_url_json(read_source, expect_snippets):
    source = read_source("supabase/functions/generate-podcast/index.ts")

    expect_snippets(
        source,
        [
            "Gemini generation failed",
            "ElevenLabs TTS failed",
            "Failed to store audio",
            "Failed to generate public URL",
            "return jsonResponse({ podcast_url: podcastUrl }, 200)",
        ],
    )
