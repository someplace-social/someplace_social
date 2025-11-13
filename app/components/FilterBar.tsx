"use client";

import { useState } from 'react';
import styles from './FilterBar.module.css';

type FilterBarProps = {
  activities: string[];
  areas: string[];
  onFilterChange: (filters: { activity: string; area: string }) => void;
};

export default function FilterBar({ activities, areas, onFilterChange }: FilterBarProps) {
  const [activity, setActivity] = useState('all');
  const [area, setArea] = useState('all');

  const handleFilterChange = (newActivity: string, newArea: string) => {
    onFilterChange({ activity: newActivity, area: newArea });
  };

  const handleActivityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newActivity = e.target.value;
    setActivity(newActivity);
    handleFilterChange(newActivity, area);
  };

  const handleAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newArea = e.target.value;
    setArea(newArea);
    handleFilterChange(activity, newArea);
  };

  const clearFilters = () => {
    setActivity('all');
    setArea('all');
    handleFilterChange('all', 'all');
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
        <button onClick={clearFilters} className={styles.button}>Clear Filters</button>
      </div>
    </div>
  );
}