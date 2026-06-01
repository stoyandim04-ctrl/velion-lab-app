// GET /api/recommendations — returns 3 short, actionable, personalized
// recommendations for the user given their current state. Uses Claude
// Haiku. Cached for 6 hours per user to avoid burning calls on every
// dashboard visit.

import Anthropic from '@anthropic-ai/sdk'
import { requireUser } from './_supabase.js'

const MODEL = 'claude-haiku-4-5-20251001'
const CACHE_HOURS = 6
const MAX_OUTPUT_TOKENS = 400

const STATIC_RECS = [
  { title: 'Започни с 4 цикъла Box дишане', body: 'Преди първата задача за деня — стабилизира нервната система.' },
  { title: 'Прегледай последния си ден от курса', body: 'Често забравяме само 24 часа след това. Повторение = ускорено учене.' },
  { title: 'Запиши едно изречение в журнала', body: 'Една реална мисъл днес е по-полезна от 10 пропуснати журнала.' }
]

async function loadContext(supabase, userId) {
  const [{ data: profile }, { data: gam }, { data: quiz }] = await Promise.all([
    supabase.from('profiles').select('display_name').eq('id', userId).maybeSingle(),
    supabase.from('user_gamification')
      .select('level, current_streak, current_week_streak')
      .eq('user_id', userId)
      .maybeSingle(),
    supabase.from('user_quiz_results')
      .select('score, tier, kind')
      .eq('user_id', userId)
      .order('taken_at', { ascending: false })
      .limit(1)
  ])
  return {
    firstName: (profile?.display_name || '').split(/\s+/)[0] || '',
    level: gam?.level || 1,
    streak: gam?.current_streak || 0,
    weekStreak: gam?.current_week_streak || 0,
    quiz: (quiz || [])[0] || null
  }
}

function todayPlusHours(hours) {
  const d = new Date()
  d.setHours(d.getHours() - hours)
  return d.toISOString()
}

async function generateRecs(apiKey, ctx) {
  const client = new Anthropic({ apiKey })
  const system = [
    'Ти си Velion Coach. Връщаш ВСИЧКО САМО на български.',
    'Изходът ти трябва да е валиден JSON с следния shape:',
    '{ "items": [ { "title": string, "body": string } ] }',
    'Точно 3 препоръки. Title максимум 5 думи, направо в повелително наклонение.',
    'Body максимум 14 думи. Никаква поезия. Конкретен резултат и защо.',
    'Не повтаряй информацията за контекста на потребителя.'
  ].join(' ')
  const contextLine = `Контекст: ниво ${ctx.level}, streak ${ctx.streak} дни${ctx.firstName ? ', име ' + ctx.firstName : ''}${ctx.quiz ? ', контрол индекс ' + ctx.quiz.score : ''}.`

  const completion = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_OUTPUT_TOKENS,
    system,
    messages: [{ role: 'user', content: `${contextLine} Дай 3 препоръки за следващите 24 часа.` }]
  })
  const text = (completion.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim()
  try {
    const parsed = JSON.parse(text)
    if (Array.isArray(parsed.items)) return parsed.items.slice(0, 3)
  } catch {}
  return null
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  let auth
  try {
    auth = await requireUser(req)
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: 'Влез в акаунта си.' })
  }

  const { supabase, user } = auth
  const since = todayPlusHours(CACHE_HOURS)
  const { data: cached } = await supabase
    .from('user_events')
    .select('payload, created_at')
    .eq('user_id', user.id)
    .eq('event_type', 'ai_recommendations_cache')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (cached?.payload?.items) {
    return res.status(200).json({ items: cached.payload.items, cached: true })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  const ctx = await loadContext(supabase, user.id)

  let items
  if (!apiKey) {
    items = STATIC_RECS
  } else {
    try {
      items = await generateRecs(apiKey, ctx)
    } catch (err) {
      console.warn('[recommendations] Anthropic error:', err?.message)
    }
    if (!items) items = STATIC_RECS
  }

  await supabase
    .from('user_events')
    .insert({
      user_id: user.id,
      event_type: 'ai_recommendations_cache',
      payload: { items }
    })
    .then(({ error }) => {
      if (error) console.warn('[recommendations] cache write error:', error.message)
    })

  return res.status(200).json({ items, cached: false })
}
