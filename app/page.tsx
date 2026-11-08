import Image from 'next/image';
import Header from './components/Header';
import Footer from './components/Footer';
import styles from './about/About.module.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Someplace Social',
  description: 'Learn about Someplace Social, our mission to build community, and our event listing criteria.',
};

const CRITERIA_ITEMS = [
  {
    number: '1',
    title: 'Regularly Occurring',
    description: 'Must happen weekly, bi-weekly, or monthly.',
  },
  {
    number: '2',
    title: 'Group Event',
    description: 'Must be open to multiple people. No one-on-one sessions.',
  },
  {
    number: '3',
    title: 'Open',
    description: 'Must be inclusive and open to all.',
  },
  {
    number: '4',
    title: 'Affordable',
    description: 'Must be relatively affordable.',
  },
] as const;

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main className={styles.page} style={{ flex: 1 }}>
        <section className={styles.heroSection}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>About Someplace Social</h1>
            <p className={styles.heroDescription}>
              We are inherently social creatures. However, modern life can sometimes lead to isolation. The solution is actually super fun: More clubs, classes, art, and parties.
            </p>
          </div>
          <div className={styles.illustrationContainer}>
            <Image
              src="/images/hero-guides.png"
              alt="Illustration of capybaras sitting around a table"
              width={400}
              height={300}
              priority
              className={styles.heroImage}
            />
          </div>
        </section>
        <section aria-labelledby="criteria-heading">
          <div className={styles.criteriaHeader}>
            <h2 id="criteria-heading" className={styles.criteriaTitle}>
              Event Listings Criteria
            </h2>
            <div className={styles.criteriaLine} aria-hidden="true" />
          </div>
          <div className={styles.criteriaList}>
            {CRITERIA_ITEMS.map((item) => (
              <div key={item.number} className={styles.criteriaCard}>
                <div className={styles.badgeCircle} aria-hidden="true">
                  {item.number}
                </div>
                <div className={styles.criteriaContent}>
                  <h3 className={styles.criteriaCardTitle}>{item.title}</h3>
                  <p className={styles.criteriaCardDescription}>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}