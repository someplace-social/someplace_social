import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCityBySlug, getAllCitySlugs } from '../../lib/cities';
import { getEvents } from '../../lib/google-sheets';
import CityEventsView from '../CityEventsView';

export const revalidate = 3600;

type PageProps = {
  params: Promise<{ city: string }>;
};

export async function generateStaticParams() {
  return getAllCitySlugs().map((city) => ({ city }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = getCityBySlug(citySlug);
  if (!city) {
    return {
      title: 'City Not Found · Someplace Social',
      robots: { index: false, follow: false },
    };
  }
  const title = `${city.name} Events & Activities This Week`;
  const description = `Weekly community events, classes, and social activities in ${city.heroLocation}. Free and affordable group gatherings.`;
  return {
    title,
    description,
    alternates: {
      canonical: `/events/${city.slug}`,
    },
    openGraph: {
      title: `${title} | Someplace Social`,
      description,
      url: `/events/${city.slug}`,
      siteName: 'Someplace Social',
      type: 'website',
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

export default async function CityEventsPage({ params }: PageProps) {
  const { city: citySlug } = await params;
  const city = getCityBySlug(citySlug);
  if (!city) {
    notFound();
  }

  const events = await getEvents(city);

  return (
    <CityEventsView
      city={city}
      initialEvents={events}
    />
  );
}