'use client';
import { useMemo } from 'react';
import Link from 'next/link';
import {
  normalizeContactText,
  normalizeProveItText,
  parseContactWithLinks,
  parseTextWithLinks,
  type TextSegment,
} from '../linkify';
import ActionPopover from './ActionPopover';
import { ExternalLinkIcon, ShieldCheckIcon } from './EventIcons';
import styles from './ProveItButton.module.css';

interface ProveItButtonProps {
  proveIt?: string;
  contact?: string;
  contactPageHref: string;
  btnClassName: string;
  btnActiveClassName: string;
  btnDisabledClassName: string;
}

function renderTextSegments(segments: TextSegment[]) {
  return segments.map((seg, idx) => {
    if (seg.type === 'text') {
      return <span key={idx}>{seg.text}</span>;
    }
    const isExternal =
      !seg.href.startsWith('mailto:') && !seg.href.startsWith('tel:');
    return (
      <a
        key={idx}
        href={seg.href}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className={styles.proveItLink}
      >
        <span>{seg.text}</span>
        {isExternal && <ExternalLinkIcon className={styles.proveItLinkIcon} />}
      </a>
    );
  });
}

export default function ProveItButton({
  proveIt,
  contact,
  contactPageHref,
  btnClassName,
  btnActiveClassName,
  btnDisabledClassName,
}: ProveItButtonProps) {
  const cleanProveIt = useMemo(() => normalizeProveItText(proveIt), [proveIt]);
  const cleanContact = useMemo(() => normalizeContactText(contact), [contact]);
  const proveItSegments = useMemo(
    () => (cleanProveIt ? parseTextWithLinks(cleanProveIt) : []),
    [cleanProveIt]
  );
  const contactSegments = useMemo(
    () => (cleanContact ? parseContactWithLinks(cleanContact) : []),
    [cleanContact]
  );

  if (!cleanProveIt && !cleanContact) {
    return (
      <button
        type="button"
        disabled
        className={`${btnClassName} ${btnDisabledClassName}`}
        title="No source details listed yet"
      >
        <ShieldCheckIcon />
        Prove It
      </button>
    );
  }

  const needsTrailingPeriod =
    Boolean(cleanContact) && !/[.!?]$/.test(cleanContact);

  return (
    <ActionPopover
      triggerLabel="Prove It"
      triggerIcon={<ShieldCheckIcon />}
      btnClassName={btnClassName}
      btnActiveClassName={btnActiveClassName}
      dialogLabel="Event source and verification details"
      headerLabel="Prove It"
      wide
      align="left"
    >
      {() => (
        <div className={styles.proveItBox}>
          {cleanProveIt && (
            <p className={styles.proveItText}>
              {renderTextSegments(proveItSegments)}
            </p>
          )}
          <p
            className={`${styles.proveItText} ${
              cleanProveIt ? styles.proveItContactDivider : ''
            }`}
          >
            <span>Need more proof? Contact </span>
            {cleanContact ? (
              <>
                {renderTextSegments(contactSegments)}
                {needsTrailingPeriod ? '.' : ''}
              </>
            ) : (
              <>
                <Link href={contactPageHref} className={styles.proveItLink}>
                  us
                </Link>
                .
              </>
            )}
          </p>
        </div>
      )}
    </ActionPopover>
  );
}