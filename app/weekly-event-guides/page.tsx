import Link from 'next/link';
import Image from 'next/image';
import styles from '../Page.module.css';

export default function WeeklyEventGuidesPage() {
  return (
    <main className={styles.page}>
      <section className={styles.heroSection}>
        <div className={styles.heroText}>
          <h1 style={{ fontSize: '3em', marginBottom: '1rem' }}>Weekly Events & Activity Guides</h1>
          <p>Community Supported events, group activities, and weekly classes all in one place. Find traveler friendly language exchanges, free salsa classes, fun parties, and other stuff to do happening near you.</p>
          <p style={{ marginTop: '2rem' }}><strong>Find weekly events in...</strong></p>
          <Link href="/medellin" className={styles.button}>Medellin</Link>
          <p style={{ marginTop: '1rem' }}>(more cities coming soon!)</p>
        </div>
        <div className={styles.illustrationContainer}>
          <Image src="/images/hero-guides.png" alt="Illustration of capybaras sitting around a table" width={400} height={300} style={{ width: '100%', height: 'auto' }} />
        </div>
      </section>

      <section className={styles.contentBox}>
        <h2 style={{ fontSize: '2em', marginBottom: '1rem' }}>About Weekly Event Guides</h2>
        <p><strong>Why Someplace Social listings are different</strong></p>
        <ul>
          <li><strong>More listings</strong> because we don't rely on the organization hosting the events to add. Anyone from the community can submit and spread the word.</li>
          <li><strong>Better organized</strong> events listed in order of date and time rather than by who pays the most.</li>
          <li><strong>Better quality</strong> events because they are vetted by real humans.</li>
        </ul>
        <p style={{ marginTop: '2rem' }}><strong>Weekly event listings criteria</strong></p>
        <ul>
          <li><strong>Regularly Occurring:</strong> must happen weekly or biweekly.</li>
          <li><strong>Group Event:</strong> must be open to multiple people. No one-on-one sessions.</li>
          <li><strong>Open:</strong> must be inclusive and open to all.</li>
          <li><strong>Affordable:</strong> must be relatively affordable.</li>
        </ul>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <a href="https://buymeacoffee.com/someplacesocial" target="_blank" rel="noopener noreferrer" className={styles.button}>
            Donate
          </a>
        </div>
      </section>
    </main>
  );
}