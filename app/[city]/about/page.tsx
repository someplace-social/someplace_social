import { notFound, permanentRedirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllCitySlugs, getCityBySlug } from '../../lib/cities';
import AboutView from '../../components/AboutView';

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
      title: 'City Not Found',
      robots: { index: false, follow: false },
    };
  }
  return {
    title: `About — ${city.name}`,
    description: `Learn about Someplace Social and community event listings in ${city.heroLocation}.`,
    alternates: {
      canonical: '/about',
    },
    openGraph: {
      title: `About — ${city.name} | Someplace Social`,
      description: `Learn about Someplace Social and community event listings in ${city.heroLocation}.`,
      url: `/${city.slug}/about`,
      siteName: 'Someplace Social',
      locale: 'en_US',
      type: 'website',
    },
  };
}

export default async function CityAboutPage({ params }: PageProps) {
  const { city: citySlug } = await params;
  const city = getCityBySlug(citySlug);
  if (!city) {
    notFound();
  }
  if (city.slug !== citySlug) {
    permanentRedirect(`/${city.slug}/about`);
  }
  return <AboutView city={city} />;
}