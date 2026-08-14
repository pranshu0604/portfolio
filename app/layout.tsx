import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Chakra_Petch, Geist_Mono } from 'next/font/google'
import './globals.css'

const display = localFont({
  variable: '--font-display',
  display: 'swap',
  src: [
    { path: './fonts/ClashDisplay-Semibold.woff2', weight: '600', style: 'normal' },
    { path: './fonts/ClashDisplay-Bold.woff2', weight: '700', style: 'normal' },
  ],
})

const sans = localFont({
  variable: '--font-sans',
  display: 'swap',
  src: [
    { path: './fonts/GeneralSans-Regular.woff2', weight: '400', style: 'normal' },
    { path: './fonts/GeneralSans-Medium.woff2', weight: '500', style: 'normal' },
    { path: './fonts/GeneralSans-Semibold.woff2', weight: '600', style: 'normal' },
  ],
})

// per-project display faces: EI-LMS → Chakra Petch, P.R.A.N. → Geist Mono
const chakra = Chakra_Petch({
  variable: '--font-chakra',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'], display: 'swap' })

/**
 * Resolve the canonical origin without hardcoding it: set NEXT_PUBLIC_SITE_URL
 * once a custom domain exists, otherwise Vercel supplies its own production URL,
 * and local dev falls back to localhost.
 */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000')

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Pranshu Pandey — Software Engineer',
  description:
    'Software engineer working across trading infrastructure and production systems that real people depend on. Currently building at Invsto.',
  openGraph: {
    title: 'Pranshu Pandey — Software Engineer',
    description: 'Systems built to hold up under load. Currently building at Invsto.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="base">
      <body
        className={`${display.variable} ${sans.variable} ${chakra.variable} ${geistMono.variable}`}
      >
        {children}
      </body>
    </html>
  )
}
