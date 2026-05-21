export async function startCheckout({ priceId, mode }) {
  if (!priceId) {
    throw new Error('Липсва Stripe price ID — провери .env')
  }

  const res = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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

  window.location.href = url
}
