import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Event } from '../lib/google-sheets';
import { CITIES } from '../lib/cities';
import { isEventActiveOnDate, isMonthActive } from './utils';
import { expandEventSchedules } from './schedule-splitter';
import {
  normalizeContactText,
  normalizeProveItText,
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
} from './event-helpers';
import {
  buildGoogleCalendarUrl,
  buildIcsContent,
  foldIcsLine,
  getIcsFilename,
  resolveCalendarOccurrence,
  zonedLocalToUtc,
} from './calendar-helpers';

function makeEvent(overrides: Partial<Event>): Event {
  return {
    id: '1',
    title: 'Test Event',
    venue: 'Test Venue',
    venueUrl: '',
    organization: 'Test Org',
    organizerUrl: '',
    location: '123 Main St',
    area: 'Downtown',
    activity: 'Social',
    activities: ['Social'],
    dayOfWeek: 'Fri',
    startTime: '7:00 PM',
    endTime: '9:00 PM',
    frequency: 'Weekly',
    frequencyNotes: '',
    price: 'Free',
    preRegistration: 'Drop-in',
    registrationUrl: '',
    map: '',
    contact: '',
    proveIt: '',
    about: '',
    notes: '',
    database: '',
    ...overrides,
  };
}

const jan2Fri = new Date(2026, 0, 2);
const jan3Sat = new Date(2026, 0, 3);
const jan4Sun = new Date(2026, 0, 4);
const jan5Mon = new Date(2026, 0, 5);
const jan7Wed = new Date(2026, 0, 7);
const jan9Fri = new Date(2026, 0, 9);
const jan12Mon = new Date(2026, 0, 12);
const jan16Fri = new Date(2026, 0, 16);
const jan23Fri = new Date(2026, 0, 23);
const jan25Sun = new Date(2026, 0, 25);
const jan30Fri = new Date(2026, 0, 30);
const feb3Tue = new Date(2026, 1, 3);
const feb4Wed = new Date(2026, 1, 4);
const feb5Thu = new Date(2026, 1, 5);
const feb6Fri = new Date(2026, 1, 6);
const feb10Tue = new Date(2026, 1, 10);
const feb13Fri = new Date(2026, 1, 13);
const feb17Tue = new Date(2026, 1, 17);
const feb18Wed = new Date(2026, 1, 18);
const feb19Thu = new Date(2026, 1, 19);
const feb20Fri = new Date(2026, 1, 20);
const feb27Fri = new Date(2026, 1, 27);
const mar3Tue = new Date(2026, 2, 3);
const mar17Tue = new Date(2026, 2, 17);
const mar31Tue = new Date(2026, 2, 31);

