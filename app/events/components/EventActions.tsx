'use client';
import type { CityConfig } from '../../lib/cities';
import type { Event } from '../../lib/google-sheets';
import AddToCalendarButton from './AddToCalendarButton';
import { PenIcon, PinIcon } from './EventIcons';
import ProveItButton from './ProveItButton';
import ShareButton from './ShareButton';
import styles from './EventActions.module.css';

interface EventActionsProps {
  event: Event;
  city: CityConfig;
  selectedDate?: Date | null;
  mapsHref: string;
  onOpenEdit: () => void;
}

export default function EventActions({
  event,
  city,
  selectedDate,
  mapsHref,
  onOpenEdit,
}: EventActionsProps) {
  return (
    <div className={styles.actions}>
      <div className={styles.buttonsGrid}>
        <ProveItButton
          proveIt={event.proveIt}
          contact={event.contact}
          contactPageHref={`/${city.slug}/contact`}
          btnClassName={`${styles.btn} ${styles.btnPrimary}`}
          btnActiveClassName={styles.btnActive}
          btnDisabledClassName={styles.btnDisabled}
        />
        <a
          href={mapsHref}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.btn}
          title="Open location in maps"
        >
          <PinIcon />
          Map
        </a>
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
      </div>
      <div className={styles.actionsFooter}>
        <button type="button" className={styles.edit} onClick={onOpenEdit}>
          <PenIcon />
          Suggest edit
        </button>
      </div>
    </div>
  );
}