"""
covers: Static integration contract for Gumroad checkout/webhook and subscription table updates.
does_not_cover: Real checkout redirects, Gumroad API calls, Supabase admin calls, or payment settlement.
prerequisites: Gumroad and Supabase interactions must be mocked if converted to runtime tests.
"""


def test_checkout_requires_authenticated_user_before_returning_checkout_url(read_source):
    source = read_source("supabase/functions/gumroad-checkout/index.ts")

    auth_index = source.index('const authHeader = req.headers.get("Authorization")')
    get_user_index = source.index("await supabase.auth.getUser()")
    response_index = source.index("checkout_url: productUrl.toString()")

    assert auth_index < get_user_index < response_index


def test_webhook_updates_subscription_after_gumroad_verification(read_source):
    source = read_source("supabase/functions/gumroad-webhook/index.ts")

    verify_index = source.index("const isValidSale = await verifySaleWithGumroad")
    active_index = source.index("status: 'active'")
    cancel_index = source.index("status: 'canceled'")

    assert verify_index < active_index
    assert verify_index < cancel_index


def test_subscription_schema_supports_pending_active_and_canceled_states(read_source, expect_snippets):
    migration = read_source("supabase/migrations/20241208000000_create_subscriptions.sql")
    webhook = read_source("supabase/functions/gumroad-webhook/index.ts")

    expect_snippets(
        migration + webhook,
        [
            "status TEXT NOT NULL DEFAULT 'free'",
            "status: 'pending'",
            "status: 'active'",
            "status: 'canceled'",
            "plan_type: 'pro'",
        ],
    )