describe('isEventActiveOnDate frequency parsing', () => {
  it('handles Weekly and Weekly, Sat & Sun', () => {
    const weeklyFri = makeEvent({ frequency: 'Weekly', dayOfWeek: 'Fri' });
    assert.equal(isEventActiveOnDate(weeklyFri, jan2Fri), true);
    assert.equal(isEventActiveOnDate(weeklyFri, jan9Fri), true);
    assert.equal(isEventActiveOnDate(weeklyFri, jan3Sat), false);
    const weekendEv = makeEvent({ frequency: 'Weekly, Sat & Sun', dayOfWeek: 'Sat, Sun' });
    assert.equal(isEventActiveOnDate(weekendEv, jan3Sat), true);
    assert.equal(isEventActiveOnDate(weekendEv, jan4Sun), true);
    assert.equal(isEventActiveOnDate(weekendEv, jan5Mon), false);
  });
  it('handles Twice-weekly with Mon & Wed and Twice-weekly, Wed & Fri', () => {
    const monWed = makeEvent({ frequency: 'Twice-weekly', dayOfWeek: 'Mon & Wed' });
    assert.equal(isEventActiveOnDate(monWed, jan5Mon), true);
    assert.equal(isEventActiveOnDate(monWed, jan7Wed), true);
    assert.equal(isEventActiveOnDate(monWed, jan2Fri), false);
    const wedFri = makeEvent({ frequency: 'Twice-weekly, Wed & Fri', dayOfWeek: 'Wed, Fri' });
    assert.equal(isEventActiveOnDate(wedFri, jan7Wed), true);
    assert.equal(isEventActiveOnDate(wedFri, jan9Fri), true);
    assert.equal(isEventActiveOnDate(wedFri, jan5Mon), false);
  });
  it('handles Bi-weekly and phrasing variations on even weeks by default', () => {
    const variations = [
      { frequency: 'Bi-weekly', frequencyNotes: '' },
      { frequency: 'Biweekly', frequencyNotes: '' },
      { frequency: 'bi weekly', frequencyNotes: '' },
      { frequency: 'Every other week', frequencyNotes: '' },
      { frequency: 'Every 2 weeks', frequencyNotes: '' },
      { frequency: 'Alternating weeks', frequencyNotes: '' },
      { frequency: '', frequencyNotes: 'Every other week' },
    ];
    for (const v of variations) {
      const ev = makeEvent({ ...v, dayOfWeek: 'Fri' });
      assert.equal(isEventActiveOnDate(ev, jan2Fri), false, `${v.frequency || v.frequencyNotes} on W1`);
      assert.equal(isEventActiveOnDate(ev, jan9Fri), true, `${v.frequency || v.frequencyNotes} on W2`);
      assert.equal(isEventActiveOnDate(ev, jan16Fri), false, `${v.frequency || v.frequencyNotes} on W3`);
      assert.equal(isEventActiveOnDate(ev, jan23Fri), true, `${v.frequency || v.frequencyNotes} on W4`);
    }
    const biweeklyMon = makeEvent({ frequency: 'Bi-weekly, Mon', dayOfWeek: 'Mon' });
    assert.equal(isEventActiveOnDate(biweeklyMon, jan5Mon), true);
    assert.equal(isEventActiveOnDate(biweeklyMon, jan12Mon), false);
  });
  it('fixes Bi-weekly + Odd weeks and respects explicit Even weeks', () => {
    const oddEv = makeEvent({
      frequency: 'Bi-weekly',
      frequencyNotes: 'Odd weeks',
      dayOfWeek: 'Fri',
    });
    assert.equal(isEventActiveOnDate(oddEv, jan2Fri), true);
    assert.equal(isEventActiveOnDate(oddEv, jan9Fri), false);
    assert.equal(isEventActiveOnDate(oddEv, jan16Fri), true);
    assert.equal(isEventActiveOnDate(oddEv, jan23Fri), false);
    const evenEv = makeEvent({
      frequency: 'Biweekly',
      frequencyNotes: 'Even weeks',
      dayOfWeek: 'Fri',
    });
    assert.equal(isEventActiveOnDate(evenEv, jan2Fri), false);
    assert.equal(isEventActiveOnDate(evenEv, jan9Fri), true);
  });
  it('handles Bi-weekly with ordinal lists including 2nd & 4th Fri and 1st, 3rd & 5th Tue', () => {
    const ev = makeEvent({
      frequency: 'Bi-weekly',
      frequencyNotes: '2nd & 4th Fri',
      dayOfWeek: 'Fri',
    });
    assert.equal(isEventActiveOnDate(ev, jan2Fri), false);
    assert.equal(isEventActiveOnDate(ev, jan9Fri), true);
    assert.equal(isEventActiveOnDate(ev, jan16Fri), false);
    assert.equal(isEventActiveOnDate(ev, jan23Fri), true);
    assert.equal(isEventActiveOnDate(ev, jan30Fri), false);
    assert.equal(isEventActiveOnDate(ev, feb6Fri), false);
    assert.equal(isEventActiveOnDate(ev, feb13Fri), true);
    const fifthTueEv = makeEvent({
      frequency: 'Bi-weekly, 1st, 3rd & 5th Tue',
      dayOfWeek: 'Tue',
    });
    assert.equal(isEventActiveOnDate(fifthTueEv, feb10Tue), false);
    assert.equal(isEventActiveOnDate(fifthTueEv, feb17Tue), true);
    assert.equal(isEventActiveOnDate(fifthTueEv, mar3Tue), true);
    assert.equal(isEventActiveOnDate(fifthTueEv, mar17Tue), true);
    assert.equal(isEventActiveOnDate(fifthTueEv, mar31Tue), true);
  });
  it('defaults plain Monthly with no ordinal to the 1st occurrence', () => {
    for (const freq of ['Monthly', 'Once a month', 'Every month']) {
      const ev = makeEvent({ frequency: freq, frequencyNotes: '', dayOfWeek: 'Fri' });
      assert.equal(isEventActiveOnDate(ev, jan2Fri), true, `${freq} on 1st Fri`);
      assert.equal(isEventActiveOnDate(ev, jan9Fri), false, `${freq} on 2nd Fri`);
      assert.equal(isEventActiveOnDate(ev, jan16Fri), false, `${freq} on 3rd Fri`);
      assert.equal(isEventActiveOnDate(ev, jan23Fri), false, `${freq} on 4th Fri`);
      assert.equal(isEventActiveOnDate(ev, feb6Fri), true, `${freq} on Feb 1st Fri`);
      assert.equal(isEventActiveOnDate(ev, feb13Fri), false, `${freq} on Feb 2nd Fri`);
    }
  });
  it('handles Monthly with Last, Final, and 1st & Last ordinals', () => {
    const lastEv = makeEvent({
      frequency: 'Monthly',
      frequencyNotes: 'Last Fri',
      dayOfWeek: 'Fri',
    });
    assert.equal(isEventActiveOnDate(lastEv, jan23Fri), false);
    assert.equal(isEventActiveOnDate(lastEv, jan30Fri), true);
    assert.equal(isEventActiveOnDate(lastEv, feb20Fri), false);
    assert.equal(isEventActiveOnDate(lastEv, feb27Fri), true);
    const finalEv = makeEvent({
      frequency: 'Monthly',
      frequencyNotes: 'Final Fri',
      dayOfWeek: 'Fri',
    });
    assert.equal(isEventActiveOnDate(finalEv, jan23Fri), false);
    assert.equal(isEventActiveOnDate(finalEv, jan30Fri), true);
    assert.equal(isEventActiveOnDate(finalEv, feb27Fri), true);
    const firstAndLastSun = makeEvent({
      frequency: 'Monthly, 1st & Last Sun',
      dayOfWeek: 'Sun',
    });
    assert.equal(isEventActiveOnDate(firstAndLastSun, jan4Sun), true);
    assert.equal(isEventActiveOnDate(firstAndLastSun, jan25Sun), true);
    assert.equal(isEventActiveOnDate(firstAndLastSun, new Date(2026, 0, 11)), false);
  });
  it('handles numeric week lists and slash ordinals like weeks 1 & 3 and 1st/3rd', () => {
    const weeksListEv = makeEvent({
      frequency: 'Monthly',
      frequencyNotes: 'weeks 1 & 3',
      dayOfWeek: 'Fri',
    });
    assert.equal(isEventActiveOnDate(weeksListEv, jan2Fri), true);
    assert.equal(isEventActiveOnDate(weeksListEv, jan9Fri), false);
    assert.equal(isEventActiveOnDate(weeksListEv, jan16Fri), true);
    assert.equal(isEventActiveOnDate(weeksListEv, jan23Fri), false);
    const slashEv = makeEvent({
      frequency: 'Monthly',
      frequencyNotes: '1st/3rd',
      dayOfWeek: 'Fri',
    });
    assert.equal(isEventActiveOnDate(slashEv, jan2Fri), true);
    assert.equal(isEventActiveOnDate(slashEv, jan9Fri), false);
    assert.equal(isEventActiveOnDate(slashEv, jan16Fri), true);
    assert.equal(isEventActiveOnDate(slashEv, jan23Fri), false);
    const commaAndEv = makeEvent({
      frequency: 'Monthly',
      frequencyNotes: 'weeks 1, 3, and 5',
      dayOfWeek: 'Fri',
    });
    assert.equal(isEventActiveOnDate(commaAndEv, jan2Fri), true);
    assert.equal(isEventActiveOnDate(commaAndEv, jan9Fri), false);
    assert.equal(isEventActiveOnDate(commaAndEv, jan30Fri), true);
  });
  it('handles Bi-monthly variations, odd months override, and day-paired ordinals', () => {
    const variations = [
      'Bi-monthly',
      'Bimonthly',
      'Bi monthly',
      'Every other month',
      'Every 2 months',
    ];
    for (const freq of variations) {
      const ev = makeEvent({ frequency: freq, frequencyNotes: '', dayOfWeek: 'Fri' });
      assert.equal(isEventActiveOnDate(ev, jan2Fri), false, `${freq} in Jan (odd)`);
      assert.equal(isEventActiveOnDate(ev, feb6Fri), true, `${freq} in Feb (even)`);
      assert.equal(isEventActiveOnDate(ev, feb13Fri), true, `${freq} in Feb 2nd Fri`);
    }
    const oddMonthsEv = makeEvent({
      frequency: 'Bi-monthly',
      frequencyNotes: 'Odd months',
      dayOfWeek: 'Fri',
    });
    assert.equal(isEventActiveOnDate(oddMonthsEv, jan2Fri), true);
    assert.equal(isEventActiveOnDate(oddMonthsEv, feb6Fri), false);
    const ordinalBiMonthlyEv = makeEvent({
      frequency: 'Every 2 months',
      frequencyNotes: '1st Fri',
      dayOfWeek: 'Fri',
    });
    assert.equal(isEventActiveOnDate(ordinalBiMonthlyEv, jan2Fri), false);
    assert.equal(isEventActiveOnDate(ordinalBiMonthlyEv, feb6Fri), true);
    assert.equal(isEventActiveOnDate(ordinalBiMonthlyEv, feb13Fri), false);
    const pairedBiMonthlyEv = makeEvent({
      frequency: 'Bi-monthly, 1st Wed & 3rd Thu',
      dayOfWeek: 'Wed, Thu',
    });
    assert.equal(isEventActiveOnDate(pairedBiMonthlyEv, feb4Wed), true);
    assert.equal(isEventActiveOnDate(pairedBiMonthlyEv, feb5Thu), false);
    assert.equal(isEventActiveOnDate(pairedBiMonthlyEv, feb18Wed), false);
    assert.equal(isEventActiveOnDate(pairedBiMonthlyEv, feb19Thu), true);
    assert.equal(isEventActiveOnDate(pairedBiMonthlyEv, feb3Tue), false);
    assert.equal(isEventActiveOnDate(pairedBiMonthlyEv, jan7Wed), false);
  });
  it('handles paused and hiatus statuses', () => {
    const pausedEv = makeEvent({ frequency: 'Weekly', frequencyNotes: 'On hold' });
    assert.equal(isEventActiveOnDate(pausedEv, jan2Fri), false);
  });
  it('matches only event.dayOfWeek when split event has multi-day text in frequency', () => {
    const splitSat = makeEvent({ frequency: 'Weekly, Sat & Sun', dayOfWeek: 'Sat' });
    assert.equal(isEventActiveOnDate(splitSat, jan3Sat), true);
    assert.equal(isEventActiveOnDate(splitSat, jan4Sun), false);
  });
});

