"use client";

import { useState } from 'react';
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
      <span>A Few Quick Notes...</span>
      <div className={styles.filtersGroup}>
        <select value={activity} onChange={handleActivityChange} className={styles.select}>
          <option value="all">All Activities</option>
          {activities.map(act => <option key={act} value={act}>{act}</option>)}
        </select>
        <select value={area} onChange={handleAreaChange} className={styles.select}>
          <option value="all">All Areas</option>
          {areas.map(ar => <option key={ar} value={ar}>{ar}</option>)}
        </select>
        <div className={styles.priceFilter}>
          <label htmlFor="price">Max Price: ${price}</label>
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