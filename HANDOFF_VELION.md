# Velion Lab — Handoff към Codex

**Дата:** 2026-05-22
**Production URL:** https://velion-lab.vercel.app
**GitHub:** https://github.com/stoyandim04-ctrl/velion-lab-app (main)
**Local cwd:** `C:\Users\HP\velion-lab`
**Последен commit:** `3be9f0b` — Add Days 41-45

---

## 1. Докъде стигнахме

### Интегрирани дни в сайта: **1-45 от 60**

| Модул | Дни | Status |
|---|---|---|
| I — Основи | 1-7 | done |
| II — Тяло | 8-14 | done |
| III — Контрол | 15-21 | done |
| IV — Сексуален фундамент | 22-28 | done |
| V — Психология на представянето | 29-35 | done (35 = end-of-week badge) |
| VI — Партньорство и интимност | 36-42 | done (42 = end-of-week badge) |
| VII — Привличане и мъжко присъствие | 43-45 | в процес (15 дни остават) |
| VIII+ | 46-60 | НЕ започнато |

Всичките 45 дни:
- имат `day{N}.js` файл в `src/data/`
- регистрирани са в `DAYS` map в `src/data/days.js`
- включени са в `ALWAYS_UNLOCKED_DAYS` (не изискват предходен ден да е завършен)
- имат експлицитни `<Route path="/course/day-N">` в `src/App.jsx`
- имат `hero.png`, `lesson.png`, `exercise.png` в `public/course/day-N/`

### Какво работи (тествано):
- Auth flow (Supabase email + password, email confirmation handled)
- Per-user data isolation (localStorage scoped с `velion_*_${userId}`)
- Dashboard списък с дни + ProfileDrawer
- DayScreen отваря всеки от 45-те дни
- Tracker checkboxes + journal — записват се в localStorage + sync към Supabase `user_progress`
- markDayCompleted → отключва следващ ден + ъпдейт в Supabase
- ProtectedRoute блокира неаутентифицирани към `/auth`
- Cinematic intro video + fallback overlay
- Production deploy през `vercel --prod`
- Vercel auto-deploy от GitHub main също работи

### Какво НЕ е довършено:
- **Дни 46-60** — съдържанието съществува в Notion (parent: "Velion курс · Дни (самостоятелни страници)"), но НЕ е извлечено и НЕ е интегрирано
- **Day 1-25 image folders** — имат стара структура (`lesson.png`, `exercise.png`, `tomorrow.png`, понякога `logo.png`). Дни 26+ използват новата консистентна структура (`hero.png`, `lesson.png`, `exercise.png`). Това не чупи нищо, защото всеки `day{N}.js` сочи към собствените си image paths
- **Build warning** — main bundle е 752 KB (gzip 230 KB). Не блокира продукция, но Codex може да split-не с `manualChunks` ако пожелае
- **CRLF warnings** при `git add` — Windows line endings. Безвредни

### Грешки / проблеми към момента:
- Няма известни runtime грешки
- Няма счупени изображения
- Няма липсващи assets за дни 1-45
- Routing работи за всички 45 дни

---

## 2. Файлове променяни за дни 26-45 (последните 5 сесии)

### Винаги при добавяне на нов ден:
1. `src/data/day{N}.js` — new file (data model на деня)
2. `src/data/days.js` — добавя import + entry в `DAYS` map + extend `ALWAYS_UNLOCKED_DAYS`
3. `src/lib/courseProgress.js` — extend `ALWAYS_UNLOCKED` Set (същия списък като `days.js`)
4. `src/App.jsx` — добавя `<Route path="/course/day-N" element={protectedDay} />`
5. `public/course/day-N/{hero,lesson,exercise}.png` — 3 cinematic images

**ВАЖНО — двата `ALWAYS_UNLOCKED` Set-а в `days.js` и `courseProgress.js` ТРЯБВА да остават синхронизирани.** Това е дублиране, което Codex може да рефакторира на по-късен етап.

---

## 3. Структура на app-а

### Tech stack
- Vite 5 + React 18 + react-router-dom v6.28
- Tailwind 3.4 + Framer Motion 11
- Supabase JS v2 (auth + Postgres + RLS)
- Stripe (за paywall, не е свързан с автоматично unlock-ване)

### Откъде се зареждат дните
- `src/data/days.js` е централният регистър:
  - `DAYS` — обект, ключ `dayNumber` → данни
  - `ALWAYS_UNLOCKED_DAYS` — Set от достъпни дни (паралелно с `courseProgress.js`)
  - `getDayData(n)`, `getDayRoute(n)`, `getNextDayRoute(n)` — хелпъри
