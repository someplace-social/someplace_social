import Image from 'next/image';
import Link from 'next/link';
import Header from './components/Header';
import Footer from './components/Footer';
import styles from './about/About.module.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Community Events, Social Clubs & Weekly Activities',
  description:
    'Find weekly community events, social clubs, classes, and meetups in Medellín, Fort Collins, and beyond. Free and accessible to everyone.',
};

const CRITERIA_ITEMS = [
  {
    number: '01',
    title: 'Regularly Occurring',
    description: 'Must happen weekly, bi-weekly, or monthly on a predictable schedule.',
  },
  {
    number: '02',
    title: 'Group Event',
    description: 'Must be open to multiple people. No private or one-on-one sessions.',
  },
  {
    number: '03',
    title: 'Open & Inclusive',
    description: 'Must be welcoming and open to anyone who wishes to attend.',
  },
  {
    number: '04',
    title: 'Affordable',
    description: 'Must be free, donation-based, or reasonably priced for the community.',
  },
  {
    number: '05',
    title: 'In-Person Only',
    description: 'Must take place at a physical venue. No virtual, online, or webinar gatherings.',
  },
] as const;

const HOW_IT_WORKS_STEPS = [
  {
    title: 'Weekly Updates',
    description: 'Listings are reviewed, verified, and updated once per week so schedules stay reliable.',
  },
  {
    title: 'Community Sourced',
    description: 'Anyone can submit new recurring gatherings or suggest edits to keep details accurate.',
  },
  {
    title: '100% Free & Ad-Free',
    description: 'No accounts required, no sponsors, no tracking, and no paywalls — just pure community info.',
  },
] as const;

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main className={styles.page} style={{ flex: 1 }}>
        <section className={styles.heroSection}>
          <div className={styles.heroText}>
            <p className={styles.eyebrow}>ABOUT</p>
            <h1 className={styles.heroTitle}>About Someplace Social</h1>
            <p className={styles.heroDescription}>
              We are social creatures. However, modern life can sometimes lead to isolation. The solution is actually quite fun: More clubs, classes, art, and parties.
            </p>
            <div className={styles.heroCityLinks}>
              <Link href="/events/medellin-colombia" className={styles.cityPill}>
                Medellín Events →
              </Link>
              <Link href="/events/fort-collins-colorado" className={styles.cityPill}>
                Fort Collins Events →
              </Link>
            </div>
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

        <section className={styles.sectionBlock} aria-labelledby="how-it-works-heading">
          <div className={styles.sectionHeader}>
            <h2 id="how-it-works-heading" className={styles.sectionHeaderTitle}>
              How It Works
            </h2>
            <div className={styles.sectionHeaderLine} aria-hidden="true" />
          </div>
          <div className={styles.howItWorksGrid}>
            {HOW_IT_WORKS_STEPS.map((step) => (
              <div key={step.title} className={styles.howItWorksItem}>
                <h3 className={styles.howItWorksTitle}>{step.title}</h3>
                <p className={styles.howItWorksDescription}>{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.sectionBlock} aria-labelledby="criteria-heading">
          <div className={styles.sectionHeader}>
            <h2 id="criteria-heading" className={styles.sectionHeaderTitle}>
              Event Listings Criteria
            </h2>
            <div className={styles.sectionHeaderLine} aria-hidden="true" />
          </div>
          <ol className={styles.criteriaList}>
            {CRITERIA_ITEMS.map((item) => (
              <li key={item.number} className={styles.criteriaListItem}>
                <span className={styles.criteriaListNumber} aria-hidden="true">
                  {item.number}
                </span>
                <div className={styles.criteriaListContent}>
                  <h3 className={styles.criteriaListTitle}>{item.title}</h3>
                  <p className={styles.criteriaListDescription}>{item.description}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className={styles.criteriaFootnote}>
            Note: All listings are for in-person gatherings only. We do not accept virtual, online, or hybrid-only meetings.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}