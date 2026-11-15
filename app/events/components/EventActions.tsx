'use client';
import Link from 'next/link';
import type { CityConfig } from '../../lib/cities';
import type { Event } from '../../lib/google-sheets';
import AddToCalendarButton from './AddToCalendarButton';
import ContactButton from './ContactButton';
import { ExternalLinkIcon, PenIcon, PinIcon } from './EventIcons';
import ProveItButton from './ProveItButton';
import ShareButton from './ShareButton';
import styles from './EventActions.module.css';

interface EventActionsProps {
  event: Event;
  city: CityConfig;
  selectedDate?: Date | null;
  mapsHref: string;
  eventHref?: string;
  onOpenEdit: () => void;
}

export default function EventActions({
  event,
  city,
  selectedDate,
  mapsHref,
  eventHref,
  onOpenEdit,
}: EventActionsProps) {
  return (
    <div className={styles.actions}>
      <ProveItButton
        proveIt={event.proveIt}
        btnClassName={styles.btn}
        btnActiveClassName={styles.btnActive}
        btnDisabledClassName={styles.btnDisabled}
      />
      <a
        href={mapsHref}
        target="_blank"
        rel="noopener noreferrer"
        className={`${styles.btn} ${styles.btnPrimary}`}
        title="Open location in maps"
      >
        <PinIcon />
        Map
      </a>
      <ContactButton
        contact={event.contact}
        btnClassName={styles.btn}
        btnActiveClassName={styles.btnActive}
        btnDisabledClassName={styles.btnDisabled}
      />
      <AddToCalendarButton
        event={event}
        city={city}
        selectedDate={selectedDate}
        btnClassName={styles.btn}
        btnActiveClassName={styles.btnActive}
        btnDisabledClassName={styles.btnDisabled}
      />
      <ShareButton
        event={event}
        citySlug={city.slug}
        btnClassName={styles.btn}
      />
      <div className={styles.footerLinks}>
        {eventHref && (
          <Link href={eventHref} className={styles.permalink}>
            Open page
            <ExternalLinkIcon />
          </Link>
        )}
        <button type="button" className={styles.edit} onClick={onOpenEdit}>
          <PenIcon />
          Suggest edit
        </button>
      </div>
    </div>
  );
}