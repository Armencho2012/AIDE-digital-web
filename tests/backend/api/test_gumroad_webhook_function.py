"""
covers: API contract for the public `gumroad-webhook` Supabase Edge Function.
does_not_cover: Real Gumroad callbacks, remote sale verification, Supabase admin execution, or retry delivery semantics.
prerequisites: Gumroad fetch and Supabase admin methods must be mocked for runtime tests.
"""


def test_gumroad_webhook_accepts_post_form_data_only(read_source, expect_snippets):
    source = read_source("supabase/functions/gumroad-webhook/index.ts")

    expect_snippets(
        source,
        [
            'if (req.method !== "POST")',
            "const formData = await req.formData();",
            "const webhookData: Record<string, string> = {};",
            "Method not allowed",
        ],
    )


def test_gumroad_webhook_validates_env_and_sale_before_mutation(read_source):
    source = read_source("supabase/functions/gumroad-webhook/index.ts")

    env_index = source.index('const supabaseUrl = Deno.env.get("SUPABASE_URL")')
    verify_index = source.index("const isValidSale = await verifySaleWithGumroad")
    mutation_index = source.index(".from('subscriptions')")

    assert env_index < verify_index < mutation_index


def test_gumroad_webhook_handles_purchase_pending_and_cancel_paths(read_source, expect_snippets):
    source = read_source("supabase/functions/gumroad-webhook/index.ts")

    expect_snippets(
        source,
        [
            "event === 'sale' || event === 'subscription_payment_succeeded'",
            "User not found, recording for later",
            "status: 'pending'",
            "status: 'active'",
            "event === 'refund' || event === 'subscription_cancelled'",
            "status: 'canceled'",
        ],
    )
