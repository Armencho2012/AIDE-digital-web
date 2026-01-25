import { corsHeaders } from "./_shared-index.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const DAILY_LIMIT_FREE = 1;
const DAILY_LIMIT_PRO = 50;

const QUIZ_QUESTIONS_COUNT = 10;
const FLASHCARDS_COUNT = 15;
const KNOWLEDGE_MAP_NODES_COUNT = 12;

const MAX_FLASHCARDS_FREE = 20;
const MAX_OUTPUT_TOKENS = 12000; // Reduced for faster response

interface AnalysisResult {
  metadata?: {
    language?: string;
    subject_domain?: string;
    complexity_level?: string;
  };
  language_detected?: string;
  three_bullet_summary?: string[];
  key_terms?: Array<{ term: string; definition: string; importance: string }>;
  lesson_sections?: Array<{ title: string; summary: string; key_takeaway: string }>;
  quiz_questions?: Array<{
    question: string;
    options: string[];
    correct_answer_index: number;
    explanation: string;
    difficulty: "easy" | "medium" | "hard";
  }>;
  flashcards?: Array<{ front: string; back: string }>;
  quick_quiz_question?: unknown;
  knowledge_map?: {
    nodes: Array<{ id: string; label: string; category: string; description: string }>;
    edges: Array<{ source: string; target: string; label: string; strength: number }>;
  };
  study_plan?: unknown;
  error?: string;
}

function stripCodeFences(text: string) {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  return match ? match[1] : text;
}

function extractJsonObject(text: string) {
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) return text.slice(first, last + 1);
  return text;
}

function removeTrailingCommas(text: string) {
  return text.replace(/,\s*]/g, "]").replace(/,\s*}/g, "}");
}

function escapeControlCharsInsideStrings(text: string) {
  let out = "";
  let inString = false;
  let escaped = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (!inString) {
      if (ch === '"') inString = true;
      out += ch;
      continue;
    }
    if (escaped) {
      escaped = false;
      out += ch;
      continue;
    }
    if (ch === "\\") {
      escaped = true;
      out += ch;
      continue;
    }
    if (ch === "\n") { out += "\\n"; continue; }
    if (ch === "\r") { out += "\\r"; continue; }
    if (ch === "\t") { out += "\\t"; continue; }
    if (ch === '"') {
      inString = false;
      out += ch;
      continue;
    }
    out += ch;
  }
  return out;
}

function normalizeJsonText(rawText: string) {
  let t = rawText ?? "";
  t = t.replace(/^\uFEFF/, "").trim();
  t = stripCodeFences(t);
  t = extractJsonObject(t);
  t = removeTrailingCommas(t.trim());
  t = escapeControlCharsInsideStrings(t);
  return t.trim();
}

function parseAnalysisOrThrow(rawText: string): AnalysisResult {
  const normalized = normalizeJsonText(rawText);
  try {
    return JSON.parse(normalized) as AnalysisResult;
  } catch (e1) {
    try {
      const safer = normalized.replace(/\\(?!["\\/bfnrtu])/g, "\\\\");
      return JSON.parse(safer) as AnalysisResult;
    } catch (e2) {
      console.error("Failed to parse AI JSON:", e2);
      throw new Error("Failed to parse AI response. Please try again.");
    }
  }
}

// Optimized: Single fast call with abort timeout
async function callGeminiFast(opts: {
  apiKey: string;
  model: string;
  systemInstruction: string;
  parts: any[];
}) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${opts.model}:generateContent?key=${opts.apiKey}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 55000); // 55s timeout

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: opts.systemInstruction }] },
        contents: [{ role: "user", parts: opts.parts }],
        generationConfig: {
          temperature: 0.2, // Lower = faster, more deterministic
          responseMimeType: "application/json",
          maxOutputTokens: MAX_OUTPUT_TOKENS,
        },
      }),
    });

    clearTimeout(timeout);
    const json = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, json };
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

