import Link from 'next/link';
import Image from 'next/image';
import styles from './Page.module.css';

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Someplace Social",
  "url": "https://www.someplacesocial.org",
  "logo": "https://www.someplacesocial.org/images/logo.svg",
  "description": "Community supported events, group activities, and weekly classes all in one place.",
  "sameAs": [
    "https://www.instagram.com/someplace.social/"
  ]
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className={styles.page}>
        <section className={styles.heroSection}>
          <div className={styles.heroText}>
            <h1>Someplace Social</h1>
            <p style={{ fontSize: '1.2em', lineHeight: 1.6 }}>
              <strong>Medellin Community Listings</strong>
            </p>
            <p style={{ fontSize: '1.2em', lineHeight: 1.6 }}>
              Community supported events, group activities, and weekly classes all in one place. Find traveler friendly language exchanges, free salsa classes, fun parties, and other stuff to do in Medellin.
            </p>
            <Link href="/medellin" className={styles.button}>Medellin Weekly Events</Link>
          </div>
          <div className={styles.illustrationContainer}>
            <Image src="/images/hero-home.png" alt="Illustration of a capybara with a backpack looking at a signpost" width={400} height={300} style={{ width: '100%', height: 'auto' }} />
          </div>
        </section>
      </main>
    </>
  );
}