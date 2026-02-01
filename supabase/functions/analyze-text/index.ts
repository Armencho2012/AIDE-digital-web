import { corsHeaders } from "./_shared-index.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const DAILY_LIMIT_FREE = 1;
const DAILY_LIMIT_PRO = 50;

// Reduced counts for speed
const QUIZ_QUESTIONS_COUNT = 5;
const FLASHCARDS_COUNT = 10;
const KNOWLEDGE_MAP_NODES_COUNT = 6;
const MAX_FLASHCARDS_FREE = 20;

interface AnalysisResult {
  metadata?: { language?: string; subject_domain?: string; complexity_level?: string };
  three_bullet_summary?: string[];
  key_terms?: Array<{ term: string; definition: string; importance: string }>;
  lesson_sections?: Array<{ title: string; summary: string; key_takeaway: string }>;
  quiz_questions?: Array<{ question: string; options: string[]; correct_answer_index: number; explanation: string; difficulty: string }>;
  flashcards?: Array<{ front: string; back: string }>;
  knowledge_map?: { nodes: Array<{ id: string; label: string; category: string; description: string }>; edges: Array<{ source: string; target: string; label: string; strength: number }> };
  study_plan?: unknown;
  error?: string;
}

function parseJSON(text: string): any {
  if (!text) return null;
  let t = text.replace(/^\uFEFF/, "").trim();
  const match = t.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (match) t = match[1];
  const first = t.indexOf("{"), last = t.lastIndexOf("}");
  if (first !== -1 && last > first) t = t.slice(first, last + 1);
  t = t.replace(/,\s*]/g, "]").replace(/,\s*}/g, "}");
  try { return JSON.parse(t); } catch { return null; }
}

/**
 * Updated for 2026: Gemini 3 series provides superior reasoning for 
 * educational content. 2.0 series is deprecated as of March 2026.
 */
const GEMINI_MODEL_CANDIDATES = [
  "gemini-3-flash-preview", 
  "gemini-3-pro-preview",   
  "gemini-2.5-flash",       
  "gemini-2.5-flash-lite",  
];

async function callGeminiAI(apiKey: string, systemPrompt: string, userContent: string) {
  let lastErrorText = "";

  for (const model of GEMINI_MODEL_CANDIDATES) {
    // FIX: New controller per model so a timeout on one doesn't kill the next
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 40000); 

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{
              role: "user",
              parts: [{ text: `${systemPrompt}\n\n${userContent}` }],
            }],
            generationConfig: { temperature: 0.7 },
          }),
        },
      );

      clearTimeout(timeout);

      if (!res.ok) {
        lastErrorText = await res.text().catch(() => "");
        console.warn(`Model ${model} failed (${res.status}). Trying next...`);
        continue;
      }

      const json = await res.json();
      const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || null;
      
      if (text) {
        console.log(`Gemini success with model=${model}`);
        return text;
      }
    } catch (err: any) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        console.error(`Model ${model} timed out after 40s.`);
      } else {
        console.error(`Fetch error for ${model}:`, err.message);
      }
      continue;
    }
  }

  console.error("All model candidates failed.");
  return null;
}

async function getUserPlan(supabaseAdmin: any, userId: string): Promise<string> {
  try {
    const { data } = await supabaseAdmin.from('subscriptions').select('status, plan_type, expires_at').eq('user_id', userId).single();
    if (!data) return 'free';
    const isActive = data.status === 'active' && ['pro', 'class'].includes(data.plan_type) && (!data.expires_at || new Date(data.expires_at) > new Date());
    return isActive ? data.plan_type : 'free';
  } catch (err) {
    console.error("Error fetching plan:", err);
    return 'free';
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Authorization required");

    const env = Deno.env.toObject();
    const { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY } = env;
    
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY || !GEMINI_API_KEY) {
      throw new Error("Missing environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } });
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const [userResult, bodyData] = await Promise.all([
      supabase.auth.getUser(),
      req.json().catch(() => ({}))
    ]);
    
    const { data: { user }, error: authError } = userResult;
    if (authError || !user) throw new Error("Invalid or expired token.");

    const { text, media } = bodyData;
    if (!text?.trim() && !media) throw new Error("No content provided");

    const userPlan = await getUserPlan(supabaseAdmin, user.id);
    const isProOrClass = userPlan === 'pro' || userPlan === 'class';

    // Usage check via RPC
    const { data: usageCount } = await supabase.rpc("get_daily_usage_count", { p_user_id: user.id });
    const dailyLimit = userPlan === 'pro' ? DAILY_LIMIT_PRO : DAILY_LIMIT_FREE;
    if (userPlan !== 'class' && (usageCount || 0) >= dailyLimit) {
      return new Response(JSON.stringify({ error: "Daily limit reached." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const contentText = text || "Analyze the content.";
    const mediaContext = media ? "\n[Attached Media Content]" : "";
    const quizCount = isProOrClass ? 15 : QUIZ_QUESTIONS_COUNT;

    // Execute multiple AI calls in parallel for speed
    const [summaryResult, quizResult, mapResult] = await Promise.all([
      callGeminiAI(GEMINI_API_KEY, "You are an education AI. Respond ONLY with valid JSON. Use the language of the input.", 
        `Analyze and return JSON: {"metadata":{"language":"code","subject_domain":"topic","complexity_level":"beginner|intermediate|advanced"},"three_bullet_summary":["s1","s2","s3"],"key_terms":[{"term":"name","definition":"def","importance":"high"}],"lesson_sections":[{"title":"T","summary":"S","key_takeaway":"K"}]} \n\n Content: ${contentText.substring(0, 10000)}${mediaContext}`),

      callGeminiAI(GEMINI_API_KEY, "You are an education AI. Respond ONLY with valid JSON.",
        `Create ${quizCount} questions and ${FLASHCARDS_COUNT} cards. JSON: {"quiz_questions":[{"question":"Q","options":["A","B","C","D"],"correct_answer_index":0,"explanation":"E","difficulty":"medium"}],"flashcards":[{"front":"F","back":"B"}]} \n\n Content: ${contentText.substring(0, 10000)}${mediaContext}`),

      callGeminiAI(GEMINI_API_KEY, "You are an education AI. Respond ONLY with valid JSON.",
        `Create a knowledge map. JSON: {"knowledge_map":{"nodes":[{"id":"n1","label":"L","category":"C","description":"D"}],"edges":[{"source":"n1","target":"n2","label":"R","strength":5}]}} \n\n Content: ${contentText.substring(0, 10000)}${mediaContext}`),
    ]);

    const summary = parseJSON(summaryResult) || {};
    const quiz = parseJSON(quizResult) || {};
    const map = parseJSON(mapResult) || {};

    const analysis: AnalysisResult = {
      metadata: summary.metadata || { language: "en", subject_domain: "General", complexity_level: "intermediate" },
      three_bullet_summary: summary.three_bullet_summary || [],
      key_terms: summary.key_terms || [],
      lesson_sections: summary.lesson_sections || [],
      quiz_questions: quiz.quiz_questions || [],
      flashcards: (quiz.flashcards || []).slice(0, MAX_FLASHCARDS_FREE),
      knowledge_map: map.knowledge_map || { nodes: [], edges: [] },
    };

    // Background logging
    supabaseAdmin.from("usage_logs").insert({ user_id: user.id, action_type: "text_analysis" }).then(({ error }) => {
      if (error) console.error("Logging error:", error);
    });

    return new Response(JSON.stringify(analysis), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Critical Function Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});