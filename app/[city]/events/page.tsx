import { notFound, permanentRedirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getCityBySlug, getAllCitySlugs, SITE_URL } from '../../lib/cities';
import { getEvents, getLastUpdated } from '../../lib/google-sheets';
import CityEventsView from '../../events/CityEventsView';

export const revalidate = 60;

type PageProps = {
  params: Promise<{ city: string }>;
  searchParams?: Promise<{ tab?: string }>;
};

export async function generateStaticParams() {
  return getAllCitySlugs().map((city) => ({ city }));
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { city: citySlug } = await params;
  const sParams = searchParams ? await searchParams : undefined;
  const isAllTab = sParams?.tab === 'all';
  const city = getCityBySlug(citySlug);
  if (!city) {
    return {
      title: 'City Not Found',
      robots: { index: false, follow: false },
    };
  }
  const title = isAllTab
    ? `All ${city.name} Events & Activities · Full Directory`
    : `${city.name} Events & Activities This Week`;
  const description = isAllTab
    ? `Complete directory of all weekly community events, recurring meetups, classes, and social gatherings in ${city.heroLocation}.`
    : `Weekly community events, classes, and social activities in ${city.heroLocation}. Free and affordable group gatherings.`;
  const canonicalPath = isAllTab
    ? `/${city.slug}/events?tab=all`
    : `/${city.slug}/events`;
  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: `${title} | Someplace Social`,
      description,
      url: canonicalPath,
      siteName: 'Someplace Social',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Someplace Social`,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  };
}

export default async function CityEventsPage({ params, searchParams }: PageProps) {
  const { city: citySlug } = await params;
  const sParams = searchParams ? await searchParams : undefined;
  const city = getCityBySlug(citySlug);
  if (!city) {
    notFound();
  }
  if (city.slug !== citySlug) {
    permanentRedirect(`/${city.slug}/events`);
  }
  const [events, lastUpdated] = await Promise.all([
    getEvents(city),
    getLastUpdated(city),
  ]);

  const breadcrumbsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: `${city.name} Events`,
        item: `${SITE_URL}/${city.slug}/events`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbsJsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <CityEventsView
        city={city}
        initialEvents={events}
        lastUpdated={lastUpdated}
        initialTab={sParams?.tab === 'all' ? 'all' : undefined}
      />
    </>
  );
}