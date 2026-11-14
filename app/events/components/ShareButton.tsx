'use client';
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Event } from '../../lib/google-sheets';
import { buildEventSharePayload, copyToClipboard } from '../event-helpers';
import { CheckIcon, ShareIcon } from './EventIcons';
import styles from './ShareButton.module.css';
interface ShareButtonProps {
  event: Event;
  citySlug: string;
  wrapperClassName?: string;
  btnClassName: string;
  btnActiveClassName?: string;
  label?: string;
}
type CopyState = 'invite' | 'link' | null;
export default function ShareButton({
  event,
  citySlug,
  wrapperClassName,
  btnClassName,
  btnActiveClassName,
  label = 'Share',
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedState, setCopiedState] = useState<CopyState>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const sharePayload = useMemo(
    () => buildEventSharePayload(event, citySlug),
    [event, citySlug]
  );
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
        triggerRef.current?.focus();
      }
    }
    document.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);
  const triggerCopyFeedback = useCallback(async (text: string, kind: 'invite' | 'link') => {
    const ok = await copyToClipboard(text);
    if (!ok) return;
    setCopiedState(kind);
    if (copyTimerRef.current) {
      clearTimeout(copyTimerRef.current);
    }
    copyTimerRef.current = setTimeout(() => setCopiedState(null), 2000);
  }, []);
  const handleShareClick = async () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }
    const isMobileLikeDevice =
      typeof window !== 'undefined' &&
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function' &&
      (window.matchMedia('(pointer: coarse)').matches ||
        /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || ''));
    if (isMobileLikeDevice) {
      try {
        await navigator.share({
          title: sharePayload.title,
          text: sharePayload.summaryText,
          url: sharePayload.url,
        });
        return;
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
      }
    }
    setIsOpen(true);
  };
  const copyIcon = (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flex: 'none' }}
      aria-hidden="true"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
  const linkIcon = (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flex: 'none' }}
      aria-hidden="true"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
  const messageIcon = (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flex: 'none' }}
      aria-hidden="true"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
  return (
    <div
      className={wrapperClassName ? `${styles.shareWrapper} ${wrapperClassName}` : styles.shareWrapper}
      ref={popoverRef}
    >
      <button
        ref={triggerRef}
        type="button"
        className={`${btnClassName} ${isOpen && btnActiveClassName ? btnActiveClassName : ''}`}
        onClick={handleShareClick}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={`Share ${event.title}`}
      >
        <ShareIcon />
        {label}
      </button>
      {isOpen && (
        <div className={styles.sharePopover} role="dialog" aria-label="Share event options">
          <div className={styles.shareHeader}>
            <span className={styles.shareHeaderLabel}>Share event</span>
            <span className={styles.shareHeaderTitle} title={event.title}>
              {event.title}
            </span>
          </div>
          <div className={styles.shareDivider} />
          <div className={styles.shareActions}>
            <button
              type="button"
              className={`${styles.shareActionBtnPrimary} ${
                copiedState === 'invite' ? styles.shareActionBtnCopied : ''
              }`}
              onClick={() => triggerCopyFeedback(sharePayload.fullInviteText, 'invite')}
            >
              <span className={styles.shareActionLeft}>
                {copiedState === 'invite' ? <CheckIcon /> : copyIcon}
                <span>
                  {copiedState === 'invite' ? 'Copied' : 'Copy invite & link'}
                </span>
              </span>
              {copiedState === 'invite' && <span aria-hidden="true">✓</span>}
            </button>
            <button
              type="button"
              className={`${styles.shareActionBtn} ${
                copiedState === 'link' ? styles.shareActionBtnCopied : ''
              }`}
              onClick={() => triggerCopyFeedback(sharePayload.url, 'link')}
            >
              <span className={styles.shareActionLeft}>
                {copiedState === 'link' ? <CheckIcon /> : linkIcon}
                <span>{copiedState === 'link' ? 'Copied' : 'Copy link'}</span>
              </span>
              {copiedState === 'link' && <span aria-hidden="true">✓</span>}
            </button>
            <a
              href={sharePayload.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.shareActionBtn}
              onClick={() => setIsOpen(false)}
            >
              <span className={styles.shareActionLeft}>
                {messageIcon}
                <span>WhatsApp</span>
              </span>
            </a>
          </div>
          <span className={styles.srOnly} aria-live="polite">
            {copiedState === 'invite'
              ? 'Event invite and link copied to clipboard.'
              : copiedState === 'link'
              ? 'Event link copied to clipboard.'
              : ''}
          </span>
        </div>
      )}
    </div>
  );
}