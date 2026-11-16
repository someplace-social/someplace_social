import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CITIES } from '../lib/cities';
import { ensureExternalUrl } from './utils';
import {
  normalizeContactText,
  parseContactWithLinks,
  parseTextWithLinks,
} from './linkify';
import {
  slugifyText,
  getEventSlug,
  resolveEventBySlug,
  getNextEventOccurrence,
  buildEventInviteText,
  buildEventJsonLd,
  getEventDisplayDetails,
  buildProveItSources,
  parseLastUpdatedDate,
  formatIsoDateAttribute,
  groupEventsForDirectory,
} from './event-helpers';
import { makeEvent } from './test-fixtures';

describe('slug generation and event resolution', () => {
  it('strips accents, emojis, punctuation, and formats clean slugs', () => {
    assert.equal(slugifyText("Café & Español! 🎉 Game's Nite"), 'cafe-espanol-games-nite');
    assert.equal(
      getEventSlug(makeEvent({ id: '14', title: 'Verb & Vibe Game Nite' })),
      'verb-vibe-game-nite-14'
    );
    assert.equal(
      getEventSlug(makeEvent({ id: '', title: 'Café Revolución Meetup' })),
      'cafe-revolucion-meetup'
    );
    assert.equal(getEventSlug(makeEvent({ id: '9', title: '🎉✨' })), 'event-9');
  });
  it('resolves exact, renamed-title ID, bare ID, missing-ID fallback, split IDs, and rejects deleted IDs', () => {
    const events = [
      makeEvent({ id: '14', title: 'Verb & Vibe Game Nite' }),
      makeEvent({ id: '', title: 'Open Air Sketching' }),
      makeEvent({ id: 'FOCO0024-mon', title: 'Weekly Karaoke Night', dayOfWeek: 'Mon' }),
      makeEvent({ id: 'FOCO0024-wed', title: 'Weekly Karaoke Night', dayOfWeek: 'Wed' }),
    ];
    const exact = resolveEventBySlug(events, 'verb-vibe-game-nite-14');
    assert.ok(exact);
    assert.equal(exact.event.id, '14');
    assert.equal(exact.isCanonical, true);
    const renamed = resolveEventBySlug(events, 'old-title-here-14');
    assert.ok(renamed);
    assert.equal(renamed.event.id, '14');
    assert.equal(renamed.canonicalSlug, 'verb-vibe-game-nite-14');
    assert.equal(renamed.isCanonical, false);
    const bareId = resolveEventBySlug(events, '14');
    assert.ok(bareId);
    assert.equal(bareId.event.id, '14');
    assert.equal(bareId.isCanonical, false);
    const splitWed = resolveEventBySlug(events, 'weekly-karaoke-night-foco0024-wed');
    assert.ok(splitWed);
    assert.equal(splitWed.event.id, 'FOCO0024-wed');
    assert.equal(splitWed.isCanonical, true);
    const legacyUnsplit = resolveEventBySlug(events, 'weekly-karaoke-night-foco0024');
    assert.ok(legacyUnsplit);
    assert.equal(legacyUnsplit.event.id, 'FOCO0024-mon');
    assert.equal(legacyUnsplit.canonicalSlug, 'weekly-karaoke-night-foco0024-mon');
    assert.equal(legacyUnsplit.isCanonical, false);
    const missingId = resolveEventBySlug(events, 'open-air-sketching');
    assert.ok(missingId);
    assert.equal(missingId.event.title, 'Open Air Sketching');
    assert.equal(missingId.isCanonical, true);
    const deletedId = resolveEventBySlug(events, 'verb-vibe-game-nite-999');
    assert.equal(deletedId, null);
  });
});

