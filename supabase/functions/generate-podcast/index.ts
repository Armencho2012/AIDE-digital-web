import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "./_shared-index.ts";

// Helper function to get user's subscription plan
async function getUserPlan(supabaseAdmin: any, userId: string): Promise<string> {
  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .select('status, plan_type, expires_at')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return 'free';
  }

  const isActive = data.status === 'active' &&
    ['pro', 'class'].includes(data.plan_type) &&
    (!data.expires_at || new Date(data.expires_at) > new Date());

  return isActive ? data.plan_type : 'free';
}

// Helper to decode base64 to Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Retry helper with exponential backoff
async function fetchWithRetry(
  url: string, 
  options: RequestInit, 
  maxRetries = 3,
  baseDelay = 2000
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      // Don't retry on client errors (4xx) except rate limits
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        return response;
      }
      
      // Retry on 5xx errors or rate limits
      if (response.status >= 500 || response.status === 429) {
        const errorJson = await response.json().catch(() => ({}));
        console.log(`Attempt ${attempt + 1}/${maxRetries} failed with ${response.status}:`, errorJson?.error?.message || 'Unknown error');
        
        if (attempt < maxRetries - 1) {
          const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
          console.log(`Retrying in ${Math.round(delay)}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        throw new Error(`TTS API failed after ${maxRetries} attempts (HTTP ${response.status}): ${errorJson?.error?.message || 'Unknown error'}`);
      }
      
      return response;
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt + 1}/${maxRetries} network error:`, lastError.message);
      
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('All retry attempts failed');
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
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
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const apiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!supabaseUrl || !apiKey || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Missing environment variables" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Client for user auth
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Admin client for storage and DB operations (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Get user's subscription plan
    const userPlan = await getUserPlan(supabaseAdmin, user.id);
    console.log(`User ${user.id} has plan: ${userPlan}`);

    // Enforce rate limits for free users
    if (userPlan === 'free') {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const startOfDay = today.toISOString();

      const { count, error: countError } = await supabaseAdmin
        .from('usage_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('action_type', 'podcast_generation')
        .gte('created_at', startOfDay);

      if (countError) {
        console.warn('Could not check usage limit:', countError);
      } else if (count && count >= 5) {
        return new Response(JSON.stringify({
          error: 'Daily podcast generation limit reached. Upgrade to Pro for unlimited access.',
          limit_reached: true,
          retryable: false
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    const body = await req.json().catch(() => ({}));
    const { prompt, language = 'en', contentId } = body;

    if (!prompt?.trim()) {
      return new Response(JSON.stringify({ error: "No topic provided for podcast generation" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Build the podcast dialogue prompt
    const languageInstruction = language === 'en' ? 'English' : 
                                language === 'ru' ? 'Russian' : 
                                language === 'hy' ? 'Armenian' : 
                                language === 'ko' ? 'Korean' : 'English';

    // Truncate prompt to avoid exceeding token limits
    const truncatedPrompt = prompt.substring(0, 4000);

    const dialoguePrompt = `You are creating an educational podcast dialogue between two speakers discussing the following topic. The conversation should be informative, engaging, and natural-sounding.

Topic: ${truncatedPrompt}

Instructions:
- Create a dialogue between Speaker 1 and Speaker 2
- Speaker 1 is the host/interviewer who asks insightful questions
- Speaker 2 is the expert who provides detailed explanations
- Make the conversation flow naturally with appropriate reactions and follow-up questions
- Include interesting facts, examples, and analogies to make the content accessible
- The dialogue should be 2-3 minutes when spoken
- Respond in ${languageInstruction}

Begin the podcast dialogue now:`;

    console.log(`Generating podcast for user ${user.id}, topic: ${truncatedPrompt.substring(0, 50)}...`);

    // Use Lovable AI Gateway with TTS capabilities
    // First generate the dialogue text
    const dialogueResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: dialoguePrompt }],
        max_tokens: 2000
      })
    });

    if (!dialogueResponse.ok) {
      const errorText = await dialogueResponse.text();
      console.error('Dialogue generation error:', dialogueResponse.status, errorText);
      if (dialogueResponse.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Rate limits exceeded, please try again later",
          retryable: true
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      if (dialogueResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      throw new Error("Failed to generate podcast dialogue");
    }

    const dialogueData = await dialogueResponse.json();
    const dialogueText = dialogueData.choices?.[0]?.message?.content;

    if (!dialogueText) {
      throw new Error("No dialogue generated");
    }

    console.log('Dialogue generated, length:', dialogueText.length);

    // Call Lovable AI Gateway TTS endpoint
    const ttsUrl = `https://ai.gateway.lovable.dev/v1/audio/speech`;
    
    const ttsPayload = {
      model: "google/gemini-3-flash-preview",
      input: dialogueText,
      voice: {
        languageCode: language,
        name: language === 'en' ? 'en-US-Neural2-F' : 
              language === 'ru' ? 'ru-RU-Neural2-F' : 
              language === 'hy' ? 'hy-AM-Neural2-F' : 
              language === 'ko' ? 'ko-KR-Neural2-F' : 'en-US-Neural2-F'
      },
      audioFormat: "mp3",
      speed: 1.0
    };

    console.log('Calling TTS API with retry...');
    
    // Add timeout protection (90 seconds for TTS generation)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000);

    let ttsRes: Response;
    try {
      ttsRes = await fetchWithRetry(ttsUrl, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(ttsPayload),
        signal: controller.signal
      }, 3, 2000);
    } finally {
      clearTimeout(timeoutId);
    }

    console.log(`TTS Response status: ${ttsRes.status}`);

    if (!ttsRes.ok) {
      const errorText = await ttsRes.text();
      const errorJson = (() => {
        try {
          return JSON.parse(errorText);
        } catch {
          return { message: errorText };
        }
      })();
      const errorMessage = errorJson?.error?.message || errorJson?.message || `TTS API error (HTTP ${ttsRes.status})`;
      console.error('TTS error:', ttsRes.status, JSON.stringify(errorJson));
      
      if (ttsRes.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Podcast generation is temporarily unavailable due to high demand. Please try again in a few minutes.",
          retryable: true
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (ttsRes.status === 500 || ttsRes.status === 503) {
        return new Response(JSON.stringify({ 
          error: "The podcast service encountered a temporary issue. Please try again.",
          retryable: true
        }), {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(errorMessage);
    }

    // Get audio as array buffer
    const audioArrayBuffer = await ttsRes.arrayBuffer();
    const audioBytes = new Uint8Array(audioArrayBuffer);
    console.log(`Audio size: ${audioBytes.length} bytes`);

    // Validate audio size
    const maxAudioSize = 50 * 1024 * 1024; // 50MB limit
    if (audioBytes.length > maxAudioSize) {
      throw new Error(`Generated audio exceeds maximum size limit (${(audioBytes.length / 1024 / 1024).toFixed(2)}MB)`);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${user.id}/${timestamp}.mp3`;

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('podcasts')
      .upload(filename, audioBytes, {
        contentType: 'audio/mpeg',
        upsert: true
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error('Failed to save podcast audio');
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('podcasts')
      .getPublicUrl(filename);

    const podcastUrl = urlData.publicUrl;
    console.log(`Podcast uploaded: ${podcastUrl}`);

    // Update user_content if contentId provided
    if (contentId) {
      const { data: contentData } = await supabaseAdmin
        .from('user_content')
        .select('generation_status')
        .eq('id', contentId)
        .single();

      const existingStatus = contentData?.generation_status || {};
      
      const { error: updateError } = await supabaseAdmin
        .from('user_content')
        .update({
          podcast_url: podcastUrl,
          generation_status: {
            ...existingStatus,
            podcast: true
          }
        })
        .eq('id', contentId);

      if (updateError) {
        console.error('Error updating content:', updateError);
      } else {
        console.log(`Content ${contentId} updated with podcast URL`);
      }
    }

    // Log usage (fire and forget)
    supabaseAdmin.from("usage_logs").insert({
      user_id: user.id,
      action_type: "podcast_generation",
    }).then((err) => {
      if (err) console.error("Error logging usage:", err);
    });

    // Return podcast URL
    return new Response(JSON.stringify({
      podcast_url: podcastUrl,
      success: true,
      dialogue: dialogueText
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Podcast generation error:", err);
    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

