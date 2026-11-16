import type { Metadata } from 'next';
import { SITE_URL } from './lib/cities';
import HomeView from './components/HomeView';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Someplace Social | Regular Things To Do Near You',
  description:
    'Free, ad-free guide to recurring local events: language exchanges, trivia, dance classes, run clubs and more in Medellín and Fort Collins.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Someplace Social | Regular Things To Do Near You',
    description:
      'Free, ad-free guide to recurring local events: language exchanges, trivia, dance classes, run clubs and more in Medellín and Fort Collins.',
    url: '/',
    siteName: 'Someplace Social',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Someplace Social | Regular Things To Do Near You',
    description:
      'Free, ad-free guide to recurring local events: language exchanges, trivia, dance classes, run clubs and more in Medellín and Fort Collins.',
  },
};

export default function Home() {
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Someplace Social',
    url: SITE_URL,
    description:
      'Free, ad-free guide to recurring local events: language exchanges, trivia, dance classes, run clubs and more in Medellín and Fort Collins.',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteJsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <HomeView />
    </>
  );
}