"""
covers: Static auth-boundary contracts for Supabase Edge Functions and user-owned data paths.
does_not_cover: Live JWT validation, RLS enforcement against a database, or browser redirect behavior.
prerequisites: Source files are available; Supabase calls remain mocked/unexecuted.
"""

# ASSUMPTION: `verify_jwt = false` in `supabase/config.toml` is intentional, and functions that need user identity enforce auth manually in source.


AUTH_REQUIRED_FUNCTIONS = [
    "supabase/functions/analyze-text/index.ts",
    "supabase/functions/content-chat/index.ts",
    "supabase/functions/delete-account/index.ts",
    "supabase/functions/gumroad-checkout/index.ts",
    "supabase/functions/scan-knowledge-map/index.ts",
]


def test_config_disables_platform_jwt_verification_for_all_functions(read_source, expect_snippets):
    source = read_source("supabase/config.toml")

    expect_snippets(
        source,
        [
            "[functions.analyze-text]",
            "[functions.delete-account]",
            "[functions.content-chat]",
            "[functions.gumroad-webhook]",
            "[functions.generate-podcast]",
            "[functions.scan-knowledge-map]",
            "[functions.gumroad-checkout]",
            "verify_jwt = false",
        ],
    )


def test_user_identity_functions_check_authorization_and_get_user(read_source):
    for relative_path in AUTH_REQUIRED_FUNCTIONS:
        source = read_source(relative_path)
        assert "Authorization" in source, f"{relative_path} should read Authorization header"
        assert ".auth.getUser()" in source, f"{relative_path} should verify current Supabase user"


def test_user_content_queries_are_scoped_to_current_user(read_source, expect_snippets):
    source = read_source("src/hooks/useContent.ts")

    expect_snippets(
        source,
        [
            ".eq('user_id', userId)",
            ".eq('id', contentId)",
            ".eq('user_id', user.id)",
            "navigate('/auth')",
        ],
    )


def test_public_functions_are_explicitly_identified_for_followup_review(read_source):
    generate_podcast = read_source("supabase/functions/generate-podcast/index.ts")
    webhook = read_source("supabase/functions/gumroad-webhook/index.ts")

    assert ".auth.getUser()" not in generate_podcast
    assert ".auth.getUser()" not in webhook
    assert "verifySaleWithGumroad" in webhook
