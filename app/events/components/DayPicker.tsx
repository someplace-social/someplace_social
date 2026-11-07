'use client';

import styles from '../EventsView.module.css';

const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface DayPickerProps {
  rollingWeek: Date[];
  activeDayIdx: number;
  onSelectDay: (idx: number) => void;
  getEventCountForDay: (idx: number) => number;
}

export default function DayPicker({
  rollingWeek,
  activeDayIdx,
  onSelectDay,
  getEventCountForDay,
}: DayPickerProps) {
  return (
    <>
      <div className={styles.dayListVertical} role="group" aria-label="Day list">
        {rollingWeek.map((day, idx) => {
          const label =
            idx === 0
              ? 'Today'
              : `${DAY_NAMES_SHORT[day.getDay()]} ${day.getDate()}`;
          const count = getEventCountForDay(idx);
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
      </div>

      <div className={styles.mobileDaysGrid} role="group" aria-label="Pick day">
        {rollingWeek.map((day, idx) => {
          const dayShort = idx === 0 ? 'Today' : DAY_NAMES_SHORT[day.getDay()];
          const count = getEventCountForDay(idx);
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
      </div>
    </>
  );
}