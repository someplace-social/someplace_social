"use client";

import Link from 'next/link';
import Image from 'next/image';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div>
        <Link href="/">
          <Image 
            src="/images/logo.svg" 
            alt="Someplace Social Logo" 
            width={300} 
            height={100} 
            priority
            style={{ width: 'auto', height: '50px' }} // Control display size while maintaining quality
          />
        </Link>
      </div>
      <nav className={styles.nav}>
        <Link href="/medellin" className={styles.navLink}>Medellin</Link>
        <Link href="/about" className={styles.navLink}>About</Link>
        <Link href="/contact" className={styles.navLink}>Contact</Link>
        <a href="https://buymeacoffee.com/someplacesocial" target="_blank" rel="noopener noreferrer" className={styles.donateButton}>
          Donate
        </a>
      </nav>
    </header>
  );
}