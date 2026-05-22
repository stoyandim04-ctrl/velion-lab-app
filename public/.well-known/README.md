# .well-known — Universal Links + App Links

Тези два файла позволяват на native iOS / Android приложението да поема URL-и
към `velion-lab.vercel.app` директно, без да отварят браузер.

Главна полза: когато Stripe Checkout пренасочи user-а към `/success?session_id=...`,
вместо браузер да отвори, native app-ът чете URL-а и отива на success екрана.

## Файлове

### `apple-app-site-association` (iOS Universal Links)
- Без разширение (Apple изисква така)
- Сервира се с `Content-Type: application/json` (виж `vercel.json`)
- Validate с: https://branch.io/resources/aasa-validator/
- **TODO:** Замени `TEAMID` с реалния Apple Developer Team ID след регистрация:
  - Apple Developer → Membership → Team ID (10-знака като `A1B2C3D4E5`)
  - Update в `apple-app-site-association` и в `ios/App/App/App.entitlements`

### `assetlinks.json` (Android App Links)
- Сервира се с `Content-Type: application/json`
- Validate с: https://developers.google.com/digital-asset-links/tools/generator
- **TODO:** Замени `REPLACE_WITH_RELEASE_KEYSTORE_SHA256` с реалния SHA-256
  fingerprint на release keystore-а:
  - След генериране на keystore: `keytool -list -v -keystore my-release.keystore`
  - SHA-256 редът изглежда като `XX:XX:XX:...` (32 hex групи)
  - Може да включиш няколко fingerprints в масива ако имаш и upload key + signing key

## iOS — допълнителни стъпки в Xcode

1. Отвори `ios/App/App.xcworkspace` в Xcode
2. Target App → **Signing & Capabilities**
3. Натисни **+ Capability** → **Associated Domains**
4. Xcode ще линкне `App.entitlements` (вече е създаден ръчно)
5. Build & test: tap link `https://velion-lab.vercel.app/success?session_id=test`
   на физическо устройство → трябва да отвори app-а

## Android — допълнителни стъпки

1. Генерирай release keystore (един път):
   ```
   keytool -genkey -v -keystore velion-release.keystore -alias velion -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Запази паролата сигурно (не commit в git!)
3. Вземи SHA-256: `keytool -list -v -keystore velion-release.keystore`
4. Update `assetlinks.json` с този fingerprint
5. Build signed APK/AAB → App Link verification става автоматично при инсталация

## Тест на deep link-овете

### iOS (Universal Link)
```
xcrun simctl openurl booted "https://velion-lab.vercel.app/success?session_id=test"
```

### Android (App Link)
```
adb shell am start -W -a android.intent.action.VIEW -d "https://velion-lab.vercel.app/success?session_id=test"
```

И двете трябва да отворят native app-а и да навигират на `/success` route.
