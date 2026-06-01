// AI Coach endpoint — POST /api/coach
//
// Wraps Anthropic's Claude Haiku 4.5 model with:
//   1. Authenticated requireUser (must be a paid Velion Lab user)
//   2. Server-side context injection: pulls the user's profile +
//      gamification + latest control index into the system prompt so
//      the assistant can reference them without the client sending
//      data it doesn't already own.
//   3. Rate limit: 5 user messages / day. Counted from the
//      ai_coach_messages table where role = 'user'.
//   4. Persistence: both the user message AND the assistant reply are
//      written so the next turn can resume the conversation with
//      history.
//
// If ANTHROPIC_API_KEY is not configured the endpoint returns a soft
// 503 with a friendly "AI Coach се пуска скоро." message — the
// frontend modal displays this verbatim instead of erroring.

import Anthropic from '@anthropic-ai/sdk'
import { requireUser } from './_supabase.js'

const MODEL = 'claude-haiku-4-5-20251001'
const MAX_USER_MESSAGES_PER_DAY = 5
const MAX_HISTORY_MESSAGES = 10
const MAX_OUTPUT_TOKENS = 400

const SOFT_OFFLINE_REPLY =
  'AI Coach се пуска скоро. Когато бъде активиран, ще можеш да задаваш въпроси и да получаваш персонални съвети.'

function buildSystemPrompt(ctx) {
  const lines = [
    'Ти си Velion Coach — личен AI треньор вътре в Velion Lab, 60-дневна програма за контрол и присъствие при мъже.',
    'Винаги отговаряй на български. Бъди директен, кратък (максимум 3-4 изречения). Топъл, но не сладкарски.',
    'Базирай съвета на нервна система, навици и приложна психология. Никакви чудотворни обещания.',
    'Никога не давай медицински съвети. При признаци на сериозни проблеми насочи към специалист или contact: velionbilgaria@gmail.com.'
  ]
  if (ctx?.firstName) lines.push(`Името на потребителя е ${ctx.firstName}.`)
  if (ctx?.level) lines.push(`В момента е на Ниво ${ctx.level}.`)
  if (typeof ctx?.streak === 'number' && ctx.streak > 0) {
    lines.push(`Streak: ${ctx.streak} поредни дни.`)
  }
  if (typeof ctx?.completedDays === 'number') {
    lines.push(`Завършил е ${ctx.completedDays} от 60 дни.`)
  }
  if (ctx?.controlIndex?.score != null) {
    const tier = ctx.controlIndex.tierLabel ? ` (${ctx.controlIndex.tierLabel})` : ''
    lines.push(`Последен Контрол индекс: ${ctx.controlIndex.score}/100${tier}.`)
  }
  return lines.join(' ')
}

async function loadUserContext(supabase, userId) {
  const [{ data: profile }, { data: gam }, { data: quizRows }] = await Promise.all([
    supabase.from('profiles').select('display_name').eq('id', userId).maybeSingle(),
    supabase.from('user_gamification')
      .select('xp, level, current_streak')
      .eq('user_id', userId)
      .maybeSingle(),
    supabase.from('user_quiz_results')
      .select('score, tier, taken_at')
      .eq('user_id', userId)
      .order('taken_at', { ascending: false })
      .limit(1)
  ])

  const { data: completedRows } = await supabase
    .from('user_day_completions')
    .select('day_number', { count: 'exact', head: false })
    .eq('user_id', userId)

  const firstName = (profile?.display_name || '').split(/\s+/)[0] || ''
  const latestQuiz = (quizRows || [])[0] || null

  const tierLabelMap = { low: 'ИНСТИНКТЕН РЕЖИМ', medium: 'В РАЗВИТИЕ', high: 'СЪЗНАТЕЛЕН РЕЖИМ' }

  return {
    firstName,
    level: gam?.level || 1,
    streak: gam?.current_streak || 0,
    completedDays: (completedRows || []).length,
    controlIndex: latestQuiz
      ? { score: latestQuiz.score, tierLabel: tierLabelMap[latestQuiz.tier] || null }
      : null
  }
}

async function checkDailyQuota(supabase, userId) {
  const since = new Date()
  since.setHours(0, 0, 0, 0)
  const { count, error } = await supabase
    .from('ai_coach_messages')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('role', 'user')
    .gte('created_at', since.toISOString())
  if (error) {
    console.warn('[ai-coach] quota count failed:', error.message)
    return { used: 0, exceeded: false }
  }
  const used = count || 0
  return { used, exceeded: used >= MAX_USER_MESSAGES_PER_DAY }
}

async function loadRecentHistory(supabase, userId) {
  const { data } = await supabase
    .from('ai_coach_messages')
    .select('role, content, created_at')
    .eq('user_id', userId)
    .in('role', ['user', 'assistant'])
    .order('created_at', { ascending: false })
    .limit(MAX_HISTORY_MESSAGES)
  return (data || []).reverse()
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  let auth
  try {
    auth = await requireUser(req)
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: 'Влез в акаунта си.' })
  }

  const { message } = req.body || {}
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Missing message' })
  }
  const trimmed = message.trim().slice(0, 600)
  if (!trimmed) {
    return res.status(400).json({ error: 'Empty message' })
  }

  const { supabase, user } = auth

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(503).json({
      error: 'ai_coach_offline',
      message: SOFT_OFFLINE_REPLY
    })
  }

  // Quota check
  const quota = await checkDailyQuota(supabase, user.id)
  if (quota.exceeded) {
    return res.status(429).json({
      error: 'quota_exceeded',
      message: `Достигна лимита от ${MAX_USER_MESSAGES_PER_DAY} въпроса за днес. Утре отново.`
    })
  }

  // Persist the user message first so it's saved even if Anthropic fails.
  await supabase.from('ai_coach_messages').insert({
    user_id: user.id,
    role: 'user',
    content: trimmed
  })

  // Load context + recent history
  const [ctx, history] = await Promise.all([
    loadUserContext(supabase, user.id),
    loadRecentHistory(supabase, user.id)
  ])
  const systemPrompt = buildSystemPrompt(ctx)
  const messages = history
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({ role: m.role, content: m.content }))

  try {
    const client = new Anthropic({ apiKey })
    const completion = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_OUTPUT_TOKENS,
      system: systemPrompt,
      messages
    })

    const reply =
      (completion.content || [])
        .filter((b) => b.type === 'text')
        .map((b) => b.text)
        .join('\n')
        .trim() || 'Опитай отново след малко.'

    await supabase.from('ai_coach_messages').insert({
      user_id: user.id,
      role: 'assistant',
      content: reply,
      tokens_in: completion.usage?.input_tokens || null,
      tokens_out: completion.usage?.output_tokens || null
    })

    return res.status(200).json({
      reply,
      quota: { used: quota.used + 1, limit: MAX_USER_MESSAGES_PER_DAY }
    })
  } catch (err) {
    console.error('[ai-coach] Anthropic error:', err?.message)
    return res.status(500).json({ error: 'AI Coach временно недостъпен. Опитай отново след малко.' })
  }
}
