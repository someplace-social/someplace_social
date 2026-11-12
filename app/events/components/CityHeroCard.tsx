'use client';
import styles from './CityHeroCard.module.css';
interface CityHeroCardProps {
  cityName: string;
  introTitle?: string;
  introDescription?: string;
  eventCount?: number;
  lastUpdated?: string | null;
  activities: string[];
  selectedActivities: string[];
  onSelectChip: (activity: string) => void;
  onClearActivities: () => void;
}
export default function CityHeroCard({
  cityName,
  introTitle,
  introDescription,
  eventCount,
  lastUpdated,
  activities,
  selectedActivities,
  onSelectChip,
  onClearActivities,
}: CityHeroCardProps) {
  const isAllActive = selectedActivities.length === 0;
  return (
    <section className={styles.heroCard} aria-labelledby="city-intro-heading">
      <div className={styles.titleCol}>
        <p className={styles.eyebrow}>Someplace Social</p>
        <h1 id="city-intro-heading" className={styles.title}>
          {introTitle || `${cityName} Community Listings`}
        </h1>
        {((typeof eventCount === 'number' && eventCount > 0) || lastUpdated) && (
          <div className={styles.metaRow}>
            {typeof eventCount === 'number' && eventCount > 0 && (
              <span className={styles.metaSubtitle}>
                {eventCount} {eventCount === 1 ? 'Event & Activity' : 'Events & Activities'}
              </span>
            )}
            {lastUpdated && (
              <div className={styles.lastUpdatedBadge}>
                <svg
                  className={styles.lastUpdatedIcon}
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M9 12.5l2 2 4-4.5" />
                </svg>
                <span className={styles.lastUpdatedLabel}>Last updated:</span>
                <span className={styles.lastUpdatedDate}>{lastUpdated}</span>
              </div>
            )}
          </div>
        )}
      </div>
      <div className={styles.descCol}>
        <p className={styles.lead}>
          {introDescription ||
            `Community supported events, group activities, and weekly classes all in one place. Find weekly meetups, classes, and fun stuff to do in ${cityName}.`}
        </p>
      </div>
      <div className={styles.chips} role="group" aria-label="Filter by activity">
        <button
          type="button"
          className={`${styles.chip} ${isAllActive ? styles.chipActive : ''}`}
          aria-pressed={isAllActive}
          onClick={onClearActivities}
        >
          All
        </button>
        {activities.map((act) => {
          const isSelected = selectedActivities.includes(act);
          return (
            <button
              key={act}
              type="button"
              className={`${styles.chip} ${isSelected ? styles.chipActive : ''}`}
              aria-pressed={isSelected}
              onClick={() => onSelectChip(act)}
            >
              {act}
            </button>
          );
        })}
      </div>
    </section>
  );
}