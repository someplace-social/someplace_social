'use client';
import { memo } from 'react';
import styles from '../EventsView.module.css';

const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface DayPickerProps {
  rollingWeek: Date[];
  activeDayIdx: number;
  onSelectDay: (idx: number) => void;
  dayCounts?: number[];
  getEventCountForDay?: (idx: number) => number;
  allEventsCount?: number;
  citySlug?: string;
}

function DayPicker({
  rollingWeek,
  activeDayIdx,
  onSelectDay,
  dayCounts,
  getEventCountForDay,
  allEventsCount,
  citySlug,
}: DayPickerProps) {
  const allEventsIdx = rollingWeek.length;
  const getCount = (idx: number) => {
    if (idx === allEventsIdx) {
      if (allEventsCount !== undefined) {
        return allEventsCount;
      }
      if (dayCounts && dayCounts[allEventsIdx] !== undefined) {
        return dayCounts[allEventsIdx];
      }
      return 0;
    }
    if (dayCounts && dayCounts[idx] !== undefined) {
      return dayCounts[idx];
    }
    return getEventCountForDay ? getEventCountForDay(idx) : 0;
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
              <span
                className={`${styles.dayCountText} ${
                  isSelected ? styles.dayCountTextActive : ''
                }`}
              >
                {count} events
              </span>
            </button>
          );
        })}
        <a
          href={allEventsHref}
          className={`${styles.dayBtnVertical} ${
            isAllEventsSelected ? styles.dayBtnVerticalActive : ''
          }`}
          aria-pressed={isAllEventsSelected}
          onClick={(e) => {
            e.preventDefault();
            onSelectDay(allEventsIdx);
          }}
        >
          <span>All Events</span>
          <span
            className={`${styles.dayCountText} ${
              isAllEventsSelected ? styles.dayCountTextActive : ''
            }`}
          >
            {allCount} events
          </span>
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
              <span
                className={`${styles.mobileDayLabel} ${
                  isSelected ? styles.mobileDayLabelActive : ''
                }`}
              >
                {dayShort}
              </span>
              <span className={styles.mobileDayNum}>{day.getDate()}</span>
              <span
                className={`${styles.mobileDayCount} ${
                  isSelected ? styles.mobileDayCountActive : ''
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
        <a
          href={allEventsHref}
          className={`${styles.mobileDayBtn} ${
            isAllEventsSelected ? styles.mobileDayBtnActive : ''
          }`}
          aria-pressed={isAllEventsSelected}
          onClick={(e) => {
            e.preventDefault();
            onSelectDay(allEventsIdx);
          }}
        >
          <span
            className={`${styles.mobileDayLabel} ${
              isAllEventsSelected ? styles.mobileDayLabelActive : ''
            }`}
          >
            All
          </span>
          <span className={`${styles.mobileDayNum} ${styles.mobileDayNumAll}`}>
            Events
          </span>
          <span
            className={`${styles.mobileDayCount} ${
              isAllEventsSelected ? styles.mobileDayCountActive : ''
            }`}
          >
            {allCount}
          </span>
        </a>
      </div>
    </>
  );
}

export default memo(DayPicker);