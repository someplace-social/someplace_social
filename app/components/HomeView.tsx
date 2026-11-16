import Link from 'next/link';
import Header from './Header';
import Footer from './Footer';
import styles from '../Home.module.css';

const CATEGORIES = [
  'Language exchanges',
  'Trivia',
  'Dance socials',
  'Board games',
  'Run clubs & yoga',
  'Open mics & jams',
  'Book clubs',
  'Arts & crafts',
  'Comedy',
  'Karaoke',
] as const;

export default function HomeView() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main className={styles.page} style={{ flex: 1 }}>
        <section className={styles.hero}>
          <p className={styles.tag}>Free · No ads · Updated every week</p>
          <h1 className={styles.heroTitle}>
            Regular things to do, all in one place.
          </h1>
          <p className={styles.lead}>
            Language exchanges, trivia, salsa classes, run clubs, book clubs. Everything here happens on a schedule, so you can just show up.
          </p>
          <div className={styles.btns}>
            <Link
              href="/medellin-colombia/events"
              className={`${styles.btn} ${styles.btnPrimary}`}
            >
              Medellín
            </Link>
            <Link
              href="/fort-collins-colorado/events"
              className={`${styles.btn} ${styles.btnSecondary}`}
            >
              Fort Collins
            </Link>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="choose-city-heading">
          <h2 className={styles.sectionHeading} id="choose-city-heading">
            Choose a city
          </h2>
          <div className={styles.cities}>
            <Link href="/medellin-colombia/events" className={styles.cityCard}>
              <strong className={styles.cityName}>Medellín</strong>
              <span className={styles.cityDescription}>
                Laureles, Poblado, Envigado and beyond. Language exchanges, free salsa, nomad meetups, run clubs.
              </span>
              <span className={styles.cityLink}>
                See the weekly schedule →
              </span>
            </Link>
            <Link href="/fort-collins-colorado/events" className={styles.cityCard}>
              <strong className={styles.cityName}>Fort Collins</strong>
              <span className={styles.cityDescription}>
                Old Town, Midtown, CSU and Laporte. Brewery trivia, open mics, jam sessions, book clubs.
              </span>
              <span className={styles.cityLink}>
                See the weekly schedule →
              </span>
            </Link>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="what-youll-find-heading">
          <h2 className={styles.sectionHeading} id="what-youll-find-heading">
            What you&apos;ll find
          </h2>
          <div className={styles.cats}>
            {CATEGORIES.map((cat) => (
              <span key={cat} className={styles.catPill}>
                {cat}
              </span>
            ))}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="how-it-works-heading">
          <h2 className={styles.sectionHeading} id="how-it-works-heading">
            How it works
          </h2>
          <div className={styles.how}>
            <div className={styles.howItem}>
              <h3>It repeats</h3>
              <p>Every listing is weekly, bi-weekly or monthly.</p>
            </div>
            <div className={styles.howItem}>
              <h3>It&apos;s in person</h3>
              <p>Cafés, parks, bars, libraries.</p>
            </div>
            <div className={styles.howItem}>
              <h3>It&apos;s free to use</h3>
              <p>No ads, no accounts, no cookies.</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}