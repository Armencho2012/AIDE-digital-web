import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const DAILY_LIMIT_FREE = 1
const DAILY_LIMIT_PRO = 50
const SIGNED_URL_EXPIRES_IN_SECONDS = 60 * 60 * 24

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
    const elevenKey = Deno.env.get('ELEVEN_LABS_API_KEY')
    const voiceId = Deno.env.get('ELEVEN_LABS_VOICE_ID')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!geminiKey || !elevenKey) {
      return jsonResponse({ error: 'Service temporarily unavailable' }, 500)
    }

    if (!voiceId) {
      return jsonResponse({ error: 'Service temporarily unavailable' }, 500)
    }

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
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

    if (!topic) {
      return jsonResponse({ error: 'Topic or knowledgeGap is required' }, 400)
    }

    const prompt = `Create a concise, engaging 1-minute podcast-style script for a student about: ${topic}. Keep it clear, energetic, and focused on the key insight. End with a one-sentence takeaway.`

    const geminiRes = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': geminiKey
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 400 }
        })
      }
    )

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text().catch(() => '')
      console.error('Gemini podcast generation failed:', geminiRes.status, errorText)
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

    const ttsRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: 'audio/mpeg',
          'xi-api-key': elevenKey
        },
        body: JSON.stringify({
          text: script,
          model_id: 'eleven_multilingual_v2'
        })
      }
    )

    if (!ttsRes.ok) {
      const errorText = await ttsRes.text().catch(() => '')
      console.error('ElevenLabs podcast generation failed:', ttsRes.status, errorText)
      return jsonResponse(
        { error: 'Podcast audio generation failed. Please try again.' },
        ttsRes.status === 429 ? 429 : 502
      )
    }

    const audioBuffer = await ttsRes.arrayBuffer()
    const contentType = ttsRes.headers.get('content-type') || 'audio/mpeg'
    const ext = contentType.includes('mpeg') || contentType.includes('mp3') ? 'mp3' : 'audio'
    const filename = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`

    const { error: uploadError } = await supabaseAdmin.storage
      .from('podcasts')
      .upload(filename, new Uint8Array(audioBuffer), {
        contentType,
        upsert: true
      })

    if (uploadError) {
      console.error('Podcast upload failed:', uploadError.message)
      return jsonResponse({ error: 'Failed to store audio' }, 500)
    }

    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
      .from('podcasts')
      .createSignedUrl(filename, SIGNED_URL_EXPIRES_IN_SECONDS)
    const podcastUrl = signedUrlData?.signedUrl

    if (signedUrlError || !podcastUrl) {
      console.error('Podcast signed URL failed:', signedUrlError?.message)
      return jsonResponse({ error: 'Failed to prepare audio playback' }, 500)
    }

    await supabaseAdmin.from('usage_logs').insert({ user_id: user.id, action_type: 'analysis' })

    return jsonResponse({ podcast_url: podcastUrl, podcast_path: filename }, 200)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('generate-podcast error:', message)
    return jsonResponse({ error: 'An unexpected error occurred. Please try again.' }, 500)
  }
})
