#!/usr/bin/env node
// Fix the double-`current` navigation bug:
// In each day file, the next-day nav entry should be `status: 'locked'` with
// a `hint` field, not a second `status: 'current'`.

import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const DAY_DIR = 'src/data'
const files = readdirSync(DAY_DIR).filter((f) => /^day\d+\.js$/.test(f))

let totalFixes = 0
const summary = []

for (const file of files) {
  const path = join(DAY_DIR, file)
  const src = readFileSync(path, 'utf8')

  // Extract dayNumber from the file body (also matches "dayNumber": N for JSON-style)
  const dnMatch = src.match(/dayNumber\s*:\s*(\d+)/)
  if (!dnMatch) continue
  const currentDay = parseInt(dnMatch[1], 10)
  const nextDay = currentDay + 1

  // Find the entry for nextDay in the navigation array and rewrite its status.
  // Match a navigation entry of the form: { day: N+1, ...status: 'current' ... }
  // We allow trailing whitespace and the route field to follow.
  const entryRegex = new RegExp(
    `(\\{\\s*day:\\s*${nextDay}\\s*,[^}]*?status:\\s*)'current'([^}]*?)\\}`,
    'g'
  )

  let fileFixes = 0
  let next = src.replace(entryRegex, (_full, before, after) => {
    fileFixes += 1
    // Replace status, drop icon swap, add hint if missing.
    let rewritten = `${before}'locked'${after}`
    // swap icon 📍 → 🔒 if present in this segment
    rewritten = rewritten.replace(/icon:\s*'📍'/, "icon: '🔒'")
    // Append hint if not already present
    if (!/hint:/.test(rewritten)) {
      rewritten = rewritten.replace(
        /(route:\s*'[^']+')/,
        `$1, hint: 'отключва се след завършване на Ден ${currentDay}'`
      )
    }
    return `{${rewritten.startsWith('{') ? rewritten.slice(1) : rewritten}}`
  })

  if (next !== src && fileFixes > 0) {
    writeFileSync(path, next)
    summary.push(`  ${file}: ${fileFixes} fix`)
    totalFixes += fileFixes
  }
}

console.log(`Navigation status fix: ${totalFixes} entries across ${summary.length} files`)
for (const line of summary) console.log(line)
