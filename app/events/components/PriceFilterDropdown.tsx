'use client';
import { useMemo } from 'react';
import { CityPriceConfig } from '../../lib/cities';
import styles from './FilterControls.module.css';

interface PriceFilterDropdownProps {
  priceConfig: CityPriceConfig;
  maxPrice: number;
  onPriceChange: (val: number) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  containerRef?: React.RefObject<HTMLDivElement | null>;
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

  const triggerLabel = useMemo(() => {
    if (maxPrice >= priceConfig.maxPrice) return 'All prices';
    if (maxPrice === 0) return 'Free / donation';
    if (maxPrice === priceConfig.underValue) return priceConfig.underLabel;
    return `Up to ${priceConfig.formatValue(maxPrice)}`;
  }, [maxPrice, priceConfig]);

  const readoutText = useMemo(() => {
    return priceConfig.formatReadout(maxPrice);
  }, [maxPrice, priceConfig]);

  const readoutColor = isFreeActive ? '#1F7A4D' : '#1F1A14';
  const trackFill = isFreeActive ? '#1F7A4D' : '#1F1A14';
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
        <span>{triggerLabel}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d={isOpen ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'} />
        </svg>
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
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" />
                <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" />
              </svg>
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
                background: `linear-gradient(to right, ${trackFill} 0%, ${trackFill} ${trackPercent}%, #EADFC4 ${trackPercent}%, #EADFC4 100%)`,
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