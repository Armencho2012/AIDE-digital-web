"""
covers: Static integration contract for Gemini script generation, ElevenLabs audio, and Supabase Storage upload.
does_not_cover: Real audio generation, Storage bucket existence, public URL validity, or playback.
prerequisites: Provider and storage clients must be mocked for any runtime execution.
"""

# ASSUMPTION: The `podcasts` Supabase Storage bucket is provisioned outside the checked-in migrations.


def test_generate_podcast_calls_gemini_before_elevenlabs_before_storage(read_source):
    source = read_source("supabase/functions/generate-podcast/index.ts")

    gemini_index = source.index("const geminiRes = await fetch")
    eleven_index = source.index("const ttsRes = await fetch")
    storage_index = source.index(".from('podcasts')")

    assert gemini_index < eleven_index < storage_index


def test_generate_podcast_returns_public_podcast_url(read_source, expect_snippets):
    source = read_source("supabase/functions/generate-podcast/index.ts")

    expect_snippets(
        source,
        [
            ".upload(filename, new Uint8Array(audioBuffer)",
            ".getPublicUrl(filename)",
            "return jsonResponse({ podcast_url: podcastUrl }, 200)",
        ],
    )


def test_content_detail_updates_user_content_after_podcast_generation(read_source, expect_snippets):
    source = read_source("src/pages/ContentDetail.tsx")

    expect_snippets(
        source,
        [
            "supabase.functions.invoke('generate-podcast'",
            "podcast_url: data.podcast_url",
            "podcast: true",
            ".eq('id', content.id)",
        ],
    )