describe('expandEventSchedules', () => {
  it('splits FOCO0024-style day-mapped schedules into separate clean events', () => {
    const karaoke = makeEvent({
      id: 'FOCO0024',
      title: 'Weekly Karaoke Night',
      venue: 'R Bar and Lounge',
      venueUrl: 'rbar.com',
      organizerUrl: 'instagram.com/rbar',
      dayOfWeek: 'Mon, Wed, Sat',
      startTime: '7p (Mon) / 8p (Wed, Sat)',
      endTime: '10p (Mon) / 11p (Wed, Sat)',
      frequency: 'Weekly',
    });
    const expanded = expandEventSchedules(karaoke);
    assert.equal(expanded.length, 3);
    assert.deepEqual(
      expanded.map((e) => ({
        id: e.id,
        dayOfWeek: e.dayOfWeek,
        startTime: e.startTime,
        endTime: e.endTime,
        venueUrl: e.venueUrl,
        organizerUrl: e.organizerUrl,
      })),
      [
        {
          id: 'FOCO0024-mon',
          dayOfWeek: 'Mon',
          startTime: '7p',
          endTime: '10p',
          venueUrl: 'rbar.com',
          organizerUrl: 'instagram.com/rbar',
        },
        {
          id: 'FOCO0024-wed',
          dayOfWeek: 'Wed',
          startTime: '8p',
          endTime: '11p',
          venueUrl: 'rbar.com',
          organizerUrl: 'instagram.com/rbar',
        },
        {
          id: 'FOCO0024-sat',
          dayOfWeek: 'Sat',
          startTime: '8p',
          endTime: '11p',
          venueUrl: 'rbar.com',
          organizerUrl: 'instagram.com/rbar',
        },
      ]
    );
  });
  it('supports comma-separated, colon-prefixed, and day-range schedules', () => {
    const commaEv = makeEvent({
      id: 'E1',
      dayOfWeek: 'Mon, Wed, Sat',
      startTime: '7p (Mon), 8p (Wed & Sat)',
      endTime: '',
    });
    const commaExpanded = expandEventSchedules(commaEv);
    assert.equal(commaExpanded.length, 3);
    assert.equal(commaExpanded[0].startTime, '7p');
    assert.equal(commaExpanded[1].startTime, '8p');
    assert.equal(commaExpanded[2].startTime, '8p');
    assert.equal(commaExpanded[0].endTime, '');
    const colonEv = makeEvent({
      id: 'E2',
      dayOfWeek: 'Tue, Thu',
      startTime: 'Tue: 6p / Thu: 7:30p',
      endTime: '9p',
    });
    const colonExpanded = expandEventSchedules(colonEv);
    assert.deepEqual(
      colonExpanded.map((e) => [e.dayOfWeek, e.startTime, e.endTime]),
      [
        ['Tue', '6p', '9p'],
        ['Thu', '7:30p', '9p'],
      ]
    );
    const rangeEv = makeEvent({
      id: 'E3',
      dayOfWeek: 'Mon-Wed',
      startTime: '5p (Mon-Tue) / 6p (Wed)',
      endTime: '7p (Mon-Tue) / 8p (Wed)',
    });
    const rangeExpanded = expandEventSchedules(rangeEv);
    assert.deepEqual(
      rangeExpanded.map((e) => [e.dayOfWeek, e.startTime, e.endTime]),
      [
        ['Mon', '5p', '7p'],
        ['Tue', '5p', '7p'],
        ['Wed', '6p', '8p'],
      ]
    );
  });
  it('supports parallel unlabeled times and same-day multiple slots', () => {
    const parallelEv = makeEvent({
      id: 'E4',
      dayOfWeek: 'Tue, Thu',
      startTime: '6p / 7p',
      endTime: '8p / 9p',
    });
    assert.deepEqual(
      expandEventSchedules(parallelEv).map((e) => [e.id, e.dayOfWeek, e.startTime, e.endTime]),
      [
        ['E4-tue', 'Tue', '6p', '8p'],
        ['E4-thu', 'Thu', '7p', '9p'],
      ]
    );
    const sameDayEv = makeEvent({
      id: 'E5',
      dayOfWeek: 'Sat',
      startTime: '10a / 2p',
      endTime: '12p / 4p',
    });
    assert.deepEqual(
      expandEventSchedules(sameDayEv).map((e) => [e.id, e.dayOfWeek, e.startTime, e.endTime]),
      [
        ['E5-sat-1', 'Sat', '10a', '12p'],
        ['E5-sat-2', 'Sat', '2p', '4p'],
      ]
    );
  });
  it('keeps single-time multi-day events unsplit', () => {
    const sameTimeMultiDay = makeEvent({
      id: 'FOCO0020',
      dayOfWeek: 'Tue, Thu',
      startTime: '6p',
      endTime: '9p',
    });
    const result = expandEventSchedules(sameTimeMultiDay);
    assert.equal(result.length, 1);
    assert.equal(result[0].dayOfWeek, 'Tue, Thu');
    assert.equal(result[0].startTime, '6p');
    assert.equal(result[0].endTime, '9p');
  });
});

