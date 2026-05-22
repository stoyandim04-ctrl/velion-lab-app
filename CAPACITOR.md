# Velion Lab — Native build (Capacitor)

Това приложение е web app, увит в Capacitor → iOS + Android native проекти.

## App Info
- **App ID:** `bg.velion.lab`
- **App Name:** Velion Lab
- **Web build dir:** `dist/`
- **iOS source:** `ios/`
- **Android source:** `android/`

## Workflow

### Локално разработване (Windows / Mac / Linux)
```bash
npm run dev          # vite dev сървър на localhost:5173
```

### Build на web bundle и sync към native
```bash
npm run build        # Vite production build → dist/
npx cap sync         # копира dist/ в ios/App/App/public/ и android/app/src/main/assets/public/
```
или комбинирано:
```bash
npm run ios:build    # build + sync ios
npm run android:build
```

## iOS (изисква Mac + Xcode)

### 1. Първоначална setup
```bash
cd ios/App
pod install
cd ../..
```

### 2. Отвори в Xcode
```bash
npm run cap:ios
# еквивалент на: npx cap sync ios && npx cap open ios
```

### 3. В Xcode
1. Избери Apple Developer Team в **Signing & Capabilities**
2. Промени **Bundle Identifier** ако `bg.velion.lab` е зает в App Store Connect
3. Натисни **Product → Archive** за release build
4. След archive: **Distribute App → App Store Connect**

### 4. App Store Connect
- Качи build-а
- Попълни metadata, screenshots, описание
- Изпрати за review

## Android (Mac / Windows / Linux с Android Studio)

### 1. Отвори в Android Studio
```bash
npm run cap:android
```

### 2. В Android Studio
1. **Build → Generate Signed Bundle / APK**
2. Избери **Android App Bundle (.aab)**
3. Създай keystore (запази паролата сигурно!)
4. Качи .aab в Google Play Console

## След промяна в кода
Винаги изпълнявай:
```bash
npm run build && npx cap sync
```
След това отвори в Xcode/Android Studio и build-ни release.

## Stripe в native app — Reader Mode (по подразбиране)

Velion Lab е конфигуриран като **"Reader App"** според Apple guideline 3.1.3(d).
В native build (iOS / Android):

- Цените и checkout-ът са СКРИТИ в приложението
- PaywallScreen показва обяснение + един бутон **"АКТИВИРАЙ В БРАУЗЕР"**
- ProfileDrawer SubscriptionCard показва **"Управлявай в браузер"**
- Бутоните водят към `https://velion-lab.vercel.app/paywall` чрез Capacitor Browser
- User се регистрира и плаща на сайта (Stripe)
- Връща се в native app чрез Universal Link / App Link → /success → /dashboard
- Apple НЕ получава 30% / 15% комисионна

Конфигурацията се управлява от `src/lib/config.js`:
```js
export const READER_MODE = isNative() // true на iOS/Android, false на web
```

Ако решиш да преминеш на **Apple IAP** в бъдеще:
1. Промени `READER_MODE` на `false` в `src/lib/config.js`
2. Имплементирай `@capacitor-community/in-app-purchases` plugin
3. Свържи Apple IAP product IDs със Supabase subscriptions

## Universal Links / App Links

Готови са (Wave 3c). За да заработят production:
- iOS: замени `TEAMID` в `ios/App/App/App.entitlements` и `public/.well-known/apple-app-site-association` с реалния Team ID
- Android: замени `REPLACE_WITH_RELEASE_KEYSTORE_SHA256` в `public/.well-known/assetlinks.json` с SHA-256 на release keystore

## Apple App Store изисквания checklist
- [x] Account Deletion бутон в app-а (ProfileDrawer)
- [x] Privacy Policy URL (https://velion-lab.vercel.app/privacy)
- [x] Terms of Use URL (https://velion-lab.vercel.app/terms)
- [x] Restore Purchases бутон (ProfileDrawer)
- [x] Reader Mode (без in-app цени)
- [x] Universal Links (AASA + entitlements готови)
- [x] Wellness-positioned съдържание (без sensitive термини)
- [x] ErrorBoundary за crash resilience
- [ ] App icon 1024x1024 PNG (заместване на default Capacitor лого)
- [ ] App preview screenshots 6.5"/5.5" iPhone
- [ ] Apple Developer Account ($99/yr)
- [ ] Реален Team ID в AASA + entitlements
- [ ] Founder photo (`public/founder/portrait.webp`)
- [ ] 3-5 verified testimonials
