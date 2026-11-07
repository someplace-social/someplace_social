'use client';

import { useState, useEffect, useMemo, useId } from 'react';
import Link from 'next/link';
import { CityConfig } from '../lib/cities';
import { getEvents, Event } from '../lib/google-sheets';
import {
  parseHour,
  formatTimeRange,
  isFreePrice,
  matchesDay,
  ensureExternalUrl,
} from './utils';
import styles from './EventsView.module.css';

const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NAMES_LONG = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

type TimeGroup = {
  name: string;
  predicate: (hour: number) => boolean;
};

const TIME_GROUPS: TimeGroup[] = [
  { name: 'Morning', predicate: (h) => h < 12 },
  { name: 'Afternoon', predicate: (h) => h >= 12 && h < 17 },
  { name: 'Evening', predicate: (h) => h >= 17 && h < 20 },
  { name: 'Night', predicate: (h) => h >= 20 },
];

export default function CityEventsView({ city }: { city: CityConfig }) {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [freeOnly, setFreeOnly] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [openEventId, setOpenEventId] = useState<string | null>(null);

  const [editModalEvent, setEditModalEvent] = useState<Event | null>(null);
  const [editEmail, setEditEmail] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [editStatus, setEditStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activitySelectId = useId();
  const areaSelectId = useId();

  useEffect(() => {
    setLoading(true);
    getEvents(city)
      .then((data) => {
        setAllEvents(data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [city]);

  const rollingWeek = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return d;
    });
  }, []);

  const activeDate = rollingWeek[activeDayIdx] || rollingWeek[0];
  const now = new Date();
  const nowHour = now.getHours() + now.getMinutes() / 60;

  const activities = useMemo(() => {
    const set = new Set<string>();
    allEvents.forEach((ev) => {
      if (ev.activity1) set.add(ev.activity1.trim());
      if (ev.activity2) set.add(ev.activity2.trim());
      if (ev.activity3) set.add(ev.activity3.trim());
    });
    return Array.from(set).filter(Boolean).sort();
  }, [allEvents]);

  const areas = useMemo(() => {
    const set = new Set<string>();
    allEvents.forEach((ev) => {
      if (ev.area && ev.area.trim().length > 0 && ev.area.trim().length < 30) {
        set.add(ev.area.trim());
      }
    });
    return Array.from(set).sort();
  }, [allEvents]);

  const getFilteredEventsForDay = (dayIndex: number) => {
    const day = rollingWeek[dayIndex];
    if (!day) return [];
    const dayName = DAY_NAMES_LONG[day.getDay()];

    return allEvents
      .filter((ev) => {
        const matchesCurrentDay = matchesDay(ev.dayOfWeek, dayName);
        if (!matchesCurrentDay) return false;

        if (freeOnly && !isFreePrice(ev.price)) return false;

        if (selectedActivity) {
          const acts = [ev.activity1, ev.activity2, ev.activity3].map((a) =>
            (a || '').trim().toLowerCase()
          );
          if (!acts.includes(selectedActivity.toLowerCase())) return false;
        }

        if (selectedArea && ev.area.trim() !== selectedArea.trim()) {
          return false;
        }

        return true;
      })
      .sort((a, b) => parseHour(a.startTime) - parseHour(b.startTime));
  };

  const currentList = useMemo(() => {
    return getFilteredEventsForDay(activeDayIdx);
  }, [allEvents, activeDayIdx, freeOnly, selectedActivity, selectedArea, rollingWeek]);

  const nextUpEventId = useMemo(() => {
    if (activeDayIdx !== 0) return null;
    const nextEvent = currentList.find((ev) => parseHour(ev.startTime) >= nowHour);
    return nextEvent ? nextEvent.id || nextEvent.title : null;
  }, [activeDayIdx, currentList, nowHour]);

  const hasActiveFilters = freeOnly || selectedActivity !== '' || selectedArea !== '';

  const clearFilters = () => {
    setFreeOnly(false);
    setSelectedActivity('');
    setSelectedArea('');
  };

  const handleOpenEdit = (event: Event) => {
    setEditModalEvent(event);
    setEditEmail('');
    setEditStatus(null);
    setEditMessage(
      `City: ${city.name}\nEvent: ${event.title}\nVenue: ${event.venue || event.location}\nTime: ${event.startTime} - ${event.endTime}\nLocation: ${event.location} (${event.area})\n\nRequested changes: `
    );
  };

  const handleCloseEdit = () => {
    setEditModalEvent(null);
    setEditStatus(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalEvent) return;
    setIsSubmitting(true);
    setEditStatus('Submitting update...');

    try {
      const fullMessage = `Sender Email: ${editEmail || 'Not provided'}\n\n${editMessage}`;
      const response = await fetch('/api/send-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formType: `Edit a Listing (${city.name})`,
          message: fullMessage,
        }),
      });

      const res = await response.json();
      if (res.success) {
        setEditStatus('Thanks! Your edit suggestion has been sent.');
        setTimeout(() => {
          handleCloseEdit();
        }, 1800);
      } else {
        setEditStatus('Failed to send. Please try again.');
      }
    } catch {
      setEditStatus('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrap}>
        <header className={styles.top}>
          <div className={styles.brand}>
            Someplace Social
            <small>{city.heroLocation}</small>
          </div>
          <Link href="/contact">+ Add event</Link>
        </header>

        <section className={styles.stick}>
          <div className={styles.days} role="group" aria-label="Pick a day">
            {rollingWeek.map((day, idx) => {
              const dayShort = idx === 0 ? 'Today' : DAY_NAMES_SHORT[day.getDay()];
              const count = getFilteredEventsForDay(idx).length;
              const isSelected = idx === activeDayIdx;

              return (
                <button
                  key={idx}
                  type="button"
                  className={styles.day}
                  aria-pressed={isSelected}
                  onClick={() => {
                    setActiveDayIdx(idx);
                    setOpenEventId(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <span>{dayShort}</span>
                  <b>{day.getDate()}</b>
                  <span>{count} events</span>
                </button>
              );
            })}
          </div>

          <div className={styles.filters}>
            <button
              type="button"
              className={styles.chip}
              aria-pressed={freeOnly}
              onClick={() => setFreeOnly(!freeOnly)}
            >
              Free only
            </button>

            <select
              id={activitySelectId}
              className={`${styles.chip} ${selectedActivity ? styles.on : ''}`}
              aria-label="Activity"
              value={selectedActivity}
              onChange={(e) => setSelectedActivity(e.target.value)}
            >
              <option value="">All activities</option>
              {activities.map((act) => (
                <option key={act} value={act}>
                  {act}
                </option>
              ))}
            </select>

            <select
              id={areaSelectId}
              className={`${styles.chip} ${selectedArea ? styles.on : ''}`}
              aria-label="Area"
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
            >
              <option value="">All areas</option>
              {areas.map((ar) => (
                <option key={ar} value={ar}>
                  {ar}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                className={styles.clear}
                onClick={clearFilters}
              >
                Clear
              </button>
            )}
          </div>
        </section>

        <h1 className={styles.title}>
          {activeDayIdx === 0
            ? 'Today'
            : activeDayIdx === 1
            ? 'Tomorrow'
            : DAY_NAMES_LONG[activeDate.getDay()]}
        </h1>
        <p className={styles.sub}>
          {DAY_NAMES_LONG[activeDate.getDay()]}, {activeDate.getDate()}{' '}
          {MONTH_NAMES[activeDate.getMonth()]} · {currentList.length}{' '}
          {currentList.length === 1 ? 'thing' : 'things'} on
        </p>

        <main id="list">
          {loading ? (
            <div className={styles.empty}>
              <b>Loading {city.name} events...</b>
              Gathering weekly activities.
            </div>
          ) : currentList.length === 0 ? (
            <div className={styles.empty}>
              <b>Nothing listed{hasActiveFilters ? ' with these filters' : ''}</b>
              {hasActiveFilters
                ? 'Try clearing a filter.'
                : 'Know a spot that runs on this day? Add it.'}
            </div>
          ) : (
            TIME_GROUPS.map((group) => {
              const groupEvents = currentList.filter((ev) =>
                group.predicate(parseHour(ev.startTime))
              );
              if (groupEvents.length === 0) return null;

              return (
                <div key={group.name}>
                  <div className={styles.grp}>{group.name}</div>
                  {groupEvents.map((ev, i) => {
                    const uniqueId = ev.id || `${ev.title}-${i}`;
                    const isOpen = openEventId === uniqueId;
                    const isNextUp = uniqueId === nextUpEventId;
                    const { start, end } = formatTimeRange(ev.startTime, ev.endTime);
                    const isFree = isFreePrice(ev.price);
                    const tagList = [ev.activity1, ev.activity2, ev.activity3].filter(
                      Boolean
                    );
                    const displayVenue = ev.venue || ev.location;

                    return (
                      <div className={styles.ev} key={uniqueId}>
                        <button
                          type="button"
                          className={styles.row}
                          aria-expanded={isOpen}
                          onClick={() => setOpenEventId(isOpen ? null : uniqueId)}
                        >
                          <div className={styles.time}>
                            {start}
                            {end && <small>to {end}</small>}
                          </div>
                          <div className={styles.mid}>
                            {isNextUp && (
                              <>
                                <span className={styles.next}>Next up</span>
                                <br />
                              </>
                            )}
                            <div className={styles.name}>
                              {ev.title}
                              {ev.organization && ev.organization !== displayVenue && (
                                <span className={styles.host}>
                                  {' '}
                                  w/ {ev.organization}
                                </span>
                              )}
                            </div>
                            <div className={styles.where}>
                              {displayVenue}
                              {ev.area ? ` · ${ev.area}` : ''}
                            </div>
                            {tagList.length > 0 && (
                              <div className={styles.tags}>
                                {tagList.map((tag) => (
                                  <i key={tag}>{tag}</i>
                                ))}
                              </div>
                            )}
                          </div>
                          <span className={`${styles.price} ${isFree ? styles.f : ''}`}>
                            {ev.price || 'Free'}
                          </span>
                        </button>

                        {isOpen && (
                          <div className={styles.more}>
                            {ev.map && (
                              <a
                                className={styles.map}
                                href={ensureExternalUrl(ev.map)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Open in Maps
                              </a>
                            )}
                            {ev.website && (
                              <a
                                href={ensureExternalUrl(ev.website)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Website
                              </a>
                            )}
                            {ev.social && (
                              <a
                                href={ensureExternalUrl(ev.social)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Instagram
                              </a>
                            )}
                            {ev.contact && (
                              <a
                                href={ensureExternalUrl(ev.contact)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Contact
                              </a>
                            )}
                            <button
                              type="button"
                              className={styles.edit}
                              onClick={() => handleOpenEdit(ev)}
                            >
                              Suggest edit
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </main>

        <footer className={styles.foot} id="add">
          Details change fast. Tap an event, then <b>Suggest edit</b> if something is
          off. Know about an event? <Link href="/contact">Submit a listing</Link>.
          <br />
          <br />
          Free for everyone, no ads.{' '}
          <a
            href="https://buymeacoffee.com/someplacesocial"
            target="_blank"
            rel="noopener noreferrer"
          >
            Buy me a drink
          </a>
          .
        </footer>
      </div>

      {editModalEvent && (
        <div className={styles.modalBackdrop} onClick={handleCloseEdit}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className={styles.modalHeader}>
              <div>
                <h2>Suggest Edit</h2>
                <small>{editModalEvent.title}</small>
              </div>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={handleCloseEdit}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className={styles.modalForm}>
              <div className={styles.modalField}>
                <label htmlFor="editEmail">Your Email (optional)</label>
                <input
                  id="editEmail"
                  type="email"
                  className={styles.modalInput}
                  placeholder="name@example.com"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />
              </div>
              <div className={styles.modalField}>
                <label htmlFor="editMessage">What needs to be changed? *</label>
                <textarea
                  id="editMessage"
                  required
                  className={styles.modalTextarea}
                  value={editMessage}
                  onChange={(e) => setEditMessage(e.target.value)}
                />
              </div>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={handleCloseEdit}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Edit'}
                </button>
              </div>
              {editStatus && <p className={styles.statusMsg}>{editStatus}</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}