import type { Event } from '../lib/google-sheets';

export function makeEvent(overrides: Partial<Event> = {}): Event {
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
    url1: '',
    url1Notes: '',
    url2: '',
    url2Notes: '',
    about: '',
    notes: '',
    database: '',
    ...overrides,
  };
}