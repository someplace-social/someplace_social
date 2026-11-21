'use client';
import { getTagStyle, isFreePrice } from '../utils';
import { CompassIcon, TagIcon } from './EventIcons';
import styles from './EventMeta.module.css';

interface EventMetaProps {
  price?: string;
  area?: string;
  activities?: string[];
  variant?: 'compact' | 'detail';
  className?: string;
}

export default function EventMeta({
  price,
  area,
  activities = [],
  variant = 'compact',
  className,
}: EventMetaProps) {
  if (!price && !area && activities.length === 0) {
    return null;
  }
  const isFree = isFreePrice(price || '');

  return (
    <div
      className={`${styles.meta} ${
        variant === 'detail' ? styles.metaDetail : styles.metaCompact
      } ${className || ''}`}
    >
      {price && (
        <span
          className={`${styles.price} ${
            isFree ? styles.priceFree : styles.pricePaid
          }`}
        >
          <TagIcon />
          <span>{price}</span>
        </span>
      )}
      {price && area && <span className={styles.dot} aria-hidden="true" />}
      {area && (
        <span className={styles.area}>
          <CompassIcon />
          <span>{area}</span>
        </span>
      )}
      {(price || area) && activities.length > 0 && (
        <span className={`${styles.dot} ${styles.sep2}`} aria-hidden="true" />
      )}
      {activities.length > 0 && (
        <div className={styles.tags}>
          {activities.map((tag) => {
            const customStyle = getTagStyle(tag);
            return (
              <span
                key={tag}
                className={styles.tag}
                style={{
                  color: customStyle.color,
                  backgroundColor: customStyle.background,
                }}
              >
                {tag}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}