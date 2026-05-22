// Velion Lab runtime configuration.
//
// Reader Mode (Apple App Store guideline 3.1.3d, post-June 2022):
//   "Reader Apps" — apps whose primary purpose is to access previously
//   purchased content — are allowed to have a single external link to
//   account management without using Apple IAP. By enabling Reader Mode
//   in the native build, the app:
//     - Hides all in-app pricing
//     - Hides "ПРОДЪЛЖИ КЪМ ПЛАЩАНЕ" CTA
//     - Replaces it with a single link to https://velion-lab.vercel.app/paywall
//     - User signs up + pays on the website (Stripe) and returns via
//       Universal Link or sign-in
//
// This sidesteps Apple's 30% / 15% commission entirely.
//
// The web build always runs with READER_MODE = false (full checkout in-app).

import { isNative } from './capacitor.js'

// Default: native builds = Reader Mode ON. Flip this to false if you decide
// to integrate Apple In-App Purchase instead.
export const READER_MODE = isNative()

export const EXTERNAL_BILLING_URL = 'https://velion-lab.vercel.app/paywall'
export const EXTERNAL_ACCOUNT_URL = 'https://velion-lab.vercel.app/auth'
