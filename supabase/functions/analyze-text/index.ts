import { corsHeaders } from "./_shared-index.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const DAILY_LIMIT_FREE = 1;
const DAILY_LIMIT_PRO = 50;

// Reduced counts for speed
const QUIZ_QUESTIONS_COUNT = 5;
const FLASHCARDS_COUNT = 10;
const KNOWLEDGE_MAP_NODES_COUNT = 6;

const MAX_FLASHCARDS_FREE = 20;
const MAX_TEXT_LENGTH = 50000; // Prevent token limit issues
const MIN_TEXT_LENGTH = 10; // Minimum for meaningful analysis
const API_TIMEOUT_MS = 40000; // 40 second timeout for API calls

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

// Enhanced JSON parser with fallback
function parseJSON(text: string): any {
  if (!text || typeof text !== 'string') return null;
  
  let t = text.replace(/^\uFEFF/, "").trim();
  
  // Try to extract JSON from markdown code blocks
  const match = t.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (match) t = match[1].trim();
  
  // Find JSON object boundaries
  const first = t.indexOf("{");
  const last = t.lastIndexOf("}");
  
  if (first === -1 || last <= first) return null;
  
  t = t.slice(first, last + 1);
  
  // Fix common JSON errors
  t = t.replace(/,\s*]/g, "]").replace(/,\s*}/g, "}");
  
  try { 
    return JSON.parse(t); 
  } catch (e) {
    console.error("JSON parse error:", e, "Text:", t.substring(0, 200));
    return null;
  }
}

// Lovable AI Gateway call with enhanced error handling and timeout
async function callLovableAI(apiKey: string, systemPrompt: string, userContent: string, callName: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  
  try {
    console.log(`Starting ${callName} API call...`);
    
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent }
        ],
        response_format: { type: "json_object" }
      }),
    });
    
    clearTimeout(timeoutId);
    
    // Handle error responses
    if (!res.ok) {
      const errorText = await res.text();
      const errorJson = (() => {
        try { return JSON.parse(errorText); } catch { return { message: errorText }; }
      })();
      
      const errorMessage = errorJson?.error?.message || errorJson?.message || `API Error ${res.status}`;
      console.error(`${callName} API error (${res.status}):`, errorMessage);
      
      // Check for rate limiting or quota issues
      if (res.status === 429) {
        throw new Error(`${callName}: Rate limit exceeded. Please try again in a few minutes.`);
      }
      if (res.status === 503) {
        throw new Error(`${callName}: Service temporarily unavailable.`);
      }
      if (res.status >= 500) {
        throw new Error(`${callName}: Service error. Please try again.`);
      }
      
      throw new Error(errorMessage);
    }
    
    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error(`${callName}: No content in response`);
    }
    
    console.log(`${callName} completed successfully`);
    return content;
    
  } catch (err) {
    clearTimeout(timeoutId);
    
    if (err instanceof Error && err.name === 'AbortError') {
      console.error(`${callName} timeout (${API_TIMEOUT_MS}ms)`);
      throw new Error(`${callName}: Request timed out. Analysis took too long.`);
    }
    
    console.error(`${callName} failed:`, err);
    throw err;
  }
}

// Get user's subscription plan
async function getUserPlan(supabaseAdmin: any, userId: string): Promise<string> {
  try {
    const { data } = await supabaseAdmin
      .from('subscriptions')
      .select('status, plan_type, expires_at')
      .eq('user_id', userId)
      .single();
    
    if (!data) return 'free';
    
    const isActive = data.status === 'active' && 
      ['pro', 'class'].includes(data.plan_type) && 
      (!data.expires_at || new Date(data.expires_at) > new Date());
    
    return isActive ? data.plan_type : 'free';
  } catch (err) {
    console.error("Error fetching user plan:", err);
    return 'free';
  }
}

