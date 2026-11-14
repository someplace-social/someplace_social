'use client';
import { memo, useId, useRef } from 'react';
import Link from 'next/link';
import { Event } from '../../lib/google-sheets';
import {
  formatTimeRange,
  formatRecurrenceText,
  isFreePrice,
  ensureExternalUrl,
  getTagStyle,
} from '../utils';
import { getEventPath } from '../event-helpers';
import ContactButton from './ContactButton';
import ShareButton from './ShareButton';
import {
  CheckIcon,
  ChevronDownIcon,
  CompassIcon,
  ExternalLinkIcon,
  GlobeIcon,
  PenIcon,
  PinIcon,
  RepeatIcon,
  SocialIcon,
  TagIcon,
} from './EventIcons';
import styles from './EventCard.module.css';
const DRAG_THRESHOLD_PX = 5;
interface EventCardProps {
  event: Event;
  isOpen: boolean;
  isNextUp: boolean;
  cityName: string;
  citySlug: string;
  domId?: string;
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
  const safeHref = href ? ensureExternalUrl(href) : '';
  if (safeHref) {
    return (
      <a
        href={safeHref}
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
  citySlug,
  domId,
  onToggle,
  onOpenEdit,
}: EventCardProps) {
  const bodyId = useId();
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
  const mapsHref =
    (event.map ? ensureExternalUrl(event.map) : '') ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${displayVenue || event.title}, ${cityName}`
    )}`;
  const eventHref = getEventPath(citySlug, event);
  return (
    <article
      id={domId}
      className={`${styles.card} ${isOpen ? styles.open : ''}`}
    >
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
              <PinIcon className={`${styles.icon} ${styles.venueIcon}`} />
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
                  <TagIcon className={styles.icon} />
                  <span>{event.price}</span>
                </span>
              )}
              {event.price && event.area && (
                <span className={styles.dot} aria-hidden="true" />
              )}
              {event.area && (
                <span className={styles.area}>
                  <CompassIcon className={styles.icon} />
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
          aria-controls={bodyId}
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
          <ChevronDownIcon className={styles.icon} />
        </button>
      </div>
      <div
        id={bodyId}
        className={`${styles.body} ${!isOpen ? styles.bodyHidden : ''}`}
        aria-hidden={!isOpen}
      >
        {(event.about || event.notes) && (
          <p className={styles.desc}>{event.about || event.notes}</p>
        )}
        {hasFacts && (
          <div className={styles.facts}>
            {recurrenceText && (
              <span className={styles.fact}>
                <RepeatIcon className={`${styles.icon} ${styles.factIcon}`} />
                <span>{recurrenceText}</span>
              </span>
            )}
            {event.preRegistration && (
              <span className={styles.fact}>
                {needsSignupIcon ? (
                  <PenIcon className={`${styles.icon} ${styles.factIcon}`} />
                ) : (
                  <CheckIcon className={`${styles.icon} ${styles.factIcon}`} />
                )}
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
            <PinIcon className={styles.icon} />
            Maps
          </a>
          <ActionButton
            href={event.website}
            label="Website"
            icon={<GlobeIcon className={styles.icon} />}
          />
          <ActionButton
            href={event.social}
            label="Social"
            icon={<SocialIcon className={styles.icon} />}
          />
          <ContactButton
            contact={event.contact}
            btnClassName={styles.btn}
            btnActiveClassName={styles.btnActive}
            btnDisabledClassName={styles.btnDisabled}
          />
          <ShareButton
            event={event}
            citySlug={citySlug}
            btnClassName={`${styles.btn} ${styles.shareBtn}`}
          />
          <div className={styles.footerLinks}>
            <Link href={eventHref} className={styles.permalink}>
              Open page
              <ExternalLinkIcon />
            </Link>
            <button
              type="button"
              className={styles.edit}
              onClick={() => onOpenEdit(event)}
            >
              <PenIcon className={styles.icon} />
              Suggest edit
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
export default memo(EventCard);