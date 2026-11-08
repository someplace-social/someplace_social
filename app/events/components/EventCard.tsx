'use client';
import { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react';
import { Event } from '../../lib/google-sheets';
import {
  formatTimeRange,
  formatRecurrenceText,
  isFreePrice,
  ensureExternalUrl,
  getTagStyle,
  parseContactInfo,
} from '../utils';
import styles from './EventCard.module.css';

interface EventCardProps {
  event: Event;
  isOpen: boolean;
  isNextUp: boolean;
  cityName: string;
  onToggle: () => void;
  onOpenEdit: (ev: Event) => void;
}

function ActionButton({
  href,
  label,
  icon,
}: {
  href?: string;
  label: string;
  icon: React.ReactNode;
}) {
  if (href) {
    return (
      <a
        href={ensureExternalUrl(href)}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.actionBtnOutline}
      >
        {icon}
        {label}
      </a>
    );
  }
  return (
    <div
      className={styles.actionBtnOutline}
      style={{ opacity: 0.45, cursor: 'not-allowed' }}
    >
      {icon}
      {label}
    </div>
  );
}

function ContactButton({ contact }: { contact?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const contactInfo = useMemo(() => parseContactInfo(contact), [contact]);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleCopy = useCallback(async (text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard error
    }
  }, []);

  const contactIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3.5 6.5l8.5 6.5 8.5-6.5" />
    </svg>
  );

  if (contactInfo.type === 'none') {
    return (
      <div
        className={styles.actionBtnOutline}
        style={{ opacity: 0.45, cursor: 'not-allowed' }}
        aria-disabled="true"
      >
        {contactIcon}
        Contact
      </div>
    );
  }

  if (contactInfo.type === 'url') {
    return (
      <a
        href={contactInfo.url}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.actionBtnOutline}
      >
        {contactIcon}
        Contact
      </a>
    );
  }

  return (
    <div className={styles.contactWrapper} ref={popoverRef}>
      <button
        type="button"
        className={`${styles.actionBtnOutline} ${isOpen ? styles.actionBtnOutlineActive : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {contactIcon}
        Contact
      </button>

      {isOpen && (
        <div className={styles.contactPopover} role="dialog" aria-label="Contact options">
          {contactInfo.type === 'email' && (
            <>
              <div className={styles.contactHeader}>
                <span className={styles.contactHeaderLabel}>Email</span>
                <span className={styles.contactHeaderValue} title={contactInfo.email}>
                  {contactInfo.email}
                </span>
              </div>
              <div className={styles.contactDivider} />
              <div className={styles.contactActions}>
                <button
                  type="button"
                  className={`${styles.contactActionBtn} ${copied ? styles.contactActionBtnCopied : ''}`}
                  onClick={() => handleCopy(contactInfo.email)}
                >
                  {copied ? (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                      </svg>
                      Copy Email
                    </>
                  )}
                </button>
                <a
                  href={contactInfo.gmailUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.contactActionLink}
                  onClick={() => setIsOpen(false)}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3 7l9 6 9-6" />
                  </svg>
                  Open in Gmail
                </a>
                <a
                  href={contactInfo.mailtoUrl}
                  className={styles.contactActionLink}
                  onClick={() => setIsOpen(false)}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  Default Mail App
                </a>
              </div>
            </>
          )}

          {contactInfo.type === 'phone' && (
            <>
              <div className={styles.contactHeader}>
                <span className={styles.contactHeaderLabel}>Phone</span>
                <span className={styles.contactHeaderValue} title={contactInfo.displayPhone}>
                  {contactInfo.displayPhone}
                </span>
              </div>
              <div className={styles.contactDivider} />
              <div className={styles.contactActions}>
                <a
                  href={contactInfo.telUrl}
                  className={styles.contactActionLinkPrimary}
                  onClick={() => setIsOpen(false)}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                  </svg>
                  Call {contactInfo.displayPhone}
                </a>
                <button
                  type="button"
                  className={`${styles.contactActionBtn} ${copied ? styles.contactActionBtnCopied : ''}`}
                  onClick={() => handleCopy(contactInfo.displayPhone)}
                >
                  {copied ? (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                      </svg>
                      Copy Number
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function EventCard({
  event,
  isOpen,
  isNextUp,
  cityName,
  onToggle,
  onOpenEdit,
}: EventCardProps) {
  const { start, end } = formatTimeRange(event.startTime, event.endTime);
  const isFree = isFreePrice(event.price);
  const tagList = event.activities || [];
  const displayVenue = event.venue || event.location;
  const recurrenceText = formatRecurrenceText(event.frequency, event.frequencyNotes);

  return (
    <div className={`${styles.eventCard} ${isOpen ? styles.eventCardOpen : ''}`}>
      <button
        type="button"
        className={styles.cardRow}
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        <div className={styles.timeCol}>
          {start}
          {end && <div className={styles.endTimeText}>to {end}</div>}
        </div>
        <div className={styles.infoCol}>
          {isNextUp && <span className={styles.nextUpBadge}>Next up</span>}
          <div className={styles.eventTitle}>
            {event.title}
            {event.organization && event.organization !== displayVenue && (
              <span className={styles.eventHost}> w/ {event.organization}</span>
            )}
          </div>
          <div className={styles.eventLocation}>
            {displayVenue}
            {event.area ? ` · ${event.area}` : ''}
          </div>
          {event.price ? (
            <div className={`${styles.priceLine} ${isFree ? styles.priceFree : styles.pricePaid}`}>
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 12V4h8l10 10-8 8L3 12z" />
                <circle cx="7.5" cy="8.5" r="1" />
              </svg>
              {event.price}
            </div>
          ) : null}
          {tagList.length > 0 && (
            <div className={styles.tagList}>
              {tagList.map((tag) => {
                const customStyle = getTagStyle(tag);
                return (
                  <span
                    key={tag}
                    className={styles.tagChip}
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
        <span
          aria-hidden="true"
          className={`${styles.chevronCircle} ${
            isOpen ? styles.chevronCircleOpen : ''
          }`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={isOpen ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'} />
          </svg>
        </span>
      </button>
      {isOpen && (
        <div className={styles.expandedDrawer}>
          {(event.about || event.notes) && (
            <p className={styles.eventDescription}>{event.about || event.notes}</p>
          )}
          {recurrenceText && (
            <p
              className={styles.eventDescription}
              style={{
                fontWeight: 600,
                color: 'var(--ink)',
                marginBottom: event.preRegistration ? 8 : 14,
              }}
            >
              📅 {recurrenceText}
            </p>
          )}
          {event.preRegistration && (
            <p
              className={styles.eventDescription}
              style={{
                fontWeight: 600,
                color: 'var(--ink)',
                marginBottom: 14,
              }}
            >
              📝 {event.preRegistration}
            </p>
          )}
          <div className={styles.drawerActionRow}>
            <div className={styles.buttonGrid4}>
              <a
                href={
                  event.map
                    ? ensureExternalUrl(event.map)
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${displayVenue}, ${cityName}`
                      )}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className={styles.actionBtnPrimary}
                aria-label="Open in Maps"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
                Maps
              </a>
              <ActionButton
                href={event.website}
                label="Website"
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18" />
                  </svg>
                }
              />
              <ActionButton
                href={event.social}
                label="Instagram"
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.2" cy="6.8" r=".6" />
                  </svg>
                }
              />
              <ContactButton contact={event.contact} />
            </div>
            <button
              type="button"
              className={styles.suggestEditBtn}
              onClick={() => onOpenEdit(event)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 20l1-4L16.5 4.5a2 2 0 013 3L8 19l-4 1z" />
              </svg>
              Suggest edit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(EventCard);