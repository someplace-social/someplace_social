"use client";
import { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import { getEvents, Event } from '../lib/google-sheets';
import { isEventActiveOnDate } from '../events/utils';
import DayAccordion from './DayAccordion';
import FilterBar from '../components/FilterBar';
import ContactForm from '../components/ContactForm';
import EventListing from './EventListing';
import pageStyles from '../Page.module.css';

const daysOfWeek = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

const editEventFields = [
  { name: 'Your Email', label: 'Your Email? (optional)', placeholder: 'e.g. john@doe.com', type: 'email', required: false },
  { name: 'Listing Needs to be Updated', label: 'Which Listing Needs to be Updated? *', placeholder: "This part can't be blank or we won't know what listing you're referring to!", type: 'text', required: true },
  { name: 'What Needs to be Changed', label: 'What Needs to be Changed? *', placeholder: "Ex. time, price, location etc. Or say, DOESN'T EXIST", type: 'textarea', required: true },
] as const;

export default function MedellinPage() {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [filters, setFilters] = useState({ activity: 'all', area: 'all', price: 100 });
  const editFormRef = useRef<HTMLDivElement>(null);

  const handleEditClick = (content: string) => {
    if (editFormRef.current) {
      const textarea = editFormRef.current.querySelector('textarea[name="What Needs to be Changed"]');
      if (textarea) {
        (textarea as HTMLTextAreaElement).value = "Please update this listing:\n\n" + content;
        editFormRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  useEffect(() => {
    document.title = "Weekly Events in Medellin | Someplace Social";
    getEvents().then((fetchedEvents) => {
      setAllEvents(fetchedEvents);
    });
  }, []);

  const uniqueActivities = useMemo(() => {
    const activitySet = new Set<string>();
    allEvents.forEach((event) => {
      const list =
        event.activities && event.activities.length > 0
          ? event.activities
          : event.activity
          ? event.activity.split(',').map((a) => a.trim()).filter(Boolean)
          : [event.activity1, event.activity2, event.activity3].filter(Boolean);
      list.forEach((a) => activitySet.add(a));
    });
    return Array.from(activitySet).sort();
  }, [allEvents]);

  const uniqueAreas = useMemo(() => {
    const areaSet = new Set<string>();
    allEvents.forEach((event) => {
      if (event.area) areaSet.add(event.area);
    });
    return Array.from(areaSet).sort();
  }, [allEvents]);

  const filteredEvents = useMemo(() => {
    return allEvents.filter((event) => {
      const evActs = (
        event.activities && event.activities.length > 0
          ? event.activities
          : event.activity
          ? event.activity.split(',').map((a) => a.trim()).filter(Boolean)
          : [event.activity1, event.activity2, event.activity3].filter(Boolean)
      ).map((a) => a.toLowerCase());

      const activityMatch =
        filters.activity === 'all' ||
        evActs.includes(filters.activity.toLowerCase()) ||
        event.activity1 === filters.activity ||
        event.activity2 === filters.activity ||
        event.activity3 === filters.activity;

      const areaMatch = filters.area === 'all' || event.area === filters.area;
      const numericPrice = parseFloat(event.price.replace(/[^0-9.]+/g, '')) || 0;
      const priceMatch = numericPrice <= filters.price;
      return activityMatch && areaMatch && priceMatch;
    });
  }, [allEvents, filters]);

  const currentWeekDates = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sun, 1 = Mon ...
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);

    const map: Record<string, Date> = {};
    daysOfWeek.forEach((dayName, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      map[dayName] = d;
    });
    return map;
  }, []);

  const eventsByDay = useMemo(() => {
    const map: Record<string, Event[]> = {};
    daysOfWeek.forEach((day) => {
      const targetDate = currentWeekDates[day] || new Date();
      map[day] = filteredEvents.filter((event) => isEventActiveOnDate(event, targetDate));
    });
    return map;
  }, [filteredEvents, currentWeekDates]);

  return (
    <main className={pageStyles.page}>
      <section className={pageStyles.heroSection}>
        <div className={pageStyles.heroText}>
          <h1>Medellin Weekly Events & Activity Guide</h1>
          <p><strong>by Someplace Social</strong></p>
          <p style={{ marginTop: '1rem' }}>
            Medellin, Colombia recurring activities, group events, and community classes all in one place. Find traveler friendly weekly language exchanges, free salsa classes, fun parties, and other stuff to do happening near you.
          </p>
        </div>
        <div className={pageStyles.illustrationContainer}>
          <Image src="/images/hero-medellin.png" alt="Illustration of two capybaras dancing" width={400} height={300} style={{ width: '100%', height: 'auto' }} />
        </div>
      </section>

      <FilterBar
        activities={uniqueActivities}
        areas={uniqueAreas}
        onFilterChange={setFilters}
      />

      <div style={{ width: '100%' }}>
        {daysOfWeek.map((day) => (
          eventsByDay[day] && eventsByDay[day].length > 0 ? (
            <DayAccordion key={day} title={day}>
              {eventsByDay[day].map((event, index) => (
                <EventListing key={index} event={event} onEdit={handleEditClick} />
              ))}
            </DayAccordion>
          ) : null
        ))}
      </div>

      <section ref={editFormRef} style={{ width: '100%', marginTop: '4rem' }}>
        <h2 style={{ fontSize: '2.5em' }}>Edit a Listing</h2>
        <p>These listings stay up to date because of the community members like you! If you see info that’s incorrect, let us know below.</p>
        <p>*Note: click the “✏️ EDIT” link at the end of the listing that needs to be updated to copy and paste it’s details below automatically.</p>
        <div style={{ width: '100%', marginTop: '2rem' }}>
          <ContactForm formType="Edit a Listing (Medellin)" fields={editEventFields} />
        </div>
      </section>
    </main>
  );
}