import { supabase } from './supabaseClient.js'
import { openExternalUrl } from './capacitor.js'

export async function startCheckout({ priceId, mode }) {
  if (!priceId) {
    throw new Error('Липсва Stripe price ID — провери .env')
  }

  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  if (!token) {
    throw new Error('Влез в акаунта си преди плащане.')
  }

  const res = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ priceId, mode })
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Грешка при стартиране на плащането')
  }

  const { url } = await res.json()
  if (!url) {
    throw new Error('Stripe не върна URL за checkout')
  }

  // On native (iOS/Android) Capacitor opens the URL inside Safari View
  // Controller / Chrome Custom Tabs so the user can return to the app
  // via universal/app links. On web it just navigates the tab.
  await openExternalUrl(url)
}
