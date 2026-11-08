'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
import FilterDropdown from './FilterDropdown';
import PriceFilterDropdown from './PriceFilterDropdown';
import { CityPriceConfig } from '../../lib/cities';
import styles from './FilterControls.module.css';

interface FilterControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  priceConfig: CityPriceConfig;
  maxPrice: number;
  onPriceChange: (val: number) => void;
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
  priceConfig,
  maxPrice,
  onPriceChange,
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
  const [priceMenuOpen, setPriceMenuOpen] = useState(false);
  const [timeMenuOpen, setTimeMenuOpen] = useState(false);
  const [actMenuOpen, setActMenuOpen] = useState(false);
  const [areaMenuOpen, setAreaMenuOpen] = useState(false);

  const priceMenuRef = useRef<HTMLDivElement>(null);
  const priceMobileMenuRef = useRef<HTMLDivElement>(null);
  const timeMenuRef = useRef<HTMLDivElement>(null);
  const actMenuRef = useRef<HTMLDivElement>(null);
  const areaMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        priceMenuRef.current &&
        !priceMenuRef.current.contains(target) &&
        (!priceMobileMenuRef.current || !priceMobileMenuRef.current.contains(target))
      ) {
        setPriceMenuOpen(false);
      }
      if (timeMenuRef.current && !timeMenuRef.current.contains(target)) {
        setTimeMenuOpen(false);
      }
      if (actMenuRef.current && !actMenuRef.current.contains(target)) {
        setActMenuOpen(false);
      }
      if (areaMenuRef.current && !areaMenuRef.current.contains(target)) {
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

  const renderSearchInput = () => (
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
  );

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
          {renderSearchInput()}
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
          <PriceFilterDropdown
            priceConfig={priceConfig}
            maxPrice={maxPrice}
            onPriceChange={onPriceChange}
            isOpen={priceMenuOpen}
            onToggleOpen={() => setPriceMenuOpen(!priceMenuOpen)}
            containerRef={priceMenuRef}
          />
        </div>
      </div>
      <div className={styles.mobileFiltersSection}>
        {renderSearchInput()}
        <div className={styles.mobileFiltersRow}>
          <PriceFilterDropdown
            priceConfig={priceConfig}
            maxPrice={maxPrice}
            onPriceChange={onPriceChange}
            isOpen={priceMenuOpen}
            onToggleOpen={() => setPriceMenuOpen(!priceMenuOpen)}
            containerRef={priceMobileMenuRef}
            flexStyle
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