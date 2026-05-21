import sharp from 'sharp'
import { resolve } from 'path'

const OUT = resolve(process.cwd(), 'public/og-image.jpg')
const SHIELD_SVG = resolve(process.cwd(), 'public/logo/velion-shield.svg')

const W = 1200
const H = 630

const bgSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="glow" cx="50%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#FF6A00" stop-opacity="0.42" />
      <stop offset="30%" stop-color="#FF6A00" stop-opacity="0.16" />
      <stop offset="70%" stop-color="#0A0A0A" stop-opacity="1" />
      <stop offset="100%" stop-color="#000000" stop-opacity="1" />
    </radialGradient>
    <radialGradient id="vignette" cx="50%" cy="50%" r="80%">
      <stop offset="55%" stop-color="#000000" stop-opacity="0" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.7" />
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#0A0A0A" />
  <rect width="${W}" height="${H}" fill="url(#glow)" />
  <rect width="${W}" height="${H}" fill="url(#vignette)" />

  <text
    x="50%" y="${H / 2 + 80}"
    font-family="'Unbounded', 'Arial Black', sans-serif"
    font-size="84"
    font-weight="800"
    letter-spacing="6"
    text-anchor="middle"
    fill="#F5F1EA"
  >VELION LAB</text>

  <text
    x="50%" y="${H / 2 + 140}"
    font-family="'Manrope', Arial, sans-serif"
    font-size="26"
    font-weight="500"
    letter-spacing="3"
    text-anchor="middle"
    fill="#F5F1EA"
    opacity="0.6"
  >Контрол · увереност · мъжка енергия</text>

  <text
    x="50%" y="${H - 40}"
    font-family="'Manrope', Arial, sans-serif"
    font-size="18"
    letter-spacing="4"
    text-anchor="middle"
    fill="#FF6A00"
    opacity="0.7"
  >60-ДНЕВНА ПЕРСОНАЛИЗИРАНА СИСТЕМА</text>
</svg>`

const iconSize = 180
const iconBuffer = await sharp(SHIELD_SVG)
  .resize(iconSize, iconSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer()

await sharp(Buffer.from(bgSvg))
  .composite([
    {
      input: iconBuffer,
      top: Math.round(H / 2 - iconSize - 20),
      left: Math.round((W - iconSize) / 2)
    }
  ])
  .jpeg({ quality: 90, mozjpeg: true })
  .toFile(OUT)

console.log('✓ og-image.jpg generated')