// Validate input text
function validateInput(text: string, media: any): { valid: boolean; error?: string } {
  // Check that at least one input is provided
  if (!text?.trim() && !media) {
    return { valid: false, error: "No content provided. Please enter text or attach a file." };
  }
  
  // If text is provided, validate length
  if (text && text.trim()) {
    if (text.trim().length < MIN_TEXT_LENGTH) {
      return { valid: false, error: `Text too short. Minimum ${MIN_TEXT_LENGTH} characters required.` };
    }
    
    if (text.length > MAX_TEXT_LENGTH) {
      return { valid: false, error: `Text too long. Maximum ${MAX_TEXT_LENGTH} characters allowed.` };
    }
  }
  
  // Validate media if present
  if (media) {
    if (typeof media.data !== 'string' && !(media.data instanceof Uint8Array)) {
      return { valid: false, error: "Invalid media data format." };
    }
    
    if (!media.mimeType || !media.mimeType.startsWith('image/') && !media.mimeType.startsWith('application/pdf')) {
      return { valid: false, error: "Only images and PDFs are supported." };
    }
  }
  
  return { valid: true };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const startTime = Date.now();

  try {
    // Verify authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Authorization required");

    // Initialize Supabase clients
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    
    if (!supabaseUrl || !supabaseKey || !serviceRoleKey || !apiKey) {
      throw new Error("Required environment variables not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Parse request body
    let body: any;
    try {
      body = await req.json();
    } catch (err) {
      throw new Error("Invalid JSON in request body");
    }

    // Verify user authentication
    const [userResult] = await Promise.all([
      supabase.auth.getUser(),
      req.json().catch(() => ({}))
    ]);
    
    const { data: { user }, error: authError } = userResult;
    if (authError || !user) {
      throw new Error("Invalid authentication token");
    }

    const { text, media, isCourse } = body;
    
    // Validate input
    const inputValidation = validateInput(text, media);
    if (!inputValidation.valid) {
      throw new Error(inputValidation.error);
    }

    // Get user's plan and check limits
    const userPlan = await getUserPlan(supabaseAdmin, user.id);
    const isProOrClass = userPlan === 'pro' || userPlan === 'class';

    // Enforce daily usage limits
    if (userPlan !== 'class') {
      try {
        const { data: usageCount } = await supabase.rpc("get_daily_usage_count", {
          p_user_id: user.id
        });
        
        const dailyLimit = userPlan === 'pro' ? DAILY_LIMIT_PRO : DAILY_LIMIT_FREE;
        
        if ((usageCount || 0) >= dailyLimit) {
          return new Response(
            JSON.stringify({
              error: `Daily analysis limit reached (${dailyLimit}). Upgrade to Pro for more analyses.`,
              limit_reached: true,
              retryable: false
            }),
            {
              status: 429,
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            }
          );
        }
      } catch (err) {
        console.error("Error checking usage limit:", err);
        // Continue anyway - don't block analysis if limit check fails
      }
    }

    console.log(`Processing analysis for user ${user.id}, plan: ${userPlan}, duration: ${Date.now() - startTime}ms`);

    // Prepare content for AI analysis
    const contentText = text && text.trim() ? text : "Analyze the provided content.";
    const truncatedContent = contentText.substring(0, 8000); // Ensure we don't exceed token limits
    const mediaContext = media ? "\n[Note: User has attached an image/document for context]" : "";

    // Determine quiz count based on plan
    const quizCount = isProOrClass ? 20 : QUIZ_QUESTIONS_COUNT;

    // Make 3 parallel API calls to Lovable AI Gateway
    const [summaryResult, quizResult, mapResult] = await Promise.all([
      // Call 1: Summary, key terms, lesson sections
      callLovableAI(
        apiKey,
        "You are an education AI expert. Respond ONLY with valid JSON. Analyze content carefully and respond in the same language as the input.",
        `Analyze this educational content:

${truncatedContent}${mediaContext}

Return valid JSON with this structure:
{
  "metadata": {"language":"detected language code","subject_domain":"topic area","complexity_level":"beginner|intermediate|advanced"},
  "three_bullet_summary": ["point 1","point 2","point 3"],
  "key_terms": [{"term":"name","definition":"definition","importance":"high|medium|low"}],
  "lesson_sections": [{"title":"title","summary":"summary","key_takeaway":"takeaway"}]
}

Provide exactly 3 summary points, 4-6 key terms, and 2-3 lesson sections. Be concise and informative.`,
        "Summary"
      ),

      // Call 2: Quiz + Flashcards
      callLovableAI(
        apiKey,
        "You are an expert educator creating study materials. Respond ONLY with valid JSON.",
        `Create ${quizCount} quiz questions and ${FLASHCARDS_COUNT} flashcards for this content:

${truncatedContent}${mediaContext}

Return JSON:
{
  "quiz_questions": [{"question":"text","options":["A","B","C","D"],"correct_answer_index":0,"explanation":"why correct","difficulty":"easy|medium|hard"}],
  "flashcards": [{"front":"question/term","back":"answer/definition"}]
}

Mix difficulty levels for quiz questions. Make flashcards concise and memorable.`,
        "Quiz"
      ),

      // Call 3: Knowledge map
      callLovableAI(
        apiKey,
        "You are an expert at creating knowledge maps. Respond ONLY with valid JSON.",
        `Create a knowledge map for this content:

${truncatedContent}${mediaContext}

Return JSON:
{
  "knowledge_map": {
    "nodes": [{"id":"n1","label":"concept name","category":"category","description":"brief description"}],
    "edges": [{"source":"n1","target":"n2","label":"relationship type","strength":5}]
  }
}

Create ${KNOWLEDGE_MAP_NODES_COUNT} nodes for main concepts and 8-10 edges showing relationships. Strength: 1-10.`,
        "KnowledgeMap"
      ),
    ]);

    console.log(`All API calls completed in ${Date.now() - startTime}ms`);

    // Parse and merge results with fallbacks
    const summary = parseJSON(summaryResult) || {};
    const quiz = parseJSON(quizResult) || {};
    const map = parseJSON(mapResult) || {};

    // Construct final analysis result with safe defaults
    const analysis: AnalysisResult = {
      metadata: summary.metadata || {
        language: "en",
        subject_domain: "General Studies",
        complexity_level: "intermediate"
      },
      three_bullet_summary: (summary.three_bullet_summary || []).slice(0, 3).filter((s: any) => s),
      key_terms: (summary.key_terms || []).slice(0, 10).filter((kt: any) => kt.term && kt.definition),
      lesson_sections: (summary.lesson_sections || []).slice(0, 5).filter((ls: any) => ls.title && ls.summary),
      quiz_questions: (quiz.quiz_questions || []).slice(0, quizCount).filter((q: any) => q.question && q.options && q.options.length === 4),
      flashcards: (quiz.flashcards || []).slice(0, Math.min(FLASHCARDS_COUNT, MAX_FLASHCARDS_FREE)).filter((f: any) => f.front && f.back),
      knowledge_map: map.knowledge_map || { nodes: [], edges: [] },
    };

    // Log usage (fire and forget - don't block response)
    supabaseAdmin
      .from("usage_logs")
      .insert({ user_id: user.id, action_type: "text_analysis" })
      .catch((err: any) => console.error("Error logging usage:", err));

    console.log(`Analysis complete: ${Date.now() - startTime}ms total, ${analysis.quiz_questions?.length} questions, ${analysis.flashcards?.length} flashcards`);

    return new Response(JSON.stringify(analysis), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error occurred";
    console.error("Analysis error:", errorMsg, `(${Date.now() - startTime}ms)`);
    
    // Return appropriate error response
    return new Response(
      JSON.stringify({
        error: errorMsg,
        timestamp: new Date().toISOString()
      }),
      {
        status: err instanceof Error && err.message.includes("limit") ? 429 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});

