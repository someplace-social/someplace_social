"use client";

import { useState } from 'react';

type FilterBarProps = {
  activities: string[];
  areas: string[];
  onFilterChange: (filters: { activity: string; area: string }) => void;
};

const filterContainerStyles: React.CSSProperties = {
  display: 'flex',
  gap: '1rem',
  marginBottom: '2rem',
  padding: '1rem',
  backgroundColor: '#fdf8e1',
  border: '1px solid #eee',
  borderRadius: '8px',
};

export default function FilterBar({ activities, areas, onFilterChange }: FilterBarProps) {
  const [activity, setActivity] = useState('all');
  const [area, setArea] = useState('all');

  const handleActivityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newActivity = e.target.value;
    setActivity(newActivity);
    onFilterChange({ activity: newActivity, area });
  };

  const handleAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newArea = e.target.value;
    setArea(newArea);
    onFilterChange({ activity, area: newArea });
  };

  return (
    <div style={filterContainerStyles}>
      <select value={activity} onChange={handleActivityChange}>
        <option value="all">All Activities</option>
        {activities.map(act => <option key={act} value={act}>{act}</option>)}
      </select>
      <select value={area} onChange={handleAreaChange}>
        <option value="all">All Areas</option>
        {areas.map(ar => <option key={ar} value={ar}>{ar}</option>)}
      </select>
    </div>
  );
}