- `src/data/course.js` — генерира dashboard списъка (60 дни total) + module metadata
- `src/data/day{N}.js` — структура: `{ module, tags, duration, title, dayNumber, theme, lesson, fact, exercise, dailyTask, journal, tracker, victory, tomorrow, navigation, isIntegration? }`

### Как се отваря отделен ден
- `App.jsx` има експлицитен route за всеки от дни 1-45: `/course/day-N` → `<ProtectedRoute><DayScreen /></ProtectedRoute>`
- Fallback `<Route path={ROUTES.day} element={protectedDay} />` хваща другите чрез `:day` param
- `DayScreen.jsx`:
  1. Парсва `dayNumber` от `useParams().day` или от path `/course/day-(\d+)/`
  2. `getDayData(n)` — ако няма данни, показва "Ден N още не е готов"
  3. `isDayUnlocked(userId, n)` — ако не е отключен и не е в `ALWAYS_UNLOCKED`, показва "заключен"
  4. Зарежда `getDayProgress(userId, n)` от localStorage
  5. Render-ва секциите чрез компонентите в `src/components/features/course/`

### Progress / completion / journal
- `src/lib/courseProgress.js` — primary API (localStorage):
  - `getDayProgress(userId, day)` → `{ tracker, journal, completed }`
  - `setTrackerItem(userId, day, itemId, value)`
  - `setJournal(userId, day, text)`
  - `markDayCompleted(userId, day)` — записва `completed: true` + timestamp
  - `isDayUnlocked(userId, day)` — `true` ако ден 1, в `ALWAYS_UNLOCKED`, или предходен е completed
  - `replaceAllProgress(userId, state)` / `clearProgress(userId)`
- `src/lib/progressSync.js` — Supabase ↔ localStorage sync:
  - `fetchRemoteProgress(userId)` — SELECT `user_progress` filtered by `user_id`
  - `pullToLocal(userId)` — Supabase → localStorage (overwrite, не merge)
  - `pushFromLocal(userId)` — localStorage → Supabase upsert
  - `syncDayCompletion(userId, day)` — local + push
  - `syncLastOpened(userId, day)` — upsert `last_opened_day`
- **Storage keys (P0 security)** — ВСИЧКО per-user:
  - `velion_course_progress_${userId}`
  - `velion_profile_${userId}`
- Supabase tables (вече създадени с RLS):
  - `profiles` (id, display_name, avatar_url)
  - `user_progress` (user_id PK, current_day, completed_days int[], completed_lessons jsonb, last_opened_day, streak_count, last_active_at, updated_at)
  - RLS policies: SELECT/INSERT/UPDATE с `auth.uid() = id/user_id`
  - Trigger `handle_new_user` auto-създава profile + user_progress при signup

---

## 4. Следващи задачи за Codex (точен ред)

### Приоритет 1: Дни 46-60 (15 дни остават)
Workflow за всеки batch от 5-7 дни:

1. **Извличане от Notion.** Parent page: "Velion курс · Дни (самостоятелни страници)" (URL: `https://www.notion.so/726a99d0be6349a8a5140e16b7876e0a`). Всеки ден има индивидуална страница с Build Pack най-долу (JSON с `imageSlots` + `prompt` полета).
2. **Генериране на изображения.** За всеки image slot с `url: null` използвай:
   ```bash
   higgsfield generate create cinematic_studio_2_5 \
     --prompt "{from Notion Build Pack}" \
     --aspect_ratio 9:16 \
     --wait
   ```
   Дисперсирай в batch-ове макс 8 паралелно (Higgsfield concurrent limit).
3. **Сваляне.** `curl -sL -o /c/Users/HP/velion-lab/public/course/day-N/{hero,lesson,exercise}.png "{cloudfront_url}"`
4. **Data file.** Виж `src/data/day41.js`-`day45.js` като референция за структурата. `isIntegration: true` + `victory.badge` за дни на интеграция (всеки 7-ми ден — 49, 56). `tomorrow.moduleStart` при смяна на модул.
5. **Регистрация.** Update в 3 файла:
   - `src/data/days.js` — import + DAYS entry + `ALWAYS_UNLOCKED_DAYS`
   - `src/lib/courseProgress.js` — `ALWAYS_UNLOCKED`
   - `src/App.jsx` — `<Route path="/course/day-N" element={protectedDay} />`
6. **Build + push + prod deploy:**
   ```bash
   npx vite build
   git add -A && git commit -m "Add Days X-Y — {short title}"
   git push origin main
   npx vercel --prod
   ```

### Приоритет 2: Day 60 final / completion screen
60-тият ден е финалът на курса. Може да има специален victory screen / certificate / "share" CTA. Обсъди с user преди да го имплементираш — не пипай без указание.

