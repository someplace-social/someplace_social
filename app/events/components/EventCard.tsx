'use client';
import { memo } from 'react';
import { Event } from '../../lib/google-sheets';
import {
  formatTimeRange,
  formatRecurrenceText,
  isFreePrice,
  ensureExternalUrl,
  getTagStyle,
} from '../utils';
import ContactButton from './ContactButton';
import styles from './EventCard.module.css';
interface EventCardProps {
  event: Event;
  isOpen: boolean;
  isNextUp: boolean;
  cityName: string;
  onToggle: () => void;
  onOpenEdit: (ev: Event) => void;
}
function ActionButton({
  href,
  label,
  icon,
}: {
  href?: string;
  label: string;
  icon: React.ReactNode;
}) {
  if (href) {
    return (
      <a
        href={ensureExternalUrl(href)}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.btn}
      >
        {icon}
        {label}
      </a>
    );
  }
  return (
    <div className={`${styles.btn} ${styles.btnDisabled}`} aria-disabled="true">
      {icon}
      {label}
    </div>
  );
}
function EventCard({
  event,
  isOpen,
  isNextUp,
  cityName,
  onToggle,
  onOpenEdit,
}: EventCardProps) {
  const { start, end } = formatTimeRange(event.startTime, event.endTime);
  const isFree = isFreePrice(event.price);
  const tagList = event.activities || [];
  const displayVenue = event.venue || event.location;
  const cleanOrg = (event.organization || '')
    .trim()
    .replace(/^hosted\s+by\s+/i, '')
    .trim();
  const showOrganizer = Boolean(
    cleanOrg && cleanOrg.toLowerCase() !== (displayVenue || '').trim().toLowerCase()
  );
  const recurrenceText = formatRecurrenceText(event.frequency, event.frequencyNotes);
  const regLower = (event.preRegistration || '').trim().toLowerCase();
  const needsSignupIcon =
    !regLower.startsWith('drop') &&
    !regLower.startsWith('no ') &&
    !regLower.includes('no rsvp') &&
    !regLower.includes('not required') &&
    /\b(reg|rsvp|ticket|pre-?pay|required|recommended)\b/i.test(regLower);
  const hasMeta = Boolean(event.price || event.area || tagList.length > 0);
  const hasFacts = Boolean(recurrenceText || event.preRegistration);
  const mapsHref = event.map
    ? ensureExternalUrl(event.map)
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${displayVenue || event.title}, ${cityName}`
      )}`;
  const pinIcon = (className?: string) => (
    <svg
      className={className ? `${styles.icon} ${className}` : styles.icon}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
  const tagIcon = (
    <svg
      className={styles.icon}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
      <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
    </svg>
  );
  const compassIcon = (
    <svg
      className={styles.icon}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z" />
    </svg>
  );
  const chevIcon = (
    <svg
      className={styles.icon}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
  const repeatIcon = (
    <svg
      className={`${styles.icon} ${styles.factIcon}`}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m17 2 4 4-4 4" />
      <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
      <path d="m7 22-4-4 4-4" />
      <path d="M21 13v1a4 4 0 0 1-4 4H3" />
    </svg>
  );
  const checkIcon = (
    <svg
      className={`${styles.icon} ${styles.factIcon}`}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
  const penIcon = (className?: string) => (
    <svg
      className={className ? `${styles.icon} ${className}` : styles.icon}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20h9" />
      <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
    </svg>
  );
  const globeIcon = (
    <svg
      className={styles.icon}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
  const instaIcon = (
    <svg
      className={styles.icon}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
  return (
    <article className={`${styles.card} ${isOpen ? styles.open : ''}`}>
      <button
        type="button"
        className={styles.head}
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        <span className={styles.time}>
          <b>{start || '—'}</b>
          {end && <span>to {end}</span>}
        </span>
        <span className={styles.main}>
          {isNextUp && <span className={styles.next}>Next up</span>}
          <span className={styles.title}>{event.title}</span>
          {displayVenue && (
            <span className={styles.venue}>
              {pinIcon(styles.venueIcon)}
              <span>{displayVenue}</span>
            </span>
          )}
          {showOrganizer && (
            <span
              className={`${styles.host} ${!displayVenue ? styles.hostFlush : ''}`}
            >
              Hosted by {cleanOrg}
            </span>
          )}
          {hasMeta && (
            <span className={styles.meta}>
              {event.price && (
                <span
                  className={`${styles.price} ${
                    isFree ? styles.priceFree : styles.pricePaid
                  }`}
                >
                  {tagIcon}
                  <span>{event.price}</span>
                </span>
              )}
              {event.price && event.area && (
                <span className={styles.dot} aria-hidden="true" />
              )}
              {event.area && (
                <span className={styles.area}>
                  {compassIcon}
                  <span>{event.area}</span>
                </span>
              )}
              {(event.price || event.area) && tagList.length > 0 && (
                <span className={`${styles.dot} ${styles.sep2}`} aria-hidden="true" />
              )}
              {tagList.length > 0 && (
                <span className={styles.tags}>
                  {tagList.map((tag) => {
                    const customStyle = getTagStyle(tag);
                    return (
                      <span
                        key={tag}
                        className={styles.tag}
                        style={{
                          color: customStyle.color,
                          backgroundColor: customStyle.background,
                        }}
                      >
                        {tag}
                      </span>
                    );
                  })}
                </span>
              )}
            </span>
          )}
        </span>
        <span className={styles.chev} aria-hidden="true">
          {chevIcon}
        </span>
      </button>
      {isOpen && (
        <div className={styles.body}>
          {(event.about || event.notes) && (
            <p className={styles.desc}>{event.about || event.notes}</p>
          )}
          {hasFacts && (
            <div className={styles.facts}>
              {recurrenceText && (
                <span className={styles.fact}>
                  {repeatIcon}
                  <span>{recurrenceText}</span>
                </span>
              )}
              {event.preRegistration && (
                <span className={styles.fact}>
                  {needsSignupIcon ? penIcon(styles.factIcon) : checkIcon}
                  <span>{event.preRegistration}</span>
                </span>
              )}
            </div>
          )}
          <div className={styles.actions}>
            <a
              href={mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.btn} ${styles.btnPrimary}`}
              aria-label="Open in Maps"
            >
              {pinIcon()}
              Maps
            </a>
            <ActionButton href={event.website} label="Website" icon={globeIcon} />
            <ActionButton href={event.social} label="Instagram" icon={instaIcon} />
            <ContactButton
              contact={event.contact}
              btnClassName={styles.btn}
              btnActiveClassName={styles.btnActive}
              btnDisabledClassName={styles.btnDisabled}
            />
            <button
              type="button"
              className={styles.edit}
              onClick={() => onOpenEdit(event)}
            >
              {penIcon()}
              Suggest edit
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
export default memo(EventCard);