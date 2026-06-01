// Canvas-based Share Card renderer. Outputs a 1080×1920 PNG that
// matches TikTok / Instagram Reels / Stories aspect (9:16). Goal:
// give the user a polished asset they can paste straight into a post
// instead of asking them to design something themselves — every share
// becomes a referral.
//
// No external deps; the entire layout is hand-drawn on a canvas. Brand
// fonts (Unbounded, Manrope) need to be loaded by the page (they are,
// via index.html). On a fresh load we wait for the FontFace promise so
// the rendered glyphs aren't fallback Times New Roman.

const WIDTH = 1080
const HEIGHT = 1920
const BG_DEEP = '#060D0A'
const BG_CARD = '#0F1A14'
const ACCENT = '#FF6A00'
const INK = '#F5F1EA'
const INK_MUTED = '#B7B0A2'
const INK_DIM = '#7F7866'

async function waitForFonts() {
  if (typeof document === 'undefined' || !document.fonts) return
  try {
    await document.fonts.ready
  } catch {}
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

function drawCard(ctx, label, value, sub, x, y, w, h, valueColor = ACCENT) {
  ctx.fillStyle = BG_CARD
  roundedRect(ctx, x, y, w, h, 28)
  ctx.fill()

  ctx.strokeStyle = 'rgba(255,255,255,0.07)'
  ctx.lineWidth = 1.5
  roundedRect(ctx, x + 0.75, y + 0.75, w - 1.5, h - 1.5, 28)
  ctx.stroke()

  ctx.fillStyle = INK_MUTED
  ctx.font = '600 22px "Unbounded", "Inter", sans-serif'
  ctx.textBaseline = 'top'
  ctx.fillText(label.toUpperCase(), x + 32, y + 28)

  ctx.fillStyle = valueColor
  ctx.font = '800 84px "Unbounded", "Inter", sans-serif'
  ctx.fillText(value, x + 32, y + 64)

  if (sub) {
    ctx.fillStyle = INK_DIM
    ctx.font = '500 22px "Manrope", sans-serif'
    ctx.fillText(sub, x + 32, y + h - 50)
  }
}

function drawHero(ctx, displayName) {
  // Subtle radial glow top-right
  const grad = ctx.createRadialGradient(WIDTH * 0.85, 280, 80, WIDTH * 0.85, 280, 700)
  grad.addColorStop(0, 'rgba(255,106,0,0.32)')
  grad.addColorStop(1, 'rgba(255,106,0,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, WIDTH, HEIGHT * 0.5)

  // Brand chip
  ctx.fillStyle = ACCENT
  ctx.font = '700 28px "Unbounded", "Inter", sans-serif'
  ctx.textBaseline = 'top'
  ctx.fillText('VELION LAB · 60 ДНИ', 64, 96)

  // Headline
  ctx.fillStyle = INK
  ctx.font = '800 96px "Unbounded", "Inter", sans-serif'
  const title = displayName ? `${displayName.toUpperCase()}` : 'ПРОТОКОЛЪТ'
  ctx.fillText(title, 64, 156)

  ctx.fillStyle = INK_MUTED
  ctx.font = '500 36px "Manrope", sans-serif'
  ctx.fillText('Контрол · Увереност · Присъствие', 64, 280)
}

function drawFooter(ctx) {
  ctx.fillStyle = INK_MUTED
  ctx.font = '500 30px "Manrope", sans-serif'
  ctx.textBaseline = 'top'
  ctx.fillText('velion-lab.com', 64, HEIGHT - 130)

  ctx.fillStyle = ACCENT
  ctx.font = '700 28px "Unbounded", "Inter", sans-serif'
  const cta = '€11 · ЕДНОКРАТНО'
  const metrics = ctx.measureText(cta)
  ctx.fillText(cta, WIDTH - 64 - metrics.width, HEIGHT - 128)
}

/**
 * Render a Share Card to a hidden canvas and return a PNG blob (and a
 * data URL fallback for browsers without Blob support).
 *
 * @param {Object} options
 * @param {string} options.displayName  — first name preferred
 * @param {number} options.level
 * @param {number} options.streak
 * @param {number} options.completedDays
 * @param {Object} [options.controlIndex] — { score, delta?, tierLabel? }
 */
export async function renderShareCard(options) {
  await waitForFonts()

  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')

  // Background
  ctx.fillStyle = BG_DEEP
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  drawHero(ctx, options.displayName || '')

  // Stat grid (2×2)
  const colW = (WIDTH - 64 * 2 - 32) / 2
  const cardH = 280
  const gridTop = 460
  const gridLeftX = 64
  const gridRightX = 64 + colW + 32

  drawCard(
    ctx,
    'Ниво',
    String(options.level || 1),
    options.level >= 5 ? 'Дисциплина' : 'В развитие',
    gridLeftX, gridTop, colW, cardH
  )
  drawCard(
    ctx,
    'Streak',
    String(options.streak || 0),
    options.streak === 1 ? 'ден поред' : 'дни поред',
    gridRightX, gridTop, colW, cardH
  )
  drawCard(
    ctx,
    'Завършени',
    `${options.completedDays || 0}/60`,
    options.completedDays >= 60 ? 'Протоколът завърши' : 'дни',
    gridLeftX, gridTop + cardH + 32, colW, cardH
  )

  const idx = options.controlIndex || null
  const idxValue = idx ? String(idx.score) : '—'
  const idxSub = idx
    ? idx.delta != null && idx.delta !== 0
      ? `${idx.delta > 0 ? '+' : ''}${idx.delta} от старта`
      : (idx.tierLabel || 'индекс')
    : 'тест предстои'
  const idxColor = idx
    ? (idx.delta != null && idx.delta > 0 ? '#3DD68C' : ACCENT)
    : INK_MUTED
  drawCard(
    ctx,
    'Контрол индекс',
    idxValue + (idx ? '/100' : ''),
    idxSub,
    gridRightX, gridTop + cardH + 32, colW, cardH,
    idxColor
  )

  // Mid divider quote
  ctx.fillStyle = INK
  ctx.font = '700 56px "Unbounded", "Inter", sans-serif'
  ctx.textBaseline = 'top'
  const quote = 'НЕ ЛУКСУС.'
  const subQuote = 'СИСТЕМА.'
  const qY = gridTop + (cardH + 32) * 2 + 80
  ctx.fillText(quote, 64, qY)
  ctx.fillStyle = ACCENT
  ctx.fillText(subQuote, 64, qY + 80)

  drawFooter(ctx)

  return new Promise((resolve) => {
    if (canvas.toBlob) {
      canvas.toBlob(
        (blob) => {
          resolve({ blob, dataUrl: canvas.toDataURL('image/png'), width: WIDTH, height: HEIGHT })
        },
        'image/png',
        0.95
      )
    } else {
      resolve({
        blob: null,
        dataUrl: canvas.toDataURL('image/png'),
        width: WIDTH,
        height: HEIGHT
      })
    }
  })
}

/**
 * Trigger a browser download for the rendered card.
 */
export function downloadShareCard(dataUrl, filename = 'velion-lab-share.png') {
  if (!dataUrl || typeof document === 'undefined') return
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * If the platform supports the Web Share API with files (modern mobile
 * browsers), invoke the native share sheet. Falls back to download +
 * resolves false so the caller can show a manual hint.
 */
export async function shareShareCard(blob, filename = 'velion-lab-share.png') {
  if (!blob || typeof navigator === 'undefined') return false
  const file = new File([blob], filename, { type: 'image/png' })
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: 'Velion Lab',
        text: '60 дни. Контрол · Присъствие · velion-lab.com'
      })
      return true
    } catch {
      return false
    }
  }
  return false
}
