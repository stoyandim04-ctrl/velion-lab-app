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

## Stripe в native app
Когато Stripe checkout се отваря, Capacitor Browser plugin отваря Safari View Controller (iOS) или Chrome Custom Tabs (Android). За да върнем user-а в app-а след checkout трябва **Universal Links** (iOS) / **App Links** (Android):

- iOS: добави Associated Domains capability с `applinks:velion-lab.vercel.app`
- Android: добави intent-filter за HTTPS schema към `velion-lab.vercel.app`
- На сайта: добави `/.well-known/apple-app-site-association` JSON

(тази стъпка я правим преди App Store submit, не сега)

## Apple App Store изисквания checklist
- [x] Account Deletion бутон в app-а (готов — ProfileDrawer)
- [x] Privacy Policy URL (https://velion-lab.vercel.app/privacy)
- [x] Terms of Use URL (https://velion-lab.vercel.app/terms)
- [x] Restore Purchases бутон (готов — ProfileDrawer)
- [ ] App icon 1024x1024 PNG
- [ ] App preview screenshots 6.5"/5.5"
- [ ] Apple Developer Account ($99/yr)
- [ ] Решение: IAP vs Reader app
- [ ] Universal Links setup
