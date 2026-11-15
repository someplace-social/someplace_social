'use client';
import { useState, useRef, useEffect, useMemo, useCallback, useSyncExternalStore } from 'react';
import { parseContactInfo } from '../utils';
import { copyToClipboard } from '../event-helpers';
import ActionPopover from './ActionPopover';
import styles from './ActionPopover.module.css';

const emptySubscribe = () => () => {};

interface ContactButtonProps {
  contact?: string;
  btnClassName: string;
  btnActiveClassName: string;
  btnDisabledClassName: string;
}

export default function ContactButton({
  contact,
  btnClassName,
  btnActiveClassName,
  btnDisabledClassName,
}: ContactButtonProps) {
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAndroid = useSyncExternalStore(
    emptySubscribe,
    () => /android/i.test(navigator.userAgent || ''),
    () => false
  );
  const contactInfo = useMemo(() => parseContactInfo(contact), [contact]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const handleCopy = useCallback(async (text: string) => {
    const ok = await copyToClipboard(text);
    if (!ok) return;
    setCopied(true);
    if (copyTimerRef.current) {
      clearTimeout(copyTimerRef.current);
    }
    copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
  }, []);

  const handleOpenGmail = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, close: () => void) => {
      if (contactInfo.type !== 'email') return;
      if (isAndroid) {
        e.preventDefault();
        window.location.href = contactInfo.androidIntentUrl;
      }
      close();
    },
    [contactInfo, isAndroid]
  );

  const mailIcon = (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flex: 'none' }}
      aria-hidden="true"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );

  if (contactInfo.type === 'none') {
    return (
      <div className={`${btnClassName} ${btnDisabledClassName}`} aria-disabled="true">
        {mailIcon}
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
        className={btnClassName}
      >
        {mailIcon}
        Contact
      </a>
    );
  }

  const copyIcon = copied ? (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ) : (
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
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );

  return (
    <ActionPopover
      triggerLabel="Contact"
      triggerIcon={mailIcon}
      btnClassName={btnClassName}
      btnActiveClassName={btnActiveClassName}
      dialogLabel="Contact options"
      headerLabel={contactInfo.type === 'email' ? 'Email' : 'Phone'}
      align="left"
    >
      {(close) => (
        <>
          {contactInfo.type === 'email' && (
            <>
              <div className={styles.popoverInlineRow}>
                <span className={styles.popoverHeaderValue} title={contactInfo.email}>
                  {contactInfo.email}
                </span>
                <button
                  type="button"
                  className={`${styles.copyIconBtn} ${copied ? styles.copyIconBtnCopied : ''}`}
                  onClick={() => handleCopy(contactInfo.email)}
                  title={copied ? 'Copied to clipboard' : 'Copy email'}
                  aria-label={copied ? 'Email copied to clipboard' : 'Copy email to clipboard'}
                >
                  {copyIcon}
                </button>
              </div>
              <div className={styles.popoverDivider} />
              <div className={styles.popoverActions}>
                <a
                  href={isAndroid ? contactInfo.androidIntentUrl : contactInfo.gmailUrl}
                  target={isAndroid ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  className={styles.popoverActionLink}
                  onClick={(e) => handleOpenGmail(e, close)}
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
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3 7l9 6 9-6" />
                  </svg>
                  Open in Gmail
                </a>
                <a
                  href={contactInfo.mailtoUrl}
                  className={styles.popoverActionLink}
                  onClick={close}
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
              <div className={styles.popoverInlineRow}>
                <span className={styles.popoverHeaderValue} title={contactInfo.displayPhone}>
                  {contactInfo.displayPhone}
                </span>
                <button
                  type="button"
                  className={`${styles.copyIconBtn} ${copied ? styles.copyIconBtnCopied : ''}`}
                  onClick={() => handleCopy(contactInfo.displayPhone)}
                  title={copied ? 'Copied to clipboard' : 'Copy phone number'}
                  aria-label={
                    copied ? 'Phone number copied to clipboard' : 'Copy phone number to clipboard'
                  }
                >
                  {copyIcon}
                </button>
              </div>
              <div className={styles.popoverDivider} />
              <div className={styles.popoverActions}>
                <a
                  href={contactInfo.telUrl}
                  className={styles.popoverActionLinkPrimary}
                  onClick={close}
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
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                  </svg>
                  Call {contactInfo.displayPhone}
                </a>
              </div>
            </>
          )}
        </>
      )}
    </ActionPopover>
  );
}