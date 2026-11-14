'use client';
import { memo, useRef } from 'react';
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
const DRAG_THRESHOLD_PX = 5;
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
  const headRef = useRef<HTMLDivElement>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const didDragRef = useRef(false);
  const prevSelectionRef = useRef('');
  const handleHeadPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) {
      pointerStartRef.current = null;
      return;
    }
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    didDragRef.current = false;
    prevSelectionRef.current = window.getSelection()?.toString() ?? '';
  };
  const handleHeadPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerStartRef.current || didDragRef.current) return;
    const dx = e.clientX - pointerStartRef.current.x;
    const dy = e.clientY - pointerStartRef.current.y;
    if (Math.hypot(dx, dy) > DRAG_THRESHOLD_PX) {
      didDragRef.current = true;
    }
  };
  const handleHeadPointerCancel = () => {
    pointerStartRef.current = null;
    didDragRef.current = false;
  };
  const handleHeadClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement | null;
    if (target?.closest('button, a')) {
      return;
    }
    const start = pointerStartRef.current;
    pointerStartRef.current = null;
    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }
    if (start) {
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (Math.hypot(dx, dy) > DRAG_THRESHOLD_PX) {
        return;
      }
    }
    if (e.detail >= 2) {
      return;
    }
    const selection = window.getSelection();
    const selectedText = selection?.toString() ?? '';
    if (
      selectedText.trim().length > 0 &&
      selectedText !== prevSelectionRef.current &&
      headRef.current &&
      selection
    ) {
      const { anchorNode, focusNode } = selection;
      if (
        (anchorNode && headRef.current.contains(anchorNode)) ||
        (focusNode && headRef.current.contains(focusNode))
      ) {
        return;
      }
    }
    onToggle();
  };
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
  const socialIcon = (
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
  const shareIcon = (
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
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" x2="12" y1="2" y2="15" />
    </svg>
  );
  return (
    <article className={`${styles.card} ${isOpen ? styles.open : ''}`}>
      <div
        ref={headRef}
        className={styles.head}
        onPointerDown={handleHeadPointerDown}
        onPointerMove={handleHeadPointerMove}
        onPointerCancel={handleHeadPointerCancel}
        onClick={handleHeadClick}
      >
        <div className={styles.time}>
          <b>{start || '—'}</b>
          {end && <span>to {end}</span>}
        </div>
        <div className={styles.main}>
          {isNextUp && <span className={styles.next}>Next up</span>}
          <h3 className={styles.title}>{event.title}</h3>
          {displayVenue && (
            <div className={styles.venue}>
              {pinIcon(styles.venueIcon)}
              <span>{displayVenue}</span>
            </div>
          )}
          {showOrganizer && (
            <div
              className={`${styles.host} ${!displayVenue ? styles.hostFlush : ''}`}
            >
              Hosted by {cleanOrg}
            </div>
          )}
          {hasMeta && (
            <div className={styles.meta}>
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
                <div className={styles.tags}>
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
                </div>
              )}
            </div>
          )}
        </div>
        <button
          type="button"
          className={styles.chev}
          aria-expanded={isOpen}
          aria-label={
            isOpen
              ? `Collapse details for ${event.title}`
              : `Expand details for ${event.title}`
          }
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          {chevIcon}
        </button>
      </div>
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
            <ActionButton href={event.social} label="Social" icon={socialIcon} />
            <ContactButton
              contact={event.contact}
              btnClassName={styles.btn}
              btnActiveClassName={styles.btnActive}
              btnDisabledClassName={styles.btnDisabled}
            />
            <button
              type="button"
              className={styles.btn}
              aria-label={`Share ${event.title}`}
            >
              {shareIcon}
              Share
            </button>
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