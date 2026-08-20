export const runtime = 'edge'

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'
const ELEVENLABS_ENDPOINT = 'https://api.elevenlabs.io/v1/text-to-speech'

const DAILY_LIMITS: Record<string, number> = {
  free: 2,
  pro: 20,
  class: Number.POSITIVE_INFINITY
}

const MAX_TOPIC_LENGTH = 500

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })

const extractText = (data: any) => {
  const parts = data?.candidates?.[0]?.content?.parts
  if (!Array.isArray(parts)) return ''
  return parts.map((part: any) => part?.text).filter(Boolean).join('')
}

const supabaseRest = async (
  path: string,
  supabaseUrl: string,
  serviceKey: string,
  init: RequestInit = {}
) =>
  fetch(`${supabaseUrl}${path}`, {
    ...init,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      ...(init.headers || {})
    }
  })

export async function POST(req: Request) {
  try {
    const geminiKey = process.env.GEMINI_API_KEY
    const elevenKey = process.env.ELEVEN_LABS_API_KEY
    const supabaseUrl =
      process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!geminiKey || !elevenKey || !supabaseUrl || !serviceKey) {
      console.error('generate-audio: missing required server configuration')
      return jsonResponse({ error: 'Service temporarily unavailable' }, 500)
    }

    // --- Authentication: require a valid Supabase user session ---
    const authHeader = req.headers.get('Authorization') || ''
    const token = authHeader.replace(/^Bearer\s+/i, '').trim()

    if (!token) {
      return jsonResponse({ error: 'Authentication required' }, 401)
    }

    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${token}` }
    })

    if (!userRes.ok) {
      return jsonResponse({ error: 'Authentication required' }, 401)
    }

    const user = await userRes.json().catch(() => null)
    const userId = user?.id

    if (!userId) {
      return jsonResponse({ error: 'Authentication required' }, 401)
    }

    // --- Input validation ---
    const body = await req.json().catch(() => ({}))
    const rawTopic =
      typeof body?.topic === 'string'
        ? body.topic
        : typeof body?.knowledgeGap === 'string'
          ? body.knowledgeGap
          : ''
    const topic = rawTopic.trim()
    const voiceId =
      (typeof body?.voiceId === 'string' ? body.voiceId.trim() : '') ||
      process.env.ELEVEN_LABS_VOICE_ID

    if (!topic) {
      return jsonResponse({ error: 'Topic or knowledgeGap is required' }, 400)
    }

    if (topic.length > MAX_TOPIC_LENGTH) {
      return jsonResponse({ error: 'Topic is too long' }, 400)
    }

    if (!voiceId) {
      console.error('generate-audio: no voice id configured')
      return jsonResponse({ error: 'Service temporarily unavailable' }, 500)
    }

    // --- Server-side daily usage limit ---
    const planRes = await supabaseRest(
      `/rest/v1/subscriptions?user_id=eq.${userId}&status=eq.active&select=plan_type`,
      supabaseUrl,
      serviceKey
    )
    const subs = planRes.ok ? await planRes.json().catch(() => []) : []
    const plan: string = Array.isArray(subs) && subs.length
      ? subs.some((s: any) => s?.plan_type === 'class')
        ? 'class'
        : subs.some((s: any) => s?.plan_type === 'pro')
          ? 'pro'
          : 'free'
      : 'free'

    const limit = DAILY_LIMITS[plan] ?? DAILY_LIMITS.free
    if (Number.isFinite(limit)) {
      const since = new Date()
      since.setUTCHours(0, 0, 0, 0)
      const usageRes = await supabaseRest(
        `/rest/v1/usage_logs?user_id=eq.${userId}&created_at=gte.${since.toISOString()}&action_type=eq.generate_audio&select=id`,
        supabaseUrl,
        serviceKey,
        { headers: { Prefer: 'count=exact' } }
      )
      const used = usageRes.ok
        ? ((await usageRes.json().catch(() => [])) as unknown[]).length
        : 0

      if (used >= limit) {
        return jsonResponse(
          { error: 'Daily audio generation limit reached', limit, plan },
          429
        )
      }
    }

    const prompt = `Create a concise, engaging 1-minute podcast-style script for a student about: ${topic}. Keep it clear, energetic, and focused on the key insight. End with a one-sentence takeaway.`

    const geminiRes = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiKey
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 400 }
      })
    })

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text().catch(() => '')
      console.error(`generate-audio: Gemini failed [${geminiRes.status}]: ${errorText}`)
      return jsonResponse({ error: 'Audio generation failed' }, 502)
    }

    const geminiJson = await geminiRes.json().catch(() => null)
    const script = extractText(geminiJson).trim()

    if (!script) {
      console.error('generate-audio: Gemini returned an empty script')
      return jsonResponse({ error: 'Audio generation failed' }, 502)
    }

    const ttsRes = await fetch(`${ELEVENLABS_ENDPOINT}/${encodeURIComponent(voiceId)}`, {
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
    })

    if (!ttsRes.ok) {
      const errorText = await ttsRes.text().catch(() => '')
      console.error(`generate-audio: ElevenLabs failed [${ttsRes.status}]: ${errorText}`)
      return jsonResponse({ error: 'Audio generation failed' }, 502)
    }

    // Log usage for attribution and rate limiting
    await supabaseRest('/rest/v1/usage_logs', supabaseUrl, serviceKey, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, action_type: 'generate_audio' })
    }).catch(() => undefined)

    const contentType = ttsRes.headers.get('content-type') || 'audio/mpeg'
    return new Response(ttsRes.body, { status: 200, headers: { 'Content-Type': contentType } })
  } catch (error) {
    console.error('generate-audio: unexpected error', error)
    return jsonResponse({ error: 'Audio generation failed' }, 500)
  }
}
