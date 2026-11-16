import { Suspense } from 'react';
import { notFound, permanentRedirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllCitySlugs, getCityBySlug } from '../../lib/cities';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ContactView from '../../contact/ContactView';

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
  const title = `Contact Us — ${city.name}`;
  const description = `Submit a new regularly occurring event in ${city.heroLocation} or ask us a question.`;
  const canonicalPath = `/${city.slug}/contact`;
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
      locale: 'en_US',
      type: 'website',
    },
  };
}

export default async function CityContactPage({ params }: PageProps) {
  const { city: citySlug } = await params;
  const city = getCityBySlug(citySlug);
  if (!city) {
    notFound();
  }
  if (city.slug !== citySlug) {
    permanentRedirect(`/${city.slug}/contact`);
  }
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header city={city} />
      <Suspense fallback={null}>
        <ContactView city={city} />
      </Suspense>
      <Footer city={city} />
    </div>
  );
}