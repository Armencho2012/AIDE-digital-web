"""
covers: Source-level validation and sanitization contracts for the Gumroad webhook.
does_not_cover: Real Gumroad verification, Supabase admin calls, or webhook delivery.
prerequisites: `supabase/functions/gumroad-webhook/index.ts` exists and network calls remain mocked/unexecuted.
"""


def test_webhook_whitelists_and_sanitizes_form_fields(read_source, expect_snippets):
    source = read_source("supabase/functions/gumroad-webhook/index.ts")

    expect_snippets(
        source,
        [
            "const ALLOWED_FIELDS",
            "sanitizeString(value.toString())",
            "input.trim().slice(0, 500)",
        ],
    )


def test_webhook_validates_email_sale_product_and_text_fields(read_source, expect_snippets):
    source = read_source("supabase/functions/gumroad-webhook/index.ts")

    expect_snippets(
        source,
        [
            "function isValidEmail",
            "function isValidSaleId",
            "function isValidProductId",
            "function isValidTextField",
            "email.length <= 254",
            "const saleIdRegex = /^[a-zA-Z0-9_-]{6,60}$/",
            "const productIdRegex = /^[a-zA-Z0-9_-]{1,50}$/",
        ],
    )


def test_webhook_requires_remote_sale_verification_before_subscription_update(read_source):
    source = read_source("supabase/functions/gumroad-webhook/index.ts")

    verification_index = source.index("const isValidSale = await verifySaleWithGumroad")
    upsert_index = source.index(".from('subscriptions')")

    assert verification_index < upsert_index
    assert "return data.success === true && data.sale != null;" in source
