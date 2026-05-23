#!/usr/bin/env node
// Update all '/course/day-N/*.png' references to '.webp' in day data files,
// then delete the original .png files now that webp copies exist.

import { readdirSync, readFileSync, writeFileSync, statSync, unlinkSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const DAY_DIR = 'src/data'
const COURSE_DIR = 'public/course'

// 1. Rewrite paths in day data
const files = readdirSync(DAY_DIR).filter((f) => /^day\d+\.js$/.test(f))
let dataReplacements = 0
for (const file of files) {
  const path = join(DAY_DIR, file)
  const src = readFileSync(path, 'utf8')
  const next = src.replace(/\/course\/day-(\d+)\/([a-z0-9_-]+)\.png/gi, '/course/day-$1/$2.webp')
  if (next !== src) {
    writeFileSync(path, next)
    dataReplacements += (src.match(/\/course\/day-\d+\/[a-z0-9_-]+\.png/gi) || []).length
  }
}
console.log(`Day data: ${dataReplacements} png paths → webp`)

// 2. Delete the original .png files where a .webp twin exists
let deleted = 0
let freedBytes = 0
const dayFolders = readdirSync(COURSE_DIR).filter((d) => /^day-\d+$/.test(d))
for (const folder of dayFolders) {
  const dayPath = join(COURSE_DIR, folder)
  const folderFiles = readdirSync(dayPath)
  for (const f of folderFiles) {
    if (!f.endsWith('.png')) continue
    const webpTwin = join(dayPath, f.replace(/\.png$/, '.webp'))
    if (existsSync(webpTwin)) {
      const pngPath = join(dayPath, f)
      freedBytes += statSync(pngPath).size
      unlinkSync(pngPath)
      deleted += 1
    }
  }
}
console.log(`Deleted ${deleted} original .png files (${(freedBytes / 1024 / 1024).toFixed(2)} MB freed on disk)`)
