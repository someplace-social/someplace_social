"use client";

import { useState } from 'react';
import Link from 'next/link';

const headerStyles: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1rem 2rem',
  borderBottom: '1px solid #ddd',
  position: 'relative',
};

const navStyles: React.CSSProperties = {
  display: 'flex',
  gap: '1.5rem',
  alignItems: 'center',
};

const navItemStyles: React.CSSProperties = {
  position: 'relative',
};

const dropdownMenuStyles: React.CSSProperties = {
  position: 'absolute',
  top: '100%',
  left: 0,
  backgroundColor: 'white',
  border: '1px solid #ddd',
  borderRadius: '4px',
  padding: '0.5rem',
  marginTop: '0.5rem',
  zIndex: 10,
};

const buttonStyles: React.CSSProperties = {
  backgroundColor: '#272626',
  color: 'white',
  padding: '8px 16px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  textDecoration: 'none',
  fontSize: '1rem',
};

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header style={headerStyles}>
      <div>
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit', fontWeight: 'bold', fontSize: '1.5rem' }}>
          Someplace Social
        </Link>
      </div>
      <nav style={navStyles}>
        <div 
          style={navItemStyles}
          onMouseEnter={() => setIsDropdownOpen(true)}
          onMouseLeave={() => setIsDropdownOpen(false)}
        >
          <span style={{ cursor: 'pointer' }}>Weekly Event Guides</span>
          {isDropdownOpen && (
            <div style={dropdownMenuStyles}>
              <Link href="/medellin" style={{ display: 'block', whiteSpace: 'nowrap' }}>
                Medellin
              </Link>
            </div>
          )}
        </div>
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>
        <a href="https://buymeacoffee.com/someplacesocial" target="_blank" rel="noopener noreferrer" style={buttonStyles}>
          Donate
        </a>
      </nav>
    </header>
  );
}