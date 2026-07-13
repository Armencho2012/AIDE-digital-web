import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const DAILY_LIMIT_FREE = 1
const DAILY_LIMIT_PRO = 50

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

    const prompt = `Write an engaging ~1-minute podcast-style monologue in ${langName} about the following content. Be conversational, energetic, and clear. Start with a hook, cover the 2-3 most important insights, and end with a memorable one-sentence takeaway. Return ONLY the spoken script text — no stage directions, no speaker labels, no markdown.\n\nContent:\n${topic.slice(0, 8000)}`

    const geminiRes = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': geminiKey
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 600 }
        })
      }
    )

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text().catch(() => '')
      console.error('Gemini podcast script failed:', geminiRes.status, errorText)
      return jsonResponse(
        { error: 'Podcast generation failed. Please try again.' },
        geminiRes.status === 429 ? 429 : 502
      )
    }

    const geminiJson = await geminiRes.json().catch(() => null)
    const script = extractText(geminiJson).trim()

    if (!script) {
      return jsonResponse({ error: 'Podcast generation returned an empty response. Please try again.' }, 502)
    }

    await supabaseAdmin.from('usage_logs').insert({ user_id: user.id, action_type: 'podcast' })

    // Return the script — client plays via browser SpeechSynthesis (no external TTS).
    return jsonResponse({ podcast_script: script, language }, 200)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('generate-podcast error:', message)
    return jsonResponse({ error: 'An unexpected error occurred. Please try again.' }, 500)
  }
})
