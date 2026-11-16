import type { Metadata } from 'next';
import { getAllCities, SITE_URL } from './lib/cities';
import { getEvents } from './lib/google-sheets';
import HomeView from './components/HomeView';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Someplace Social | Regular Things to Do, All in One Place',
  description:
    'Free, ad-free directory of weekly community events, recurring meetups, language exchanges, and social clubs in Medellín, Fort Collins, and beyond.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Someplace Social | Regular Things to Do, All in One Place',
    description:
      'Free, ad-free directory of weekly community events, recurring meetups, language exchanges, and social clubs in Medellín, Fort Collins, and beyond.',
    url: '/',
    siteName: 'Someplace Social',
    locale: 'en_US',
    type: 'website',
  },
};

export default async function Home() {
  const cities = getAllCities();
  const citySummaries = await Promise.all(
    cities.map(async (city) => {
      const events = await getEvents(city, 3600);
      return {
        ...city,
        eventCount: events.length,
      };
    })
  );

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: 'Someplace Social',
        description:
          'Directory of recurring community events, weekly activities, and social clubs.',
        inLanguage: 'en-US',
      },
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: 'Someplace Social',
        url: SITE_URL,
        logo: `${SITE_URL}/icon.png`,
        sameAs: ['https://www.instagram.com/someplace.social/'],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteJsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <HomeView citySummaries={citySummaries} />
    </>
  );
}