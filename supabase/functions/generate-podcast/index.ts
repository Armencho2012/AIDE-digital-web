import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const DAILY_LIMIT_FREE = 1
const DAILY_LIMIT_PRO = 50
// Generate dialogue with a text model; browser speech handles playback afterward.
const GEMINI_PODCAST_MODEL = Deno.env.get('GEMINI_PODCAST_MODEL')?.trim() || 'gemini-2.5-flash'
const GEMINI_DIALOGUE_FALLBACK_MODEL = 'gemini-2.5-flash'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })

const extractText = (data: any) => {
  const parts = data?.candidates?.[0]?.content?.parts
  if (!Array.isArray(parts)) return ''
  return parts.map((part: any) => part?.text).filter(Boolean).join('')
}

const parseJson = (raw: string) => {
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
  return JSON.parse(cleaned)
}

const isDialogue = (value: any) =>
  value &&
  typeof value.title === 'string' &&
  Array.isArray(value.speakers) &&
  value.speakers.length === 2 &&
  value.speakers.every((speaker: any) => typeof speaker.name === 'string' && typeof speaker.voice === 'string') &&
  Array.isArray(value.turns) &&
  value.turns.length > 0 &&
  value.turns.every((turn: any) =>
    typeof turn.speaker === 'string' && typeof turn.text === 'string' && typeof turn.pacing === 'string'
  )

const getUserPlan = async (supabaseAdmin: any, userId: string) => {
  const { data: subscription } = await supabaseAdmin
    .from('subscriptions')
    .select('plan_type, status, expires_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const isActive =
    subscription?.status === 'active' &&
    (!subscription.expires_at || new Date(subscription.expires_at) > new Date())

  return isActive && (subscription?.plan_type === 'pro' || subscription?.plan_type === 'class')
    ? subscription.plan_type
    : 'free'
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  try {
    const geminiKey = Deno.env.get('GEMINI_API_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!geminiKey || !supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      return jsonResponse({ error: 'Service temporarily unavailable' }, 500)
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return jsonResponse({ error: 'Authorization required' }, 401)
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return jsonResponse({ error: 'Invalid or expired token' }, 401)
    }

    const userPlan = await getUserPlan(supabaseAdmin, user.id)
    if (userPlan !== 'class') {
      const { data: usageCount } = await supabase.rpc('get_daily_usage_count', { p_user_id: user.id })
      const dailyLimit = userPlan === 'pro' ? DAILY_LIMIT_PRO : DAILY_LIMIT_FREE
      if ((usageCount || 0) >= dailyLimit) {
        return jsonResponse({ error: 'Daily limit reached. Upgrade for more.' }, 429)
      }
    }

    const body = await req.json().catch(() => ({}))
    const topic =
      body?.topic?.trim() || body?.knowledgeGap?.trim() || body?.prompt?.trim()
    const language = typeof body?.language === 'string' ? body.language : 'en'

    if (!topic) {
      return jsonResponse({ error: 'Topic or knowledgeGap is required' }, 400)
    }

    const languageNames: Record<string, string> = {
      en: 'English',
      ru: 'Russian',
      hy: 'Armenian',
      ko: 'Korean'
    }
    const langName = languageNames[language] || 'English'

    const prompt = `Create a short, engaging two-host educational podcast in ${langName} about the content below. Return ONLY valid JSON matching this exact schema, with no markdown or extra text:
{
  "title": "short episode title",
  "speakers": [{"name": "Joe", "voice": "Kore"}, {"name": "Jane", "voice": "Puck"}],
  "turns": [{"speaker": "Joe", "text": "exact spoken line", "pacing": "brief pause"}]
}
Use exactly two speakers named Joe and Jane and alternate them naturally for 6 turns. The voice values must be Kore and Puck. Include pacing cues such as "brief pause", "emphasis", or "warmly" but never put cues inside text. The text must be the exact words to speak, conversational and clear, with a hook, 2-3 key insights, and a memorable takeaway. Do not include stage directions in text.

Content:
${topic.slice(0, 8000)}`

    const requestGemini = (model: string, structured = false) => fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': geminiKey
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2200,
            ...(structured ? { responseMimeType: 'application/json' } : {})
          }
        })
      }
    )

    let geminiRes = await requestGemini(GEMINI_PODCAST_MODEL, true)
    if (!geminiRes.ok && GEMINI_PODCAST_MODEL !== GEMINI_DIALOGUE_FALLBACK_MODEL) {
      console.warn(`Podcast model ${GEMINI_PODCAST_MODEL} failed; retrying with ${GEMINI_DIALOGUE_FALLBACK_MODEL}`)
      geminiRes = await requestGemini(GEMINI_DIALOGUE_FALLBACK_MODEL, true)
    }

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text().catch(() => '')
      console.error('Gemini podcast script failed:', geminiRes.status, errorText)
      return jsonResponse(
        { error: 'Podcast generation failed. Please try again.' },
        geminiRes.status === 429 ? 429 : 502
      )
    }

    const geminiJson = await geminiRes.json().catch(() => null)
    const rawScript = extractText(geminiJson).trim()
    let script: any
    try {
      script = parseJson(rawScript)
    } catch {
      if (rawScript.trimStart().startsWith('{') || rawScript.trimStart().startsWith('[')) {
        console.error('Gemini returned truncated podcast JSON:', rawScript.slice(0, 1200))
        return jsonResponse({ error: 'Podcast dialogue was incomplete. Please generate it again.' }, 502)
      }
      // Some model versions ignore responseMimeType. Preserve the generated text
      // as a valid dialogue rather than making the entire podcast request fail.
      script = {
        title: 'Study discussion',
        speakers: [
          { name: 'Joe', voice: 'Kore' },
          { name: 'Jane', voice: 'Puck' }
        ],
        turns: [
          { speaker: 'Joe', text: rawScript || 'Let us review the key ideas together.', pacing: 'warmly' },
          { speaker: 'Jane', text: 'That is the main idea. Now let us connect it to the most important takeaway.', pacing: 'brief pause' }
        ]
      }
    }

    if (!isDialogue(script)) {
      return jsonResponse({ error: 'Podcast generation returned an empty response. Please try again.' }, 502)
    }

    await supabaseAdmin.from('usage_logs').insert({ user_id: user.id, action_type: 'podcast' })

    // Return the script — client plays via browser SpeechSynthesis (no external TTS).
    return jsonResponse({ podcast_script: JSON.stringify(script), dialogue: script, language }, 200)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('generate-podcast error:', message)
    return jsonResponse({ error: 'An unexpected error occurred. Please try again.' }, 500)
  }
})
