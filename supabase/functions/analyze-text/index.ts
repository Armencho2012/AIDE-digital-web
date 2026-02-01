import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.24.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Config Constants
const DAILY_LIMIT_FREE = 1;
const DAILY_LIMIT_PRO = 50;
const FLASHCARDS_COUNT = 10;
const KNOWLEDGE_MAP_NODES_COUNT = 6;
const MAX_FLASHCARDS_FREE = 20;

Deno.serve(async (req: Request) => {
  // 1. Handle CORS Preflight
  if (req.method === "OPTIONS") return new Response('ok', { headers: corsHeaders });

  try {
    // 2. Auth & Environment Validation
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Authorization required");

    const env = Deno.env.toObject();
    const { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY } = env;

    if (!SUPABASE_URL || !GEMINI_API_KEY) throw new Error("Missing environment variables");

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Invalid or expired token");

    // 3. Parse Request & Check Limits
    const { text, media, language = 'en' } = await req.json().catch(() => ({}));
    if (!text?.trim() && !media) throw new Error("No content provided");

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

    // 4. Gemini AI Integration (The "Brains")
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    // Using gemini-3-flash-preview for the highest reasoning/speed ratio in 2026
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3-flash-preview",
      // Forces the model to output valid JSON based on our prompt structure
      generationConfig: { 
        responseMimeType: "application/json",
        // @ts-ignore: 2026 reasoning parameter
        thinkingLevel: "medium" 
      }
    });

    const quizCount = isProOrClass ? 15 : 5;
    const contentContext = text.substring(0, 15000); // 2026 models handle larger context
    const mediaContext = media ? "\n[Analyzing attached visual media]" : "";

    const systemPrompt = `You are a world-class education engine. Respond in ${language}.
    Return a SINGLE JSON object exactly like this:
    {
      "metadata": {"language": "code", "subject_domain": "string", "complexity_level": "beginner|intermediate|advanced"},
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
    Math: Use LaTeX notation like $x^2$.`;

    console.log(`Analyzing for user: ${user.id} (Plan: ${userPlan})`);

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: `Content: ${contentContext}${mediaContext}` }
    ]);

    // No need for regex parsing anymore!
    const analysis = JSON.parse(result.response.text());

    // Slice flashcards for free users if necessary
    if (!isProOrClass && analysis.flashcards) {
      analysis.flashcards = analysis.flashcards.slice(0, MAX_FLASHCARDS_FREE);
    }

    // 5. Async Logging & Final Response
    supabaseAdmin.from("usage_logs").insert({ user_id: user.id, action_type: "text_analysis" }).then();

    return new Response(JSON.stringify(analysis), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("Critical Function Error:", err.message);
    return new Response(JSON.stringify({ error: err.message || "An unexpected error occurred" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});