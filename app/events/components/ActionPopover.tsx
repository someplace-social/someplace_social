'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { CloseIcon } from './EventIcons';
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
  children: (close: () => void) => React.ReactNode;
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
          className={`${styles.popover} ${wide ? styles.popoverWide : ''}`}
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