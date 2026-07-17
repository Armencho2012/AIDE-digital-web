declare const process: { env: Record<string, string | undefined> };
import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "search_content",
  title: "Search study content",
  description: "Search the signed-in user's study content by title or original text (case-insensitive substring match).",
  inputSchema: {
    query: z.string().trim().min(1).describe("Search term matched against title and original_text."),
    limit: z.number().int().optional().describe("Max rows to return (default 20, max 100)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ query, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const cap = Math.min(Math.max(limit ?? 20, 1), 100);
    const escaped = query.replace(/[%_]/g, (m) => `\\${m}`);
    const pattern = `%${escaped}%`;
    const { data, error } = await supabaseForUser(ctx)
      .from("user_content")
      .select("id, title, content_type, language, created_at")
      .or(`title.ilike.${pattern},original_text.ilike.${pattern}`)
      .order("created_at", { ascending: false })
      .limit(cap);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { items: data ?? [] },
    };
  },
});
