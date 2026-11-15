'use client';
import { useState } from 'react';
import Link from 'next/link';
import { CityConfig, getCityTimeZone } from '../../../lib/cities';
import { Event } from '../../../lib/google-sheets';
import {
  formatTimeRange,
  getTagStyle,
  isFreePrice,
} from '../../../events/utils';
import {
  buildScheduleLine,
  getEventDisplayDetails,
} from '../../../events/event-helpers';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import ContactButton from '../../../events/components/ContactButton';
import EventFacts from '../../../events/components/EventFacts';
import InlineExternalLink from '../../../events/components/InlineExternalLink';
import ProveItButton from '../../../events/components/ProveItButton';
import ShareButton from '../../../events/components/ShareButton';
import SuggestEditModal from '../../../events/components/SuggestEditModal';
import {
  CalendarIcon,
  CompassIcon,
  PenIcon,
  PinIcon,
  TagIcon,
} from '../../../events/components/EventIcons';
import NextOccurrenceBadge from './NextOccurrenceBadge';
import styles from './EventDetail.module.css';

interface EventDetailViewProps {
  city: CityConfig;
  event: Event;
  initialNextLabel: string | null;
}

export default function EventDetailView({
  city,
  event,
  initialNextLabel,
}: EventDetailViewProps) {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const timeZone = getCityTimeZone(city);
  const { start, end } = formatTimeRange(event.startTime, event.endTime);
  const scheduleSummary =
    buildScheduleLine(event) || (start && end ? `${start} – ${end}` : start);
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
  } = getEventDisplayDetails(event, city.name);
  const isFree = isFreePrice(event.price);
  const tagList = event.activities || [];
  const hasMeta = Boolean(event.price || event.area || tagList.length > 0);
  const hasDescription = Boolean((event.about || event.notes || '').trim());
  const eyebrowText = event.area ? `${city.name} · ${event.area}` : city.name;

  return (
    <div className={styles.pageContainer}>
      <Header city={city} />
      <main className={styles.main}>
        <Link href={`/${city.slug}/events`} className={styles.backLink}>
          <span aria-hidden="true">←</span>
          <span>All {city.name} events</span>
        </Link>
        <article className={styles.card}>
          <div className={styles.head}>
            <p className={styles.eyebrow}>{eyebrowText}</p>
            <h1 className={styles.title}>{event.title}</h1>
            {(scheduleSummary || initialNextLabel) && (
              <div className={styles.scheduleRow}>
                {scheduleSummary && (
                  <span className={styles.scheduleText}>
                    <CalendarIcon className={styles.scheduleIcon} />
                    <span>{scheduleSummary}</span>
                  </span>
                )}
                <NextOccurrenceBadge
                  event={event}
                  timeZone={timeZone}
                  initialLabel={initialNextLabel}
                  className={styles.nextBadge}
                  todayClassName={styles.nextBadgeToday}
                />
              </div>
            )}
            {(displayVenue || showOrganizer) && (
              <div className={styles.venueBlock}>
                {displayVenue && (
                  <div className={styles.venue}>
                    <PinIcon className={styles.venueIcon} />
                    <InlineExternalLink href={venueUrl}>
                      {displayVenue}
                    </InlineExternalLink>
                  </div>
                )}
                {showDistinctAddress && (
                  <div className={styles.address}>{event.location}</div>
                )}
                {showOrganizer && (
                  <div
                    className={`${styles.host} ${
                      !displayVenue ? styles.hostFlush : ''
                    }`}
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
                    <TagIcon />
                    <span>{event.price}</span>
                  </span>
                )}
                {event.price && event.area && (
                  <span className={styles.dot} aria-hidden="true" />
                )}
                {event.area && (
                  <span className={styles.area}>
                    <CompassIcon />
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
          <div className={styles.body}>
            {hasDescription && (
              <p className={styles.desc}>{event.about || event.notes}</p>
            )}
            <EventFacts
              recurrenceText={recurrenceText}
              preRegistrationText={preRegistrationText}
              registrationUrl={registrationUrl}
              needsSignupIcon={needsSignupIcon}
              className={styles.facts}
            />
            <div className={styles.actions}>
              <a
                href={mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.btn} ${styles.btnPrimary}`}
                aria-label="Open in Maps"
              >
                <PinIcon />
                Maps
              </a>
              <ContactButton
                contact={event.contact}
                btnClassName={styles.btn}
                btnActiveClassName={styles.btnActive}
                btnDisabledClassName={styles.btnDisabled}
              />
              <ProveItButton
                proveIt={event.proveIt}
                btnClassName={styles.btn}
                btnActiveClassName={styles.btnActive}
                btnDisabledClassName={styles.btnDisabled}
              />
              <ShareButton
                event={event}
                citySlug={city.slug}
                btnClassName={styles.btn}
              />
              <button
                type="button"
                className={styles.edit}
                onClick={() => setEditModalOpen(true)}
              >
                <PenIcon />
                Suggest edit
              </button>
            </div>
          </div>
        </article>
        <div className={styles.bottomCtaWrap}>
          <Link href={`/${city.slug}/events`} className={styles.bottomCta}>
            Explore all {city.name} events →
          </Link>
        </div>
      </main>
      <Footer city={city} />
      {editModalOpen && (
        <SuggestEditModal
          event={event}
          cityName={city.name}
          onClose={() => setEditModalOpen(false)}
        />
      )}
    </div>
  );
}