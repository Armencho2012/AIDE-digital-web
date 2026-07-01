"""
covers: API contract for the `gumroad-checkout` Supabase Edge Function.
does_not_cover: Real Gumroad product lookup, browser window behavior, or payment completion.
prerequisites: Gumroad and Supabase auth calls must be mocked for runtime tests.
"""


def test_gumroad_checkout_requires_post_auth_and_supabase_env(read_source, expect_snippets):
    source = read_source("supabase/functions/gumroad-checkout/index.ts")

    expect_snippets(
        source,
        [
            'if (req.method !== "POST")',
            'const authHeader = req.headers.get("Authorization")',
            "Deno.env.get(\"SUPABASE_URL\")",
            "Deno.env.get(\"SUPABASE_ANON_KEY\")",
            "await supabase.auth.getUser()",
        ],
    )


def test_gumroad_checkout_plan_schema_and_url_resolution(read_source, expect_snippets):
    source = read_source("supabase/functions/gumroad-checkout/index.ts")

    expect_snippets(
        source,
        [
            'const plan = body?.plan === "class" ? "class" : "pro";',
            "GUMROAD_CLASS_ID",
            "GUMROAD_PRODUCT_ID",
            "GUMROAD_CLASS_FULL_URL",
            "GUMROAD_PRO_FULL_URL",
            "https://api.gumroad.com/v2/products",
        ],
    )


def test_gumroad_checkout_response_appends_email_and_safe_success_origin(read_source, expect_snippets):
    source = read_source("supabase/functions/gumroad-checkout/index.ts")

    expect_snippets(
        source,
        [
            'productUrl.searchParams.set("email", user.email);',
            'productUrl.searchParams.set("success_url", `${origin}/billing?status=success`);',
            "product_url: productUrl.toString()",
            "checkout_url: productUrl.toString()",
        ],
    )
