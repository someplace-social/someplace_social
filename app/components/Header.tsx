import Link from 'next/link';

const headerStyles: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1rem 2rem',
  borderBottom: '1px solid #ddd',
};

const navStyles: React.CSSProperties = {
  display: 'flex',
  gap: '1.5rem',
};

export default function Header() {
  return (
    <header style={headerStyles}>
      <div>
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit', fontWeight: 'bold', fontSize: '1.5rem' }}>
          Someplace Social
        </Link>
      </div>
      <nav style={navStyles}>
        <Link href="/medellin">Weekly Event Guides</Link>
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>
        <button>Donate</button>
      </nav>
    </header>
  );
}