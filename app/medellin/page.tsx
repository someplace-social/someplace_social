"use client";

import { useState, useEffect, useMemo } from 'react';
import { getEvents, Event } from '../lib/google-sheets';
import Accordion from '../components/Accordion';
import FilterBar from '../components/FilterBar';

const daysOfWeek = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

export default function MedellinPage() {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({ activity: 'all', area: 'all' });

  useEffect(() => {
    async function fetchEvents() {
      const fetchedEvents = await getEvents();
      setAllEvents(fetchedEvents);
      setIsLoading(false);
    }
    fetchEvents();
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

  if (isLoading) {
    return (
      <main style={{ padding: '2rem' }}>
        <h1>Medellin Weekly Events & Activity Guide</h1>
        <p>Loading listings...</p>
      </main>
    );
  }

  return (
    <main style={{ padding: '2rem' }}>
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
              <div key={index} style={{ marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                <strong>{event.title}</strong>
                <p>{[event.activity1, event.activity2, event.activity3].filter(a => a).join(', ')}</p>
                <p>
                  <span>⏳{event.startTime} - {event.endTime}</span> | 
                  <span> 💰{event.price || 'Free/Varies'}</span> | 
                  <span> 📍{event.location}</span>
                </p>
              </div>
            ))}
          </Accordion>
        ) : null
      ))}
    </main>
  );
}