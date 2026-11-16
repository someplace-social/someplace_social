import Link from 'next/link';
import type { CityConfig } from '../lib/cities';
import Header from './Header';
import Footer from './Footer';
import styles from '../Home.module.css';

export type CitySummary = CityConfig & {
  eventCount: number;
};

interface HomeViewProps {
  citySummaries: CitySummary[];
}

const ACTIVITIES = [
  {
    title: 'Language Exchanges',
    description:
      'Practice Spanish, English, and other languages in relaxed café, bar, and park settings.',
  },
  {
    title: 'Dance & Socials',
    description:
      'Beginner salsa and bachata classes, open dancing, and welcoming group practices.',
  },
  {
    title: 'Trivia & Game Nights',
    description:
      'Pub trivia, board game meetups, chess clubs, and casual group challenges.',
  },
  {
    title: 'Live Music & Jams',
    description:
      'Acoustic jams, bluegrass circles, jazz gatherings, and open mic evenings.',
  },
  {
    title: 'Run Clubs & Fitness',
    description:
      'Weekly social 5k runs, morning yoga in the park, and community fitness meetups.',
  },
  {
    title: 'Art, Books & Crafting',
    description:
      'Open-air sketching, reading clubs, maker circles, and community creative sessions.',
  },
] as const;

const WHY_RECURRING = [
  {
    number: '01',
    title: 'On a Predictable Schedule',
    description:
      'Everything happens weekly or monthly at the same time and place. No booking stress or one-off tickets.',
  },
  {
    number: '02',
    title: 'Just Show Up',
    description:
      'Every listing is open to newcomers and solo attendees. Simply drop in whenever it fits your week.',
  },
  {
    number: '03',
    title: '100% Free & No Ads',
    description:
      'No paywalls, sponsors, accounts, or pop-ups. Verified weekly by real community members.',
  },
] as const;

export default function HomeView({ citySummaries }: HomeViewProps) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main className={styles.page} style={{ flex: 1 }}>
        <section className={styles.heroSection}>
          <div className={styles.eyebrow}>
            Free · No ads · Updated every week
          </div>
          <h1 className={styles.heroTitle}>
            Regular things to do, all in one place.
          </h1>
          <p className={styles.heroDescription}>
            Language exchanges, trivia, salsa classes, run clubs, book clubs. Everything here happens on a schedule, so you can just show up.
          </p>
          <div className={styles.heroCtaRow}>
            {citySummaries.map((city) => (
              <Link
                key={city.slug}
                href={`/${city.slug}/events`}
                className={styles.primaryCta}
              >
                Explore {city.name} Events →
              </Link>
            ))}
            <Link href="/about" className={styles.secondaryCta}>
              About Someplace Social
            </Link>
          </div>
          <div className={styles.trustList}>
            <div className={styles.trustItem}>
              <span className={styles.trustIcon} aria-hidden="true">✓</span>
              <span>100% Free &amp; Ad-Free</span>
            </div>
            <div className={styles.trustItem}>
              <span className={styles.trustIcon} aria-hidden="true">✓</span>
              <span>No Accounts or Paywalls</span>
            </div>
            <div className={styles.trustItem}>
              <span className={styles.trustIcon} aria-hidden="true">✓</span>
              <span>Verified Weekly</span>
            </div>
          </div>
        </section>

        <section className={styles.sectionBlock} aria-labelledby="active-cities-heading">
          <div className={styles.sectionHeader}>
            <h2 id="active-cities-heading" className={styles.sectionHeaderTitle}>
              Active Cities
            </h2>
            <div className={styles.sectionHeaderLine} aria-hidden="true" />
          </div>
          <div className={styles.citiesGrid}>
            {citySummaries.map((city) => (
              <article key={city.slug} className={styles.cityCard}>
                <div className={styles.cityCardTop}>
                  <div className={styles.cityBadgeRow}>
                    <span className={styles.cityRegionBadge}>
                      {city.region || city.heroLocation}
                    </span>
                    {city.eventCount > 0 && (
                      <span className={styles.cityCountBadge}>
                        {city.eventCount} recurring {city.eventCount === 1 ? 'activity' : 'activities'}
                      </span>
                    )}
                  </div>
                  <h3 className={styles.cityName}>{city.name}</h3>
                  <p className={styles.cityDescription}>
                    {city.introDescription ||
                      `Regular community events, weekly activities, and recurring meetups in ${city.heroLocation}.`}
                  </p>
                </div>
                <div className={styles.cityLinks}>
                  <Link
                    href={`/${city.slug}/events`}
                    className={styles.cityScheduleBtn}
                  >
                    View Weekly Schedule →
                  </Link>
                  <Link
                    href={`/${city.slug}/events?tab=all`}
                    className={styles.cityDirectoryLink}
                  >
                    Full {city.name} Directory ({city.eventCount})
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.sectionBlock} aria-labelledby="activities-heading">
          <div className={styles.sectionHeader}>
            <h2 id="activities-heading" className={styles.sectionHeaderTitle}>
              Popular Recurring Activities
            </h2>
            <div className={styles.sectionHeaderLine} aria-hidden="true" />
          </div>
          <div className={styles.activitiesGrid}>
            {ACTIVITIES.map((act) => (
              <div key={act.title} className={styles.activityCard}>
                <h3 className={styles.activityTitle}>{act.title}</h3>
                <p className={styles.activityDescription}>{act.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.sectionBlock} aria-labelledby="why-heading">
          <div className={styles.sectionHeader}>
            <h2 id="why-heading" className={styles.sectionHeaderTitle}>
              Why Regular Things to Do?
            </h2>
            <div className={styles.sectionHeaderLine} aria-hidden="true" />
          </div>
          <div className={styles.whyGrid}>
            {WHY_RECURRING.map((item) => (
              <div key={item.number} className={styles.whyItem}>
                <span className={styles.whyNumber}>{item.number}</span>
                <h3 className={styles.whyTitle}>{item.title}</h3>
                <p className={styles.whyDescription}>{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.sectionBlock} aria-labelledby="community-cta-heading">
          <div className={styles.ctaCard}>
            <div className={styles.ctaContent}>
              <h2 id="community-cta-heading" className={styles.ctaTitle}>
                Host or Know About a Recurring Gathering?
              </h2>
              <p className={styles.ctaDescription}>
                We list free and affordable group activities that happen regularly and are open to anyone. Help keep your city connected.
              </p>
            </div>
            <div className={styles.ctaActions}>
              <Link href="/contact?tab=submit" className={styles.primaryCta}>
                Submit an Event
              </Link>
              <Link href="/contact" className={styles.secondaryCta}>
                Suggest a City
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}