describe('isMonthActive', () => {
  it('respects month ranges, exclusions, bi-monthly, and odd/even months', () => {
    assert.equal(isMonthActive('May-Sep', new Date(2026, 5, 1)), true);
    assert.equal(isMonthActive('May-Sep', new Date(2026, 0, 1)), false);
    assert.equal(isMonthActive('Except July and August', new Date(2026, 6, 1)), false);
    assert.equal(isMonthActive('Except July and August', new Date(2026, 5, 1)), true);
    assert.equal(isMonthActive('Bi-monthly', new Date(2026, 0, 1)), false);
    assert.equal(isMonthActive('Bi-monthly', new Date(2026, 1, 1)), true);
    assert.equal(isMonthActive('Bi-monthly, odd months', new Date(2026, 0, 1)), true);
    assert.equal(isMonthActive('Bi-monthly, odd months', new Date(2026, 1, 1)), false);
  });
});

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
  it('builds valid schema.org/Event JSON-LD including venue, organizer, and registration URLs', () => {
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
    const occ = getNextEventOccurrence(ev, 'America/Bogota', 90, new Date('2026-01-02T15:00:00Z'));
    const ld = buildEventJsonLd(
      ev,
      CITIES['medellin-colombia'],
      'https://www.someplacesocial.org/medellin-colombia/events/salsa-night-14',
      occ
    ) as Record<string, unknown>;
    assert.ok(ld);
    assert.equal(ld['@type'], 'Event');
    assert.equal(ld['eventAttendanceMode'], 'https://schema.org/OfflineEventAttendanceMode');
    assert.equal(String(ld['startDate']).startsWith('2026-01-02T20:00:00'), true);
    assert.equal((ld['location'] as Record<string, unknown>)['url'], 'https://sonhavana.com');
    assert.equal(
      (ld['organizer'] as Record<string, unknown>)['url'],
      'https://instagram.com/medellinsalsa'
    );
    assert.equal(
      (ld['offers'] as Record<string, unknown>)['url'],
      'https://eventbrite.com/e/salsa-14'
    );
  });
});

