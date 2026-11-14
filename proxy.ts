import { NextResponse, type NextRequest } from 'next/server';
import { getCityBySlug } from './app/lib/cities';
export function proxy(request: NextRequest) {
  const rawEvent = request.nextUrl.searchParams.get('event')?.trim() || '';
  if (
    !rawEvent ||
    rawEvent.length > 200 ||
    rawEvent.includes('/') ||
    rawEvent.includes('\\') ||
    rawEvent.includes('..')
  ) {
    return NextResponse.next();
  }
  const segments = request.nextUrl.pathname.split('/').filter(Boolean);
  if (segments.length !== 2 || segments[0] !== 'events') {
    return NextResponse.next();
  }
  const citySlug = segments[1];
  const city = getCityBySlug(citySlug);
  if (!city) {
    return NextResponse.next();
  }
  const destination = request.nextUrl.clone();
  destination.pathname = `/events/${city.slug}/${encodeURIComponent(rawEvent)}`;
  destination.searchParams.delete('event');
  return NextResponse.redirect(destination, 307);
}
export const config = {
  matcher: [
    {
      source: '/events/:city',
      has: [{ type: 'query', key: 'event' }],
    },
  ],
};