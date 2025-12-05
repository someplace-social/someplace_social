import type { Metadata } from 'next'
import { Karla } from 'next/font/google'
import './globals.css'
import Header from './components/Header'
import Footer from './components/Footer'
import GoogleAnalytics from './components/GoogleAnalytics'
// 1. IMPORT VERCEL ANALYTICS
import { Analytics } from "@vercel/analytics/react"

const karla = Karla({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://www.someplacesocial.org'),
  title: {
    default: 'Someplace Social | Community Event Listings',
    template: '%s | Someplace Social',
  },
  description: 'Community supported events, group activities, and weekly classes all in one place. Find traveler friendly language exchanges, free salsa classes, and more.',
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={karla.className}>
        <div style={{ backgroundColor: '#fffbee' }}>
          <Header />
          {children}
          <Footer />
        </div>
        
        {/* Google Analytics (Keep this if you want) */}
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-NSETWN0K9W'} />

        {/* 2. ADD VERCEL ANALYTICS HERE */}
        <Analytics />
      </body>
    </html>
  )
}