import type { Metadata } from 'next'
import { Karla } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import Header from './components/Header'
import Footer from './components/Footer'

const karla = Karla({ subsets: ['latin'] })

// This pulls the ID from your Vercel Environment Variable, 
// or falls back to the hardcoded one if the variable is missing.
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-NSETWN0K9W'

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

        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
      </body>
    </html>
  )
}