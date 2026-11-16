import Link from 'next/link';
import type { CityConfig } from '../../lib/cities';
import type { Event } from '../../lib/google-sheets';
import {
  formatRecurrenceText,
  formatTimeRange,
  isFreePrice,
} from '../utils';
import {
  getEventPath,
  getEventSlug,
  groupEventsForDirectory,
} from '../event-helpers';
import styles from './WeeklyEventDirectory.module.css';

interface WeeklyEventDirectoryProps {
  city: CityConfig;
  events: Event[];
}

export default function WeeklyEventDirectory({
  city,
  events,
}: WeeklyEventDirectoryProps) {
  const groups = groupEventsForDirectory(events);
  if (groups.length === 0) return null;

  return (
    <section
      className={styles.directory}
      aria-labelledby="all-city-events-heading"
    >
      <div className={styles.directoryInner}>
        <div className={styles.header}>
          <h2 id="all-city-events-heading" className={styles.heading}>
            All {city.name} Events
          </h2>
          <p className={styles.subheading}>
            Full weekly &amp; recurring directory · {events.length}{' '}
            {events.length === 1 ? 'listing' : 'listings'}
          </p>
        </div>
        <div className={styles.groups}>
          {groups.map((group) => (
            <div key={group.key} className={styles.group}>
              <div className={styles.groupHeader}>
                <h3 className={styles.groupTitle}>
                  {group.label}{' '}
                  <span className={styles.groupCount}>
                    ({group.events.length})
                  </span>
                </h3>
                <div className={styles.groupLine} aria-hidden="true" />
              </div>
              <ul className={styles.list}>
                {group.events.map((ev, idx) => {
                  const { start, end } = formatTimeRange(
                    ev.startTime,
                    ev.endTime
                  );
                  const timeText =
                    start && end ? `${start} – ${end}` : start || '';
                  const recurrence = formatRecurrenceText(
                    ev.frequency,
                    ev.frequencyNotes
                  );
                  const showCadence =
                    Boolean(recurrence) && !/^weekly$/i.test(recurrence);
                  const venue = (ev.venue || ev.location || '').trim();
                  const area = (ev.area || '').trim();
                  const placeText =
                    venue &&
                    area &&
                    venue.toLowerCase() !== area.toLowerCase()
                      ? `${venue} · ${area}`
                      : venue || area;
                  const free = Boolean(ev.price && isFreePrice(ev.price));

                  return (
                    <li
                      key={`${group.key}-${idx}-${getEventSlug(ev)}`}
                      className={styles.row}
                    >
                      <div className={styles.rowTop}>
                        <Link
                          href={getEventPath(city.slug, ev)}
                          className={styles.eventLink}
                        >
                          {ev.title}
                        </Link>
                        {ev.price && (
                          <span
                            className={`${styles.price} ${
                              free ? styles.priceFree : ''
                            }`}
                          >
                            {ev.price}
                          </span>
                        )}
                      </div>
                      {(timeText || showCadence || placeText) && (
                        <div className={styles.meta}>
                          {timeText && (
                            <span className={styles.time}>{timeText}</span>
                          )}
                          {showCadence && (
                            <span className={styles.cadence}>{recurrence}</span>
                          )}
                          {placeText && (
                            <span className={styles.place}>{placeText}</span>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}