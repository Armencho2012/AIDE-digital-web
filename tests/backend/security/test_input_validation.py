"""
covers: Static input-validation contracts across backend routes and Edge Functions.
does_not_cover: Runtime fuzzing, browser form validation, SQL injection execution, or provider-side validation.
prerequisites: Source files are available; external calls remain mocked/unexecuted.
"""


def test_auth_page_has_zod_signin_and_signup_validation(read_source, expect_snippets):
    source = read_source("src/pages/Auth.tsx")

    expect_snippets(
        source,
        [
            "const signUpSchema = z.object",
            ".email(\"Invalid email format\")",
            ".min(8, \"Password must be at least 8 characters\")",
            ".regex(/^[a-zA-Z\\s'-]+$/",
            "const signInSchema = z.object",
        ],
    )


def test_analysis_inputs_are_required_and_media_is_limited_client_side(read_source, expect_snippets):
    edge = read_source("supabase/functions/analyze-text/index.ts")
    client = read_source("src/lib/analyzeText.ts")

    expect_snippets(
        edge + client,
        [
            'return new Response(JSON.stringify({ error: "No content provided" })',
            "const MAX_TEXT_CHARS = 15000;",
            "const MAX_MEDIA_BYTES = 4 * 1024 * 1024;",
            "throw new Error('Attached file is too large for analysis right now.",
        ],
    )


def test_webhook_rejects_invalid_form_fields_before_processing(read_source, expect_snippets):
    source = read_source("supabase/functions/gumroad-webhook/index.ts")

    expect_snippets(
        source,
        [
            "if (!isValidSaleId(saleId))",
            "if (!isValidProductId(productId))",
            "if ((fullName && !isValidTextField(fullName)) || (productName && !isValidTextField(productName)))",
            "return new Response(\"Invalid request\"",
        ],
    )


def test_chat_and_map_endpoints_require_minimum_payloads(read_source, expect_snippets):
    chat = read_source("supabase/functions/content-chat/index.ts")
    scan = read_source("supabase/functions/scan-knowledge-map/index.ts")

    expect_snippets(
        chat + scan,
        [
            'return new Response(JSON.stringify({ error: "Question and content required" })',
            'return new Response(JSON.stringify({ error: "Missing text or knowledge_map" })',
        ],
    )
