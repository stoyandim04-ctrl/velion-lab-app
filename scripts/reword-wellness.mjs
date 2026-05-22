#!/usr/bin/env node
// One-off wellness rewording for App Store sensitive-content safety.
// Run from repo root: node scripts/reword-wellness.mjs

import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const DAY_DIR = 'src/data'

// Order matters: longer phrases first to avoid partial overlaps.
const REPLACEMENTS = [
  // Multi-word phrases first
  ['бърза еякулация', 'бързо освобождаване'],
  ['Бърза еякулация', 'Бързо освобождаване'],
  ['БЪРЗА ЕЯКУЛАЦИЯ', 'БЪРЗО ОСВОБОЖДАВАНЕ'],
  ['реален секс', 'реална близост'],
  ['реалния секс', 'реалната близост'],
  ['по време на секс', 'по време на близост'],
  ['преди секс', 'преди интимен момент'],
  ['добре изграден секс', 'дълбока близост'],
  ['оценяват секса си', 'оценяват близостта си'],
  ['оценяват секса', 'оценяват близостта'],
  ['сексът става', 'близостта става'],
  ['след секса', 'след близостта'],

  // Definite forms of "секс"
  ['секса', 'близостта'],
  ['сексът', 'близостта'],

  // "порно" family — neutral wellness term
  ['порното', 'стимулативните медии'],
  ['Порното', 'Стимулативните медии'],
  ['порно', 'стимулативни медии'],
  ['Порно', 'Стимулативни медии'],
  ['ПОРНО', 'СТИМУЛАТИВНИ МЕДИИ'],

  // "еякулация" — physiological language
  ['еякулация', 'освобождаване'],
  ['Еякулация', 'Освобождаване'],
  ['ЕЯКУЛАЦИЯ', 'ОСВОБОЖДАВАНЕ'],

  // "оргазъм"
  ['оргазма', 'пика'],
  ['оргазъма', 'пика'],
  ['оргазъм', 'пик'],
  ['Оргазъм', 'Пик'],
  ['ОРГАЗЪМ', 'ПИК'],

  // "ерекция"
  ['ерекцията', 'физическата реакция'],
  ['ерекция', 'физическа реакция'],
  ['Ерекция', 'Физическа реакция'],
  ['ЕРЕКЦИЯ', 'ФИЗИЧЕСКА РЕАКЦИЯ'],

  // "пенис"
  ['пениса', 'тялото'],
  ['пенис', 'тялото'],
  ['Пенис', 'Тялото'],

  // "сексуален / сексуална / сексуално / сексуални"
  ['сексуалната', 'интимната'],
  ['сексуалния', 'интимния'],
  ['сексуални', 'интимни'],
  ['сексуално', 'интимно'],
  ['сексуална', 'интимна'],
  ['сексуален', 'интимен'],
  ['Сексуални', 'Интимни'],
  ['Сексуално', 'Интимно'],
  ['Сексуална', 'Интимна'],
  ['Сексуален', 'Интимен'],

  // Bare "секс"
  ['секс,', 'близост,'],
  ['секс.', 'близост.'],
  ['секс!', 'близост!'],
  ['секс?', 'близост?'],
  ['секс ', 'близост '],
  [' секс\n', ' близост\n'],
  ['Секс ', 'Близост '],
  ['Секс,', 'Близост,'],
  ['Секс.', 'Близост.']
]

const files = readdirSync(DAY_DIR).filter((f) => /^day\d+\.js$/.test(f))

let totalReplacements = 0
const summary = []

for (const file of files) {
  const path = join(DAY_DIR, file)
  const original = readFileSync(path, 'utf8')
  let text = original
  let fileReplacements = 0

  for (const [from, to] of REPLACEMENTS) {
    if (from === to) continue
    const parts = text.split(from)
    if (parts.length > 1) {
      fileReplacements += parts.length - 1
      text = parts.join(to)
    }
  }

  if (text !== original) {
    writeFileSync(path, text)
    summary.push(`  ${file}: ${fileReplacements} replacements`)
    totalReplacements += fileReplacements
  }
}

console.log(`Wellness rewording pass 2: ${totalReplacements} total replacements across ${summary.length} files`)
for (const line of summary) console.log(line)
