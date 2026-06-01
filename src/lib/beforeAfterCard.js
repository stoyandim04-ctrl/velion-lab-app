// Before/After share variant. Larger emphasis on the score delta —
// used after the user records a 'final' Контрол индекс. The hero is
// the +N (or -N) number, with smaller before/after pills below.
// Same canvas-only approach as the regular Share Card; no extra deps.

const WIDTH = 1080
const HEIGHT = 1920
const BG_DEEP = '#060D0A'
const BG_CARD = '#0F1A14'
const ACCENT = '#FF6A00'
const POSITIVE = '#3DD68C'
const INK = '#F5F1EA'
const INK_MUTED = '#B7B0A2'
const INK_DIM = '#7F7866'

async function waitForFonts() {
  if (typeof document === 'undefined' || !document.fonts) return
  try { await document.fonts.ready } catch {}
}

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function drawScorePill(ctx, label, score, x, y, w, h, color) {
  ctx.fillStyle = BG_CARD
  roundedRect(ctx, x, y, w, h, 24)
  ctx.fill()
  ctx.strokeStyle = `${color}55`
  ctx.lineWidth = 2
  roundedRect(ctx, x + 1, y + 1, w - 2, h - 2, 24)
  ctx.stroke()

  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillStyle = INK_DIM
  ctx.font = '700 26px "Unbounded", "Inter", sans-serif'
  ctx.fillText(label.toUpperCase(), x + w / 2, y + 28)

  ctx.fillStyle = color
  ctx.font = '800 92px "Unbounded", "Inter", sans-serif'
  ctx.fillText(String(score), x + w / 2, y + 70)
  ctx.fillStyle = INK_MUTED
  ctx.font = '600 24px "Manrope", sans-serif'
  ctx.fillText('/100', x + w / 2, y + 180)
}

export async function renderBeforeAfterCard(payload) {
  await waitForFonts()
  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = BG_DEEP
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  // amber wash from the bottom
  const grad = ctx.createRadialGradient(WIDTH / 2, HEIGHT + 100, 100, WIDTH / 2, HEIGHT + 100, 1200)
  grad.addColorStop(0, 'rgba(255,106,0,0.25)')
  grad.addColorStop(1, 'rgba(255,106,0,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, HEIGHT * 0.4, WIDTH, HEIGHT * 0.6)

  // Eyebrow
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillStyle = ACCENT
  ctx.font = '700 30px "Unbounded", "Inter", sans-serif'
  ctx.fillText('60 ДНИ · ВЪТРЕШНА ПРОМЯНА', WIDTH / 2, 160)

  // Name
  if (payload.displayName) {
    ctx.fillStyle = INK
    ctx.font = '800 76px "Unbounded", "Inter", sans-serif'
    ctx.fillText(payload.displayName.toUpperCase(), WIDTH / 2, 220)
  }

  // Big DELTA hero
  const delta = payload.delta ?? 0
  const positive = delta > 0
  const deltaColor = positive ? POSITIVE : delta < 0 ? '#FF4D2A' : INK_MUTED

  ctx.textAlign = 'center'
  ctx.fillStyle = INK_DIM
  ctx.font = '600 32px "Unbounded", "Inter", sans-serif'
  ctx.fillText('КОНТРОЛ ИНДЕКС', WIDTH / 2, 380)

  ctx.fillStyle = deltaColor
  ctx.font = '800 280px "Unbounded", "Inter", sans-serif'
  const heroText = `${positive ? '+' : delta < 0 ? '' : '±'}${delta}`
  ctx.fillText(heroText, WIDTH / 2, 430)

  ctx.fillStyle = INK_MUTED
  ctx.font = '600 32px "Unbounded", "Inter", sans-serif'
  ctx.fillText('ТОЧКИ', WIDTH / 2, 750)

  // Before / After pills
  const pillW = 380
  const pillH = 280
  const gap = 80
  const totalW = pillW * 2 + gap
  const pillTop = 870
  drawScorePill(ctx, 'Преди', payload.initialScore ?? 0, (WIDTH - totalW) / 2, pillTop, pillW, pillH, '#9CA3AF')
  drawScorePill(ctx, 'След', payload.finalScore ?? 0, (WIDTH - totalW) / 2 + pillW + gap, pillTop, pillW, pillH, ACCENT)

  // Mid divider
  ctx.fillStyle = INK
  ctx.font = '800 64px "Unbounded", "Inter", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('ПРОТОКОЛЪТ', WIDTH / 2, 1280)
  ctx.fillStyle = ACCENT
  ctx.fillText('РАБОТИ.', WIDTH / 2, 1360)

  // Stat strip
  const stats = [
    { label: 'Дни', value: '60/60' },
    { label: 'Streak', value: String(payload.streak ?? 0) },
    { label: 'Ниво', value: String(payload.level ?? 1) }
  ]
  const sw = 280
  const sh = 130
  const sgap = 30
  const stotal = sw * stats.length + sgap * (stats.length - 1)
  let sx = (WIDTH - stotal) / 2
  const sy = 1500
  for (const s of stats) {
    ctx.fillStyle = BG_CARD
    roundedRect(ctx, sx, sy, sw, sh, 22)
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.lineWidth = 1.5
    roundedRect(ctx, sx + 0.75, sy + 0.75, sw - 1.5, sh - 1.5, 22)
    ctx.stroke()

    ctx.fillStyle = INK_DIM
    ctx.font = '700 20px "Unbounded", "Inter", sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(s.label.toUpperCase(), sx + sw / 2, sy + 22)
    ctx.fillStyle = ACCENT
    ctx.font = '800 56px "Unbounded", "Inter", sans-serif'
    ctx.fillText(s.value, sx + sw / 2, sy + 52)
    sx += sw + sgap
  }

  // Footer
  ctx.fillStyle = INK_MUTED
  ctx.font = '500 30px "Manrope", sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('velion-lab.com', 64, HEIGHT - 130)
  ctx.fillStyle = ACCENT
  ctx.font = '700 28px "Unbounded", "Inter", sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText('€11 · ЕДНОКРАТНО', WIDTH - 64, HEIGHT - 128)

  return new Promise((resolve) => {
    if (canvas.toBlob) {
      canvas.toBlob(
        (blob) => resolve({ blob, dataUrl: canvas.toDataURL('image/png'), width: WIDTH, height: HEIGHT }),
        'image/png',
        0.95
      )
    } else {
      resolve({ blob: null, dataUrl: canvas.toDataURL('image/png'), width: WIDTH, height: HEIGHT })
    }
  })
}
