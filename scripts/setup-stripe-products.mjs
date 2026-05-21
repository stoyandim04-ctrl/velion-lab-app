import Stripe from 'stripe'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve } from 'path'

const envPath = resolve(process.cwd(), '.env.local')
if (!existsSync(envPath)) {
  console.error('❌ Missing .env.local')
  process.exit(1)
}
const env = Object.fromEntries(
  readFileSync(envPath, 'utf8')
    .split('\n')
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
    })
)

if (!env.STRIPE_SECRET_KEY?.startsWith('sk_test_')) {
  console.error('❌ STRIPE_SECRET_KEY must be a test key')
  process.exit(1)
}

const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })

async function findOrCreateProduct(name, description) {
  const existing = await stripe.products.search({
    query: `name:"${name}" AND active:"true"`
  })
  if (existing.data.length > 0) {
    console.log(`✓ Product exists: ${name} (${existing.data[0].id})`)
    return existing.data[0]
  }
  const product = await stripe.products.create({ name, description })
  console.log(`+ Created product: ${name} (${product.id})`)
  return product
}

async function findOrCreatePrice(product, params, label) {
  const prices = await stripe.prices.list({ product: product.id, active: true, limit: 100 })

  const match = prices.data.find((p) => {
    if (p.currency !== params.currency) return false
    if (p.unit_amount !== params.unit_amount) return false
    if (params.recurring) {
      return p.recurring?.interval === params.recurring.interval
    }
    return !p.recurring
  })

  if (match) {
    console.log(`✓ Price exists: ${label} (${match.id})`)
    return match
  }

  const price = await stripe.prices.create({ product: product.id, ...params })
  console.log(`+ Created price: ${label} (${price.id})`)
  return price
}

const monthlyProduct = await findOrCreateProduct(
  'Velion Lab Monthly',
  '60-дневна персонализирана система — месечен абонамент'
)
const lifetimeProduct = await findOrCreateProduct(
  'Velion Lab Lifetime',
  '60-дневна персонализирана система — еднократно плащане, достъп завинаги'
)

const monthlyPrice = await findOrCreatePrice(
  monthlyProduct,
  { currency: 'eur', unit_amount: 2499, recurring: { interval: 'month' } },
  'Monthly €24.99/mo'
)
const lifetimePrice = await findOrCreatePrice(
  lifetimeProduct,
  { currency: 'eur', unit_amount: 6999 },
  'Lifetime €69.99 one-time'
)

const lines = readFileSync(envPath, 'utf8').split('\n').filter(Boolean)
const keep = lines.filter(
  (l) => !l.startsWith('VITE_PRICE_MONTHLY=') && !l.startsWith('VITE_PRICE_LIFETIME=')
)
keep.push(`VITE_PRICE_MONTHLY=${monthlyPrice.id}`)
keep.push(`VITE_PRICE_LIFETIME=${lifetimePrice.id}`)
writeFileSync(envPath, keep.join('\n') + '\n')

console.log('\n─── DONE ───')
console.log(`VITE_PRICE_MONTHLY=${monthlyPrice.id}`)
console.log(`VITE_PRICE_LIFETIME=${lifetimePrice.id}`)
