"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Header.module.css';

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

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
          ref={dropdownRef}
        >
          <span onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            Weekly Event Guides
          </span>
          {isDropdownOpen && (
            <div className={styles.dropdownMenu}>
              <Link href="/medellin" className={styles.dropdownLink}>
                Medellin
              </Link>
            </div>
          )}
        </div>
        <Link href="/about" className={styles.navLink}>About</Link>
        <Link href="/contact" className={styles.navLink}>Contact</Link>
        <a href="https://buymeacoffee.com/someplacesocial" target="_blank" rel="noopener noreferrer" className={styles.donateButton}>
          Donate
        </a>
      </nav>
    </header>
  );
}