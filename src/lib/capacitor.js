// Capacitor runtime helpers. Safe to import in pure web builds — every
// import is dynamic and behind an isNative() guard, so the web bundle stays
// unchanged when running in the browser.

import { Capacitor } from '@capacitor/core'

export function isNative() {
  return Capacitor.isNativePlatform()
}

export function getPlatform() {
  return Capacitor.getPlatform() // 'ios' | 'android' | 'web'
}

export async function configureStatusBar() {
  if (!isNative()) return
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar')
    await StatusBar.setStyle({ style: Style.Dark })
    if (getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: '#060D0A' })
    }
    await StatusBar.setOverlaysWebView({ overlay: false })
  } catch (err) {
    console.warn('[Capacitor] status bar setup failed:', err?.message)
  }
}

export async function hideSplash() {
  if (!isNative()) return
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen')
    await SplashScreen.hide()
  } catch (err) {
    console.warn('[Capacitor] splash hide failed:', err?.message)
  }
}

// Wire the Android hardware back button + iOS swipe-back semantics.
// If a callback is provided, it runs on each back gesture and decides
// whether to navigate back or exit the app.
export async function registerBackButton(onBack) {
  if (!isNative()) return () => {}
  try {
    const { App } = await import('@capacitor/app')
    const handle = await App.addListener('backButton', ({ canGoBack }) => {
      if (onBack) onBack({ canGoBack })
    })
    return () => handle.remove()
  } catch (err) {
    console.warn('[Capacitor] back button setup failed:', err?.message)
    return () => {}
  }
}

// Open a URL in the in-app browser (Safari View Controller on iOS,
// Chrome Custom Tabs on Android). Used for Stripe Checkout so the user
// returns to the app via universal/app links instead of losing context.
export async function openExternalUrl(url) {
  if (!url) return
  if (!isNative()) {
    window.location.href = url
    return
  }
  try {
    const { Browser } = await import('@capacitor/browser')
    await Browser.open({ url, presentationStyle: 'popover' })
  } catch (err) {
    console.warn('[Capacitor] browser open failed:', err?.message)
    window.location.href = url
  }
}
