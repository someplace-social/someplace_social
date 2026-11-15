'use client';
import { useMemo } from 'react';
import { normalizeProveItText, parseTextWithLinks } from '../linkify';
import ActionPopover from './ActionPopover';
import { ExternalLinkIcon, ShieldCheckIcon } from './EventIcons';
import styles from './ProveItButton.module.css';

interface ProveItButtonProps {
  proveIt?: string;
  btnClassName: string;
  btnActiveClassName: string;
  btnDisabledClassName: string;
  slotClassName?: string;
}

export default function ProveItButton({
  proveIt,
  btnClassName,
  btnActiveClassName,
  btnDisabledClassName,
  slotClassName,
}: ProveItButtonProps) {
  const cleanText = useMemo(() => normalizeProveItText(proveIt), [proveIt]);
  const segments = useMemo(
    () => (cleanText ? parseTextWithLinks(cleanText) : []),
    [cleanText]
  );

  if (!cleanText) {
    return (
      <div
        className={`${btnClassName} ${btnDisabledClassName} ${slotClassName || ''}`}
        aria-disabled="true"
      >
        <ShieldCheckIcon />
        Prove It
      </div>
    );
  }

  return (
    <ActionPopover
      triggerLabel="Prove It"
      triggerIcon={<ShieldCheckIcon />}
      btnClassName={btnClassName}
      btnActiveClassName={btnActiveClassName}
      wrapperClassName={slotClassName}
      dialogLabel="Event source and verification details"
      headerLabel="Prove It"
      wide
    >
      {() => (
        <div className={styles.proveItBox}>
          <p className={styles.proveItText}>
            {segments.map((seg, idx) => {
              if (seg.type === 'text') {
                return <span key={idx}>{seg.text}</span>;
              }
              const isMailto = seg.href.startsWith('mailto:');
              return (
                <a
                  key={idx}
                  href={seg.href}
                  target={isMailto ? undefined : '_blank'}
                  rel={isMailto ? undefined : 'noopener noreferrer'}
                  className={styles.proveItLink}
                >
                  <span>{seg.text}</span>
                  {!isMailto && <ExternalLinkIcon className={styles.proveItLinkIcon} />}
                </a>
              );
            })}
          </p>
        </div>
      )}
    </ActionPopover>
  );
}