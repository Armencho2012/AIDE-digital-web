import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "./_shared-index.ts";

const GEMINI_API_VERSIONS = Array.from(new Set([
  ...(Deno.env.get("GEMINI_API_VERSIONS") || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
  Deno.env.get("GEMINI_API_VERSION")?.trim(),
  "v1beta",
  "v1",
].filter((value): value is string => Boolean(value && value.trim()))));
const GEMINI_MODEL_CANDIDATES = Array.from(new Set([
  Deno.env.get("GEMINI_TEXT_MODEL"),
  "gemini-flash-latest",
  "gemini-3-flash-preview",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
].filter((model): model is string => Boolean(model && model.trim()))));

const isModelAvailabilityError = (status: number, details: string): boolean => {
  if (status === 404) return true;
  return status === 400 && /not found|not supported|unknown model|unsupported model|api version/i.test(details);
};

const extractGeminiText = (payload: any): string => {
  const parts = payload?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return "";
  return parts
    .map((part: any) => (typeof part?.text === "string" ? part.text : ""))
    .join("");
};

const parseGeminiJson = (rawText: string): any => {
  const trimmed = rawText.trim();
  if (!trimmed) return {};
  const cleaned = trimmed
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      try {
        return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
      } catch {
        return {};
      }
    }
    return {};
  }
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authorization required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const apiKey = Deno.env.get("GEMINI_API_KEY") || Deno.env.get("LOVABLE_API_KEY");

    if (!supabaseUrl || !apiKey || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Missing environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY/LOVABLE_API_KEY)" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const body = await req.json().catch(() => ({}));
    const { text, knowledge_map, language = "en" } = body;
    if (!text?.trim() || !knowledge_map) {
      return new Response(JSON.stringify({ error: "Missing text or knowledge_map" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const systemPrompt = `You are an expert study assistant.
Compare the knowledge map to the original text and identify 3 missing key concepts.
Return a SINGLE JSON object exactly like this:
{
  "ghost_nodes": [
    {"id": "g1", "label": "string", "category": "Concept|Problem|Technology|Science|History|Math|Language|Philosophy|Art|General", "description": "string", "source_snippet": "string", "is_high_yield": false, "is_ghost": true}
  ],
  "ghost_edges": [
    {"source": "g1", "target": "n2", "label": "string", "type": "enables|challenges|relates_to|is_a_type_of|essential_for", "direction": "uni|bi", "strength": 3}
  ]
}

Rules:
- Use content from the original text to justify each ghost node via source_snippet.
- Keep ghost_nodes to 3 items.
- Use types and directions that match the relationship.`;

    let response: Response | null = null;
    let selectedModel: string | null = null;
    let selectedApiVersion: string | null = null;
    const modelErrors: string[] = [];

    modelLoop: for (const model of GEMINI_MODEL_CANDIDATES) {
      for (const apiVersion of GEMINI_API_VERSIONS) {
        const endpoint = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${apiKey}`;
        let candidateResponse = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemPrompt }]
            },
            contents: [{
              role: "user",
              parts: [{ text: `Original Text:\n${text}\n\nKnowledge Map:\n${JSON.stringify(knowledge_map)}` }]
            }],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 2048,
              responseMimeType: "application/json"
            }
          })
        });

        if (!candidateResponse.ok && candidateResponse.status === 400) {
          candidateResponse = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: systemPrompt }]
              },
              contents: [{
                role: "user",
                parts: [{ text: `Original Text:\n${text}\n\nKnowledge Map:\n${JSON.stringify(knowledge_map)}` }]
              }],
              generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 2048
              }
            })
          });
        }

        if (candidateResponse.ok) {
          response = candidateResponse;
          selectedModel = model;
          selectedApiVersion = apiVersion;
          break modelLoop;
        }

        const details = await candidateResponse.text();
        if (isModelAvailabilityError(candidateResponse.status, details)) {
          modelErrors.push(`[${model} @ ${apiVersion}] ${details}`);
          continue;
        }

        response = new Response(details, {
          status: candidateResponse.status,
          headers: { "Content-Type": "application/json" }
        });
        selectedModel = model;
        selectedApiVersion = apiVersion;
        break modelLoop;
      }
    }

    if (!response) {
      return new Response(JSON.stringify({
        error: "Gemini model not found",
        details: modelErrors.join("\n")
      }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (!response.ok) {
      const providerError = await response.text();
      console.error(`Gemini API error (${selectedModel} @ ${selectedApiVersion}):`, response.status, providerError);
      return new Response(JSON.stringify({ error: "Gemini API error", model: selectedModel, apiVersion: selectedApiVersion, details: providerError }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const responseData = await response.json();
    const parsed = parseGeminiJson(extractGeminiText(responseData));

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (err) {
    const error = err as Error;
    console.error("scan-knowledge-map error:", error.message);
    return new Response(JSON.stringify({ error: error.message || "An unexpected error occurred" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