describe('getEventDisplayDetails', () => {
  it('normalizes venue, organizer, and registration URLs and falls back to plain text when blank or unsafe', () => {
    const linked = getEventDisplayDetails(
      makeEvent({
        venue: 'Maxline Brewing',
        venueUrl: 'maxlinebrewing.com',
        organization: 'Hosted by Geeks Who Drink',
        organizerUrl: 'https://instagram.com/geekswhodrink',
        preRegistration: 'Registration required.',
        registrationUrl: 'geekswhodrink.com/register',
      }),
      'Fort Collins'
    );
    assert.equal(linked.displayVenue, 'Maxline Brewing');
    assert.equal(linked.venueUrl, 'https://maxlinebrewing.com');
    assert.equal(linked.organizerName, 'Geeks Who Drink');
    assert.equal(linked.organizerUrl, 'https://instagram.com/geekswhodrink');
    assert.equal(linked.showOrganizer, true);
    assert.equal(linked.preRegistrationText, 'Registration required.');
    assert.equal(linked.registrationUrl, 'https://geekswhodrink.com/register');
    assert.equal(linked.needsSignupIcon, true);

    const blankAndUnsafe = getEventDisplayDetails(
      makeEvent({
        venue: 'City Park',
        venueUrl: 'javascript:alert(1)',
        organization: '',
        organizerUrl: '',
        preRegistration: 'Drop-in (no RSVP needed)',
        registrationUrl: '',
      }),
      'Fort Collins'
    );
    assert.equal(blankAndUnsafe.venueUrl, '');
    assert.equal(blankAndUnsafe.showOrganizer, false);
    assert.equal(blankAndUnsafe.registrationUrl, '');
    assert.equal(blankAndUnsafe.needsSignupIcon, false);
  });
});

