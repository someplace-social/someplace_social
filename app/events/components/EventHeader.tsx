'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CityConfig } from '../../lib/cities';
import styles from '../EventsView.module.css';

interface EventHeaderProps {
  city: CityConfig;
  allCityOptions: CityConfig[];
}

export default function EventHeader({ city, allCityOptions }: EventHeaderProps) {
  const [citiesMenuOpen, setCitiesMenuOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const citiesMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (citiesMenuRef.current && !citiesMenuRef.current.contains(e.target as Node)) {
        setCitiesMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brandCol}>
            <Link href={`/events/${city.slug}`} className={styles.brandLogoLink}>
              <Image
                src="/images/logo.svg"
                alt="Someplace Social"
                width={360}
                height={100}
                priority
                className={styles.logoImage}
              />
            </Link>
            <div className={styles.brandSubtitle}>{city.heroLocation}</div>
          </div>

          <nav className={styles.navDesktop}>
            <div className={styles.citiesWrapper} ref={citiesMenuRef}>
              <button
                type="button"
                className={styles.citiesBtn}
                aria-expanded={citiesMenuOpen}
                onClick={() => setCitiesMenuOpen(!citiesMenuOpen)}
              >
                Cities
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {citiesMenuOpen && (
                <div className={styles.citiesDropdown}>
                  {allCityOptions.map((c) => {
                    const isActive = c.slug === city.slug;
                    return (
                      <Link
                        key={c.slug}
                        href={`/events/${c.slug}`}
                        className={`${styles.cityOption} ${
                          isActive ? styles.cityOptionActive : ''
                        }`}
                        onClick={() => setCitiesMenuOpen(false)}
                      >
                        {c.name}
                        {isActive && (
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
                            <path d="M5 12.5l4.5 4.5L19 7.5" />
                          </svg>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <Link href="/about" className={styles.navLink}>
              About
            </Link>
            <Link href="/contact" className={styles.navLink}>
              Contact
            </Link>
            <Link href="/contact" className={styles.addEventBtn}>
              + Add event
            </Link>
          </nav>

          <div className={styles.navMobileActions}>
            <Link href="/contact" className={styles.mobileAddBtn}>
              + Add
            </Link>
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

            <div className={styles.drawerSectionTitle}>Choose City</div>
            <div className={styles.drawerCityList}>
              {allCityOptions.map((c) => {
                const isActive = c.slug === city.slug;
                return (
                  <Link
                    key={c.slug}
                    href={`/events/${c.slug}`}
                    className={`${styles.drawerCityItem} ${
                      isActive ? styles.drawerCityItemActive : ''
                    }`}
                    onClick={() => setMobileDrawerOpen(false)}
                  >
                    {c.name}
                    {isActive && <span>✓</span>}
                  </Link>
                );
              })}
            </div>

            <div className={styles.drawerSectionTitle}>Navigation</div>
            <div className={styles.drawerNavLinks}>
              <Link
                href="/about"
                className={styles.drawerNavLink}
                onClick={() => setMobileDrawerOpen(false)}
              >
                About
              </Link>
              <Link
                href="/contact"
                className={styles.drawerNavLink}
                onClick={() => setMobileDrawerOpen(false)}
              >
                Contact
              </Link>
              <Link
                href="/contact"
                className={styles.drawerNavLink}
                onClick={() => setMobileDrawerOpen(false)}
              >
                + Add event
              </Link>
            </div>

            <div className={styles.drawerFooter}>
              <a
                href="https://buymeacoffee.com/someplacesocial"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.drawerSupportBtn}
              >
                Buy me a drink
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}