'use client';
import type { Ref } from 'react';
import { CheckIcon, ChevronDownIcon } from './EventIcons';
import styles from './FilterControls.module.css';

interface FilterDropdownProps {
  icon: React.ReactNode;
  category: string;
  value: string;
  title: string;
  options: string[];
  selected: string[];
  isOpen: boolean;
  onToggleOpen: () => void;
  onToggleOption: (option: string) => void;
  onClear: () => void;
  containerRef?: Ref<HTMLDivElement>;
  flexStyle?: boolean;
}

export default function FilterDropdown({
  icon,
  category,
  value,
  title,
  options,
  selected,
  isOpen,
  onToggleOpen,
  onToggleOption,
  onClear,
  containerRef,
  flexStyle = false,
}: FilterDropdownProps) {
  return (
    <div
      className={styles.multiSelectWrapper}
      ref={containerRef}
      style={flexStyle ? { flex: 1 } : undefined}
    >
      <button
        type="button"
        className={`${styles.multiSelectTrigger} ${
          selected.length > 0 ? styles.multiSelectTriggerActive : ''
        }`}
        aria-expanded={isOpen}
        onClick={onToggleOpen}
      >
        <span className={styles.filterTriggerLeft}>
          <span className={styles.filterTriggerIcon}>{icon}</span>
          <span className={styles.filterCategory}>{category}</span>
          <span className={styles.filterValue}>{value}</span>
        </span>
        <ChevronDownIcon
          className={styles.filterChevron}
          size={14}
          strokeWidth={2.4}
          style={isOpen ? { transform: 'rotate(180deg)' } : undefined}
        />
      </button>
      {isOpen && (
        <div className={styles.multiSelectMenu}>
          <div className={styles.multiSelectMenuHeader}>
            <span>{title}</span>
            {selected.length > 0 && (
              <button
                type="button"
                className={styles.multiSelectClearLink}
                onClick={onClear}
              >
                Clear
              </button>
            )}
          </div>
          {options.map((opt) => {
            const isChecked = selected.includes(opt);
            return (
              <label key={opt} className={styles.multiSelectOption}>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleOption(opt)}
                  className={styles.hiddenCheckbox}
                />
                <span
                  className={`${styles.customCheckbox} ${
                    isChecked ? styles.customCheckboxChecked : ''
                  }`}
                >
                  {isChecked && <CheckIcon size={12} strokeWidth={3} />}
                </span>
                <span>{opt}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}