describe('next occurrence, invite text, and JSON-LD', () => {
  it('finds next occurrence beyond 7 days for monthly events and omits paused events', () => {
    const monthlyEv = makeEvent({
      frequency: 'Monthly',
      frequencyNotes: '1st Fri',
      dayOfWeek: 'Fri',
    });
    const occ = getNextEventOccurrence(monthlyEv, 'America/Bogota', 90, new Date('2026-01-10T15:00:00Z'));
    assert.ok(occ);
    assert.equal(occ.date.getMonth(), 1);
    assert.equal(occ.date.getDate(), 6);
    assert.equal(occ.label.startsWith('Next: '), true);
    const pausedEv = makeEvent({ frequency: 'Weekly', frequencyNotes: 'Paused' });
    assert.equal(
      getNextEventOccurrence(pausedEv, 'America/Bogota', 90, new Date('2026-01-10T15:00:00Z')),
      null
    );
  });
  it('builds formatted invite text skipping missing fields cleanly', () => {
    const fullEv = makeEvent({
      id: '14',
      title: 'Verb & Vibe Game Nite',
      dayOfWeek: 'Fri',
      startTime: '7:00 PM',
      endTime: '9:30 PM',
      venue: 'Café Revolución',
      area: 'Laureles',
      price: 'Free',
    });
    assert.equal(
      buildEventInviteText(fullEv, 'medellin-colombia'),
      'Verb & Vibe Game Nite\nFri · 7p – 9:30p\nCafé Revolución (Laureles) · Free\nhttps://www.someplacesocial.org/medellin-colombia/events/verb-vibe-game-nite-14'
    );
    const sparseEv = makeEvent({
      id: '2',
      title: 'Mystery Gathering',
      dayOfWeek: '',
      frequency: '',
      startTime: '',
      endTime: '',
      venue: '',
      location: '',
      area: '',
      price: '',
    });
    assert.equal(
      buildEventInviteText(sparseEv, 'fort-collins-colorado'),
      'Mystery Gathering\nhttps://www.someplacesocial.org/fort-collins-colorado/events/mystery-gathering-2'
    );
  });
  it('builds valid schema.org/Event JSON-LD including image, addressCountry, venue, organizer, and registration URLs', () => {
    const ev = makeEvent({
      id: '14',
      title: 'Salsa Night',
      venue: 'Son Havana',
      venueUrl: 'sonhavana.com',
      organization: 'Medellín Salsa Collective',
      organizerUrl: 'instagram.com/medellinsalsa',
      registrationUrl: 'eventbrite.com/e/salsa-14',
      location: 'Cra 73 #44-56',
      price: 'Free',
      startTime: '8:00 PM',
      endTime: '11:00 PM',
    });
    const canonicalUrl =
      'https://www.someplacesocial.org/medellin-colombia/events/salsa-night-14';
    const occ = getNextEventOccurrence(ev, 'America/Bogota', 90, new Date('2026-01-02T15:00:00Z'));
    const ld = buildEventJsonLd(
      ev,
      CITIES['medellin-colombia'],
      canonicalUrl,
      occ
    ) as Record<string, unknown>;
    assert.ok(ld);
    assert.equal(ld['@type'], 'Event');
    assert.equal(ld['image'], `${canonicalUrl}/opengraph-image`);
    assert.equal(ld['eventAttendanceMode'], 'https://schema.org/OfflineEventAttendanceMode');
    assert.equal(String(ld['startDate']).startsWith('2026-01-02T20:00:00'), true);
    const location = ld['location'] as Record<string, unknown>;
    assert.equal(location['url'], 'https://sonhavana.com');
    assert.equal((location['address'] as Record<string, unknown>)['addressCountry'], 'CO');
    assert.equal(
      (ld['organizer'] as Record<string, unknown>)['url'],
      'https://instagram.com/medellinsalsa'
    );
    assert.equal(
      (ld['offers'] as Record<string, unknown>)['url'],
      'https://eventbrite.com/e/salsa-14'
    );

    const focoOcc = getNextEventOccurrence(ev, 'America/Denver', 90, new Date('2026-01-02T15:00:00Z'));
    const focoLd = buildEventJsonLd(
      ev,
      CITIES['fort-collins-colorado'],
      'https://www.someplacesocial.org/fort-collins-colorado/events/salsa-night-14',
      focoOcc
    ) as Record<string, unknown>;
    const focoAddress = (focoLd['location'] as Record<string, unknown>)['address'] as Record<string, unknown>;
    assert.equal(focoAddress['addressCountry'], 'US');
  });
});

