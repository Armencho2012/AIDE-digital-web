import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "./_shared-index.ts";

// Config Constants
const DAILY_LIMIT_FREE = 1;
const DAILY_LIMIT_PRO = 50;
const FLASHCARDS_COUNT = 10;
const KNOWLEDGE_MAP_NODES_COUNT = 6;
const MAX_FLASHCARDS_FREE = 20;

Deno.serve(async (req: Request) => {
  // 1. Handle CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 2. Auth & Environment Validation
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
    const apiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!supabaseUrl || !apiKey || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Missing environment variables" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 3. Parse Request & Check Limits
    const body = await req.json().catch(() => ({}));
    const { text, media, language = 'en' } = body;
    if (!text?.trim() && !media) {
      return new Response(JSON.stringify({ error: "No content provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('plan_type, status')
      .eq('user_id', user.id)
      .single();

    const userPlan = subscription?.status === 'active' ? (subscription.plan_type || 'free') : 'free';
    const isProOrClass = ['pro', 'class'].includes(userPlan);

    // Daily usage check via RPC
    if (userPlan !== 'class') {
      const { data: usageCount } = await supabase.rpc("get_daily_usage_count", { p_user_id: user.id });
      const dailyLimit = userPlan === 'pro' ? DAILY_LIMIT_PRO : DAILY_LIMIT_FREE;
      if ((usageCount || 0) >= dailyLimit) {
        return new Response(JSON.stringify({ error: "Daily limit reached. Upgrade for more." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    // 4. AI Integration using Lovable AI Gateway (consistent with content-chat)
    const quizCount = isProOrClass ? 15 : 5;
    const contentContext = text.substring(0, 15000);
    const mediaContext = media ? "\n[Analyzing attached visual media]" : "";

    const systemPrompt = `You are a world-class education engine. Respond in ${language}.
Return a SINGLE JSON object exactly like this:
{
  "metadata": {"language": "${language}", "subject_domain": "string", "complexity_level": "beginner|intermediate|advanced"},
  "three_bullet_summary": ["string", "string", "string"],
  "key_terms": [{"term": "string", "definition": "string", "importance": "high|medium|low"}],
  "lesson_sections": [{"title": "string", "summary": "string", "key_takeaway": "string"}],
  "quiz_questions": [{"question": "string", "options": ["A", "B", "C", "D"], "correct_answer_index": 0, "explanation": "string", "difficulty": "easy|medium|hard"}],
  "flashcards": [{"front": "string", "back": "string"}],
  "knowledge_map": {
    "nodes": [{"id": "n1", "label": "string", "category": "string", "description": "string"}],
    "edges": [{"source": "n1", "target": "n2", "label": "string", "strength": 5}]
  }
}

Stats: Create ${quizCount} quiz questions, ${FLASHCARDS_COUNT} flashcards, and ${KNOWLEDGE_MAP_NODES_COUNT} map nodes.
Math: Use LaTeX notation like $x^2$.
If the content is in a language other than ${language}, still respond in ${language}.`;

    console.log(`Analyzing for user: ${user.id} (Plan: ${userPlan})`);

    // Use Lovable AI Gateway with JSON response mode
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Content: ${contentContext}${mediaContext}` }
        ],
        response_format: { type: "json_object" },
        max_tokens: 8192
      })
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status, await response.text());
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      throw new Error("AI gateway error");
    }

    const responseData = await response.json();
    let analysis = JSON.parse(responseData.choices?.[0]?.message?.content || "{}");

    // Validate and ensure all required fields exist
    if (!analysis.metadata) {
      analysis.metadata = { language, subject_domain: "general", complexity_level: "intermediate" };
    }
    if (!analysis.three_bullet_summary) {
      analysis.three_bullet_summary = ["Summary not available", "Unable to analyze content", "Please try again"];
    }
    if (!analysis.key_terms) analysis.key_terms = [];
    if (!analysis.lesson_sections) analysis.lesson_sections = [];
    if (!analysis.quiz_questions) analysis.quiz_questions = [];
    if (!analysis.flashcards) analysis.flashcards = [];
    if (!analysis.knowledge_map) {
      analysis.knowledge_map = { nodes: [], edges: [] };
    }

    // Slice flashcards for free users if necessary
    if (!isProOrClass && analysis.flashcards) {
      analysis.flashcards = analysis.flashcards.slice(0, MAX_FLASHCARDS_FREE);
    }

    // 5. Async Logging & Final Response
    supabaseAdmin.from("usage_logs").insert({ user_id: user.id, action_type: "analysis" }).then();

    return new Response(JSON.stringify(analysis), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    const error = err as Error;
    console.error("Critical Function Error:", error.message);
    return new Response(JSON.stringify({ error: error.message || "An unexpected error occurred" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});

