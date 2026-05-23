#!/usr/bin/env node
// Convert all course PNGs to WebP at sensible mobile sizes.
// Run from repo root: node scripts/optimize-images.mjs

import { readdirSync, statSync, writeFileSync, readFileSync, existsSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'

const COURSE_DIR = 'public/course'
const QUALITY = 78
const MAX_WIDTH = 1200

async function processDay(dayDir) {
  const dayPath = join(COURSE_DIR, dayDir)
  const files = readdirSync(dayPath).filter((f) => f.endsWith('.png'))
  let savedBytes = 0
  for (const file of files) {
    const inputPath = join(dayPath, file)
    const outputPath = inputPath.replace(/\.png$/, '.webp')
    if (existsSync(outputPath)) {
      // Already converted — skip to keep this script idempotent
      const inSize = statSync(inputPath).size
      const outSize = statSync(outputPath).size
      savedBytes += inSize - outSize
      continue
    }
    const inputBuf = readFileSync(inputPath)
    const meta = await sharp(inputBuf).metadata()
    const resize = (meta.width || 0) > MAX_WIDTH ? { width: MAX_WIDTH } : null
    let pipeline = sharp(inputBuf)
    if (resize) pipeline = pipeline.resize(resize)
    const output = await pipeline.webp({ quality: QUALITY, effort: 5 }).toBuffer()
    writeFileSync(outputPath, output)
    savedBytes += inputBuf.length - output.length
  }
  return { dayDir, fileCount: files.length, savedBytes }
}

const days = readdirSync(COURSE_DIR).filter((d) => /^day-\d+$/.test(d))

let totalSaved = 0
let totalFiles = 0
for (const d of days) {
  const { fileCount, savedBytes } = await processDay(d)
  totalFiles += fileCount
  totalSaved += savedBytes
  const mb = (savedBytes / 1024 / 1024).toFixed(2)
  console.log(`  ${d}: ${fileCount} → webp, saved ${mb} MB`)
}

console.log(`\nDone: ${totalFiles} files converted, saved ${(totalSaved / 1024 / 1024).toFixed(2)} MB`)
console.log('\nNext: update src/data/day*.js to reference .webp (run reword-image-paths.mjs)')
console.log('Original .png files preserved on disk — delete after verifying webp loads.')
