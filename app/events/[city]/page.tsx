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
  return {
    title: `${city.name} this week · Someplace Social`,
    description: `Weekly events, classes, and activities in ${city.heroLocation}.`,
    robots: {
      index: false,
      follow: false,
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
  const allSlugs = getAllCitySlugs();
  const countEntries = await Promise.all(
    allSlugs.map(async (slug) => {
      const c = getCityBySlug(slug);
      if (!c) return [slug, 0] as const;
      if (c.slug === city.slug) return [slug, events.length] as const;
      const otherEvents = await getEvents(c);
      return [slug, otherEvents.length] as const;
    })
  );

  const cityCounts = Object.fromEntries(countEntries);

  return (
    <CityEventsView
      city={city}
      initialEvents={events}
      initialCityCounts={cityCounts}
    />
  );
}