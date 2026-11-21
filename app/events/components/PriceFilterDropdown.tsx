'use client';
import { useMemo, type Ref } from 'react';
import { CityPriceConfig } from '../../lib/cities';
import { formatPriceValue, formatPriceReadout } from '../utils';
import { ChevronDownIcon, TagIcon } from './EventIcons';
import styles from './FilterControls.module.css';

interface PriceFilterDropdownProps {
  priceConfig: CityPriceConfig;
  maxPrice: number;
  onPriceChange: (val: number) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  containerRef?: Ref<HTMLDivElement>;
  flexStyle?: boolean;
}

export default function PriceFilterDropdown({
  priceConfig,
  maxPrice,
  onPriceChange,
  isOpen,
  onToggleOpen,
  containerRef,
  flexStyle = false,
}: PriceFilterDropdownProps) {
  const isFreeActive = maxPrice === 0;
  const isUnderActive = maxPrice === priceConfig.underValue;
  const isFiltered = maxPrice < priceConfig.maxPrice;

  const priceValue = useMemo(() => {
    if (maxPrice >= priceConfig.maxPrice) return 'All';
    if (maxPrice === 0) return 'Free';
    if (maxPrice === priceConfig.underValue) return priceConfig.underLabel;
    return `Up to ${formatPriceValue(maxPrice, priceConfig)}`;
  }, [maxPrice, priceConfig]);

  const readoutText = useMemo(() => {
    return formatPriceReadout(maxPrice, priceConfig);
  }, [maxPrice, priceConfig]);

  const readoutColor = isFreeActive ? 'var(--free)' : 'var(--ink)';
  const trackFill = isFreeActive ? 'var(--free)' : 'var(--ink)';
  const trackPercent = (maxPrice / priceConfig.maxPrice) * 100;

  const handleToggleFree = () => {
    onPriceChange(isFreeActive ? priceConfig.maxPrice : 0);
  };

  const handleToggleUnder = () => {
    onPriceChange(isUnderActive ? priceConfig.maxPrice : priceConfig.underValue);
  };

  return (
    <div
      className={styles.multiSelectWrapper}
      ref={containerRef}
      style={flexStyle ? { flex: 1, minWidth: 120 } : undefined}
    >
      <button
        type="button"
        className={`${styles.multiSelectTrigger} ${
          isFiltered ? styles.multiSelectTriggerActive : ''
        }`}
        aria-expanded={isOpen}
        onClick={onToggleOpen}
      >
        <span className={styles.filterTriggerLeft}>
          <span className={styles.filterTriggerIcon}>
            <TagIcon size={16} strokeWidth={2.2} />
          </span>
          <span className={styles.filterCategory}>Price</span>
          <span className={styles.filterValue}>{priceValue}</span>
        </span>
        <ChevronDownIcon
          className={styles.filterChevron}
          size={14}
          strokeWidth={2.4}
          style={isOpen ? { transform: 'rotate(180deg)' } : undefined}
        />
      </button>
      {isOpen && (
        <div className={`${styles.priceMenu} ${flexStyle ? styles.mobilePriceMenu : ''}`}>
          <div className={styles.priceHeaderRow}>
            <span className={styles.priceHeaderTitle}>Price</span>
            <span
              className={styles.priceHeaderReadout}
              style={{ color: readoutColor }}
            >
              {readoutText}
            </span>
          </div>
          <div className={styles.priceChipsRow} role="group" aria-label="Price quick filters">
            <button
              type="button"
              className={`${styles.priceChip} ${
                isFreeActive ? styles.priceChipFreeActive : ''
              }`}
              onClick={handleToggleFree}
              aria-pressed={isFreeActive}
            >
              <TagIcon size={15} strokeWidth={2} />
              Free / donation
            </button>
            <button
              type="button"
              className={`${styles.priceChip} ${
                isUnderActive ? styles.priceChipUnderActive : ''
              }`}
              onClick={handleToggleUnder}
              aria-pressed={isUnderActive}
            >
              {priceConfig.underLabel}
            </button>
          </div>
          <div className={styles.sliderSection}>
            <input
              type="range"
              min={0}
              max={priceConfig.maxPrice}
              step={priceConfig.step}
              value={maxPrice}
              onChange={(e) => onPriceChange(Number(e.target.value))}
              className={styles.rangeSlider}
              aria-label="Maximum price"
              style={{
                background: `linear-gradient(to right, ${trackFill} 0%, ${trackFill} ${trackPercent}%, var(--slider-track) ${trackPercent}%, var(--slider-track) 100%)`,
              }}
            />
            <div className={styles.sliderLabelsRow} aria-hidden="true">
              <span>Free</span>
              <span>{priceConfig.midLabel}</span>
              <span>Any</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}