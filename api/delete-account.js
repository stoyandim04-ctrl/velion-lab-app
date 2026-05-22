import { requireUser, getSupabaseAdmin } from './_supabase.js'

// Apple App Store requires users to be able to delete their account and all
// associated data from inside the app. This endpoint:
//   1) Verifies the requesting user via their Supabase JWT.
//   2) Deletes all per-user rows that are NOT covered by ON DELETE CASCADE.
//   3) Deletes the auth.users row via the admin API, which cascades into
//      public.profiles (and from there into user_progress, user_events,
//      subscriptions, journal_entries, user_metrics, user_day_completions).
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  let auth
  try {
    auth = await requireUser(req)
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: 'Не си влязъл в акаунта си.' })
  }

  const admin = getSupabaseAdmin()
  const userId = auth.user.id

  try {
    // Best-effort cleanup of rows that may exist without a strict cascade chain.
    // We ignore individual table errors — the final auth.users delete is what
    // makes the account unusable and triggers Supabase's own cascades.
    await admin.from('user_events').delete().eq('user_id', userId)
    await admin.from('journal_entries').delete().eq('user_id', userId)
    await admin.from('user_metrics').delete().eq('user_id', userId)
    await admin.from('user_day_completions').delete().eq('user_id', userId)
    await admin.from('user_progress').delete().eq('user_id', userId)
    await admin.from('subscriptions').delete().eq('user_id', userId)
    await admin.from('profiles').delete().eq('id', userId)

    const { error } = await admin.auth.admin.deleteUser(userId)
    if (error) throw error

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('[delete-account] failed:', err?.message)
    return res.status(500).json({ error: 'Грешка при изтриване на акаунта. Опитай отново.' })
  }
}
