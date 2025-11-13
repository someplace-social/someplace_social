import type { Metadata } from 'next'
import './globals.css'

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
      <body>{children}</body>
    </html>
  )
}