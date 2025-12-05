import type { Metadata } from 'next'
import { Karla } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google' // <--- 1. Import this
import './globals.css'
import Header from './components/Header'
import Footer from './components/Footer'

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
      </body>
      {/* 2. Add the component here with your ID */}
      <GoogleAnalytics gaId="G-NSETWN0K9W" />
    </html>
  )
}