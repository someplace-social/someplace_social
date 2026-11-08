'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import FilterDropdown from './FilterDropdown';
import styles from './FilterControls.module.css';

interface FilterControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  freeOnly: boolean;
  onToggleFree: () => void;
  timeSections: string[];
  selectedTimes: string[];
  onToggleTime: (timeName: string) => void;
  onClearTimes: () => void;
  activities: string[];
  selectedActivities: string[];
  onToggleActivity: (act: string) => void;
  onClearActivities: () => void;
  areas: string[];
  selectedAreas: string[];
  onToggleArea: (ar: string) => void;
  onClearAreas: () => void;
  hasActiveFilters: boolean;
  onClearAllFilters: () => void;
}

export default function FilterControls({
  searchQuery,
  onSearchChange,
  freeOnly,
  onToggleFree,
  timeSections,
  selectedTimes,
  onToggleTime,
  onClearTimes,
  activities,
  selectedActivities,
  onToggleActivity,
  onClearActivities,
  areas,
  selectedAreas,
  onToggleArea,
  onClearAreas,
  hasActiveFilters,
  onClearAllFilters,
}: FilterControlsProps) {
  const [timeMenuOpen, setTimeMenuOpen] = useState(false);
  const [actMenuOpen, setActMenuOpen] = useState(false);
  const [areaMenuOpen, setAreaMenuOpen] = useState(false);

  const timeMenuRef = useRef<HTMLDivElement>(null);
  const actMenuRef = useRef<HTMLDivElement>(null);
  const areaMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (timeMenuRef.current && !timeMenuRef.current.contains(e.target as Node)) {
        setTimeMenuOpen(false);
      }
      if (actMenuRef.current && !actMenuRef.current.contains(e.target as Node)) {
        setActMenuOpen(false);
      }
      if (areaMenuRef.current && !areaMenuRef.current.contains(e.target as Node)) {
        setAreaMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const timeLabel = useMemo(() => {
    if (selectedTimes.length === 0) return 'All times';
    if (selectedTimes.length === 1) return selectedTimes[0];
    return `Times (${selectedTimes.length})`;
  }, [selectedTimes]);

  const activityLabel = useMemo(() => {
    if (selectedActivities.length === 0) return 'All activities';
    if (selectedActivities.length === 1) return selectedActivities[0];
    return `Activities (${selectedActivities.length})`;
  }, [selectedActivities]);

  const areaLabel = useMemo(() => {
    if (selectedAreas.length === 0) return 'All areas';
    if (selectedAreas.length === 1) return selectedAreas[0];
    return `Areas (${selectedAreas.length})`;
  }, [selectedAreas]);

  return (
    <>
      <div className={styles.filterBlockDesktop}>
        <div className={styles.filterHeaderRow}>
          <span className={styles.filterTitle}>Filters</span>
          {hasActiveFilters && (
            <button
              type="button"
              className={styles.clearFiltersLink}
              onClick={onClearAllFilters}
            >
              Reset all
            </button>
          )}
        </div>

        <div className={styles.filterListVertical}>
          <div className={styles.searchWrapper}>
            <svg
              className={styles.searchIcon}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search events, places, tags..."
              className={styles.searchInput}
              aria-label="Search events"
              autoComplete="off"
              spellCheck={false}
            />
            {searchQuery && (
              <button
                type="button"
                className={styles.searchClearBtn}
                onClick={() => onSearchChange('')}
                aria-label="Clear search query"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <FilterDropdown
            label={activityLabel}
            title="Select activities"
            options={activities}
            selected={selectedActivities}
            isOpen={actMenuOpen}
            onToggleOpen={() => setActMenuOpen(!actMenuOpen)}
            onToggleOption={onToggleActivity}
            onClear={onClearActivities}
            containerRef={actMenuRef}
          />

          <FilterDropdown
            label={timeLabel}
            title="Time of day"
            options={timeSections}
            selected={selectedTimes}
            isOpen={timeMenuOpen}
            onToggleOpen={() => setTimeMenuOpen(!timeMenuOpen)}
            onToggleOption={onToggleTime}
            onClear={onClearTimes}
            containerRef={timeMenuRef}
          />

          <FilterDropdown
            label={areaLabel}
            title="Select areas"
            options={areas}
            selected={selectedAreas}
            isOpen={areaMenuOpen}
            onToggleOpen={() => setAreaMenuOpen(!areaMenuOpen)}
            onToggleOption={onToggleArea}
            onClear={onClearAreas}
            containerRef={areaMenuRef}
          />

          <button
            type="button"
            className={styles.filterFreeBtn}
            aria-pressed={freeOnly}
            onClick={onToggleFree}
          >
            Free only
            <span
              className={`${styles.checkboxSquare} ${
                freeOnly ? styles.checkboxChecked : ''
              }`}
            >
              {freeOnly && (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
              )}
            </span>
          </button>
        </div>
      </div>

      <div className={styles.mobileFiltersSection}>
        <div className={styles.searchWrapper}>
          <svg
            className={styles.searchIcon}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search events, places, tags..."
            className={styles.searchInput}
            aria-label="Search events"
            autoComplete="off"
            spellCheck={false}
          />
          {searchQuery && (
            <button
              type="button"
              className={styles.searchClearBtn}
              onClick={() => onSearchChange('')}
              aria-label="Clear search query"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className={styles.mobileFiltersRow}>
          <button
            type="button"
            className={`${styles.mobileFreeBtn} ${freeOnly ? styles.mobileFreeBtnActive : ''}`}
            onClick={onToggleFree}
          >
            Free only
          </button>
          <FilterDropdown
            label={timeLabel}
            title="Time of day"
            options={timeSections}
            selected={selectedTimes}
            isOpen={timeMenuOpen}
            onToggleOpen={() => setTimeMenuOpen(!timeMenuOpen)}
            onToggleOption={onToggleTime}
            onClear={onClearTimes}
            flexStyle
          />
          <FilterDropdown
            label={activityLabel}
            title="Activities"
            options={activities}
            selected={selectedActivities}
            isOpen={actMenuOpen}
            onToggleOpen={() => setActMenuOpen(!actMenuOpen)}
            onToggleOption={onToggleActivity}
            onClear={onClearActivities}
            flexStyle
          />
          <FilterDropdown
            label={areaLabel}
            title="Areas"
            options={areas}
            selected={selectedAreas}
            isOpen={areaMenuOpen}
            onToggleOpen={() => setAreaMenuOpen(!areaMenuOpen)}
            onToggleOption={onToggleArea}
            onClear={onClearAreas}
            flexStyle
          />
          {hasActiveFilters && (
            <button
              type="button"
              className={styles.clearFiltersBtn}
              onClick={onClearAllFilters}
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </>
  );
}