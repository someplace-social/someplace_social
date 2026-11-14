'use client';
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Event } from '../../lib/google-sheets';
import { buildEventInviteText, copyToClipboard } from '../event-helpers';
import { CheckIcon, ShareIcon } from './EventIcons';
import styles from './ShareButton.module.css';
interface ShareButtonProps {
  event: Event;
  citySlug: string;
  btnClassName: string;
}
export default function ShareButton({
  event,
  citySlug,
  btnClassName,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inviteText = useMemo(
    () => buildEventInviteText(event, citySlug),
    [event, citySlug]
  );
  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
    };
  }, []);
  const handleCopyInvite = useCallback(async () => {
    const ok = await copyToClipboard(inviteText);
    if (!ok) return;
    setCopied(true);
    if (copyTimerRef.current) {
      clearTimeout(copyTimerRef.current);
    }
    copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
  }, [inviteText]);
  return (
    <>
      <button
        type="button"
        className={`${btnClassName} ${copied ? styles.copied : ''}`}
        onClick={handleCopyInvite}
        title={copied ? 'Copied invite and link' : 'Copy invite and link'}
        aria-label={
          copied
            ? `Copied invite and link for ${event.title}`
            : `Share ${event.title}`
        }
      >
        {copied ? <CheckIcon /> : <ShareIcon />}
        {copied ? 'Copied!' : 'Share'}
      </button>
      <span className={styles.srOnly} role="status" aria-live="polite">
        {copied ? 'Event invite and link copied to clipboard.' : ''}
      </span>
    </>
  );
}