import type { MetadataRoute } from 'next';
import { SITE_URL, getAllCities } from './lib/cities';
import { getEvents, getLastUpdated } from './lib/google-sheets';
import { getEventSlug, parseLastUpdatedDate } from './events/event-helpers';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;
  const cities = getAllCities();

  const cityData = await Promise.all(
    cities.map(async (city) => {
      const [events, lastUpdatedRaw] = await Promise.all([
        getEvents(city, 3600),
        getLastUpdated(city, 3600),
      ]);
      return {
        citySlug: city.slug,
        events,
        lastModified: parseLastUpdatedDate(lastUpdatedRaw),
      };
    })
  );

  const cityUrls: MetadataRoute.Sitemap = cityData.flatMap(
    ({ citySlug, lastModified }) => [
      {
        url: `${baseUrl}/${citySlug}/events`,
        ...(lastModified ? { lastModified } : {}),
      },
      {
        url: `${baseUrl}/${citySlug}/events?tab=all`,
        ...(lastModified ? { lastModified } : {}),
      },
      {
        url: `${baseUrl}/${citySlug}/contact`,
      },
    ]
  );

  const seenEventUrls = new Set<string>();
  const eventUrls: MetadataRoute.Sitemap = [];
  for (const { citySlug, events } of cityData) {
    for (const ev of events) {
      const url = `${baseUrl}/${citySlug}/events/${getEventSlug(ev)}`;
      if (seenEventUrls.has(url)) continue;
      seenEventUrls.add(url);
      eventUrls.push({ url });
    }
  }

  return [
    { url: baseUrl },
    ...cityUrls,
    ...eventUrls,
    { url: `${baseUrl}/about` },
    { url: `${baseUrl}/contact` },
  ];
}