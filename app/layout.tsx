import type { Metadata } from 'next';
import { Bricolage_Grotesque, Karla } from 'next/font/google';
import './globals.css';
import GoogleAnalytics from './components/GoogleAnalytics';
import { Analytics } from '@vercel/analytics/react';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['500', '700', '800'],
  variable: '--font-bricolage',
  display: 'swap',
});

const karla = Karla({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-karla',
  display: 'swap',
});

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
    <html lang="en" className={`${bricolage.variable} ${karla.variable}`}>
      <body>
        {children}
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-NSETWN0K9W'} />
        <Analytics />
      </body>
    </html>
  );
}