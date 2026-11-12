'use client';
import { useState, useRef, useEffect, useMemo, useCallback, useSyncExternalStore } from 'react';
import { parseContactInfo } from '../utils';
import styles from './ContactButton.module.css';
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
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAndroid = useSyncExternalStore(
    emptySubscribe,
    () => /android/i.test(navigator.userAgent || ''),
    () => false
  );
  const popoverRef = useRef<HTMLDivElement>(null);
  const contactInfo = useMemo(() => parseContactInfo(contact), [contact]);
  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
    };
  }, []);
  useEffect(() => {
    if (!isOpen) return;
    function handlePointerDown(e: PointerEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    document.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
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
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
    }
  }, []);
  const handleOpenGmail = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (contactInfo.type !== 'email') return;
      if (isAndroid) {
        e.preventDefault();
        window.location.href = contactInfo.androidIntentUrl;
        setIsOpen(false);
      } else {
        setIsOpen(false);
      }
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
  return (
    <div className={styles.contactWrapper} ref={popoverRef}>
      <button
        type="button"
        className={`${btnClassName} ${isOpen ? btnActiveClassName : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {mailIcon}
        Contact
      </button>
      {isOpen && (
        <div className={styles.contactPopover} role="dialog" aria-label="Contact options">
          {contactInfo.type === 'email' && (
            <>
              <div className={styles.contactHeader}>
                <span className={styles.contactHeaderLabel}>Email</span>
                <div className={styles.contactInlineRow}>
                  <span className={styles.contactHeaderValue} title={contactInfo.email}>
                    {contactInfo.email}
                  </span>
                  <button
                    type="button"
                    className={`${styles.copyIconBtn} ${copied ? styles.copyIconBtnCopied : ''}`}
                    onClick={() => handleCopy(contactInfo.email)}
                    title={copied ? 'Copied to clipboard' : 'Copy email'}
                    aria-label={copied ? 'Email copied to clipboard' : 'Copy email to clipboard'}
                  >
                    {copied ? (
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
                    )}
                  </button>
                </div>
              </div>
              <div className={styles.contactDivider} />
              <div className={styles.contactActions}>
                <a
                  href={isAndroid ? contactInfo.androidIntentUrl : contactInfo.gmailUrl}
                  target={isAndroid ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  className={styles.contactActionLink}
                  onClick={handleOpenGmail}
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
                  className={styles.contactActionLink}
                  onClick={() => setIsOpen(false)}
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
              <div className={styles.contactHeader}>
                <span className={styles.contactHeaderLabel}>Phone</span>
                <div className={styles.contactInlineRow}>
                  <span className={styles.contactHeaderValue} title={contactInfo.displayPhone}>
                    {contactInfo.displayPhone}
                  </span>
                  <button
                    type="button"
                    className={`${styles.copyIconBtn} ${copied ? styles.copyIconBtnCopied : ''}`}
                    onClick={() => handleCopy(contactInfo.displayPhone)}
                    title={copied ? 'Copied to clipboard' : 'Copy phone number'}
                    aria-label={copied ? 'Phone number copied to clipboard' : 'Copy phone number to clipboard'}
                  >
                    {copied ? (
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
                    )}
                  </button>
                </div>
              </div>
              <div className={styles.contactDivider} />
              <div className={styles.contactActions}>
                <a
                  href={contactInfo.telUrl}
                  className={styles.contactActionLinkPrimary}
                  onClick={() => setIsOpen(false)}
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
        </div>
      )}
    </div>
  );
}