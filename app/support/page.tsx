import Image from 'next/image';
import Link from 'next/link';
import styles from '../Page.module.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Support Us',
  description: 'Learn how you can support Someplace Social and keep the community going.',
};

export default function SupportPage() {
  return (
    <main className={styles.page}>
      <section className={styles.heroSection}>
        <div className={styles.heroText}>
          <h1>Support Someplace Social</h1>
          <p style={{ fontSize: '1.2em', lineHeight: 1.6 }}>
            This website is 100% free, community-driven, and runs without ads or pop-ups. If you find it valuable, here are a few ways you can help keep it going.
          </p>
        </div>
        <div className={styles.illustrationContainer}>
          <Image src="/images/hero-contact.png" alt="Illustration of a capybara drinking a coffee" width={400} height={300} style={{ width: '100%', height: 'auto' }} />
        </div>
      </section>

      <section className={styles.contentBox} style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        <div>
          <h2 style={{ fontSize: '2em', marginBottom: '0.5rem' }}>1. Keep Information Updated</h2>
          <p style={{ fontSize: '1.1em', lineHeight: 1.6, marginBottom: '1rem' }}>
            The absolute best way to support is to help keep our event listings accurate. Submit new activities you find, or let me know if existing event info needs to be updated.
          </p>
          <Link href="/contact" className={styles.button}>Submit or Edit Events</Link>
        </div>

        <div>
          <h2 style={{ fontSize: '2em', marginBottom: '0.5rem' }}>2. Buy Me a Drink</h2>
          <p style={{ fontSize: '1.1em', lineHeight: 1.6, marginBottom: '1rem' }}>
            If you've met cool people or found fun things to do through the site, consider buying me a coffee (or a beer) to help cover the server costs.
          </p>
          <a href="https://buymeacoffee.com/someplacesocial" target="_blank" rel="noopener noreferrer" className={styles.button}>Buy Me a Drink</a>
        </div>

        <div>
          <h2 style={{ fontSize: '2em', marginBottom: '0.5rem' }}>3. Free Month of Starlink</h2>
          <p style={{ fontSize: '1.1em', lineHeight: 1.6, marginBottom: '1rem' }}>
            Need high-speed internet? Use my Starlink referral code. If you sign up using the link, we will both get a free month of service!
          </p>
          <a href="https://sites.google.com/view/starlink-referral-link" target="_blank" rel="noopener noreferrer" className={styles.button}>Get Starlink Referral</a>
        </div>
      </section>
    </main>
  );
}