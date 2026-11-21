'use client';
import { useState, useRef, useEffect, useMemo, memo } from 'react';
import FilterDropdown from './FilterDropdown';
import PriceFilterDropdown from './PriceFilterDropdown';
import { ChevronDownIcon, CloseIcon, PinIcon } from './EventIcons';
import { CityPriceConfig } from '../../lib/cities';
import styles from './FilterControls.module.css';

type MenuKey = 'activity' | 'time' | 'area' | 'price';

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

type FilterDropdownGroupProps = Omit<
  FilterControlsProps,
  'searchQuery' | 'onSearchChange' | 'hasActiveFilters' | 'onClearAllFilters'
> & {
  isMobile: boolean;
};

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

function formatSelectionValue(selected: string[]): string {
  if (selected.length === 0) return 'All';
  if (selected.length === 1) return selected[0];
  return `${selected.length} selected`;
}

function FilterDropdownGroup({
  isMobile,
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
}: FilterDropdownGroupProps) {
  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null);
  const actRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openMenu) return;
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      const activeRef =
        openMenu === 'activity'
          ? actRef
          : openMenu === 'time'
          ? timeRef
          : openMenu === 'area'
          ? areaRef
          : priceRef;
      if (activeRef.current && !activeRef.current.contains(target)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenu]);

  const toggleMenu = (key: MenuKey) => {
    setOpenMenu((prev) => (prev === key ? null : key));
  };

  return (
    <>
      <FilterDropdown
        icon={activityIcon}
        category="Activity"
        value={formatSelectionValue(selectedActivities)}
        title={isMobile ? 'Activities' : 'Select activities'}
        options={activities}
        selected={selectedActivities}
        isOpen={openMenu === 'activity'}
        onToggleOpen={() => toggleMenu('activity')}
        onToggleOption={onToggleActivity}
        onClear={onClearActivities}
        containerRef={actRef}
        flexStyle={isMobile}
      />
      <FilterDropdown
        icon={timeIcon}
        category="Time"
        value={formatSelectionValue(selectedTimes)}
        title="Time of day"
        options={timeSections}
        selected={selectedTimes}
        isOpen={openMenu === 'time'}
        onToggleOpen={() => toggleMenu('time')}
        onToggleOption={onToggleTime}
        onClear={onClearTimes}
        containerRef={timeRef}
        flexStyle={isMobile}
      />
      <FilterDropdown
        icon={<PinIcon strokeWidth={2.2} />}
        category="Area"
        value={formatSelectionValue(selectedAreas)}
        title={isMobile ? 'Areas' : 'Select areas'}
        options={areas}
        selected={selectedAreas}
        isOpen={openMenu === 'area'}
        onToggleOpen={() => toggleMenu('area')}
        onToggleOption={onToggleArea}
        onClear={onClearAreas}
        containerRef={areaRef}
        flexStyle={isMobile}
      />
      <PriceFilterDropdown
        priceConfig={priceConfig}
        maxPrice={maxPrice}
        onPriceChange={onPriceChange}
        isOpen={openMenu === 'price'}
        onToggleOpen={() => toggleMenu('price')}
        containerRef={priceRef}
        flexStyle={isMobile}
      />
    </>
  );
}

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

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim().length > 0) count++;
    if (maxPrice < priceConfig.maxPrice) count++;
    return count + selectedTimes.length + selectedActivities.length + selectedAreas.length;
  }, [
    searchQuery,
    maxPrice,
    priceConfig.maxPrice,
    selectedTimes.length,
    selectedActivities.length,
    selectedAreas.length,
  ]);

  const sharedDropdownProps = {
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
  };

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
          <CloseIcon size={13} strokeWidth={2.5} />
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
          <FilterDropdownGroup isMobile={false} {...sharedDropdownProps} />
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
            <ChevronDownIcon
              className={`${styles.mobileAccordionChevron} ${
                mobileAccordionOpen ? styles.mobileAccordionChevronOpen : ''
              }`}
              size={15}
              strokeWidth={2.4}
            />
          </div>
        </button>
        {mobileAccordionOpen && (
          <div id="mobile-filters-content" className={styles.mobileAccordionContent}>
            {renderSearchInput()}
            <div className={styles.mobileFiltersRow}>
              <FilterDropdownGroup isMobile {...sharedDropdownProps} />
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