import Link from 'next/link';

// Inline styles for organization
const pageStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '2rem',
  maxWidth: '1000px',
  margin: '0 auto',
};

const heroSectionStyles: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '2rem',
  width: '100%',
  marginBottom: '4rem',
};

const heroTextStyles: React.CSSProperties = {
  flex: 1,
  maxWidth: '500px',
};

const illustrationPlaceholderStyles: React.CSSProperties = {
  flex: 1,
  maxWidth: '400px',
  height: '300px',
  backgroundColor: '#e0e0e0',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const contentBoxStyles: React.CSSProperties = {
  backgroundColor: '#fdf8e1',
  border: '1px solid #eee',
  borderRadius: '8px',
  padding: '2rem',
  width: '100%',
  textAlign: 'center',
};

const buttonStyles: React.CSSProperties = {
  backgroundColor: '#272626',
  color: 'white',
  padding: '10px 20px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  textDecoration: 'none',
  display: 'inline-block',
  marginTop: '1rem',
};

export default function Home() {
  return (
    <main style={pageStyles}>
      <section style={heroSectionStyles}>
        <div style={heroTextStyles}>
          <h1 style={{ fontSize: '3em', marginBottom: '1rem' }}>Someplace Social</h1>
          <p style={{ fontSize: '1.2em', lineHeight: 1.6 }}>Community Listings.</p>
          <p style={{ fontSize: '1.2em', lineHeight: 1.6 }}>Our mission is to promote creative communities and connect likeminded people worldwide. (Formerly TheFlyer.info)</p>
          <Link href="/medellin" style={buttonStyles}>Medellin Weekly Events</Link>
        </div>
        <div style={illustrationPlaceholderStyles}>
          <span>Illustration Placeholder</span>
        </div>
      </section>

      <section style={contentBoxStyles}>
        <h2 style={{ fontSize: '2em', marginBottom: '1rem' }}>Current Projects</h2>
        <Link href="/medellin" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3 style={{ fontSize: '1.5em' }}>Weekly Event & Activity Guides</h3>
        </Link>
        <p>Community supported events, group activities, and weekly classes all in one place. Find traveler friendly language exchanges, free salsa classes, fun parties, and other stuff to do happening near you.</p>
        <p style={{ marginTop: '1rem' }}><strong>More Social Projects & Cities Coming Soon</strong></p>
        <a href="https://buymeacoffee.com/someplacesocial" target="_blank" rel="noopener noreferrer" style={buttonStyles}>
          Donate
        </a>
      </section>
    </main>
  );
}