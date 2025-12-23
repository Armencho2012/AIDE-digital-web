import { corsHeaders } from "./_shared-index.ts";

const MIN_QUIZ_QUESTIONS = 5;
const MAX_QUIZ_QUESTIONS = 12;

interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer_index: number;
  explanation: string;
}

interface LessonSection {
  title: string;
  summary: string;
}

interface AnalysisResult {
  language_detected?: string;
  three_bullet_summary?: string[];
  key_terms?: string[];
  lesson_sections?: LessonSection[];
  quiz_questions?: QuizQuestion[];
  quick_quiz_question?: QuizQuestion;
  error?: string;
}

Deno.serve(async (req: Request) => {
  console.log("Request received:", req.method);
  
  // --- 1. CORS Preflight Handler ---
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let responsePayload: AnalysisResult = {};
  
  try {
    const body = await req.json().catch(() => ({}));
    const { text } = body;
    
    // --- 2. Input Validation ---
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Text is required and must be non-empty" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      console.error("❌ GEMINI_API_KEY missing in environment");
      return new Response(JSON.stringify({ error: "Server misconfigured: missing API key" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // --- 3. Gemini API Call Function (with Retry Logic) ---
    const callGemini = async (promptText: string): Promise<AnalysisResult> => {
      const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
      const maxAttempts = 3;
      
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: promptText }] }],
                generationConfig: { temperature: 0.6 }
              })
            }
          );

          const result = await response.json().catch(() => ({}));
          
          if (!response.ok) {
            const errMsg = result?.error?.message || response.statusText;
            if (response.status === 429 && attempt < maxAttempts) {
              const delay = 500 * Math.pow(2, attempt - 1);
              console.log(`⏳ Rate limited, retrying in ${delay}ms...`);
              await sleep(delay);
              continue;
            }
            throw new Error(`Gemini API error ${response.status}: ${errMsg}`);
          }

          const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text || "";
          
          // Clean the response - remove markdown code blocks if present
          let cleanedText = rawText.trim();
          if (cleanedText.startsWith("```json")) {
            cleanedText = cleanedText.slice(7);
          } else if (cleanedText.startsWith("```")) {
            cleanedText = cleanedText.slice(3);
          }
          if (cleanedText.endsWith("```")) {
            cleanedText = cleanedText.slice(0, -3);
          }
          cleanedText = cleanedText.trim();

          try {
            return JSON.parse(cleanedText);
          } catch {
            console.warn("Failed to parse Gemini response as JSON, returning empty object.");
            return {};
          }
        } catch (err) {
          const error = err as Error;
          console.error("Attempt failed:", error.message);
          if (attempt < maxAttempts) await sleep(500 * attempt);
        }
      }
      return {}; // fallback empty object
    };

    // --- 4. Prompt Definition ---
    const prompt = `You are an academic assistant. Analyze this text and return a JSON object with:
language_detected, three_bullet_summary (3–7 points), key_terms (6–10),
lesson_sections (3–6 objects with title and summary),
quiz_questions (array of EXACTLY 8 objects: question, options[4], correct_answer_index, explanation),
quick_quiz_question (duplicate of the first quiz question).

Return only JSON, no markdown, no comments.

Text to analyze:
${text}`;

    const mainAnalysis = await callGemini(prompt);

    // --- 5. Normalization Functions ---
    const normalizeQuestion = (q: unknown): QuizQuestion | null => {
      if (!q || typeof q !== "object") return null;
      const questionObj = q as Record<string, unknown>;
      const { question, options, correct_answer_index, explanation } = questionObj;
      if (!question || !options || !explanation) return null;
      return {
        question: String(question),
        options: Array.isArray(options) ? options.slice(0, 4).map(String) : ["A", "B", "C", "D"],
        correct_answer_index: Number.isInteger(correct_answer_index) 
          ? Math.max(0, Math.min(3, correct_answer_index as number)) 
          : 0,
        explanation: String(explanation)
      };
    };

    const normalizeSections = (sections: unknown): LessonSection[] => {
      if (!Array.isArray(sections)) return [];
      return sections
        .map((s: unknown) => {
          if (!s || typeof s !== "object") return null;
          const section = s as Record<string, unknown>;
          if (section?.title && section?.summary) {
            return { title: String(section.title), summary: String(section.summary) };
          }
          return null;
        })
        .filter((s): s is LessonSection => s !== null);
    };

    const dedupeByQuestion = (arr: (QuizQuestion | null)[]): QuizQuestion[] => {
      const seen = new Set<string>();
      return arr.filter((q): q is QuizQuestion => {
        if (!q) return false;
        const key = q.question.trim().toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    };

    // --- 6. Normalize and Filter Quiz Logic ---
    let quizQuestions = dedupeByQuestion(
      (mainAnalysis.quiz_questions || []).map(normalizeQuestion).filter(Boolean)
    );

    if (quizQuestions.length === 0 && mainAnalysis.quick_quiz_question) {
      const fallback = normalizeQuestion(mainAnalysis.quick_quiz_question);
      if (fallback) quizQuestions.push(fallback);
    }

    if (quizQuestions.length < MIN_QUIZ_QUESTIONS) {
      const base = quizQuestions[0] || {
        question: "Placeholder question",
        options: ["A", "B", "C", "D"],
        correct_answer_index: 0,
        explanation: "No quiz could be generated."
      };
      while (quizQuestions.length < MIN_QUIZ_QUESTIONS) {
        quizQuestions.push({
          ...base,
          question: `${base.question} (Variant ${quizQuestions.length + 1})`
        });
      }
    }

    // --- 7. Final Response Payload ---
    responsePayload = {
      ...mainAnalysis,
      quiz_questions: quizQuestions.slice(0, MAX_QUIZ_QUESTIONS),
      quick_quiz_question: quizQuestions[0],
      lesson_sections: normalizeSections(mainAnalysis.lesson_sections)
    };

    console.log(`✅ Success: ${quizQuestions.length} quiz questions generated`);
  } catch (err) {
    const error = err as Error;
    console.error("❌ Error in analyze-text function:", error.message);
    responsePayload = { error: error.message };
  }

  // --- 8. Final HTTP Response ---
  return new Response(JSON.stringify(responsePayload), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
});
