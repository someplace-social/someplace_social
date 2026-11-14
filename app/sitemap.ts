import type { MetadataRoute } from 'next';
import { SITE_URL, getAllCities } from './lib/cities';
import { getEvents } from './lib/google-sheets';
import { getEventSlug } from './events/event-helpers';
export const revalidate = 3600;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;
  const cities = getAllCities();
  const cityUrls = cities.map((city) => ({
    url: `${baseUrl}/events/${city.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));
  const cityEventsList = await Promise.all(
    cities.map(async (city) => ({
      citySlug: city.slug,
      events: await getEvents(city, 3600),
    }))
  );
  const seenEventUrls = new Set<string>();
  const eventUrls: MetadataRoute.Sitemap = [];
  for (const { citySlug, events } of cityEventsList) {
    for (const ev of events) {
      const url = `${baseUrl}/events/${citySlug}/${getEventSlug(ev)}`;
      if (seenEventUrls.has(url)) continue;
      seenEventUrls.add(url);
      eventUrls.push({
        url,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      });
    }
  }
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    ...cityUrls,
    ...eventUrls,
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/support`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ];
}