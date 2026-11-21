import { NextResponse, type NextRequest } from 'next/server';
import { getCityBySlug } from './app/lib/cities';

const CONTROL_CHAR_REGEX = /[\u0000-\u001F\u007F]/;

export function proxy(request: NextRequest) {
  const rawEvent = request.nextUrl.searchParams.get('event')?.trim() || '';
  if (
    !rawEvent ||
    rawEvent.length > 200 ||
    CONTROL_CHAR_REGEX.test(rawEvent) ||
    rawEvent.includes('/') ||
    rawEvent.includes('\\') ||
    rawEvent.includes('..')
  ) {
    return NextResponse.next();
  }
  const segments = request.nextUrl.pathname.split('/').filter(Boolean);
  if (segments.length !== 2) {
    return NextResponse.next();
  }
  const citySlug =
    segments[1] === 'events'
      ? segments[0]
      : segments[0] === 'events'
      ? segments[1]
      : '';
  if (!citySlug) {
    return NextResponse.next();
  }
  const city = getCityBySlug(citySlug);
  if (!city) {
    return NextResponse.next();
  }
  const destination = request.nextUrl.clone();
  destination.pathname = `/${city.slug}/events/${encodeURIComponent(rawEvent)}`;
  destination.searchParams.delete('event');
  return NextResponse.redirect(destination, 308);
}

export const config = {
  matcher: [
    {
      source: '/:city/events',
      has: [{ type: 'query', key: 'event' }],
    },
    {
      source: '/events/:city',
      has: [{ type: 'query', key: 'event' }],
    },
  ],
};