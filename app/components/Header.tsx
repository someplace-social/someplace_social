"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Header.module.css';

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div>
        <Link href="/">
          <Image 
            src="/images/logo.svg" 
            alt="Someplace Social Logo" 
            width={150} 
            height={50} 
            priority
          />
        </Link>
      </div>
      <nav className={styles.nav}>
        <div 
          className={styles.navItem}
          onMouseEnter={() => setIsDropdownOpen(true)}
          onMouseLeave={() => setIsDropdownOpen(false)}
        >
          <span>Weekly Event Guides</span>
          {isDropdownOpen && (
            <div className={styles.dropdownMenu}>
              <Link href="/medellin" className={styles.dropdownLink}>
                Medellin
              </Link>
            </div>
          )}
        </div>
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>
        <a href="https://buymeacoffee.com/someplacesocial" target="_blank" rel="noopener noreferrer" className={styles.donateButton}>
          Donate
        </a>
      </nav>
    </header>
  );
}