'use client';
import { useState, useRef, useEffect, useMemo, memo } from 'react';
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

const activityIcon = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 6h16M7 12h10M10 18h4" />
  </svg>
);

const timeIcon = (
  <svg
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
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 7 12 12 15 14" />
  </svg>
);

const areaIcon = (
  <svg
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
    <path d="M12 21s-6-5.5-6-10a6 6 0 1 1 12 0c0 4.5-6 10-6 10z" />
    <circle cx="12" cy="11" r="2.5" />
  </svg>
);

const filterSliderIcon = (
  <svg
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
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" />
    <line x1="9" y1="8" x2="15" y2="8" />
    <line x1="17" y1="16" x2="23" y2="16" />
  </svg>
);

function FilterControls({
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
  const [mobileAccordionOpen, setMobileAccordionOpen] = useState(false);
  const [priceMenuOpen, setPriceMenuOpen] = useState(false);
  const [timeMenuOpen, setTimeMenuOpen] = useState(false);
  const [actMenuOpen, setActMenuOpen] = useState(false);
  const [areaMenuOpen, setAreaMenuOpen] = useState(false);

  const priceMenuRef = useRef<HTMLDivElement>(null);
  const priceMobileMenuRef = useRef<HTMLDivElement>(null);
  const timeMenuRef = useRef<HTMLDivElement>(null);
  const timeMobileMenuRef = useRef<HTMLDivElement>(null);
  const actMenuRef = useRef<HTMLDivElement>(null);
  const actMobileMenuRef = useRef<HTMLDivElement>(null);
  const areaMenuRef = useRef<HTMLDivElement>(null);
  const areaMobileMenuRef = useRef<HTMLDivElement>(null);

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
      if (
        timeMenuRef.current &&
        !timeMenuRef.current.contains(target) &&
        (!timeMobileMenuRef.current || !timeMobileMenuRef.current.contains(target))
      ) {
        setTimeMenuOpen(false);
      }
      if (
        actMenuRef.current &&
        !actMenuRef.current.contains(target) &&
        (!actMobileMenuRef.current || !actMobileMenuRef.current.contains(target))
      ) {
        setActMenuOpen(false);
      }
      if (
        areaMenuRef.current &&
        !areaMenuRef.current.contains(target) &&
        (!areaMobileMenuRef.current || !areaMobileMenuRef.current.contains(target))
      ) {
        setAreaMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim().length > 0) count++;
    if (maxPrice < priceConfig.maxPrice) count++;
    count += selectedTimes.length;
    count += selectedActivities.length;
    count += selectedAreas.length;
    return count;
  }, [
    searchQuery,
    maxPrice,
    priceConfig.maxPrice,
    selectedTimes.length,
    selectedActivities.length,
    selectedAreas.length,
  ]);

  const timeValue = useMemo(() => {
    if (selectedTimes.length === 0) return 'All';
    if (selectedTimes.length === 1) return selectedTimes[0];
    return `${selectedTimes.length} selected`;
  }, [selectedTimes]);

  const activityValue = useMemo(() => {
    if (selectedActivities.length === 0) return 'All';
    if (selectedActivities.length === 1) return selectedActivities[0];
    return `${selectedActivities.length} selected`;
  }, [selectedActivities]);

  const areaValue = useMemo(() => {
    if (selectedAreas.length === 0) return 'All';
    if (selectedAreas.length === 1) return selectedAreas[0];
    return `${selectedAreas.length} selected`;
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
            icon={activityIcon}
            category="Activity"
            value={activityValue}
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
            icon={timeIcon}
            category="Time"
            value={timeValue}
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
            icon={areaIcon}
            category="Area"
            value={areaValue}
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

      <div className={styles.mobileAccordionWrapper}>
        <button
          type="button"
          className={`${styles.mobileAccordionTrigger} ${
            mobileAccordionOpen ? styles.mobileAccordionTriggerOpen : ''
          }`}
          onClick={() => setMobileAccordionOpen((prev) => !prev)}
          aria-expanded={mobileAccordionOpen}
          aria-controls="mobile-filters-content"
        >
          <div className={styles.mobileTriggerLeft}>
            <span className={styles.mobileTriggerIcon}>{filterSliderIcon}</span>
            <span className={styles.mobileTriggerText}>Filters &amp; Search</span>
            {activeFilterCount > 0 && (
              <span className={styles.mobileActiveBadge}>
                {activeFilterCount}
              </span>
            )}
          </div>

          <div className={styles.mobileTriggerRight}>
            <span className={styles.mobileTriggerStatus}>
              {mobileAccordionOpen ? 'Hide' : activeFilterCount > 0 ? 'Edit' : 'Show'}
            </span>
            <svg
              className={`${styles.mobileAccordionChevron} ${
                mobileAccordionOpen ? styles.mobileAccordionChevronOpen : ''
              }`}
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </button>

        {mobileAccordionOpen && (
          <div id="mobile-filters-content" className={styles.mobileAccordionContent}>
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
                icon={timeIcon}
                category="Time"
                value={timeValue}
                title="Time of day"
                options={timeSections}
                selected={selectedTimes}
                isOpen={timeMenuOpen}
                onToggleOpen={() => setTimeMenuOpen(!timeMenuOpen)}
                onToggleOption={onToggleTime}
                onClear={onClearTimes}
                containerRef={timeMobileMenuRef}
                flexStyle
              />
              <FilterDropdown
                icon={activityIcon}
                category="Activity"
                value={activityValue}
                title="Activities"
                options={activities}
                selected={selectedActivities}
                isOpen={actMenuOpen}
                onToggleOpen={() => setActMenuOpen(!actMenuOpen)}
                onToggleOption={onToggleActivity}
                onClear={onClearActivities}
                containerRef={actMobileMenuRef}
                flexStyle
              />
              <FilterDropdown
                icon={areaIcon}
                category="Area"
                value={areaValue}
                title="Areas"
                options={areas}
                selected={selectedAreas}
                isOpen={areaMenuOpen}
                onToggleOpen={() => setAreaMenuOpen(!areaMenuOpen)}
                onToggleOption={onToggleArea}
                onClear={onClearAreas}
                containerRef={areaMobileMenuRef}
                flexStyle
              />
            </div>

            {hasActiveFilters && (
              <div className={styles.mobileClearRow}>
                <button
                  type="button"
                  className={styles.clearFiltersBtn}
                  onClick={onClearAllFilters}
                >
                  Reset all filters ({activeFilterCount})
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default memo(FilterControls);