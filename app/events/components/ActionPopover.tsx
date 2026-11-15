'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { copyToClipboard } from '../event-helpers';
import { CheckIcon, CloseIcon, CopyIcon } from './EventIcons';
import styles from './ActionPopover.module.css';

interface ActionPopoverProps {
  triggerLabel: string;
  triggerIcon: React.ReactNode;
  btnClassName: string;
  btnActiveClassName: string;
  wrapperClassName?: string;
  dialogLabel: string;
  headerLabel: string;
  wide?: boolean;
  align?: 'left' | 'right';
  children: (close: () => void) => React.ReactNode;
}

interface PopoverCopyRowProps {
  text: string;
  copyValue?: string;
  copyLabel: string;
  wrap?: boolean;
}

export function PopoverCopyRow({
  text,
  copyValue,
  copyLabel,
  wrap = false,
}: PopoverCopyRowProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const valueToCopy = copyValue ?? text;

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleCopy = useCallback(async () => {
    const ok = await copyToClipboard(valueToCopy);
    if (!ok) return;
    setCopied(true);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => setCopied(false), 2000);
  }, [valueToCopy]);

  return (
    <div className={styles.popoverInlineRow}>
      <span
        className={`${styles.popoverHeaderValue} ${
          wrap ? styles.popoverHeaderValueWrap : ''
        }`}
        title={text}
      >
        {text}
      </span>
      <button
        type="button"
        className={`${styles.copyIconBtn} ${
          copied ? styles.copyIconBtnCopied : ''
        }`}
        onClick={handleCopy}
        title={copied ? 'Copied to clipboard' : copyLabel}
        aria-label={copied ? 'Copied to clipboard' : copyLabel}
      >
        {copied ? <CheckIcon size={15} strokeWidth={2.6} /> : <CopyIcon />}
      </button>
    </div>
  );
}

export default function ActionPopover({
  triggerLabel,
  triggerIcon,
  btnClassName,
  btnActiveClassName,
  wrapperClassName,
  dialogLabel,
  headerLabel,
  wide = false,
  align = 'right',
  children,
}: ActionPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setIsOpen(false);
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

  return (
    <div
      className={`${styles.popoverWrapper} ${wrapperClassName || ''}`}
      ref={popoverRef}
    >
      <button
        type="button"
        className={`${btnClassName} ${isOpen ? btnActiveClassName : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        {triggerIcon}
        {triggerLabel}
      </button>
      {isOpen && (
        <div
          className={`${styles.popover} ${wide ? styles.popoverWide : ''} ${
            align === 'left' ? styles.popoverAlignLeft : ''
          }`}
          role="dialog"
          aria-label={dialogLabel}
        >
          <div className={styles.popoverHeader}>
            <div className={styles.popoverHeaderTop}>
              <span className={styles.popoverHeaderLabel}>{headerLabel}</span>
              <button
                type="button"
                className={styles.popoverCloseBtn}
                onClick={close}
                aria-label={`Close ${headerLabel}`}
              >
                <CloseIcon />
              </button>
            </div>
          </div>
          {children(close)}
        </div>
      )}
    </div>
  );
}