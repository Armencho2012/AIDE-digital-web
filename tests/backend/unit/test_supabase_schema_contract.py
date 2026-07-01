"""
covers: Supabase generated table/RPC contract and migration-level RLS/index expectations.
does_not_cover: Live database migrations, SQL execution, policy enforcement, or Supabase API calls.
prerequisites: Repository source files are present; external services are not contacted.
"""


def test_generated_database_types_include_core_tables(read_source, expect_snippets):
    source = read_source("src/integrations/supabase/types.ts")

    expect_snippets(
        source,
        [
            "profiles:",
            "subscriptions:",
            "usage_logs:",
            "user_content:",
            "generation_status: Json | null",
            "podcast_url: string | null",
            "course_data: Json | null",
        ],
    )


def test_generated_database_types_include_plan_and_usage_rpcs(read_source, expect_snippets):
    source = read_source("src/integrations/supabase/types.ts")

    expect_snippets(
        source,
        [
            "get_daily_usage_count: { Args: { p_user_id: string }; Returns: number }",
            "get_user_plan: { Args: { p_user_id: string }; Returns: string }",
            "is_pro_user: { Args: { p_user_id: string }; Returns: boolean }",
        ],
    )


def test_migrations_define_rls_for_user_owned_tables(read_source, expect_snippets):
    profiles = read_source("supabase/migrations/20251107131324_da345373-cff1-4a90-9f28-9d6de282746f.sql")
    subscriptions = read_source("supabase/migrations/20241208000000_create_subscriptions.sql")
    content = read_source("supabase/migrations/20251108000008_create_user_content.sql")
    optimized = read_source("supabase/migrations/20260125175301_ff44cea9-168b-4689-8f2b-cefc13fe8fc2.sql")

    expect_snippets(
        profiles + subscriptions + content + optimized,
        [
            "ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY",
            "ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY",
            "ALTER TABLE public.user_content ENABLE ROW LEVEL SECURITY",
            "ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY",
            "CREATE INDEX IF NOT EXISTS idx_user_content_user_id",
        ],
    )


def test_usage_count_rpc_enforces_calling_user(read_source, expect_snippets):
    source = read_source("supabase/migrations/20260110130635_d4d800e4-5fed-4c33-9401-622c15fad56d.sql")

    expect_snippets(
        source,
        [
            "IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN",
            "RAISE EXCEPTION 'Unauthorized: Cannot access other users data';",
            "AND created_at >= CURRENT_DATE",
        ],
    )