### Приоритет 3 (по преценка на user, не сега):
- Code splitting за main bundle (752 KB → split с `manualChunks`)
- Refactor дублирания `ALWAYS_UNLOCKED` Set между `days.js` и `courseProgress.js`
- Streak counter UI (полето `streak_count` съществува в Supabase, но не се показва)
- Stripe paywall actual gating (в момента `ALWAYS_UNLOCKED` overrides paywall — намерение след курса е готов)

---

## 5. Команди

### Локално стартиране (Codex проверка):
```bash
cd C:\Users\HP\velion-lab
npm install        # ако node_modules липсва
npm run dev        # vite dev server
```
URL по подразбиране: **http://localhost:5173** (или следващ свободен порт ако зает).

**Финална проверка от тази сесия (2026-05-22):** `npx vite --port 5180` стартира успешно, ready в ~1.1s.

### Build:
```bash
npx vite build     # output: dist/
npx vite preview   # serve dist локално на :4173
```

### Deploy (prod):
```bash
git add -A
git commit -m "..."
git push origin main           # GitHub auto-trigger Vercel (понякога не сработва)
npx vercel --prod              # ръчен production deploy + auto-alias към velion-lab.vercel.app
```

### Verify prod deploy:
```bash
npx vercel inspect velion-lab.vercel.app
```

### Environment (.env.local):
Файлът съществува и е gitignored. Съдържа 5 `VITE_*` променливи:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- (+ Stripe public + 2 други)

Същите променливи са set-нати в Vercel Project Settings. **Не пипай и не комитай `.env.local`.**

---

## 6. Notion структура + image generation

### Notion build packs
Всяка ден-страница има секция **"💻 Build Pack за Claude Code"** в края, която съдържа JSON като:
```json
{
  "id": "day_N",
  "route": "/course/day-N",
  "title": "...",
  "module": "...",
  "durationMinutes": 13,
  "components": ["DayHero", "..."],
  "imageSlots": [
    {
      "key": "dayN-hero-9x16",
      "placement": "Hero screen",
      "url": null,
      "prompt": "Premium 9:16 mobile app hero...",
      "alt": "..."
    },
    ...
  ]
}
```

**Правила за prompts** (потвърдени от user):
- Model: `cinematic_studio_2_5`
- Aspect ratio: `9:16` (vertical mobile)
- Палитра: black `#0A0A0A`, deep forest green `#0F1E18`, amber-orange `#FF6A00`
- Винаги: "no text, no logo, no nudity"
- Mood: cinematic, masculine wellness, premium dark

### Notion MCP tools
- `mcp__notion__notion-fetch` с URL → връща page content като Markdown с XML обвивка
- Build Pack JSON-ът е винаги в `<details>` block в края на page-а

### Higgsfield CLI
- Path: `higgsfield` (в `$PATH`)
- Concurrency limit: **8 паралелни jobs** (повече → `rate_limit_reached`)
- Background output: `C:\Users\HP\AppData\Local\Temp\claude\C--Users-HP\b5be551b-7465-47c0-ad24-f557d61c1707\tasks\{id}.output`
- URL pattern в output: `https://d8j0ntlcm91z4.cloudfront.net/user_3Do7uWUseGZg57LexLmh3PopubW/hf_*.png`

---

## 7. Critical user preferences (не пипай)

- **Дизайн** — НЕ променяй съществуващи компоненти, цветове, типография, layout. Само добавяй нови дни.
- **Език** — Reply-вай на български. Course copy е изцяло на български. Технически identifier-и (component names, props, routes) остават на английски.
- **Autonomy** — User предпочита пълни multi-step plans изпълнени без mid-task confirmation. Освен ако:
  - Действието е destructive / hard to reverse
  - Действието засяга нещо извън кода (production deploy, force push, и т.н.)
- **Per-user isolation е P0.** Всеки storage key трябва да включва `${userId}`. Всеки Supabase query трябва да включва `.eq('user_id', user.id)`. Не пиши код, който вади global state.
- **Email confirmation** — `AuthScreen` показва "Провери имейла си..." когато `signUp` връща `session: null`.

---

## 8. Текущо състояние (последна верификация)

- `git status`: clean (всичко committed + pushed)
- `git log -1`: `3be9f0b Add Days 41-45 ...`
- Dev server: стартира успешно на :5180 (тествано 2026-05-22 02:55 локално)
- Production: ✅ Ready на velion-lab.vercel.app
- Brand assets day 1-45: всички 3 image-а налични
- Build: passes (~17s, 752 KB main bundle, 1 chunk warning безвреден)

Готов за продължение.
