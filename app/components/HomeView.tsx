import Link from 'next/link';
import Header from './Header';
import Footer from './Footer';
import styles from '../Home.module.css';

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
            Trivia, dance lessons, board games, language practice, open mics, book clubs, arts &amp; crafts, comedy, and karaoke. Everything here happens on a schedule, so you can just show up.
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
      </main>
      <Footer />
    </div>
  );
}