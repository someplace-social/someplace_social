'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Header.module.css';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isMobileMenuOpen]);

  return (
    <>
      {isMobileMenuOpen && (
        <div
          className={styles.backdrop}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      <header className={styles.header}>
        <div className={styles.container}>
          <Link href="/" className={styles.logoLink}>
            <Image
              src="/images/logo.svg"
              alt="Someplace Social Logo"
              width={190}
              height={50}
              priority
              className={styles.logoImage}
            />
          </Link>
          <nav className={styles.nav}>
            <Link href="/events/fort-collins-colorado" className={styles.navLink}>
              Fort Collins
            </Link>
            <Link href="/events/medellin-colombia" className={styles.navLink}>
              Medellín
            </Link>
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
          <div
            className={styles.hamburger}
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Toggle navigation menu"
          >
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </header>
      <nav className={`${styles.mobileNav} ${isMobileMenuOpen ? styles.open : ''}`}>
        <div className={styles.mobileNavHeader}>
          <span className={styles.mobileNavTitle}>Someplace Social</span>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>
        <Link
          href="/events/fort-collins-colorado"
          className={styles.mobileNavLink}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Fort Collins
        </Link>
        <Link
          href="/events/medellin-colombia"
          className={styles.mobileNavLink}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Medellín
        </Link>
        <Link
          href="/about"
          className={styles.mobileNavLink}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          About
        </Link>
        <Link
          href="/contact"
          className={styles.mobileNavLink}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Contact
        </Link>
        <a
          href="https://buymeacoffee.com/someplacesocial"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.mobileSupportBtn}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Buy me a drink
        </a>
      </nav>
    </>
  );
}