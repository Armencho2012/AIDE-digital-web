import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listContentTool from "./tools/list-content";
import getContentTool from "./tools/get-content";
import searchContentTool from "./tools/search-content";
import deleteContentTool from "./tools/delete-content";
import getPlanInfoTool from "./tools/get-plan-info";

// The OAuth issuer must be the direct Supabase host, built from the project ref
// (a build-time literal). Never derive it from SUPABASE_URL at runtime.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "aide-mcp",
  title: "Aide Study MCP",
  version: "0.1.0",
  instructions:
    "Tools for Aide, an AI study companion. Use `list_content` and `search_content` to find the signed-in user's saved analyses and chats, `get_content` for the full analysis payload (summary, key terms, quiz, flashcards, knowledge map), `delete_content` to remove an item, and `get_plan_info` for their current plan and today's usage.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listContentTool,
    getContentTool,
    searchContentTool,
    deleteContentTool,
    getPlanInfoTool,
  ],
});
