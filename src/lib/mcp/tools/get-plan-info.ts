declare const process: { env: Record<string, string | undefined> };
import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "get_plan_info",
  title: "Get plan and daily usage",
  description: "Return the signed-in user's current Aide plan (free/pro/class) and today's analysis usage count.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const client = supabaseForUser(ctx);
    const userId = ctx.getUserId();
    const [{ data: planData }, { data: usageData }] = await Promise.all([
      client.rpc("get_user_plan", { p_user_id: userId }),
      client.rpc("get_daily_usage_count", { p_user_id: userId }),
    ]);
    const info = {
      user_id: userId,
      email: ctx.getUserEmail(),
      plan: planData ?? "free",
      daily_usage_count: usageData ?? 0,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(info) }],
      structuredContent: info,
    };
  },
});
