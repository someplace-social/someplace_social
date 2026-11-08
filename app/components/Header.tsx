'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { CityConfig, getAllCities } from '../lib/cities';
import styles from './Header.module.css';

interface HeaderProps {
  city?: CityConfig;
  allCityOptions?: CityConfig[];
}

export default function Header({
  city,
  allCityOptions,
}: HeaderProps) {
  const pathname = usePathname();
  const [citiesMenuOpen, setCitiesMenuOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const citiesMenuRef = useRef<HTMLDivElement>(null);
  const citiesList = useMemo(() => {
    const list = allCityOptions || getAllCities();
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [allCityOptions]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (citiesMenuRef.current && !citiesMenuRef.current.contains(e.target as Node)) {
        setCitiesMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (mobileDrawerOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mobileDrawerOpen]);

  const isAboutActive = pathname === '/' || pathname === '/about';
  const isContactActive = pathname === '/contact';
  const isCityActive = Boolean(city);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brandCol}>
            <Link
              href={city ? `/events/${city.slug}` : '/'}
              className={styles.brandLogoLink}
            >
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
              <div className={styles.brandSubtitle}>
                {city.heroLocation}
              </div>
            )}
          </div>
          <nav className={styles.navDesktop}>
            <div className={styles.citiesWrapper} ref={citiesMenuRef}>
              <button
                type="button"
                className={`${styles.citiesBtn} ${isCityActive ? styles.citiesBtnActive : ''}`}
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
              <div
                className={`${styles.citiesDropdown} ${
                  citiesMenuOpen ? '' : styles.citiesDropdownHidden
                }`}
              >
                {citiesList.map((c) => {
                  const isActive = city?.slug === c.slug;
                  return (
                    <Link
                      key={c.slug}
                      href={`/events/${c.slug}`}
                      className={`${styles.cityOption} ${
                        isActive ? styles.cityOptionActive : ''
                      }`}
                      onClick={() => setCitiesMenuOpen(false)}
                    >
                      <span className={styles.cityName}>{c.name}</span>
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
            </div>
            <Link
              href="/"
              className={`${styles.navLink} ${isAboutActive ? styles.navLinkActive : ''}`}
            >
              About
            </Link>
            <Link
              href="/contact"
              className={`${styles.navLink} ${isContactActive ? styles.navLinkActive : ''}`}
            >
              Contact
            </Link>
            <Link href="/contact?tab=submit" className={styles.addEventBtn}>
              +Add Event
            </Link>
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
              {citiesList.map((c) => {
                const isActive = city?.slug === c.slug;
                return (
                  <Link
                    key={c.slug}
                    href={`/events/${c.slug}`}
                    className={`${styles.drawerCityItem} ${
                      isActive ? styles.drawerCityItemActive : ''
                    }`}
                    onClick={() => setMobileDrawerOpen(false)}
                  >
                    <span>{c.name}</span>
                    {isActive && <span>✓</span>}
                  </Link>
                );
              })}
            </div>
            <div className={styles.drawerSectionTitle}>Navigation</div>
            <div className={styles.drawerNavLinks}>
              <Link
                href="/"
                className={`${styles.drawerNavLink} ${
                  isAboutActive ? styles.drawerNavLinkActive : ''
                }`}
                onClick={() => setMobileDrawerOpen(false)}
              >
                About
              </Link>
              <Link
                href="/contact"
                className={`${styles.drawerNavLink} ${
                  isContactActive ? styles.drawerNavLinkActive : ''
                }`}
                onClick={() => setMobileDrawerOpen(false)}
              >
                Contact
              </Link>
            </div>
            <div className={styles.drawerFooter}>
              <Link
                href="/contact?tab=submit"
                className={styles.drawerAddEventBtn}
                onClick={() => setMobileDrawerOpen(false)}
              >
                +Add Event
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}