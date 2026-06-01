// Velion Lab — Certificate of Completion (PDF).
//
// Triggered when the user finishes Day 60 (and any time afterwards
// from /stats). Renders a high-DPI canvas in A4 landscape, then drops
// it into a jsPDF document and downloads. The actual layout uses the
// same brand vocabulary as ShareCard — Unbounded headings, Manrope
// body, accent #FF6A00, forest-deep background — so the certificate
// reads as an extension of the app rather than a generic template.

import jsPDF from 'jspdf'

// A4 landscape, 200 DPI render target → keeps text crisp when scaled
// to physical print size (210 × 297 mm landscape = 297 × 210).
const W = 2339   // 297mm × 200dpi / 25.4 ≈ 2339
const H = 1654   // 210mm × 200dpi / 25.4 ≈ 1654

const BG_DEEP = '#060D0A'
const ACCENT = '#FF6A00'
const ACCENT_DIM = 'rgba(255,106,0,0.45)'
const INK = '#F5F1EA'
const INK_MUTED = '#B7B0A2'
const INK_DIM = '#7F7866'

async function waitForFonts() {
  if (typeof document === 'undefined' || !document.fonts) return
  try {
    await document.fonts.ready
  } catch {}
}

function formatCompletionDate(d = new Date()) {
  const months = [
    'януари', 'февруари', 'март', 'април', 'май', 'юни',
    'юли', 'август', 'септември', 'октомври', 'ноември', 'декември'
  ]
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

function shortId() {
  return Array.from({ length: 8 }, () =>
    'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'.charAt(Math.floor(Math.random() * 32))
  ).join('')
}

function drawFrame(ctx) {
  // Outer ornamental frame
  const margin = 70
  ctx.strokeStyle = ACCENT_DIM
  ctx.lineWidth = 4
  ctx.strokeRect(margin, margin, W - margin * 2, H - margin * 2)

  const inner = margin + 18
  ctx.strokeStyle = 'rgba(255,255,255,0.10)'
  ctx.lineWidth = 1.5
  ctx.strokeRect(inner, inner, W - inner * 2, H - inner * 2)

  // Corner accents
  const corner = 60
  ctx.strokeStyle = ACCENT
  ctx.lineWidth = 5
  ctx.lineCap = 'round'
  const corners = [
    [margin + 10, margin + 10],
    [W - margin - 10, margin + 10],
    [margin + 10, H - margin - 10],
    [W - margin - 10, H - margin - 10]
  ]
  for (const [x, y] of corners) {
    const sx = x < W / 2 ? 1 : -1
    const sy = y < H / 2 ? 1 : -1
    ctx.beginPath()
    ctx.moveTo(x + corner * sx, y)
    ctx.lineTo(x, y)
    ctx.lineTo(x, y + corner * sy)
    ctx.stroke()
  }
}

function drawHeader(ctx) {
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'

  // Eyebrow
  ctx.fillStyle = ACCENT
  ctx.font = '700 28px "Unbounded", "Inter", sans-serif'
  ctx.fillText('VELION LAB · 60-ДНЕВЕН ПРОТОКОЛ', W / 2, 230)

  // Big title
  ctx.fillStyle = INK
  ctx.font = '800 110px "Unbounded", "Inter", sans-serif'
  ctx.fillText('СЕРТИФИКАТ', W / 2, 290)

  ctx.fillStyle = ACCENT
  ctx.font = '600 48px "Unbounded", "Inter", sans-serif'
  ctx.fillText('за завършване', W / 2, 430)
}

function drawRecipient(ctx, fullName) {
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'

  ctx.fillStyle = INK_MUTED
  ctx.font = '500 32px "Manrope", sans-serif'
  ctx.fillText('Този сертификат се връчва на', W / 2, 560)

  ctx.fillStyle = INK
  // Scale font down a little if the name is unusually long so it stays
  // on a single line within the inner frame.
  const safeName = (fullName || 'Velion Lab User').toUpperCase()
  let nameSize = 130
  ctx.font = `800 ${nameSize}px "Unbounded", "Inter", sans-serif`
  while (ctx.measureText(safeName).width > W - 320 && nameSize > 60) {
    nameSize -= 6
    ctx.font = `800 ${nameSize}px "Unbounded", "Inter", sans-serif`
  }
  ctx.fillText(safeName, W / 2, 620)

  // Underline accent
  const underlineW = Math.min(W - 320, ctx.measureText(safeName).width + 80)
  ctx.fillStyle = ACCENT
  ctx.fillRect((W - underlineW) / 2, 620 + nameSize + 22, underlineW, 4)
}

function drawBody(ctx, options) {
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'

  ctx.fillStyle = INK
  ctx.font = '500 34px "Manrope", sans-serif'
  const line1 = 'За успешно завършване на пълните 60 дни на'
  const line2 = 'протокола за контрол, увереност и присъствие.'
  ctx.fillText(line1, W / 2, 920)
  ctx.fillText(line2, W / 2, 970)

  // Three stats row
  const stats = []
  stats.push({ label: 'Завършени дни', value: `${options.completedDays || 60} / 60` })
  if (options.controlIndex) {
    const idx = options.controlIndex
    if (idx.initialScore != null && idx.finalScore != null) {
      stats.push({
        label: 'Контрол индекс',
        value: `${idx.initialScore} → ${idx.finalScore}`,
        sub: idx.delta != null && idx.delta !== 0
          ? `${idx.delta > 0 ? '+' : ''}${idx.delta} точки`
          : null
      })
    } else if (idx.finalScore != null) {
      stats.push({ label: 'Финален индекс', value: `${idx.finalScore}/100` })
    }
  }
  if (options.level) {
    stats.push({ label: 'Достигнато ниво', value: `Ниво ${options.level}` })
  }

  const statsTop = 1090
  const cellW = 460
  const totalW = cellW * stats.length + 60 * (stats.length - 1)
  const startX = (W - totalW) / 2

  stats.forEach((s, i) => {
    const x = startX + i * (cellW + 60)
    ctx.fillStyle = INK_DIM
    ctx.font = '600 24px "Unbounded", "Inter", sans-serif'
    ctx.fillText(s.label.toUpperCase(), x + cellW / 2, statsTop)

    ctx.fillStyle = ACCENT
    ctx.font = '800 76px "Unbounded", "Inter", sans-serif'
    ctx.fillText(s.value, x + cellW / 2, statsTop + 50)

    if (s.sub) {
      ctx.fillStyle = INK_MUTED
      ctx.font = '500 26px "Manrope", sans-serif'
      ctx.fillText(s.sub, x + cellW / 2, statsTop + 150)
    }
  })
}

function drawFooter(ctx, options) {
  const footerY = H - 200
  const colY = footerY

  // Left: date
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillStyle = INK_DIM
  ctx.font = '600 22px "Unbounded", "Inter", sans-serif'
  ctx.fillText('ЗАВЪРШЕН НА', 180, colY)
  ctx.fillStyle = INK
  ctx.font = '700 36px "Manrope", sans-serif'
  ctx.fillText(options.completionDate, 180, colY + 36)

  // Right: cert id
  ctx.textAlign = 'right'
  ctx.fillStyle = INK_DIM
  ctx.font = '600 22px "Unbounded", "Inter", sans-serif'
  ctx.fillText('CERT ID', W - 180, colY)
  ctx.fillStyle = INK
  ctx.font = '700 36px "Manrope", sans-serif'
  ctx.fillText(options.certId, W - 180, colY + 36)

  // Center: brand line
  ctx.textAlign = 'center'
  ctx.fillStyle = ACCENT
  ctx.font = '700 28px "Unbounded", "Inter", sans-serif'
  ctx.fillText('VELION LAB · velion-lab.com', W / 2, colY + 8)
  ctx.fillStyle = INK_MUTED
  ctx.font = '500 22px "Manrope", sans-serif'
  ctx.fillText('Контрол · Увереност · Присъствие', W / 2, colY + 52)
}

async function renderCertificateCanvas(payload) {
  await waitForFonts()

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  // Background
  ctx.fillStyle = BG_DEEP
  ctx.fillRect(0, 0, W, H)

  // Soft radial vignette glow from top center
  const grad = ctx.createRadialGradient(W / 2, -200, 200, W / 2, -200, 1400)
  grad.addColorStop(0, 'rgba(255,106,0,0.22)')
  grad.addColorStop(1, 'rgba(255,106,0,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  drawFrame(ctx)
  drawHeader(ctx)
  drawRecipient(ctx, payload.fullName)
  drawBody(ctx, payload)
  drawFooter(ctx, payload)

  return canvas
}

/**
 * Build the certificate PDF and trigger a download.
 *
 * @param {Object} options
 * @param {string} options.fullName
 * @param {number} options.completedDays
 * @param {number} [options.level]
 * @param {Object} [options.controlIndex] — { initialScore, finalScore, delta }
 * @param {Date}   [options.completionDate]
 * @param {string} [options.certId]
 */
export async function generateCertificatePdf(options) {
  const completionDate = formatCompletionDate(options.completionDate || new Date())
  const certId = options.certId || `VL-${shortId()}`
  const payload = {
    ...options,
    completionDate,
    certId
  }

  const canvas = await renderCertificateCanvas(payload)
  const imgData = canvas.toDataURL('image/jpeg', 0.92)

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
    compress: true
  })

  // 297 × 210 mm — fill the page edge-to-edge with the canvas image.
  pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210, undefined, 'FAST')

  const filename = `velion-lab-certificate-${(options.fullName || 'user').toLowerCase().replace(/\s+/g, '-')}.pdf`
  pdf.save(filename)

  return { filename, certId, completionDate }
}
