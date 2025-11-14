"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Header.module.css';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className={styles.header}>
      <div>
        <Link href="/">
          <Image 
            src="/images/logo.svg" 
            alt="Someplace Social Logo" 
            width={250}
            height={83}
            priority
          />
        </Link>
      </div>

      {/* Desktop Navigation */}
      <nav className={styles.nav}>
        <Link href="/medellin" className={styles.navLink}>Medellin</Link>
        <Link href="/about" className={styles.navLink}>About</Link>
        <Link href="/contact" className={styles.navLink}>Contact</Link>
        <a href="https://buymeacoffee.com/someplacesocial" target="_blank" rel="noopener noreferrer" className={styles.donateButton}>
          Donate
        </a>
      </nav>

      {/* Hamburger Icon */}
      <div className={styles.hamburger} onClick={toggleMobileMenu}>
        <div></div>
        <div></div>
        <div></div>
      </div>

      {/* Mobile Navigation Menu */}
      <nav className={`${styles.mobileNav} ${isMobileMenuOpen ? styles.open : ''}`}>
        <Link href="/medellin" className={styles.navLink} onClick={toggleMobileMenu}>Medellin</Link>
        <Link href="/about" className={styles.navLink} onClick={toggleMobileMenu}>About</Link>
        <Link href="/contact" className={styles.navLink} onClick={toggleMobileMenu}>Contact</Link>
        <a href="https://buymeacoffee.com/someplacesocial" target="_blank" rel="noopener noreferrer" className={styles.donateButton}>
          Donate
        </a>
      </nav>
    </header>
  );
}