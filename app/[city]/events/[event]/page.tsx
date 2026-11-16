import { notFound, permanentRedirect } from 'next/navigation';
import type { Metadata } from 'next';
import {
  SITE_URL,
  getAllCities,
  getCityBySlug,
  getCityTimeZone,
} from '../../../lib/cities';
import { getEvents } from '../../../lib/google-sheets';
import {
  buildEventJsonLd,
  buildEventMetaDescription,
  getEventSlug,
  getNextEventOccurrence,
  resolveEventBySlug,
} from '../../../events/event-helpers';
import EventDetailView from './EventDetailView';

export const revalidate = 3600;

type PageProps = {
  params: Promise<{ city: string; event: string }>;
};

export async function generateStaticParams() {
  const cities = getAllCities();
  const allParams = await Promise.all(
    cities.map(async (city) => {
      const events = await getEvents(city, 3600);
      return events.map((ev) => ({
        city: city.slug,
        event: getEventSlug(ev),
      }));
    })
  );
  return allParams.flat();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city: citySlug, event: eventSlug } = await params;
  const city = getCityBySlug(citySlug);
  if (!city) {
    return {
      title: 'Event Not Found',
      robots: { index: false, follow: false },
    };
  }
  const events = await getEvents(city, 3600);
  const resolved = resolveEventBySlug(events, eventSlug);
  if (!resolved) {
    return {
      title: 'Event Not Found',
      robots: { index: false, follow: false },
    };
  }
  const { event, canonicalSlug } = resolved;
  const pageTitle = `${event.title} — ${city.name} Events`;
  const fullTitle = `${pageTitle} | Someplace Social`;
  const description = buildEventMetaDescription(event, city);
  const canonicalPath = `/${city.slug}/events/${canonicalSlug}`;
  return {
    title: pageTitle,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalPath,
      siteName: 'Someplace Social',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
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

export default async function EventPage({ params }: PageProps) {
  const { city: citySlug, event: eventSlug } = await params;
  const city = getCityBySlug(citySlug);
  if (!city) {
    notFound();
  }
  const events = await getEvents(city, 3600);
  const resolved = resolveEventBySlug(events, eventSlug);
  if (!resolved) {
    notFound();
  }
  if (!resolved.isCanonical || city.slug !== citySlug) {
    permanentRedirect(`/${city.slug}/events/${resolved.canonicalSlug}`);
  }
  const { event, canonicalSlug } = resolved;
  const timeZone = getCityTimeZone(city);
  const nextOccurrence = getNextEventOccurrence(event, timeZone, 90);
  const canonicalUrl = `${SITE_URL}/${city.slug}/events/${canonicalSlug}`;
  const eventJsonLd = buildEventJsonLd(event, city, canonicalUrl, nextOccurrence);

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
      {
        '@type': 'ListItem',
        position: 3,
        name: event.title,
        item: canonicalUrl,
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
      {eventJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(eventJsonLd).replace(/</g, '\\u003c'),
          }}
        />
      )}
      <EventDetailView
        city={city}
        event={event}
        initialNextLabel={nextOccurrence?.label ?? null}
      />
    </>
  );
}