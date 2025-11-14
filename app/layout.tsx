import type { Metadata } from 'next'
import { Karla } from 'next/font/google'
import './globals.css'
import Header from './components/Header'
import Footer from './components/Footer'

const karla = Karla({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://www.someplacesocial.org'), // Set your production URL here
  title: {
    default: 'Someplace Social | Community Event Listings',
    template: '%s | Someplace Social',
  },
  description: 'Community supported events, group activities, and weekly classes all in one place. Find traveler friendly language exchanges, free salsa classes, and more.',
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
    </html>
  )
}