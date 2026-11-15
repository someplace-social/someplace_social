import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CITIES } from '../lib/cities';
import {
  buildGoogleCalendarUrl,
  buildIcsContent,
  foldIcsLine,
  getIcsFilename,
  resolveCalendarOccurrence,
  zonedLocalToUtc,
} from './calendar-helpers';
import { makeEvent } from './test-fixtures';

const jan2Fri = new Date(2026, 0, 2);

describe('calendar helpers (Google Calendar, ICS & copy summary)', () => {
  it('builds a clean single-occurrence Google Calendar URL, upgrades short-form contact URLs, and omits evidence notes', () => {
    const ev = makeEvent({
      id: 'MED014',
      title: 'Verb & Vibe Game Nite',
      venue: 'Café Revolución',
      location: 'Cra. 37 #8A-37',
      area: 'Laureles',
      organization: 'Language Friends',
      startTime: '7:00 PM',
      endTime: '9:30 PM',
      frequency: 'Weekly',
      price: 'Free',
      preRegistration: 'RSVP recommended',
      registrationUrl: 'lu.ma/verb-vibe',
      contact: 'hello@verbvibe.com',
      map: 'maps.app.goo.gl/abc123',
      about: 'Practice Spanish and English with board games.',
      url1: 'instagram.com/p/public-link',
      url1Notes: 'secret-verification-note',
      url2: 'meetup.com/group',
      url2Notes: 'secret-url2-note',
      database: 'Medellin Sheet Row 44',
      activities: ['Games', 'Language exchange'],
    });
    const details = resolveCalendarOccurrence(
      ev,
      CITIES['medellin-colombia'],
      jan2Fri
    );
    assert.ok(details);
    assert.equal(details.location, 'Café Revolución, Cra. 37 #8A-37, Medellín, Colombia');
    assert.equal(
      details.copySummary,
      'Fri, Jan 2 7p–9:30p: Verb & Vibe Game Nite at Café Revolución'
    );

    const url = new URL(buildGoogleCalendarUrl(details));
    assert.equal(url.origin + url.pathname, 'https://calendar.google.com/calendar/render');
    assert.equal(url.searchParams.get('action'), 'TEMPLATE');
    assert.equal(url.searchParams.get('text'), 'Verb & Vibe Game Nite');
    assert.equal(url.searchParams.get('dates'), '20260102T190000/20260102T213000');
    assert.equal(url.searchParams.get('ctz'), 'America/Bogota');
    assert.equal(
      url.searchParams.get('location'),
      'Café Revolución, Cra. 37 #8A-37, Medellín, Colombia'
    );

    const desc = url.searchParams.get('details') || '';
    assert.equal(desc.includes('Practice Spanish and English with board games.'), true);
    assert.equal(desc.includes('Price: Free'), true);
    assert.equal(desc.includes('RSVP: RSVP recommended (https://lu.ma/verb-vibe)'), true);
    assert.equal(desc.includes('Schedule: Weekly'), true);
    assert.equal(desc.includes('Hosted by: Language Friends'), true);
    assert.equal(desc.includes('Contact: hello@verbvibe.com'), true);
    assert.equal(desc.includes('Map: https://maps.app.goo.gl/abc123'), true);
    assert.equal(
      desc.includes(
        'Event info: https://www.someplacesocial.org/medellin-colombia/events/verb-vibe-game-nite-med014'
      ),
      true
    );
    assert.equal(desc.includes('secret-verification-note'), false);
    assert.equal(desc.includes('secret-url2-note'), false);
    assert.equal(desc.includes('Medellin Sheet Row 44'), false);
    assert.equal(desc.includes('MED014'), false);

    const urlContactDetails = resolveCalendarOccurrence(
      makeEvent({
        id: 'MED015',
        title: 'WhatsApp Club',
        contact: 'wa.me/573001234567',
      }),
      CITIES['medellin-colombia'],
      jan2Fri
    );
    assert.ok(urlContactDetails);
    assert.equal(
      urlContactDetails.description.includes('Contact: https://wa.me/573001234567'),
      true
    );
  });

  it('handles missing endTime (+1h default), overnight rollover, all-day events, missing venue, and duplicate venue in title', () => {
    const noEnd = resolveCalendarOccurrence(
      makeEvent({
        title: 'Trivia at Maxline Brewing',
        venue: 'Maxline Brewing',
        location: '2724 McClelland Dr, Fort Collins, CO',
        startTime: '7:00 PM',
        endTime: '',
      }),
      CITIES['fort-collins-colorado'],
      jan2Fri
    );
    assert.ok(noEnd);
    assert.equal(noEnd.location, 'Maxline Brewing, 2724 McClelland Dr, Fort Collins, CO');
    assert.equal(noEnd.copySummary, 'Fri, Jan 2 7p: Trivia at Maxline Brewing');
    assert.deepEqual(noEnd.startLocal, { year: 2026, month: 1, day: 2, hour: 19, minute: 0 });
    assert.deepEqual(noEnd.endLocal, { year: 2026, month: 1, day: 2, hour: 20, minute: 0 });

    const overnight = resolveCalendarOccurrence(
      makeEvent({ startTime: '9:00 PM', endTime: '1:00 AM' }),
      CITIES['medellin-colombia'],
      jan2Fri
    );
    assert.ok(overnight);
    assert.deepEqual(overnight.endLocal, { year: 2026, month: 1, day: 3, hour: 1, minute: 0 });

    const allDay = resolveCalendarOccurrence(
      makeEvent({ title: 'Park Day', startTime: '', endTime: '', venue: '', location: '', area: '' }),
      CITIES['fort-collins-colorado'],
      jan2Fri
    );
    assert.ok(allDay);
    assert.equal(allDay.isAllDay, true);
    assert.equal(allDay.copySummary, 'Fri, Jan 2: Park Day');
    const allDayUrl = new URL(buildGoogleCalendarUrl(allDay));
    assert.equal(allDayUrl.searchParams.get('dates'), '20260102/20260103');

    const paused = resolveCalendarOccurrence(
      makeEvent({ frequency: 'Weekly', frequencyNotes: 'Paused' }),
      CITIES['medellin-colombia']
    );
    assert.equal(paused, null);
  });

  it('converts local wall times accurately to UTC across Bogota and Denver standard/DST dates', () => {
    const bogotaUtc = zonedLocalToUtc(
      { year: 2026, month: 1, day: 2, hour: 19, minute: 0 },
      'America/Bogota'
    );
    assert.equal(bogotaUtc.toISOString(), '2026-01-03T00:00:00.000Z');

    const denverWinterUtc = zonedLocalToUtc(
      { year: 2026, month: 1, day: 2, hour: 19, minute: 0 },
      'America/Denver'
    );
    assert.equal(denverWinterUtc.toISOString(), '2026-01-03T02:00:00.000Z');

    const denverSummerUtc = zonedLocalToUtc(
      { year: 2026, month: 7, day: 10, hour: 19, minute: 0 },
      'America/Denver'
    );
    assert.equal(denverSummerUtc.toISOString(), '2026-07-11T01:00:00.000Z');
  });

  it('generates RFC 5545 compliant ICS content with escaping, CRLF endings, UTC times, and UTF-8 safe folding', () => {
    const ev = makeEvent({
      id: '14',
      title: 'Salsa, Bachata; & Café Night',
      venue: 'Café Revolución',
      location: 'Cra. 37 #8A-37',
      startTime: '7:00 PM',
      endTime: '9:00 PM',
      about: 'Bring friends, water;\nMeet upstairs in Medellín.',
    });
    const details = resolveCalendarOccurrence(
      ev,
      CITIES['medellin-colombia'],
      jan2Fri
    );
    assert.ok(details);
    assert.equal(getIcsFilename(details), 'salsa-bachata-cafe-night-2026-01-02.ics');

    const ics = buildIcsContent(details, new Date('2026-01-01T12:00:00Z'));
    assert.equal(ics.endsWith('\r\n'), true);
    assert.equal(ics.includes('RRULE'), false);
    assert.equal(ics.includes('DTSTART:20260103T000000Z'), true);
    assert.equal(ics.includes('DTEND:20260103T020000Z'), true);
    assert.equal(ics.includes('SUMMARY:Salsa\\, Bachata\\; & Café Night'), true);
    assert.equal(ics.includes('Bring friends\\, water\\;\\nMeet upstairs in Medellín.'), true);

    const folded = foldIcsLine(
      `DESCRIPTION:${'Medellín '.repeat(15)}`
    );
    const encoder = new TextEncoder();
    for (const part of folded.split('\r\n')) {
      assert.equal(encoder.encode(part).length <= 75, true);
    }

    const allDayDetails = resolveCalendarOccurrence(
      makeEvent({ id: '99', title: 'Park Day', startTime: '', endTime: '' }),
      CITIES['fort-collins-colorado'],
      jan2Fri
    );
    assert.ok(allDayDetails);
    const allDayIcs = buildIcsContent(allDayDetails, new Date('2026-01-01T12:00:00Z'));
    assert.equal(allDayIcs.includes('DTSTART;VALUE=DATE:20260102'), true);
    assert.equal(allDayIcs.includes('DTEND;VALUE=DATE:20260103'), true);
  });
});