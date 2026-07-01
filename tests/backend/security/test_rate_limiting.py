"""
covers: Static rate/usage limiting contracts for analysis and Gumroad webhook paths.
does_not_cover: Load testing, distributed rate limiting, cold-start behavior, or quota enforcement by providers.
prerequisites: Source files are available; no tests make real requests.
"""

# ASSUMPTION: There is no centralized rate-limiting middleware; limits are implemented per feature in source.


def test_analyze_text_enforces_daily_usage_by_plan(read_source, expect_snippets):
    source = read_source("supabase/functions/analyze-text/index.ts")

    expect_snippets(
        source,
        [
            "const DAILY_LIMIT_FREE = 1;",
            "const DAILY_LIMIT_PRO = 50;",
            "if (userPlan !== 'class')",
            'await supabase.rpc("get_daily_usage_count", { p_user_id: user.id })',
            "status: 429",
        ],
    )


def test_usage_limit_hook_mirrors_free_pro_class_limits(read_source, expect_snippets):
    source = read_source("src/hooks/useUsageLimit.ts")

    expect_snippets(
        source,
        [
            "const DAILY_LIMIT_FREE = 1;",
            "const DAILY_LIMIT_PRO = 50;",
            "const DAILY_LIMIT_CLASS = Infinity;",
            "setIsLocked(remainingCount <= 0 && plan === 'free')",
        ],
    )


def test_gumroad_webhook_has_in_memory_rate_limit(read_source, expect_snippets):
    source = read_source("supabase/functions/gumroad-webhook/index.ts")

    expect_snippets(
        source,
        [
            "const requestCounts = new Map",
            "const RATE_LIMIT = 10;",
            "const RATE_WINDOW_MS = 60000;",
            "function isRateLimited",
            "return new Response(\"Too many requests\"",
        ],
    )
