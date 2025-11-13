"use client";

import { useState, useEffect } from 'react';
import { getEvents, Event } from '../lib/google-sheets';
import Accordion from '../components/Accordion';

const daysOfWeek = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

export default function MedellinPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      const fetchedEvents = await getEvents();
      setEvents(fetchedEvents);
      setIsLoading(false);
    }
    fetchEvents();
  }, []);

  // Group events by the day of the week
  const eventsByDay = events.reduce((acc, event) => {
    const day = event.dayOfWeek;
    if (!acc[day]) {
      acc[day] = [];
    }
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
      
      {daysOfWeek.map(day => (
        eventsByDay[day] ? (
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