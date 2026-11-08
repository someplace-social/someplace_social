'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import styles from '../EventsView.module.css';

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

          <div className={styles.multiSelectWrapper} ref={actMenuRef}>
            <button
              type="button"
              className={`${styles.multiSelectTrigger} ${
                selectedActivities.length > 0 ? styles.multiSelectTriggerActive : ''
              }`}
              aria-expanded={actMenuOpen}
              onClick={() => setActMenuOpen(!actMenuOpen)}
            >
              <span>{activityLabel}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d={actMenuOpen ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'} />
              </svg>
            </button>
            {actMenuOpen && (
              <div className={styles.multiSelectMenu}>
                <div className={styles.multiSelectMenuHeader}>
                  <span>Select activities</span>
                  {selectedActivities.length > 0 && (
                    <button type="button" className={styles.multiSelectClearLink} onClick={onClearActivities}>
                      Clear
                    </button>
                  )}
                </div>
                {activities.map((act) => {
                  const isChecked = selectedActivities.includes(act);
                  return (
                    <label key={act} className={styles.multiSelectOption}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggleActivity(act)}
                        className={styles.hiddenCheckbox}
                      />
                      <span className={`${styles.customCheckbox} ${isChecked ? styles.customCheckboxChecked : ''}`}>
                        {isChecked && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                      <span>{act}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div className={styles.multiSelectWrapper} ref={timeMenuRef}>
            <button
              type="button"
              className={`${styles.multiSelectTrigger} ${
                selectedTimes.length > 0 ? styles.multiSelectTriggerActive : ''
              }`}
              aria-expanded={timeMenuOpen}
              onClick={() => setTimeMenuOpen(!timeMenuOpen)}
            >
              <span>{timeLabel}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d={timeMenuOpen ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'} />
              </svg>
            </button>
            {timeMenuOpen && (
              <div className={styles.multiSelectMenu}>
                <div className={styles.multiSelectMenuHeader}>
                  <span>Time of day</span>
                  {selectedTimes.length > 0 && (
                    <button type="button" className={styles.multiSelectClearLink} onClick={onClearTimes}>
                      Clear
                    </button>
                  )}
                </div>
                {timeSections.map((tName) => {
                  const isChecked = selectedTimes.includes(tName);
                  return (
                    <label key={tName} className={styles.multiSelectOption}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggleTime(tName)}
                        className={styles.hiddenCheckbox}
                      />
                      <span className={`${styles.customCheckbox} ${isChecked ? styles.customCheckboxChecked : ''}`}>
                        {isChecked && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                      <span>{tName}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div className={styles.multiSelectWrapper} ref={areaMenuRef}>
            <button
              type="button"
              className={`${styles.multiSelectTrigger} ${
                selectedAreas.length > 0 ? styles.multiSelectTriggerActive : ''
              }`}
              aria-expanded={areaMenuOpen}
              onClick={() => setAreaMenuOpen(!areaMenuOpen)}
            >
              <span>{areaLabel}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d={areaMenuOpen ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'} />
              </svg>
            </button>
            {areaMenuOpen && (
              <div className={styles.multiSelectMenu}>
                <div className={styles.multiSelectMenuHeader}>
                  <span>Select areas</span>
                  {selectedAreas.length > 0 && (
                    <button type="button" className={styles.multiSelectClearLink} onClick={onClearAreas}>
                      Clear
                    </button>
                  )}
                </div>
                {areas.map((ar) => {
                  const isChecked = selectedAreas.includes(ar);
                  return (
                    <label key={ar} className={styles.multiSelectOption}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggleArea(ar)}
                        className={styles.hiddenCheckbox}
                      />
                      <span className={`${styles.customCheckbox} ${isChecked ? styles.customCheckboxChecked : ''}`}>
                        {isChecked && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                      <span>{ar}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

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
          <div className={styles.multiSelectWrapper} style={{ flex: 1 }}>
            <button
              type="button"
              className={`${styles.multiSelectTrigger} ${selectedTimes.length > 0 ? styles.multiSelectTriggerActive : ''}`}
              onClick={() => setTimeMenuOpen(!timeMenuOpen)}
            >
              <span>{timeLabel}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d={timeMenuOpen ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'} />
              </svg>
            </button>
            {timeMenuOpen && (
              <div className={styles.multiSelectMenu}>
                <div className={styles.multiSelectMenuHeader}>
                  <span>Time of day</span>
                  {selectedTimes.length > 0 && (
                    <button type="button" className={styles.multiSelectClearLink} onClick={onClearTimes}>
                      Clear
                    </button>
                  )}
                </div>
                {timeSections.map((tName) => {
                  const isChecked = selectedTimes.includes(tName);
                  return (
                    <label key={tName} className={styles.multiSelectOption}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggleTime(tName)}
                        className={styles.hiddenCheckbox}
                      />
                      <span className={`${styles.customCheckbox} ${isChecked ? styles.customCheckboxChecked : ''}`}>
                        {isChecked && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                      <span>{tName}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
          <div className={styles.multiSelectWrapper} style={{ flex: 1 }}>
            <button
              type="button"
              className={`${styles.multiSelectTrigger} ${selectedActivities.length > 0 ? styles.multiSelectTriggerActive : ''}`}
              onClick={() => setActMenuOpen(!actMenuOpen)}
            >
              <span>{activityLabel}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d={actMenuOpen ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'} />
              </svg>
            </button>
            {actMenuOpen && (
              <div className={styles.multiSelectMenu}>
                <div className={styles.multiSelectMenuHeader}>
                  <span>Activities</span>
                  {selectedActivities.length > 0 && (
                    <button type="button" className={styles.multiSelectClearLink} onClick={onClearActivities}>
                      Clear
                    </button>
                  )}
                </div>
                {activities.map((act) => {
                  const isChecked = selectedActivities.includes(act);
                  return (
                    <label key={act} className={styles.multiSelectOption}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggleActivity(act)}
                        className={styles.hiddenCheckbox}
                      />
                      <span className={`${styles.customCheckbox} ${isChecked ? styles.customCheckboxChecked : ''}`}>
                        {isChecked && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                      <span>{act}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
          <div className={styles.multiSelectWrapper} style={{ flex: 1 }}>
            <button
              type="button"
              className={`${styles.multiSelectTrigger} ${selectedAreas.length > 0 ? styles.multiSelectTriggerActive : ''}`}
              onClick={() => setAreaMenuOpen(!areaMenuOpen)}
            >
              <span>{areaLabel}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d={areaMenuOpen ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'} />
              </svg>
            </button>
            {areaMenuOpen && (
              <div className={styles.multiSelectMenu}>
                <div className={styles.multiSelectMenuHeader}>
                  <span>Areas</span>
                  {selectedAreas.length > 0 && (
                    <button type="button" className={styles.multiSelectClearLink} onClick={onClearAreas}>
                      Clear
                    </button>
                  )}
                </div>
                {areas.map((ar) => {
                  const isChecked = selectedAreas.includes(ar);
                  return (
                    <label key={ar} className={styles.multiSelectOption}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggleArea(ar)}
                        className={styles.hiddenCheckbox}
                      />
                      <span className={`${styles.customCheckbox} ${isChecked ? styles.customCheckboxChecked : ''}`}>
                        {isChecked && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                      <span>{ar}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
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