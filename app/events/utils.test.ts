import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  ensureExternalUrl,
  filterAndCountEvents,
  indexEvents,
  isDateRecurringEvent,
  isEventActiveOnDate,
  isMonthActive,
} from './utils';
import { expandEventSchedules } from './schedule-splitter';
import { makeEvent } from './test-fixtures';
import { DEFAULT_USD_PRICE_CONFIG } from '../lib/cities';

const jan1Thu = new Date(2026, 0, 1);
const jan2Fri = new Date(2026, 0, 2);
const jan3Sat = new Date(2026, 0, 3);
const jan4Sun = new Date(2026, 0, 4);
const jan5Mon = new Date(2026, 0, 5);
const jan7Wed = new Date(2026, 0, 7);
const jan9Fri = new Date(2026, 0, 9);
const jan12Mon = new Date(2026, 0, 12);
const jan15Thu = new Date(2026, 0, 15);
const jan16Fri = new Date(2026, 0, 16);
const jan23Fri = new Date(2026, 0, 23);
const jan25Sun = new Date(2026, 0, 25);
const jan30Fri = new Date(2026, 0, 30);
const jan31Sat = new Date(2026, 0, 31);
const feb1Sun = new Date(2026, 1, 1);
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
const feb28Sat = new Date(2026, 1, 28);
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

  it('handles Multi-day rows with Sat & Sun appearing under each day', () => {
    const multiDay = makeEvent({ frequency: 'Weekly', dayOfWeek: 'Sat & Sun' });
    assert.equal(isEventActiveOnDate(multiDay, jan3Sat), true);
    assert.equal(isEventActiveOnDate(multiDay, jan4Sun), true);
    assert.equal(isEventActiveOnDate(multiDay, jan5Mon), false);
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

  it('handles Plain Bi-weekly rows without anchor week by showing them on their weekday', () => {
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
      assert.equal(isEventActiveOnDate(ev, jan2Fri), true, `${v.frequency || v.frequencyNotes} on Fri W1`);
      assert.equal(isEventActiveOnDate(ev, jan9Fri), true, `${v.frequency || v.frequencyNotes} on Fri W2`);
      assert.equal(isEventActiveOnDate(ev, jan3Sat), false, `${v.frequency || v.frequencyNotes} on Sat`);
    }
    const biweeklyMon = makeEvent({ frequency: 'Bi-weekly', dayOfWeek: 'Mon' });
    assert.equal(isEventActiveOnDate(biweeklyMon, jan5Mon), true);
    assert.equal(isEventActiveOnDate(biweeklyMon, jan12Mon), true);
  });

  it('respects explicit Odd weeks and Even weeks anchor rules for Bi-weekly', () => {
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

  it('handles Week-of-month patterns including 1st & 3rd Tue and 1st, 3rd & 5th Tue with plural weekdays', () => {
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

    const pluralTue = makeEvent({
      frequency: 'Monthly, 1st & 3rd Tuesdays',
      dayOfWeek: 'Tue',
    });
    assert.equal(isEventActiveOnDate(pluralTue, feb3Tue), true);
    assert.equal(isEventActiveOnDate(pluralTue, feb10Tue), false);
    assert.equal(isEventActiveOnDate(pluralTue, feb17Tue), true);
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

  it('handles Date-of-Month recurring rows (Monthly 1st, 15th, Last day) with Day of Week = Varies', () => {
    const potluck = makeEvent({
      title: 'Community Potluck',
      dayOfWeek: 'Varies',
      frequency: 'Monthly, 1st',
    });
    assert.equal(isDateRecurringEvent(potluck), true);
    assert.equal(isEventActiveOnDate(potluck, jan1Thu), true);
    assert.equal(isEventActiveOnDate(potluck, jan2Fri), false);
    assert.equal(isEventActiveOnDate(potluck, feb1Sun), true);

    const midMonth = makeEvent({
      title: 'Book Swap',
      dayOfWeek: 'Varies',
      frequency: 'Monthly, 15th',
    });
    assert.equal(isDateRecurringEvent(midMonth), true);
    assert.equal(isEventActiveOnDate(midMonth, jan15Thu), true);
    assert.equal(isEventActiveOnDate(midMonth, jan16Fri), false);

    const lastDay = makeEvent({
      title: 'End of Month Party',
      dayOfWeek: 'Varies',
      frequency: 'Monthly, Last day',
    });
    assert.equal(isDateRecurringEvent(lastDay), true);
    assert.equal(isEventActiveOnDate(lastDay, jan31Sat), true);
    assert.equal(isEventActiveOnDate(lastDay, jan30Fri), false);
    assert.equal(isEventActiveOnDate(lastDay, feb28Sat), true);
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
      url1: 'rbar.com/karaoke',
      url1Notes: 'See events calendar',
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
        url1: e.url1,
        url1Notes: e.url1Notes,
      })),
      [
        {
          id: 'FOCO0024-mon',
          dayOfWeek: 'Mon',
          startTime: '7p',
          endTime: '10p',
          venueUrl: 'rbar.com',
          organizerUrl: 'instagram.com/rbar',
          url1: 'rbar.com/karaoke',
          url1Notes: 'See events calendar',
        },
        {
          id: 'FOCO0024-wed',
          dayOfWeek: 'Wed',
          startTime: '8p',
          endTime: '11p',
          venueUrl: 'rbar.com',
          organizerUrl: 'instagram.com/rbar',
          url1: 'rbar.com/karaoke',
          url1Notes: 'See events calendar',
        },
        {
          id: 'FOCO0024-sat',
          dayOfWeek: 'Sat',
          startTime: '8p',
          endTime: '11p',
          venueUrl: 'rbar.com',
          organizerUrl: 'instagram.com/rbar',
          url1: 'rbar.com/karaoke',
          url1Notes: 'See events calendar',
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

describe('isMonthActive seasonal multi-ranges and exclusions', () => {
  it('respects single ranges, multi-season ranges (Sep-Nov & Feb-Apr), exclusions, and bimonthly', () => {
    assert.equal(isMonthActive('May-Sep', new Date(2026, 5, 1)), true);
    assert.equal(isMonthActive('May-Sep', new Date(2026, 0, 1)), false);
    assert.equal(isMonthActive('Sep–Nov Only', new Date(2026, 9, 15)), true);
    assert.equal(isMonthActive('Sep–Nov Only', new Date(2026, 0, 15)), false);

    assert.equal(isMonthActive('Sep–Nov & Feb–Apr Only', new Date(2026, 9, 15)), true);
    assert.equal(isMonthActive('Sep–Nov & Feb–Apr Only', new Date(2026, 2, 15)), true);
    assert.equal(isMonthActive('Sep–Nov & Feb–Apr Only', new Date(2026, 0, 15)), false);
    assert.equal(isMonthActive('Sep–Nov & Feb–Apr Only', new Date(2026, 6, 15)), false);

    assert.equal(isMonthActive('Except July and August', new Date(2026, 6, 1)), false);
    assert.equal(isMonthActive('Except July and August', new Date(2026, 5, 1)), true);
    assert.equal(isMonthActive('Bi-monthly', new Date(2026, 0, 1)), false);
    assert.equal(isMonthActive('Bi-monthly', new Date(2026, 1, 1)), true);
    assert.equal(isMonthActive('Bi-monthly, odd months', new Date(2026, 0, 1)), true);
    assert.equal(isMonthActive('Bi-monthly, odd months', new Date(2026, 1, 1)), false);
  });
});

describe('filterAndCountEvents with Date-of-Month recurring events and All Events tab', () => {
  it('does not pin date-recurring rows to weekday tabs but includes them in full directory and search results', () => {
    const rollingWeek = [
      new Date(2026, 0, 1),
      new Date(2026, 0, 2),
      new Date(2026, 0, 3),
      new Date(2026, 0, 4),
      new Date(2026, 0, 5),
      new Date(2026, 0, 6),
      new Date(2026, 0, 7),
    ];
    const events = [
      makeEvent({ id: '1', title: 'Friday Jam', dayOfWeek: 'Fri', startTime: '7:00 PM', price: 'Free' }),
      makeEvent({ id: '2', title: 'Saturday Hike', dayOfWeek: 'Sat', startTime: '9:00 AM', price: '$10' }),
      makeEvent({ id: '3', title: 'Community Potluck', dayOfWeek: 'Varies', frequency: 'Monthly, 1st', startTime: '5:00 PM', price: 'Free' }),
    ];
    const indexed = indexEvents(events, rollingWeek, 'USD');
    const timeGroups = [
      { name: 'Morning', predicate: (h: number) => h < 12 },
      { name: 'Evening', predicate: (h: number) => h >= 17 && h < 20 },
    ];

    assert.deepEqual(indexed[2].activeDays, [false, false, false, false, false, false, false]);

    const day0NoSearch = filterAndCountEvents(
      indexed,
      0,
      DEFAULT_USD_PRICE_CONFIG.maxPrice,
      DEFAULT_USD_PRICE_CONFIG,
      [],
      [],
      [],
      '',
      timeGroups
    );
    assert.equal(day0NoSearch.currentList.some((e) => e.title === 'Community Potluck'), false);
    assert.equal(day0NoSearch.dayCounts[0], 0);
    assert.equal(day0NoSearch.dayCounts[1], 1);
    assert.equal(day0NoSearch.dayCounts[2], 1);
    assert.equal(day0NoSearch.dayCounts[7], 3);
    assert.equal(day0NoSearch.allCount, 3);

    const day0WithSearch = filterAndCountEvents(
      indexed,
      0,
      DEFAULT_USD_PRICE_CONFIG.maxPrice,
      DEFAULT_USD_PRICE_CONFIG,
      [],
      [],
      [],
      'potluck',
      timeGroups
    );
    assert.equal(day0WithSearch.currentList.length, 1);
    assert.equal(day0WithSearch.currentList[0].title, 'Community Potluck');

    const allEventsTab = filterAndCountEvents(
      indexed,
      7,
      DEFAULT_USD_PRICE_CONFIG.maxPrice,
      DEFAULT_USD_PRICE_CONFIG,
      [],
      [],
      [],
      '',
      timeGroups
    );
    assert.equal(allEventsTab.currentList.length, 3);
    assert.equal(allEventsTab.currentList.some((e) => e.title === 'Community Potluck'), true);
  });
});

describe('ensureExternalUrl protocol hardening', () => {
  it('blocks dangerous, obfuscated, and unsupported schemes while preserving valid URLs', () => {
    assert.equal(ensureExternalUrl('javascript:alert(1)'), '');
    assert.equal(ensureExternalUrl('java\tscript:alert(1)'), '');
    assert.equal(ensureExternalUrl('\u0000javascript:alert(1)'), '');
    assert.equal(ensureExternalUrl('data:text/html,<script>alert(1)</script>'), '');
    assert.equal(ensureExternalUrl('vbscript:msgbox(1)'), '');
    assert.equal(ensureExternalUrl('file:///etc/passwd'), '');
    assert.equal(ensureExternalUrl('ftp://example.com/file'), '');
    assert.equal(ensureExternalUrl('http:evil.com'), '');
    assert.equal(ensureExternalUrl('///evil.com'), '');
    assert.equal(ensureExternalUrl('TBD'), '');

    assert.equal(ensureExternalUrl('maxlinebrewing.com/events?tab=1'), 'https://maxlinebrewing.com/events?tab=1');
    assert.equal(ensureExternalUrl('example.com:8080/events'), 'https://example.com:8080/events');
    assert.equal(ensureExternalUrl('//example.com/events?img_index=3'), 'https://example.com/events?img_index=3');
    assert.equal(ensureExternalUrl('https://example.com/path'), 'https://example.com/path');
    assert.equal(ensureExternalUrl('mailto:info@venue.com'), 'mailto:info@venue.com');
    assert.equal(ensureExternalUrl('tel:+19705551234'), 'tel:+19705551234');
  });
});