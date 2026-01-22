import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// WAV header helper for reconstructing audio from raw PCM data
function createWavHeader(dataLength: number, options: { numChannels: number; sampleRate: number; bitsPerSample: number }): Uint8Array {
  const { numChannels, sampleRate, bitsPerSample } = options;
  const byteRate = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;
  
  const buffer = new ArrayBuffer(44);
  const view = new DataView(buffer);
  
  // "RIFF" chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, 'WAVE');
  
  // "fmt " sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true);  // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  
  // "data" sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);
  
  return new Uint8Array(buffer);
}

function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Authorization required");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Client for user auth
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Admin client for logging usage (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Invalid token");

    // Get user's subscription plan
    const userPlan = await getUserPlan(supabaseAdmin, user.id);
    console.log(`User ${user.id} has plan: ${userPlan}`);

    const body = await req.json().catch(() => ({}));
    const { prompt, language = 'en' } = body;

    if (!prompt?.trim()) {
      throw new Error("No topic provided for podcast generation");
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) throw new Error("API key not configured");

    // Build the podcast dialogue prompt
    const languageInstruction = language === 'en' ? 'English' : 
                                language === 'ru' ? 'Russian' : 
                                language === 'hy' ? 'Armenian' : 
                                language === 'ko' ? 'Korean' : 'English';

    const dialoguePrompt = `You are creating an educational podcast dialogue between two speakers discussing the following topic. The conversation should be informative, engaging, and natural-sounding.

Topic: ${prompt}

Instructions:
- Create a dialogue between Speaker 1 and Speaker 2
- Speaker 1 is the host/interviewer who asks insightful questions
- Speaker 2 is the expert who provides detailed explanations
- Make the conversation flow naturally with appropriate reactions and follow-up questions
- Include interesting facts, examples, and analogies to make the content accessible
- The dialogue should be 3-5 minutes when spoken
- Respond in ${languageInstruction}

Begin the podcast dialogue now:`;

    console.log(`Generating podcast for user ${user.id}, topic: ${prompt.substring(0, 50)}...`);

    // Call Gemini TTS API with multi-speaker configuration (using flash for better quota limits)
    const ttsUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;
    
    const ttsPayload = {
      contents: [{
        role: 'user',
        parts: [{ text: dialoguePrompt }]
      }],
      generationConfig: {
        temperature: 1,
        responseModalities: ['audio'],
        speechConfig: {
          multiSpeakerVoiceConfig: {
            speakerVoiceConfigs: [
              { 
                speaker: 'Speaker 1', 
                voiceConfig: { 
                  prebuiltVoiceConfig: { voiceName: 'Zephyr' } 
                } 
              },
              { 
                speaker: 'Speaker 2', 
                voiceConfig: { 
                  prebuiltVoiceConfig: { voiceName: 'Puck' } 
                } 
              }
            ]
          }
        }
      }
    };

    console.log('Calling Gemini TTS API...');
    
    const ttsRes = await fetch(ttsUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ttsPayload),
    });

    if (!ttsRes.ok) {
      const errorJson = await ttsRes.json().catch(() => ({}));
      console.error('Gemini TTS error:', ttsRes.status, JSON.stringify(errorJson));
      throw new Error(errorJson?.error?.message || `TTS API error (HTTP ${ttsRes.status})`);
    }

    const ttsJson = await ttsRes.json();
    console.log('TTS response received');

    // Extract audio data from response
    const audioPart = ttsJson?.candidates?.[0]?.content?.parts?.find(
      (part: any) => part.inlineData?.mimeType?.startsWith('audio/')
    );

    if (!audioPart?.inlineData?.data) {
      console.error('No audio data in response:', JSON.stringify(ttsJson).substring(0, 500));
      throw new Error('No audio generated from TTS API');
    }

    const audioBase64 = audioPart.inlineData.data;
    const audioMimeType = audioPart.inlineData.mimeType || 'audio/wav';

    // Log usage with admin client (bypasses RLS)
    const { error: logError } = await supabaseAdmin.from("usage_logs").insert({
      user_id: user.id,
      action_type: "podcast_generation",
    });

    if (logError) {
      console.error("Error logging usage:", logError);
    } else {
      console.log(`Podcast usage logged for user ${user.id}`);
    }

    // Return audio data as base64 for frontend to decode
    return new Response(JSON.stringify({
      audio: audioBase64,
      mimeType: audioMimeType,
      success: true
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: unknown) {
    console.error("Podcast generation error:", err);
    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