async function getUserPlan(supabaseAdmin: any, userId: string): Promise<string> {
  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .select('status, plan_type, expires_at')
    .eq('user_id', userId)
    .single();

  if (error || !data) return 'free';

  const isActive = data.status === 'active' &&
    ['pro', 'class'].includes(data.plan_type) &&
    (!data.expires_at || new Date(data.expires_at) > new Date());

  return isActive ? data.plan_type : 'free';
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Authorization required");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Parallel: Get user and plan simultaneously
    const [userResult, body] = await Promise.all([
      supabase.auth.getUser(),
      req.json().catch(() => ({})),
    ]);

    const { data: { user }, error: authError } = userResult;
    if (authError || !user) throw new Error("Invalid token");

    const { text, media, isCourse, contextDocuments } = body;
    if (!text?.trim() && !media) {
      throw new Error("No content provided for analysis");
    }

    // Get plan (fast query)
    const userPlan = await getUserPlan(supabaseAdmin, user.id);
    console.log(`User ${user.id} plan: ${userPlan} (${Date.now() - startTime}ms)`);

    const isProOrClass = userPlan === 'pro' || userPlan === 'class';
    const quizQuestionsCount = isProOrClass ? 20 : QUIZ_QUESTIONS_COUNT; // Reduced from 30

    // Check usage limit (skip for class)
    if (userPlan !== 'class') {
      const { data: usageCount } = await supabase.rpc("get_daily_usage_count", {
        p_user_id: user.id,
      });

      const dailyLimit = userPlan === 'pro' ? DAILY_LIMIT_PRO : DAILY_LIMIT_FREE;
      if ((usageCount || 0) >= dailyLimit) {
        return new Response(
          JSON.stringify({ 
            error: userPlan === 'free'
              ? `Daily limit reached. Upgrade for more.`
              : `Monthly limit reached. Upgrade to Class for unlimited.`
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) throw new Error("API key not configured");

    // Optimized prompt - more concise, faster generation
    const systemInstruction = `You are an expert educational content analyzer. Respond in the SAME LANGUAGE as the input.

OUTPUT JSON (valid, no markdown):
{
  "metadata": { "language": "string", "subject_domain": "string", "complexity_level": "beginner|intermediate|advanced" },
  "three_bullet_summary": ["bullet1", "bullet2", "bullet3"],
  "key_terms": [{ "term": "string", "definition": "string", "importance": "high|medium|low" }],
  "lesson_sections": [{ "title": "string", "summary": "string", "key_takeaway": "string" }],
  "quiz_questions": [{ "question": "string", "options": ["a","b","c","d"], "correct_answer_index": 0, "explanation": "string", "difficulty": "easy|medium|hard" }],
  "flashcards": [{ "front": "string", "back": "string" }],
  "knowledge_map": {
    "nodes": [{ "id": "n1", "label": "string", "category": "string", "description": "string" }],
    "edges": [{ "source": "n1", "target": "n2", "label": "string", "strength": 5 }]
  }${isCourse ? ',\n  "study_plan": { "days": [{ "day": 1, "topics": ["string"], "tasks": ["string"] }] }' : ''}
}

REQUIREMENTS:
- ${quizQuestionsCount} quiz questions (mix easy/medium/hard)
- ${FLASHCARDS_COUNT} flashcards (concise backs, 30-60 words)
- ${KNOWLEDGE_MAP_NODES_COUNT} knowledge map nodes, 15-20 edges
- 5-8 key terms, 3-6 lesson sections
- ALL strings single-line (use \\n for breaks)`;

    const promptText = text || "Analyze the provided content.";
    const parts: any[] = [{ text: `[CONTENT TO ANALYZE]:\n${promptText}${contextDocuments ? `\n\n[RELATED DOCUMENTS]:\n${contextDocuments.join("\n---\n")}` : ""}` }];
    
    if (media) {
      parts.unshift({ inlineData: { data: media.data, mimeType: media.mimeType } });
    }

    console.log(`Starting AI call (${Date.now() - startTime}ms)`);

    // Use fastest model first, minimal fallback
    const modelsToTry = ["gemini-2.0-flash", "gemini-2.5-flash-preview"];
    let analysis: AnalysisResult | null = null;
    let lastError = "";

    for (const model of modelsToTry) {
      try {
        console.log(`Trying ${model}...`);
        const { ok, status, json } = await callGeminiFast({
          apiKey,
          model,
          systemInstruction,
          parts,
        });

        if (!ok) {
          lastError = json?.error?.message || `HTTP ${status}`;
          console.error(`${model} failed:`, lastError);
          continue;
        }

        const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) {
          lastError = "Empty response";
          continue;
        }

        analysis = parseAnalysisOrThrow(rawText);
        console.log(`${model} succeeded (${Date.now() - startTime}ms)`);
        break;
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
        console.error(`${model} error:`, lastError);
      }
    }

    if (!analysis) {
      return new Response(JSON.stringify({ error: lastError || "AI processing failed" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Safety cap
    if (analysis.flashcards) {
      analysis.flashcards = analysis.flashcards.slice(0, MAX_FLASHCARDS_FREE);
    }

    // Log usage (fire and forget - don't block response)
    supabaseAdmin.from("usage_logs").insert({
      user_id: user.id,
      action_type: "text_analysis",
    }).then(({ error }) => {
      if (error) console.error("Usage log error:", error);
    });

    console.log(`Analysis complete: ${Date.now() - startTime}ms total`);

    return new Response(JSON.stringify(analysis), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    console.error("Analysis error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