describe('last updated date parsing & directory grouping', () => {
  it('parses sheet verification dates cleanly into UTC dates and ISO YYYY-MM-DD attributes', () => {
    assert.equal(formatIsoDateAttribute('Nov 8, 2026'), '2026-11-08');
    assert.equal(formatIsoDateAttribute('November 8, 2026'), '2026-11-08');
    assert.equal(formatIsoDateAttribute('2026-11-08'), '2026-11-08');
    assert.equal(formatIsoDateAttribute('11/8/2026'), '2026-11-08');
    assert.equal(formatIsoDateAttribute('Date(2026, 10, 8)'), '2026-11-08');
    assert.equal(formatIsoDateAttribute('8 Nov 2026'), '2026-11-08');
    assert.equal(parseLastUpdatedDate('Feb 30, 2026'), null);
    assert.equal(parseLastUpdatedDate('Recently'), null);
    assert.equal(parseLastUpdatedDate(''), null);
    assert.equal(parseLastUpdatedDate(null), null);
  });

  it('groups daily, weekly, multi-day, monthly, and unscheduled events chronologically into directory buckets', () => {
    const events = [
      makeEvent({ id: '1', title: 'Late Trivia', dayOfWeek: 'Fri', startTime: '8:00 PM' }),
      makeEvent({ id: '2', title: 'Morning Run', dayOfWeek: 'Fri', startTime: '7:00 AM' }),
      makeEvent({ id: '3', title: 'Daily Coffee Club', dayOfWeek: 'Daily', startTime: '9:00 AM' }),
      makeEvent({ id: '4', title: 'Midweek Games', dayOfWeek: 'Tue, Thu', startTime: '6:00 PM' }),
      makeEvent({ id: '5', title: 'Seasonal Walk', dayOfWeek: '', frequency: 'Seasonal' }),
    ];

    const groups = groupEventsForDirectory(events);
    assert.deepEqual(
      groups.map((g) => ({
        key: g.key,
        titles: g.events.map((e) => e.title),
      })),
      [
        { key: 'daily', titles: ['Daily Coffee Club'] },
        { key: 'tue', titles: ['Midweek Games'] },
        { key: 'thu', titles: ['Midweek Games'] },
        { key: 'fri', titles: ['Morning Run', 'Late Trivia'] },
        { key: 'other', titles: ['Seasonal Walk'] },
      ]
    );
  });
});

describe('getEventDisplayDetails & URL normalization', () => {
  it('prepends https:// across short-form Organizer, Venue, Registration, Map, and URL1 while preserving query strings', () => {
    const linked = getEventDisplayDetails(
      makeEvent({
        venue: 'Maxline Brewing',
        venueUrl: 'maxlinebrewing.com',
        organization: 'Hosted by Geeks Who Drink',
        organizerUrl: 'instagram.com/geekswhodrink',
        preRegistration: 'Registration required.',
        registrationUrl: 'geekswhodrink.com/register?city=foco',
        map: 'maps.app.goo.gl/abc123',
        url1: 'instagram.com/p/DfV0gzJjq-e/?img_index=2',
      }),
      'Fort Collins'
    );
    assert.equal(linked.displayVenue, 'Maxline Brewing');
    assert.equal(linked.venueUrl, 'https://maxlinebrewing.com');
    assert.equal(linked.organizerName, 'Geeks Who Drink');
    assert.equal(linked.organizerUrl, 'https://instagram.com/geekswhodrink');
    assert.equal(linked.showOrganizer, true);
    assert.equal(linked.preRegistrationText, 'Registration required.');
    assert.equal(linked.registrationUrl, 'https://geekswhodrink.com/register?city=foco');
    assert.equal(linked.mapsHref, 'https://maps.app.goo.gl/abc123');
    assert.equal(linked.moreDetailsUrl, 'https://instagram.com/p/DfV0gzJjq-e/?img_index=2');
    assert.equal(linked.needsSignupIcon, true);

    const blankAndUnsafe = getEventDisplayDetails(
      makeEvent({
        venue: 'City Park',
        venueUrl: 'javascript:alert(1)',
        organization: '',
        organizerUrl: '',
        preRegistration: 'Drop-in (no RSVP needed)',
        registrationUrl: '',
        url1: '',
      }),
      'Fort Collins'
    );
    assert.equal(blankAndUnsafe.venueUrl, '');
    assert.equal(blankAndUnsafe.showOrganizer, false);
    assert.equal(blankAndUnsafe.registrationUrl, '');
    assert.equal(blankAndUnsafe.moreDetailsUrl, '');
    assert.equal(blankAndUnsafe.needsSignupIcon, false);
    assert.equal(ensureExternalUrl('//example.com/events?img_index=3'), 'https://example.com/events?img_index=3');
    assert.equal(ensureExternalUrl('x'), '');
  });
});

