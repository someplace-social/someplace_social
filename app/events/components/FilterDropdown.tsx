'use client';

import styles from './FilterControls.module.css';

interface FilterDropdownProps {
  label: string;
  title: string;
  options: string[];
  selected: string[];
  isOpen: boolean;
  onToggleOpen: () => void;
  onToggleOption: (option: string) => void;
  onClear: () => void;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  flexStyle?: boolean;
}

export default function FilterDropdown({
  label,
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
        <span>{label}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={isOpen ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'} />
        </svg>
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
                  {isChecked && (
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
                <span>{opt}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}