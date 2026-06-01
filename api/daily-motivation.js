// GET /api/daily-motivation — returns one short Bulgarian motivational
// message per user per calendar day. Caches the result in
// ai_daily_motivations so a refresh, dashboard reopen, or device
// switch don't burn a fresh Anthropic call.
//
// Falls back to a curated static line when ANTHROPIC_API_KEY is not
// configured, so the dashboard never shows an error state.

import Anthropic from '@anthropic-ai/sdk'
import { requireUser } from './_supabase.js'

const MODEL = 'claude-haiku-4-5-20251001'
const MAX_OUTPUT_TOKENS = 120

const STATIC_FALLBACKS = [
  'Денят е възможност, не задължение. Дишай. Действай.',
  'Контролът е навик. Един разчупен импулс — и навикът се случва отново.',
  'Не се състезаваш с никого освен с вчерашната версия на себе си.',
  'Силата идва от показването. Не от вдъхновението.',
  'Едно решение днес е по-силно от 10 утре.',
  'Това, което избягваш, се превръща в това, което те контролира.',
  'Малкото последователно бие голямото случайно. Винаги.',
  'Не става въпрос за повече сила. Става въпрос за по-малко съпротива.'
]

function pickStatic(seed) {
  const idx = Math.abs(hashCode(seed)) % STATIC_FALLBACKS.length
  return STATIC_FALLBACKS[idx]
}

function hashCode(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i)
    h |= 0
  }
  return h
}

function todayISO() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0, 10)
}

async function loadContext(supabase, userId) {
  const [{ data: profile }, { data: gam }] = await Promise.all([
    supabase.from('profiles').select('display_name').eq('id', userId).maybeSingle(),
    supabase
      .from('user_gamification')
      .select('level, current_streak')
      .eq('user_id', userId)
      .maybeSingle()
  ])
  return {
    firstName: (profile?.display_name || '').split(/\s+/)[0] || '',
    level: gam?.level || 1,
    streak: gam?.current_streak || 0
  }
}

async function generateLine(apiKey, ctx) {
  const client = new Anthropic({ apiKey })
  const system = [
    'Ти си Velion Coach — даваш ЕДНА директна, кратка мотивационна линия на български.',
    'Максимум 2 изречения, общо 18 думи. Никаква поезия, никакви метафори за зора и слънце.',
    'Базирана на нервна система, навици, конкретно действие. Тон: спокоен, прям, мъжки.',
    'Никаква рамка ("Здравей" / "Помни"). Започвай директно със съдържанието.'
  ].join(' ')
  const contextLine = [
    ctx.firstName ? `Потребител: ${ctx.firstName}.` : '',
    ctx.level ? `Ниво ${ctx.level}.` : '',
    ctx.streak ? `Streak ${ctx.streak} дни.` : ''
  ].filter(Boolean).join(' ')

  const completion = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_OUTPUT_TOKENS,
    system,
    messages: [
      {
        role: 'user',
        content: `Дай ми днешната ми мотивационна линия. ${contextLine}`
      }
    ]
  })
  const text = (completion.content || [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim()
  return {
    content: text || pickStatic(`${ctx.firstName}-${todayISO()}`),
    tokens_in: completion.usage?.input_tokens || null,
    tokens_out: completion.usage?.output_tokens || null
  }
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
  const forDate = todayISO()

  // 1. cached?
  const { data: cached } = await supabase
    .from('ai_daily_motivations')
    .select('content, created_at')
    .eq('user_id', user.id)
    .eq('for_date', forDate)
    .maybeSingle()
  if (cached) {
    return res.status(200).json({ content: cached.content, cached: true, for_date: forDate })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  const ctx = await loadContext(supabase, user.id)

  let content, tokensIn = null, tokensOut = null
  if (!apiKey) {
    content = pickStatic(`${ctx.firstName}-${forDate}`)
  } else {
    try {
      const gen = await generateLine(apiKey, ctx)
      content = gen.content
      tokensIn = gen.tokens_in
      tokensOut = gen.tokens_out
    } catch (err) {
      console.warn('[daily-motivation] Anthropic error:', err?.message)
      content = pickStatic(`${ctx.firstName}-${forDate}`)
    }
  }

  // Persist (best-effort)
  await supabase
    .from('ai_daily_motivations')
    .insert({
      user_id: user.id,
      for_date: forDate,
      content,
      tokens_in: tokensIn,
      tokens_out: tokensOut
    })
    .then(({ error }) => {
      if (error) console.warn('[daily-motivation] persist error:', error.message)
    })

  return res.status(200).json({ content, cached: false, for_date: forDate })
}
