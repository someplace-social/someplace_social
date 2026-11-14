import { notFound, permanentRedirect } from 'next/navigation';
import { getCityBySlug } from '../lib/cities';
type PageProps = {
  params: Promise<{ city: string }>;
};
export default async function CityRootPage({ params }: PageProps) {
  const { city: citySlug } = await params;
  const city = getCityBySlug(citySlug);
  if (!city) {
    notFound();
  }
  permanentRedirect(`/${city.slug}/events`);
}