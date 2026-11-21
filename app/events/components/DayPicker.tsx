'use client';
import { memo } from 'react';
import styles from '../EventsView.module.css';

const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface DayPickerProps {
  rollingWeek: Date[];
  activeDayIdx: number;
  onSelectDay: (idx: number) => void;
  dayCounts?: number[];
  allEventsCount?: number;
  citySlug?: string;
}

function DayPicker({
  rollingWeek,
  activeDayIdx,
  onSelectDay,
  dayCounts,
  allEventsCount,
  citySlug,
}: DayPickerProps) {
  const allEventsIdx = rollingWeek.length;
  const getCount = (idx: number) => {
    if (idx === allEventsIdx) {
      return allEventsCount ?? dayCounts?.[allEventsIdx] ?? 0;
    }
    return dayCounts?.[idx] ?? 0;
  };

  const isAllEventsSelected = activeDayIdx === allEventsIdx;
  const allCount = getCount(allEventsIdx);
  const allEventsHref = citySlug ? `/${citySlug}/events?tab=all` : '?tab=all';

  return (
    <>
      <div className={styles.dayListVertical} role="group" aria-label="Day list">
        {rollingWeek.map((day, idx) => {
          const label =
            idx === 0
              ? 'Today'
              : `${DAY_NAMES_SHORT[day.getDay()]} ${day.getDate()}`;
          const count = getCount(idx);
          const isSelected = idx === activeDayIdx;
          return (
            <button
              key={idx}
              type="button"
              className={`${styles.dayBtnVertical} ${
                isSelected ? styles.dayBtnVerticalActive : ''
              }`}
              aria-pressed={isSelected}
              onClick={() => onSelectDay(idx)}
            >
              <span>{label}</span>
              <span className={styles.dayCountText}>{count} events</span>
            </button>
          );
        })}
        <a
          href={allEventsHref}
          className={`${styles.dayBtnVertical} ${
            isAllEventsSelected ? styles.dayBtnVerticalActive : ''
          }`}
          aria-current={isAllEventsSelected ? 'page' : undefined}
          onClick={(e) => {
            e.preventDefault();
            onSelectDay(allEventsIdx);
          }}
        >
          <span>All Events</span>
          <span className={styles.dayCountText}>{allCount} events</span>
        </a>
      </div>
      <div className={styles.mobileDaysGrid} role="group" aria-label="Pick day">
        {rollingWeek.map((day, idx) => {
          const dayShort = idx === 0 ? 'Today' : DAY_NAMES_SHORT[day.getDay()];
          const count = getCount(idx);
          const isSelected = idx === activeDayIdx;
          return (
            <button
              key={idx}
              type="button"
              className={`${styles.mobileDayBtn} ${
                isSelected ? styles.mobileDayBtnActive : ''
              }`}
              aria-pressed={isSelected}
              onClick={() => onSelectDay(idx)}
            >
              <span className={styles.mobileDayLabel}>{dayShort}</span>
              <span className={styles.mobileDayNum}>{day.getDate()}</span>
              <span className={styles.mobileDayCount}>{count}</span>
            </button>
          );
        })}
        <a
          href={allEventsHref}
          className={`${styles.mobileDayBtn} ${
            isAllEventsSelected ? styles.mobileDayBtnActive : ''
          }`}
          aria-current={isAllEventsSelected ? 'page' : undefined}
          onClick={(e) => {
            e.preventDefault();
            onSelectDay(allEventsIdx);
          }}
        >
          <span className={styles.mobileDayLabel}>All</span>
          <span className={`${styles.mobileDayNum} ${styles.mobileDayNumAll}`}>
            Events
          </span>
          <span className={styles.mobileDayCount}>{allCount}</span>
        </a>
      </div>
    </>
  );
}

export default memo(DayPicker);