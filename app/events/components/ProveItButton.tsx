'use client';
import { useMemo } from 'react';
import Link from 'next/link';
import { buildProveItSources } from '../event-helpers';
import {
  normalizeContactText,
  parseContactWithLinks,
  parseTextWithLinks,
  type TextSegment,
} from '../linkify';
import ActionPopover from './ActionPopover';
import { ExternalLinkIcon, ShieldCheckIcon } from './EventIcons';
import styles from './ProveItButton.module.css';

interface ProveItButtonProps {
  url1?: string;
  url1Notes?: string;
  url2?: string;
  url2Notes?: string;
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
  url1,
  url1Notes,
  url2,
  url2Notes,
  contact,
  contactPageHref,
  btnClassName,
  btnActiveClassName,
  btnDisabledClassName,
}: ProveItButtonProps) {
  const sources = useMemo(
    () =>
      buildProveItSources({
        url1: url1 || '',
        url1Notes: url1Notes || '',
        url2: url2 || '',
        url2Notes: url2Notes || '',
      }),
    [url1, url1Notes, url2, url2Notes]
  );
  const cleanContact = useMemo(() => normalizeContactText(contact), [contact]);
  const contactSegments = useMemo(
    () => (cleanContact ? parseContactWithLinks(cleanContact) : []),
    [cleanContact]
  );

  if (sources.length === 0) {
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
          {sources.map((source) => (
            <div
              key={`${source.prefix}-${source.url}`}
              className={styles.proveItSource}
            >
              <p className={styles.proveItText}>
                <span>{source.prefix}</span>
                <a
                  href={source.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.proveItLink}
                >
                  <span>{source.url}</span>
                  <ExternalLinkIcon className={styles.proveItLinkIcon} />
                </a>
              </p>
              {source.notes && (
                <p className={styles.proveItNote}>
                  {renderTextSegments(parseTextWithLinks(source.notes))}
                </p>
              )}
            </div>
          ))}
          <p className={`${styles.proveItText} ${styles.proveItContactDivider}`}>
            <span>Want more proof? Contact </span>
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