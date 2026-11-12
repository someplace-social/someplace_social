'use client';
import { useSyncExternalStore } from 'react';
import styles from './ThemeToggle.module.css';
interface ThemeToggleProps {
  showLabel?: boolean;
}
const emptySubscribe = () => () => {};
function subscribeTheme(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', callback);
  return () => {
    observer.disconnect();
    media.removeEventListener('change', callback);
  };
}
function getThemeSnapshot(): 'light' | 'dark' {
  const current = document.documentElement.getAttribute('data-theme');
  if (current === 'dark') return 'dark';
  if (current === 'light') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
function getThemeServerSnapshot(): 'light' | 'dark' {
  return 'light';
}
export default function ThemeToggle({ showLabel = false }: ThemeToggleProps) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getThemeServerSnapshot
  );
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    try {
      localStorage.setItem('theme', nextTheme);
    } catch {
    }
  };
  const isDark = mounted ? theme === 'dark' : false;
  const sunIcon = (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
  const moonIcon = (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
  if (showLabel) {
    return (
      <button
        type="button"
        className={styles.toggleBtnMobile}
        onClick={toggleTheme}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        <span className={styles.mobileLabelRow}>
          {isDark ? sunIcon : moonIcon}
          <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </span>
        <span className={styles.pillBadge}>{isDark ? 'Dark' : 'Light'}</span>
      </button>
    );
  }
  return (
    <button
      type="button"
      className={styles.toggleBtn}
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? sunIcon : moonIcon}
    </button>
  );
}