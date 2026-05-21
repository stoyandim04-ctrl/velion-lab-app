# Velion Lab

Премиум 60-дневна система за мъже — мобилно-първо React приложение.

## Стек
- Vite + React 18
- React Router v6
- Tailwind CSS
- Framer Motion
- Lucide icons

## Локално стартиране
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Структура
- `src/screens/` — главните екрани (Welcome, Dashboard, DayScreen, и т.н.)
- `src/components/` — UI компоненти (layout, ui, features)
- `src/components/features/course/` — компоненти за дневния урок
- `src/data/` — съдържание на курса по дни (`day1.js` … `day25.js`)
- `src/lib/` — helpers (routes, courseProgress, profile)
- `src/state/` — React Context (Onboarding)
- `public/course/day-N/` — изображения за всеки ден
- `public/video/` — intro видео

## Деплой
Auto-deploy към Vercel: `velion-lab.vercel.app`
