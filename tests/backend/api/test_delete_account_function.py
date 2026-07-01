"""
covers: API contract for the `delete-account` Supabase Edge Function.
does_not_cover: Real user deletion, service-role permissions, or Supabase admin API execution.
prerequisites: `supabase/functions/delete-account/index.ts` exists; Supabase clients must be mocked in runtime tests.
"""

# ASSUMPTION: `SERVICE_ROLE_KEY` is intentionally used by this function even though other functions use `SUPABASE_SERVICE_ROLE_KEY`.


def test_delete_account_requires_authorization_header_and_env(read_source, expect_snippets):
    source = read_source("supabase/functions/delete-account/index.ts")

    expect_snippets(
        source,
        [
            "req.headers.get('Authorization') || req.headers.get('authorization')",
            "Deno.env.get('SUPABASE_URL')",
            "Deno.env.get('SERVICE_ROLE_KEY')",
            "Deno.env.get('SUPABASE_ANON_KEY')",
            "Service temporarily unavailable",
        ],
    )


def test_delete_account_verifies_current_user_before_admin_delete(read_source):
    source = read_source("supabase/functions/delete-account/index.ts")

    get_user_index = source.index("await supabaseClient.auth.getUser()")
    admin_client_index = source.index("const supabaseAdmin = createClient")
    delete_index = source.index("await supabaseAdmin.auth.admin.deleteUser(user.id)")

    assert get_user_index < admin_client_index < delete_index


def test_delete_account_success_and_failure_contract(read_source, expect_snippets):
    source = read_source("supabase/functions/delete-account/index.ts")

    expect_snippets(
        source,
        [
            "status: 401",
            "status: 503",
            "status: 500",
            "status: 200",
            "Account deleted successfully",
        ],
    )
