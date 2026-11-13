import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Event } from '../lib/google-sheets';
import { isEventActiveOnDate, isMonthActive } from './utils';
function makeEvent(overrides: Partial<Event>): Event {
  return {
    id: '1',
    title: 'Test Event',
    venue: 'Test Venue',
    organization: 'Test Org',
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
    map: '',
    social: '',
    website: '',
    contact: '',
    about: '',
    notes: '',
    database: '',
    ...overrides,
  };
}
// 2026 Fridays:
// Jan (odd month, 31 days):
//   Jan 2  = ISO week 1 (odd),  1st Fri
//   Jan 9  = ISO week 2 (even), 2nd Fri
//   Jan 16 = ISO week 3 (odd),  3rd Fri
//   Jan 23 = ISO week 4 (even), 4th Fri
//   Jan 30 = ISO week 5 (odd),  5th & Last Fri
// Feb (even month, 28 days):
//   Feb 6  = ISO week 6 (even), 1st Fri
//   Feb 13 = ISO week 7 (odd),  2nd Fri
//   Feb 20 = ISO week 8 (even), 3rd Fri
//   Feb 27 = ISO week 9 (odd),  4th & Last Fri
const jan2Fri = new Date(2026, 0, 2);
const jan3Sat = new Date(2026, 0, 3);
const jan5Mon = new Date(2026, 0, 5);
const jan7Wed = new Date(2026, 0, 7);
const jan9Fri = new Date(2026, 0, 9);
const jan16Fri = new Date(2026, 0, 16);
const jan23Fri = new Date(2026, 0, 23);
const jan30Fri = new Date(2026, 0, 30);
const feb6Fri = new Date(2026, 1, 6);
const feb13Fri = new Date(2026, 1, 13);
const feb20Fri = new Date(2026, 1, 20);
const feb27Fri = new Date(2026, 1, 27);
describe('isEventActiveOnDate frequency parsing', () => {
  it('handles Weekly events on matching days only', () => {
    const ev = makeEvent({ frequency: 'Weekly', dayOfWeek: 'Fri' });
    assert.equal(isEventActiveOnDate(ev, jan2Fri), true);
    assert.equal(isEventActiveOnDate(ev, jan9Fri), true);
    assert.equal(isEventActiveOnDate(ev, jan3Sat), false);
  });
  it('handles Twice-weekly with Mon & Wed', () => {
    const ev = makeEvent({ frequency: 'Twice-weekly', dayOfWeek: 'Mon & Wed' });
    assert.equal(isEventActiveOnDate(ev, jan5Mon), true);
    assert.equal(isEventActiveOnDate(ev, jan7Wed), true);
    assert.equal(isEventActiveOnDate(ev, jan2Fri), false);
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
  it('handles Bi-weekly with ordinal notes like 2nd & 4th Fri', () => {
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
  it('handles Monthly with Last Fri and Final Fri', () => {
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
  it('handles Bi-monthly variations, odd months override, and optional ordinals', () => {
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
  });
  it('handles paused and hiatus statuses', () => {
    const pausedEv = makeEvent({ frequency: 'Weekly', frequencyNotes: 'On hold' });
    assert.equal(isEventActiveOnDate(pausedEv, jan2Fri), false);
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