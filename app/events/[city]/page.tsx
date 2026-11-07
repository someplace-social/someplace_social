import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCityBySlug, getAllCitySlugs } from '../../lib/cities';
import CityEventsView from '../CityEventsView';

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
  return <CityEventsView city={city} />;
}