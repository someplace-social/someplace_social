"use client";

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { getEvents, Event } from '../lib/google-sheets';
import DayAccordion from './DayAccordion';
import FilterBar from '../components/FilterBar';
import ContactForm from '../components/ContactForm';
import pageStyles from '../Page.module.css';
import styles from './Medellin.module.css';

const daysOfWeek = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

const editEventFields = [
  { name: 'Your Email', label: 'Your Email (optional)', type: 'email', required: false },
  { name: 'Listing Needs to be Updated', label: 'Which Listing Needs to be Updated? *', type: 'text', required: true },
  { name: 'What Needs to be Changed', label: 'What Needs to be Changed? *', type: 'textarea', required: true },
] as const;

export default function MedellinPage() {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [filters, setFilters] = useState({ activity: 'all', area: 'all', price: 100 });

  useEffect(() => {
    getEvents().then(fetchedEvents => {
      setAllEvents(fetchedEvents);
    });
  }, []);

  const uniqueActivities = useMemo(() => {
    const activitySet = new Set<string>();
    allEvents.forEach(event => {
      if (event.activity1) activitySet.add(event.activity1);
      if (event.activity2) activitySet.add(event.activity2);
      if (event.activity3) activitySet.add(event.activity3);
    });
    return Array.from(activitySet).sort();
  }, [allEvents]);

  const uniqueAreas = useMemo(() => {
    const areaSet = new Set<string>();
    allEvents.forEach(event => {
      if (event.area) areaSet.add(event.area);
    });
    return Array.from(areaSet).sort();
  }, [allEvents]);

  const filteredEvents = useMemo(() => {
    return allEvents.filter(event => {
      const activityMatch = filters.activity === 'all' ||
        event.activity1 === filters.activity ||
        event.activity2 === filters.activity ||
        event.activity3 === filters.activity;
      
      const areaMatch = filters.area === 'all' || event.area === filters.area;

      const numericPrice = parseFloat(event.price.replace(/[^0-9.]+/g, "")) || 0;
      const priceMatch = numericPrice <= filters.price;

      return activityMatch && areaMatch && priceMatch;
    });
  }, [allEvents, filters]);

  const eventsByDay = filteredEvents.reduce((acc, event) => {
    const day = event.dayOfWeek;
    if (!acc[day]) acc[day] = [];
    acc[day].push(event);
    return acc;
  }, {} as Record<string, Event[]>);

  return (
    <main className={pageStyles.page}>
      {/* Hero Section */}
      <section className={pageStyles.heroSection}>
        <div className={pageStyles.heroText}>
          <h1 style={{ fontSize: '3em', marginBottom: '1rem' }}>Medellin Weekly Events & Activity Guide</h1>
          <p>by Someplace Social</p>
          <p style={{marginTop: '1rem'}}>Medellin, Colombia recurring activities, group events, and community classes all in one place. Find traveler friendly language exchanges, free salsa classes, fun parties, and other stuff to do happening near you.</p>
        </div>
        <div className={pageStyles.illustrationContainer}>
          <Image src="/images/hero-medellin.png" alt="Illustration of two capybaras dancing" width={400} height={300} style={{ width: '100%', height: 'auto' }} />
        </div>
      </section>

      {/* Filter Bar */}
      <FilterBar 
        activities={uniqueActivities} 
        areas={uniqueAreas} 
        onFilterChange={setFilters} 
      />

      {/* Accordions Section */}
      <div style={{ width: '100%' }}>
        {daysOfWeek.map(day => (
          eventsByDay[day] && eventsByDay[day].length > 0 ? (
            <DayAccordion key={day} title={day}>
              {eventsByDay[day].map((event, index) => (
                <div key={index} className={styles.listing}>
                  <strong className={styles.listingTitle}>{event.title}</strong>
                  <p>{[event.activity1, event.activity2, event.activity3].filter(a => a).join(', ')}</p>
                  <p className={styles.listingDetails}>
                    <span>⏳{event.startTime} - {event.endTime}</span>
                    <span>💰{event.price || 'Free/Varies'}</span>
                    <span>📍{event.location}</span>
                  </p>
                </div>
              ))}
            </DayAccordion>
          ) : null
        ))}
      </div>

      {/* Edit Listing Form Section */}
      <section style={{width: '100%', marginTop: '4rem'}}>
        <h2 style={{fontSize: '2.5em'}}>Edit a Listing</h2>
        <p>These listings stay up to date because of the community members like you! If you see info that's incorrect, let us know below.</p>
        <p>*Note: click the "✏️ EDIT" link at the end of the listing that needs to be updated to copy and paste its details below automatically.</p>
        <div style={{width: '100%', marginTop: '2rem'}}>
          <ContactForm formType="Edit a Listing (Medellin)" fields={editEventFields} />
        </div>
      </section>
    </main>
  );
}