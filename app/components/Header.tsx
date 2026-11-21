'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { CityConfig } from '../lib/cities';
import ThemeToggle from './ThemeToggle';
import styles from './Header.module.css';

interface HeaderProps {
  city?: CityConfig;
}

export default function Header({ city }: HeaderProps) {
  const pathname = usePathname();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  useEffect(() => {
    if (!mobileDrawerOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMobileDrawerOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileDrawerOpen]);

  const eventsHref = city ? `/${city.slug}/events` : '';
  const aboutHref = city ? `/${city.slug}/about` : '/about';
  const contactHref = city ? `/${city.slug}/contact` : '/contact';

  const isEventsActive = Boolean(
    city &&
      pathname &&
      (pathname === `/${city.slug}/events` ||
        pathname.startsWith(`/${city.slug}/events/`))
  );
  const isAboutActive = Boolean(
    pathname &&
      (city ? pathname === `/${city.slug}/about` : pathname === '/about')
  );
  const isContactActive = Boolean(
    pathname &&
      (city ? pathname === `/${city.slug}/contact` : pathname === '/contact')
  );

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brandCol}>
            <Link href="/" className={styles.brandLogoLink}>
              <Image
                src="/images/logo.svg"
                alt="Someplace Social"
                width={540}
                height={150}
                priority
                className={styles.logoImage}
              />
            </Link>
            {city && (
              <div className={styles.brandSubtitle}>{city.heroLocation}</div>
            )}
          </div>
          <nav className={styles.navDesktop} aria-label="Primary">
            {city && (
              <Link
                href={eventsHref}
                className={`${styles.navLink} ${
                  isEventsActive ? styles.navLinkActive : ''
                }`}
              >
                Events
              </Link>
            )}
            <Link
              href={aboutHref}
              className={`${styles.navLink} ${
                isAboutActive ? styles.navLinkActive : ''
              }`}
            >
              About
            </Link>
            <Link
              href={contactHref}
              className={`${styles.navLink} ${
                isContactActive ? styles.navLinkActive : ''
              }`}
            >
              Contact
            </Link>
            <ThemeToggle />
          </nav>
          <div className={styles.navMobileActions}>
            <button
              type="button"
              className={styles.hamburgerBtn}
              aria-label="Open menu"
              onClick={() => setMobileDrawerOpen(true)}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>
      {mobileDrawerOpen && (
        <div
          className={styles.drawerBackdrop}
          onClick={() => setMobileDrawerOpen(false)}
        >
          <div
            className={styles.drawer}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <div className={styles.drawerHeader}>
              <div className={styles.drawerTitle}>Someplace Social</div>
              <button
                type="button"
                className={styles.drawerCloseBtn}
                aria-label="Close menu"
                onClick={() => setMobileDrawerOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className={styles.drawerSectionTitle}>Navigation</div>
            <div className={styles.drawerNavLinks}>
              {city ? (
                <Link
                  href={eventsHref}
                  className={`${styles.drawerNavLink} ${
                    isEventsActive ? styles.drawerNavLinkActive : ''
                  }`}
                  onClick={() => setMobileDrawerOpen(false)}
                >
                  Events
                </Link>
              ) : (
                <Link
                  href="/"
                  className={`${styles.drawerNavLink} ${
                    pathname === '/' ? styles.drawerNavLinkActive : ''
                  }`}
                  onClick={() => setMobileDrawerOpen(false)}
                >
                  Home
                </Link>
              )}
              <Link
                href={aboutHref}
                className={`${styles.drawerNavLink} ${
                  isAboutActive ? styles.drawerNavLinkActive : ''
                }`}
                onClick={() => setMobileDrawerOpen(false)}
              >
                About
              </Link>
              <Link
                href={contactHref}
                className={`${styles.drawerNavLink} ${
                  isContactActive ? styles.drawerNavLinkActive : ''
                }`}
                onClick={() => setMobileDrawerOpen(false)}
              >
                Contact
              </Link>
            </div>
            <div className={styles.drawerSectionTitle}>Preferences</div>
            <div className={styles.drawerNavLinks}>
              <ThemeToggle showLabel />
            </div>
          </div>
        </div>
      )}
    </>
  );
}