describe('buildProveItSources', () => {
  it('builds Listed at + Also, at entries with https:// hrefs, query strings intact, and notes', () => {
    const both = buildProveItSources({
      url1: 'maxlinebrewing.com/whats-happening',
      url1Notes: 'Click on the "Community Events" tab',
      url2: 'instagram.com/p/DfV0gzJjq-e/?img_index=2',
      url2Notes: 'Check slide 2 for times',
    });
    assert.deepEqual(both, [
      {
        prefix: 'Listed at ',
        url: 'maxlinebrewing.com/whats-happening',
        href: 'https://maxlinebrewing.com/whats-happening',
        notes: 'Click on the "Community Events" tab',
      },
      {
        prefix: 'Also, at ',
        url: 'instagram.com/p/DfV0gzJjq-e/?img_index=2',
        href: 'https://instagram.com/p/DfV0gzJjq-e/?img_index=2',
        notes: 'Check slide 2 for times',
      },
    ]);
  });

  it('shows only the first line when URL2 is blank and ignores stray URL2 Notes', () => {
    const firstOnly = buildProveItSources({
      url1: 'comedyfortcollins.com/events/142205?img_index=1',
      url1Notes: 'Click on "Biography" link',
      url2: '',
      url2Notes: 'Ignored note when URL2 is empty',
    });
    assert.deepEqual(firstOnly, [
      {
        prefix: 'Listed at ',
        url: 'comedyfortcollins.com/events/142205?img_index=1',
        href: 'https://comedyfortcollins.com/events/142205?img_index=1',
        notes: 'Click on "Biography" link',
      },
    ]);
  });

  it('returns empty array when both URL1 and URL2 are blank, x, or unsafe', () => {
    assert.deepEqual(
      buildProveItSources({ url1: '', url1Notes: 'orphan', url2: '', url2Notes: '' }),
      []
    );
    assert.deepEqual(
      buildProveItSources({ url1: 'x', url1Notes: '', url2: '  ', url2Notes: '' }),
      []
    );
    assert.deepEqual(
      buildProveItSources({ url1: 'javascript:alert(1)', url1Notes: '', url2: '', url2Notes: '' }),
      []
    );
  });

  it('promotes URL2 to Listed at when URL1 is blank and URL2 is filled', () => {
    const secondOnly = buildProveItSources({
      url1: '',
      url1Notes: '',
      url2: 'instagram.com/p/DfiPohTlspn/?img_index=4',
      url2Notes: 'Carousel slide 4',
    });
    assert.deepEqual(secondOnly, [
      {
        prefix: 'Listed at ',
        url: 'instagram.com/p/DfiPohTlspn/?img_index=4',
        href: 'https://instagram.com/p/DfiPohTlspn/?img_index=4',
        notes: 'Carousel slide 4',
      },
    ]);
  });
});

