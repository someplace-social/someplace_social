"use client";

import { useState, useEffect, useMemo } from 'react';
import { getEvents, Event } from '../lib/google-sheets';
import Accordion from '../components/Accordion';
import FilterBar from '../components/FilterBar';
import pageStyles from '../Page.module.css';
import styles from './Medellin.module.css';

const daysOfWeek = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

export default function MedellinPage() {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [filters, setFilters] = useState({ activity: 'all', area: 'all' });

  useEffect(() => {
    // getEvents is now only called once on component mount
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

      return activityMatch && areaMatch;
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
      <h1>Medellin Weekly Events & Activity Guide</h1>
      
      <FilterBar 
        activities={uniqueActivities} 
        areas={uniqueAreas} 
        onFilterChange={setFilters} 
      />

      {daysOfWeek.map(day => (
        eventsByDay[day] && eventsByDay[day].length > 0 ? (
          <Accordion key={day} title={day}>
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
          </Accordion>
        ) : null
      ))}
    </main>
  );
}