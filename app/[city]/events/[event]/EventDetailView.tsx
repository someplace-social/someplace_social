'use client';
import { useState } from 'react';
import Link from 'next/link';
import { CityConfig, getCityTimeZone } from '../../../lib/cities';
import { Event } from '../../../lib/google-sheets';
import {
  buildScheduleLine,
  getEventDisplayDetails,
} from '../../../events/event-helpers';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import EventActions from '../../../events/components/EventActions';
import EventFacts from '../../../events/components/EventFacts';
import EventMeta from '../../../events/components/EventMeta';
import InlineExternalLink from '../../../events/components/InlineExternalLink';
import SuggestEditModal from '../../../events/components/SuggestEditModal';
import { CalendarIcon, PinIcon } from '../../../events/components/EventIcons';
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
  const scheduleSummary = buildScheduleLine(event);
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
  const descriptionText = (event.about || event.notes || '').trim();
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
            <EventMeta
              price={event.price}
              area={event.area}
              activities={event.activities}
              variant="detail"
              className={styles.meta}
            />
          </div>
          <div className={styles.body}>
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
              mapsHref={mapsHref}
              onOpenEdit={() => setEditModalOpen(true)}
            />
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