describe('linkify Contact and URL text', () => {
  it('normalizes empty and x placeholder values', () => {
    assert.equal(normalizeContactText(''), '');
    assert.equal(normalizeContactText('   '), '');
    assert.equal(normalizeContactText('x'), '');
    assert.equal(normalizeContactText('X'), '');
    assert.equal(normalizeContactText('  info@venue.com  '), 'info@venue.com');
  });
  it('links bare URLs, protocols, emails, query params, multi-part TLDs, curly quotes, and ignores non-URLs', () => {
    const mixed = parseTextWithLinks(
      '(See https://www.example.com/events?id=1, or maxlinebrewing.com.) Email info@venue.com at 7:30 p.m. e.g. $12.50.'
    );
    assert.deepEqual(mixed, [
      { type: 'text', text: '(See ' },
      {
        type: 'link',
        text: 'https://www.example.com/events?id=1',
        href: 'https://www.example.com/events?id=1',
      },
      { type: 'text', text: ', or ' },
      {
        type: 'link',
        text: 'maxlinebrewing.com',
        href: 'https://maxlinebrewing.com',
      },
      { type: 'text', text: '.) Email ' },
      {
        type: 'link',
        text: 'info@venue.com',
        href: 'mailto:info@venue.com',
      },
      { type: 'text', text: ' at 7:30 p.m. e.g. $12.50.' },
    ]);
    const extra = parseTextWithLinks(
      'Check “sub.example.com.co” and maxlinebrewing.com?tab=events.'
    );
    assert.deepEqual(extra, [
      { type: 'text', text: 'Check “' },
      {
        type: 'link',
        text: 'sub.example.com.co',
        href: 'https://sub.example.com.co',
      },
      { type: 'text', text: '” and ' },
      {
        type: 'link',
        text: 'maxlinebrewing.com?tab=events',
        href: 'https://maxlinebrewing.com?tab=events',
      },
      { type: 'text', text: '.' },
    ]);
    const wiki = parseTextWithLinks('Look at en.wikipedia.org/wiki/Pub_quiz_(game).');
    assert.deepEqual(wiki, [
      { type: 'text', text: 'Look at ' },
      {
        type: 'link',
        text: 'en.wikipedia.org/wiki/Pub_quiz_(game)',
        href: 'https://en.wikipedia.org/wiki/Pub_quiz_(game)',
      },
      { type: 'text', text: '.' },
    ]);
    const unsafe = parseTextWithLinks('Try javascript:alert(1) or javascript:evil.com');
    assert.deepEqual(unsafe, [
      { type: 'text', text: 'Try javascript:alert(1) or javascript:evil.com' },
    ]);
  });
  it('links emails, short-form contact URLs across TLDs, phone numbers, and mixed contact strings safely', () => {
    assert.deepEqual(parseContactWithLinks('x'), []);
    assert.deepEqual(parseContactWithLinks('mailto:hello@venue.com'), [
      { type: 'link', text: 'hello@venue.com', href: 'mailto:hello@venue.com' },
    ]);
    assert.deepEqual(parseContactWithLinks('venue.com/contact?ref=1'), [
      { type: 'link', text: 'venue.com/contact?ref=1', href: 'https://venue.com/contact?ref=1' },
    ]);
    assert.deepEqual(parseContactWithLinks('lu.ma'), [
      { type: 'link', text: 'lu.ma', href: 'https://lu.ma' },
    ]);
    assert.deepEqual(parseContactWithLinks('someclub.photography'), [
      { type: 'link', text: 'someclub.photography', href: 'https://someclub.photography' },
    ]);
    assert.deepEqual(parseContactWithLinks('wa.me/573001234567'), [
      { type: 'link', text: 'wa.me/573001234567', href: 'https://wa.me/573001234567' },
    ]);
    assert.deepEqual(parseContactWithLinks('tel:+1-970-555-1234'), [
      { type: 'link', text: '+1-970-555-1234', href: 'tel:+19705551234' },
    ]);
    assert.deepEqual(
      parseContactWithLinks('WhatsApp +57 300 123 4567 or info@venue.com'),
      [
        { type: 'text', text: 'WhatsApp ' },
        { type: 'link', text: '+57 300 123 4567', href: 'tel:+573001234567' },
        { type: 'text', text: ' or ' },
        { type: 'link', text: 'info@venue.com', href: 'mailto:info@venue.com' },
      ]
    );
    assert.deepEqual(parseContactWithLinks('(970) 555-1234'), [
      { type: 'link', text: '(970) 555-1234', href: 'tel:9705551234' },
    ]);
    assert.deepEqual(parseContactWithLinks('https://wa.me/573001234567'), [
      { type: 'link', text: 'https://wa.me/573001234567', href: 'https://wa.me/573001234567' },
    ]);
    assert.deepEqual(parseContactWithLinks('DM @club on Instagram'), [
      { type: 'text', text: 'DM @club on Instagram' },
    ]);
    assert.deepEqual(parseContactWithLinks('Updated 2026-01-15'), [
      { type: 'text', text: 'Updated 2026-01-15' },
    ]);
  });
});