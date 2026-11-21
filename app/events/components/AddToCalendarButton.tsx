'use client';
import { useMemo, useCallback } from 'react';
import type { CityConfig } from '../../lib/cities';
import type { Event } from '../../lib/google-sheets';
import {
  buildGoogleCalendarUrl,
  buildIcsContent,
  downloadIcsFile,
  getIcsFilename,
  resolveCalendarOccurrence,
} from '../calendar-helpers';
import ActionPopover, { PopoverCopyRow } from './ActionPopover';
import { CalendarIcon, CalendarPlusIcon, DownloadIcon } from './EventIcons';
import styles from './ActionPopover.module.css';

interface AddToCalendarButtonProps {
  event: Event;
  city: CityConfig;
  selectedDate?: Date | null;
  btnClassName: string;
  btnActiveClassName: string;
  btnDisabledClassName: string;
  wrapperClassName?: string;
}

export default function AddToCalendarButton({
  event,
  city,
  selectedDate,
  btnClassName,
  btnActiveClassName,
  btnDisabledClassName,
  wrapperClassName,
}: AddToCalendarButtonProps) {
  const details = useMemo(
    () => resolveCalendarOccurrence(event, city, selectedDate),
    [event, city, selectedDate]
  );

  const googleCalendarUrl = useMemo(
    () => (details ? buildGoogleCalendarUrl(details) : ''),
    [details]
  );

  const handleDownloadIcs = useCallback(
    (close: () => void) => {
      if (!details) return;
      const content = buildIcsContent(details);
      const filename = getIcsFilename(details);
      downloadIcsFile(filename, content);
      close();
    },
    [details]
  );

  if (!details) {
    return (
      <button
        type="button"
        disabled
        className={`${btnClassName} ${btnDisabledClassName} ${wrapperClassName || ''}`}
        title="No upcoming date available"
      >
        <CalendarPlusIcon />
        Add to Calendar
      </button>
    );
  }

  return (
    <ActionPopover
      triggerLabel="Add to Calendar"
      triggerIcon={<CalendarPlusIcon />}
      btnClassName={btnClassName}
      btnActiveClassName={btnActiveClassName}
      wrapperClassName={wrapperClassName}
      dialogLabel="Add event to calendar"
      headerLabel="Add to Calendar"
      align="right"
    >
      {(close) => (
        <>
          <PopoverCopyRow
            text={details.copySummary}
            copyLabel="Copy event summary"
            wrap
          />
          <div className={styles.popoverDivider} />
          <div className={styles.popoverActions}>
            <a
              href={googleCalendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.popoverActionLink}
              onClick={close}
            >
              <CalendarIcon />
              Google Calendar
            </a>
            <button
              type="button"
              className={styles.popoverActionLink}
              onClick={() => handleDownloadIcs(close)}
            >
              <DownloadIcon />
              Apple / Outlook (.ics)
            </button>
          </div>
        </>
      )}
    </ActionPopover>
  );
}