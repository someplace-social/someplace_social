// app/components/Header.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Header.module.css';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Backdrop overlay */}
      {isMobileMenuOpen && <div className={styles.backdrop} onClick={() => setIsMobileMenuOpen(false)} />}

      <header className={styles.header}>
        <div className={styles.container}>
          <Link href="/">
            <Image 
              src="/images/logo.svg" 
              alt="Someplace Social Logo" 
              width={250}
              height={83}
              priority
              className={styles.logoImage}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className={styles.nav}>
            <Link href="/medellin" className={styles.navLink}>Medellin</Link>
            <Link href="/about" className={styles.navLink}>About</Link>
            <Link href="/contact" className={styles.navLink}>Contact</Link>
            <Link href="/support" className={styles.supportButton}>
              Support
            </Link>
          </nav>

          {/* Hamburger Icon */}
          <div className={styles.hamburger} onClick={() => setIsMobileMenuOpen(true)}>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <nav className={`${styles.mobileNav} ${isMobileMenuOpen ? styles.open : ''}`}>
        <Link href="/medellin" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>Medellin</Link>
        <Link href="/about" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>About</Link>
        <Link href="/contact" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
        <Link href="/support" className={styles.supportButton} onClick={() => setIsMobileMenuOpen(false)}>
          Support
        </Link>
      </nav>
    </>
  );
}