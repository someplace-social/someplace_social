'use client';
import { Event } from '../../lib/google-sheets';
import {
  formatTimeRange,
  isFreePrice,
  ensureExternalUrl,
  getTagStyle,
} from '../utils';
import styles from '../EventsView.module.css';

interface EventCardProps {
  event: Event;
  isOpen: boolean;
  isNextUp: boolean;
  cityName: string;
  onToggle: () => void;
  onOpenEdit: (ev: Event) => void;
}

export default function EventCard({
  event,
  isOpen,
  isNextUp,
  cityName,
  onToggle,
  onOpenEdit,
}: EventCardProps) {
  const { start, end } = formatTimeRange(event.startTime, event.endTime);
  const isFree = isFreePrice(event.price);
  const tagList = [event.activity1, event.activity2, event.activity3].filter(Boolean);
  const displayVenue = event.venue || event.location;

  return (
    <div className={`${styles.eventCard} ${isOpen ? styles.eventCardOpen : ''}`}>
      <button
        type="button"
        className={styles.cardRow}
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        <div className={styles.timeCol}>
          {start}
          {end && <div className={styles.endTimeText}>to {end}</div>}
        </div>
        <div className={styles.infoCol}>
          {isNextUp && <span className={styles.nextUpBadge}>Next up</span>}
          <div className={styles.eventTitle}>
            {event.title}
            {event.organization && event.organization !== displayVenue && (
              <span className={styles.eventHost}> w/ {event.organization}</span>
            )}
          </div>
          <div className={styles.eventLocation}>
            {displayVenue}
            {event.area ? ` · ${event.area}` : ''}
          </div>
          <div className={`${styles.priceLine} ${isFree ? styles.priceFree : styles.pricePaid}`}>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12V4h8l10 10-8 8L3 12z" />
              <circle cx="7.5" cy="8.5" r="1" />
            </svg>
            {isFree ? 'Free' : event.price || 'Varies'}
          </div>
          {tagList.length > 0 && (
            <div className={styles.tagList}>
              {tagList.map((tag) => {
                const customStyle = getTagStyle(tag);
                return (
                  <span
                    key={tag}
                    className={styles.tagChip}
                    style={{
                      color: customStyle.color,
                      backgroundColor: customStyle.background,
                    }}
                  >
                    {tag}
                  </span>
                );
              })}
            </div>
          )}
        </div>
        <span
          aria-hidden="true"
          className={`${styles.chevronCircle} ${
            isOpen ? styles.chevronCircleOpen : ''
          }`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={isOpen ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'} />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className={styles.expandedDrawer}>
          {(event.about || event.notes) && (
            <p className={styles.eventDescription}>{event.about || event.notes}</p>
          )}

          {event.preRegistration && (
            <p className={styles.preRegistration}>{event.preRegistration}</p>
          )}

          <div className={styles.drawerActionRow}>
            <div className={styles.buttonGrid4}>
              <a
                href={
                  event.map
                    ? ensureExternalUrl(event.map)
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${displayVenue}, ${cityName}`
                      )}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className={styles.actionBtnPrimary}
                aria-label="Open in Maps"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
                Maps
              </a>
              {event.website ? (
                <a
                  href={ensureExternalUrl(event.website)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.actionBtnOutline}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18" />
                  </svg>
                  Website
                </a>
              ) : (
                <div className={styles.actionBtnOutline} style={{ opacity: 0.45, cursor: 'not-allowed' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18" />
                  </svg>
                  Website
                </div>
              )}
              {event.social ? (
                <a
                  href={ensureExternalUrl(event.social)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.actionBtnOutline}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.2" cy="6.8" r=".6" />
                  </svg>
                  Instagram
                </a>
              ) : (
                <div className={styles.actionBtnOutline} style={{ opacity: 0.45, cursor: 'not-allowed' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.2" cy="6.8" r=".6" />
                  </svg>
                  Instagram
                </div>
              )}
              {event.contact ? (
                <a
                  href={ensureExternalUrl(event.contact)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.actionBtnOutline}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3.5 6.5l8.5 6.5 8.5-6.5" />
                  </svg>
                  Contact
                </a>
              ) : (
                <div className={styles.actionBtnOutline} style={{ opacity: 0.45, cursor: 'not-allowed' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3.5 6.5l8.5 6.5 8.5-6.5" />
                  </svg>
                  Contact
                </div>
              )}
            </div>
            <button
              type="button"
              className={styles.suggestEditBtn}
              onClick={() => onOpenEdit(event)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 20l1-4L16.5 4.5a2 2 0 013 3L8 19l-4 1z" />
              </svg>
              Suggest edit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}