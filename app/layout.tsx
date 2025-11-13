import type { Metadata } from 'next'
import { Karla } from 'next/font/google'
import './globals.css'
import Header from './components/Header'
import Footer from './components/Footer'

const karla = Karla({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Someplace Social',
  description: 'Community supported events, group activities, and weekly classes all in one place.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={karla.className}>
        <div style={{ backgroundColor: '#fffbee' }}> {/* This is the new content container */}
          <Header />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  )
}