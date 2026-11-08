import type { MetadataRoute } from 'next';
import { getAllCitySlugs } from './lib/cities';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.someplacesocial.org';
  const cityUrls = getAllCitySlugs().map((slug) => ({
    url: `${baseUrl}/events/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    ...cityUrls,
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