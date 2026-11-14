'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { CityConfig, getAllCities, getCityTimeZone } from '../../../lib/cities';
import { Event } from '../../../lib/google-sheets';
import {
  ensureExternalUrl,
  formatRecurrenceText,
  formatTimeRange,
  getTagStyle,
  isFreePrice,
} from '../../utils';
import { buildScheduleLine } from '../../event-helpers';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import ContactButton from '../../components/ContactButton';
import ShareButton from '../../components/ShareButton';
import SuggestEditModal from '../../components/SuggestEditModal';
import {
  CalendarIcon,
  CheckIcon,
  CompassIcon,
  GlobeIcon,
  PenIcon,
  PinIcon,
  RepeatIcon,
  SocialIcon,
  TagIcon,
} from '../../components/EventIcons';
import NextOccurrenceBadge from './NextOccurrenceBadge';
import styles from './EventDetail.module.css';
interface EventDetailViewProps {
  city: CityConfig;
  event: Event;
  initialNextLabel: string | null;
}
function DetailActionButton({
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
export default function EventDetailView({
  city,
  event,
  initialNextLabel,
}: EventDetailViewProps) {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const allCityOptions = useMemo(() => getAllCities(), []);
  const timeZone = getCityTimeZone(city);
  const { start, end } = formatTimeRange(event.startTime, event.endTime);
  const scheduleSummary = buildScheduleLine(event) || (start && end ? `${start} – ${end}` : start);
  const displayVenue = event.venue || event.location;
  const showDistinctAddress = Boolean(
    event.venue &&
      event.location &&
      event.venue.trim().toLowerCase() !== event.location.trim().toLowerCase()
  );
  const cleanOrg = (event.organization || '')
    .trim()
    .replace(/^hosted\s+by\s+/i, '')
    .trim();
  const showOrganizer = Boolean(
    cleanOrg && cleanOrg.toLowerCase() !== (displayVenue || '').trim().toLowerCase()
  );
  const isFree = isFreePrice(event.price);
  const tagList = event.activities || [];
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
  const hasDescription = Boolean((event.about || event.notes || '').trim());
  const mapsHref =
    (event.map ? ensureExternalUrl(event.map) : '') ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${displayVenue || event.title}, ${city.name}`
    )}`;
  const eyebrowText = event.area ? `${city.name} · ${event.area}` : city.name;
  return (
    <div className={styles.pageContainer}>
      <Header city={city} allCityOptions={allCityOptions} />
      <main className={styles.main}>
        <Link href={`/events/${city.slug}`} className={styles.backLink}>
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
                    <span>{displayVenue}</span>
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
                    Hosted by {cleanOrg}
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
            {hasFacts && (
              <div className={styles.facts}>
                {recurrenceText && (
                  <span className={styles.fact}>
                    <RepeatIcon className={styles.factIcon} />
                    <span>{recurrenceText}</span>
                  </span>
                )}
                {event.preRegistration && (
                  <span className={styles.fact}>
                    {needsSignupIcon ? (
                      <PenIcon className={styles.factIcon} />
                    ) : (
                      <CheckIcon className={styles.factIcon} />
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
                <PinIcon />
                Maps
              </a>
              <DetailActionButton
                href={event.website}
                label="Website"
                icon={<GlobeIcon />}
              />
              <DetailActionButton
                href={event.social}
                label="Social"
                icon={<SocialIcon />}
              />
              <ContactButton
                contact={event.contact}
                btnClassName={styles.btn}
                btnActiveClassName={styles.btnActive}
                btnDisabledClassName={styles.btnDisabled}
              />
              <ShareButton
                event={event}
                citySlug={city.slug}
                btnClassName={`${styles.btn} ${styles.shareBtn}`}
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
          <Link href={`/events/${city.slug}`} className={styles.bottomCta}>
            Explore all {city.name} events →
          </Link>
        </div>
      </main>
      <Footer />
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