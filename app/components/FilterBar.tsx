"use client";

import { useState } from 'react';
import Link from 'next/link';
import styles from './FilterBar.module.css';

const MAX_PRICE = 100; // Max price for the slider

type FilterBarProps = {
  activities: string[];
  areas: string[];
  onFilterChange: (filters: { activity: string; area: string; price: number }) => void;
};

export default function FilterBar({ activities, areas, onFilterChange }: FilterBarProps) {
  const [activity, setActivity] = useState('all');
  const [area, setArea] = useState('all');
  const [price, setPrice] = useState(MAX_PRICE);

  const handleFilterChange = (newActivity: string, newArea: string, newPrice: number) => {
    onFilterChange({ activity: newActivity, area: newArea, price: newPrice });
  };

  const handleActivityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newActivity = e.target.value;
    setActivity(newActivity);
    handleFilterChange(newActivity, area, price);
  };

  const handleAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newArea = e.target.value;
    setArea(newArea);
    handleFilterChange(activity, newArea, price);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPrice = Number(e.target.value);
    setPrice(newPrice);
    handleFilterChange(activity, area, newPrice);
  };

  const clearFilters = () => {
    setActivity('all');
    setArea('all');
    setPrice(MAX_PRICE);
    handleFilterChange('all', 'all', MAX_PRICE);
  };

  return (
    <div className={styles.container}>
      <div className={styles.notesSection}>
        <h2 className={styles.notesTitle}>A Few Quick Notes</h2>
        <ol className={styles.notesList}>
          <li>Event details can change quick. Use the event’s links to <strong>confirm before you go.</strong></li>
          <li>Correct info depends on the community! Click “✏️EDIT ” if event info needs to be updated.</li>
          <li>Know of an event or activity that should be on this list? <Link href="/contact">Submit a listing.</Link></li>
          <li>This site’s free for everyone—no ads, no pop-ups. It runs 100% on donations. If you’re able, <a href="https://buymeacoffee.com/someplacesocial" target="_blank" rel="noopener noreferrer">buy me a drink.</a></li>
        </ol>
      </div>
      <div className={styles.filtersGroup}>
        <select value={activity} onChange={handleActivityChange} className={styles.select}>
          <option value="all">Activity</option>
          {activities.map(act => <option key={act} value={act}>{act}</option>)}
        </select>
        <select value={area} onChange={handleAreaChange} className={styles.select}>
          <option value="all">Area</option>
          {areas.map(ar => <option key={ar} value={ar}>{ar}</option>)}
        </select>
        <div className={styles.priceFilter}>
          <label htmlFor="price">Price</label>
          <input
            type="range"
            id="price"
            min="0"
            max={MAX_PRICE}
            value={price}
            onChange={handlePriceChange}
            className={styles.slider}
          />
        </div>
        <button onClick={clearFilters} className={styles.button}>Clear Filters</button>
      </div>
    </div>
  );
}