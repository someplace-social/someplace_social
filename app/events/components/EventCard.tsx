'use client';
import { memo, useId, useRef } from 'react';
import type { CityConfig } from '../../lib/cities';
import { Event } from '../../lib/google-sheets';
import {
  formatTimeRange,
  isFreePrice,
  getTagStyle,
} from '../utils';
import { getEventDisplayDetails } from '../event-helpers';
import EventActions from './EventActions';
import EventFacts from './EventFacts';
import InlineExternalLink from './InlineExternalLink';
import {
  ChevronDownIcon,
  CompassIcon,
  PinIcon,
  TagIcon,
} from './EventIcons';
import styles from './EventCard.module.css';

const DRAG_THRESHOLD_PX = 5;

interface EventCardProps {
  event: Event;
  isOpen: boolean;
  isNextUp: boolean;
  city: CityConfig;
  selectedDate: Date;
  domId?: string;
  onToggle: () => void;
  onOpenEdit: (ev: Event) => void;
}

function EventCard({
  event,
  isOpen,
  isNextUp,
  city,
  selectedDate,
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
  const {
    displayVenue,
    venueUrl,
    showDistinctAddress,
    organizerName,
    organizerUrl,
    showOrganizer,
    recurrenceText,
    preRegistrationText,
    registrationUrl,
    needsSignupIcon,
    mapsHref,
    moreDetailsUrl,
  } = getEventDisplayDetails(event, city.name);
  const hasMeta = Boolean(event.price || event.area || tagList.length > 0);
  const descriptionText = (event.about || event.notes || '').trim();

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
              <InlineExternalLink href={venueUrl}>
                {displayVenue}
              </InlineExternalLink>
            </div>
          )}
          {showOrganizer && (
            <div
              className={`${styles.host} ${!displayVenue ? styles.hostFlush : ''}`}
            >
              Hosted by{' '}
              <InlineExternalLink
                href={organizerUrl}
                className={organizerUrl ? styles.hostLink : undefined}
              >
                {organizerName}
              </InlineExternalLink>
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
        {showDistinctAddress && (
          <div className={styles.address}>
            <PinIcon className={styles.icon} />
            <span>{event.location}</span>
          </div>
        )}
        {(descriptionText || moreDetailsUrl) && (
          <p className={styles.desc}>
            {descriptionText}
            {descriptionText && moreDetailsUrl ? ' ' : ''}
            {moreDetailsUrl && (
              <InlineExternalLink
                href={moreDetailsUrl}
                className={styles.moreDetailsLink}
              >
                More details
              </InlineExternalLink>
            )}
          </p>
        )}
        <EventFacts
          recurrenceText={recurrenceText}
          preRegistrationText={preRegistrationText}
          registrationUrl={registrationUrl}
          needsSignupIcon={needsSignupIcon}
          className={styles.facts}
        />
        <EventActions
          event={event}
          city={city}
          selectedDate={selectedDate}
          mapsHref={mapsHref}
          onOpenEdit={() => onOpenEdit(event)}
        />
      </div>
    </article>
  );
}

export default memo(EventCard);