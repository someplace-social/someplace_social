import type { Metadata } from 'next';
import './globals.css';
import GoogleAnalytics from './components/GoogleAnalytics';
import { Analytics } from '@vercel/analytics/react';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.someplacesocial.org'),
  title: {
    default: 'Someplace Social | Community Event Listings',
    template: '%s | Someplace Social',
  },
  description:
    'Community supported events, group activities, and weekly classes all in one place. Find traveler friendly language exchanges, free salsa classes, and more.',
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;700;800&family=Karla:ital,wght@0,400;0,500;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-NSETWN0K9W'} />
        <Analytics />
      </body>
    </html>
  );
}