describe('linkify Prove It and Contact text', () => {
  it('normalizes empty and x placeholder values', () => {
    assert.equal(normalizeProveItText(''), '');
    assert.equal(normalizeProveItText('   '), '');
    assert.equal(normalizeProveItText('x'), '');
    assert.equal(normalizeProveItText('X'), '');
    assert.equal(normalizeProveItText('  maxlinebrewing.com  '), 'maxlinebrewing.com');
    assert.equal(normalizeContactText(''), '');
    assert.equal(normalizeContactText('x'), '');
    assert.equal(normalizeContactText('  info@venue.com  '), 'info@venue.com');
  });
  it('links bare URLs in all provided Prove It examples', () => {
    const ex1 = parseTextWithLinks(
      'Go to maxlinebrewing.com/whats-happening , click on the "Community Events" tab. Also, at instagram.com/p/De-X7zOMr6n'
    );
    assert.deepEqual(ex1, [
      { type: 'text', text: 'Go to ' },
      {
        type: 'link',
        text: 'maxlinebrewing.com/whats-happening',
        href: 'https://maxlinebrewing.com/whats-happening',
      },
      { type: 'text', text: ' , click on the "Community Events" tab. Also, at ' },
      {
        type: 'link',
        text: 'instagram.com/p/De-X7zOMr6n',
        href: 'https://instagram.com/p/De-X7zOMr6n',
      },
    ]);
    const ex2 = parseTextWithLinks(
      'Go to breckbrew.com/events/y2k-bingo-night . Also, at instagram.com/p/DfV0gzJjq-e/?img_index=2'
    );
    assert.deepEqual(ex2, [
      { type: 'text', text: 'Go to ' },
      {
        type: 'link',
        text: 'breckbrew.com/events/y2k-bingo-night',
        href: 'https://breckbrew.com/events/y2k-bingo-night',
      },
      { type: 'text', text: ' . Also, at ' },
      {
        type: 'link',
        text: 'instagram.com/p/DfV0gzJjq-e/?img_index=2',
        href: 'https://instagram.com/p/DfV0gzJjq-e/?img_index=2',
      },
    ]);
    const ex3 = parseTextWithLinks(
      'Go to comedyfortcollins.com/events/142205 , click on "Biography" link for further details like price. Also, at instagram.com/p/DfiPohTlspn'
    );
    assert.deepEqual(ex3, [
      { type: 'text', text: 'Go to ' },
      {
        type: 'link',
        text: 'comedyfortcollins.com/events/142205',
        href: 'https://comedyfortcollins.com/events/142205',
      },
      { type: 'text', text: ' , click on "Biography" link for further details like price. Also, at ' },
      {
        type: 'link',
        text: 'instagram.com/p/DfiPohTlspn',
        href: 'https://instagram.com/p/DfiPohTlspn',
      },
    ]);
  });
  it('handles protocols, emails, query params, multi-part TLDs, curly quotes, and ignores non-URLs', () => {
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
  it('links emails, contact URLs, phone numbers, and mixed contact strings safely', () => {
    assert.deepEqual(parseContactWithLinks('x'), []);
    assert.deepEqual(parseContactWithLinks('mailto:hello@venue.com'), [
      { type: 'link', text: 'hello@venue.com', href: 'mailto:hello@venue.com' },
    ]);
    assert.deepEqual(parseContactWithLinks('venue.com/contact'), [
      { type: 'link', text: 'venue.com/contact', href: 'https://venue.com/contact' },
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

describe('calendar helpers (Google Calendar, ICS & copy summary)', () => {
  it('builds a clean single-occurrence Google Calendar URL, simple copySummary, and omits extraneous fields', () => {
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
      proveIt: 'instagram.com/p/secret-verification-note',
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
    assert.equal(desc.includes('Medellin Sheet Row 44'), false);
    assert.equal(desc.includes('MED014'), false);
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