'use client';

import styles from './CityHeroCard.module.css';

interface CityHeroCardProps {
  cityName: string;
  introTitle?: string;
  introDescription?: string;
  activities: string[];
  selectedActivities: string[];
  onSelectChip: (activity: string) => void;
  onClearActivities: () => void;
}

export default function CityHeroCard({
  cityName,
  introTitle,
  introDescription,
  activities,
  selectedActivities,
  onSelectChip,
  onClearActivities,
}: CityHeroCardProps) {
  const isAllActive = selectedActivities.length === 0;

  return (
    <section className={styles.heroCard} aria-labelledby="city-intro-heading">
      <div>
        <p className={styles.eyebrow}>Someplace Social</p>
        <h1 id="city-intro-heading" className={styles.title}>
          {introTitle || `${cityName} Community Listings`}
        </h1>
      </div>
      <p className={styles.lead}>
        {introDescription ||
          `Community supported events, group activities, and weekly classes all in one place. Find weekly meetups, classes, and fun stuff to do in ${cityName}.`}
      </p>
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