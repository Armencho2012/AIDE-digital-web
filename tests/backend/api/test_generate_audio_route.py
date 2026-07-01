"""
covers: API contract for `POST /api/generate-audio`.
does_not_cover: Real Gemini calls, real ElevenLabs calls, audio decoding, or deployed Vercel runtime behavior.
prerequisites: `app/api/generate-audio/route.ts` exists; fetch must be mocked in runtime tests.
"""

# ASSUMPTION: `app/api/generate-audio/route.ts` is deployed in a runtime that supports Next-style app API routes alongside the Vite frontend.


def test_generate_audio_route_declares_edge_post_handler(read_source, expect_snippets):
    source = read_source("app/api/generate-audio/route.ts")

    expect_snippets(
        source,
        [
            "export const runtime = 'edge'",
            "export async function POST(req: Request)",
            "const GEMINI_ENDPOINT",
            "const ELEVENLABS_ENDPOINT",
        ],
    )


def test_generate_audio_route_validates_env_topic_and_voice_before_provider_calls(read_source):
    source = read_source("app/api/generate-audio/route.ts")

    env_index = source.index("if (!geminiKey || !elevenKey)")
    topic_index = source.index("if (!topic)")
    voice_index = source.index("if (!voiceId)")
    provider_index = source.index("const geminiRes = await fetch")

    assert env_index < provider_index
    assert topic_index < provider_index
    assert voice_index < provider_index


def test_generate_audio_route_returns_audio_stream_from_tts(read_source, expect_snippets):
    source = read_source("app/api/generate-audio/route.ts")

    expect_snippets(
        source,
        [
            "accept: 'audio/mpeg'",
            "'xi-api-key': elevenKey",
            "const contentType = ttsRes.headers.get('content-type') || 'audio/mpeg'",
            "return new Response(ttsRes.body, { status: 200, headers: { 'Content-Type': contentType } })",
        ],
    )
