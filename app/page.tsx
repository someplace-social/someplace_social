import Link from 'next/link';
import Image from 'next/image';
import styles from './Page.module.css';

export default function Home() {
  return (
    <main className={styles.page}>
      <section className={styles.heroSection}>
        <div className={styles.heroText}>
          <h1 style={{ fontSize: '3em', marginBottom: '1rem' }}>Someplace Social</h1>
          <p style={{ fontSize: '1.2em', lineHeight: 1.6 }}>Community Listings.</p>
          <p style={{ fontSize: '1.2em', lineHeight: 1.6 }}>Our mission is to promote creative communities and connect likeminded people worldwide. (Formerly TheFlyer.info)</p>
          <Link href="/medellin" className={styles.button}>Medellin Weekly Events</Link>
        </div>
        <div className={styles.illustrationContainer}>
          <Image src="/images/hero-home.png" alt="Illustration of a capybara with a backpack looking at a signpost" width={400} height={300} style={{ width: '100%', height: 'auto' }} />
        </div>
      </section>

      <section className={`${styles.contentBox}`} style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '2em', marginBottom: '1rem' }}>Current Projects</h2>
        <Link href="/medellin" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3 style={{ fontSize: '1.5em' }}>Weekly Event & Activity Guides</h3>
        </Link>
        <p>Community supported events, group activities, and weekly classes all in one place. Find traveler friendly language exchanges, free salsa classes, fun parties, and other stuff to do happening near you.</p>
        <p style={{ marginTop: '1rem' }}><strong>More Social Projects & Cities Coming Soon</strong></p>
        <a href="https://buymeacoffee.com/someplacesocial" target="_blank" rel="noopener noreferrer" className={styles.button}>
          Donate
        </a>
      </section>
    </main>
  );
}