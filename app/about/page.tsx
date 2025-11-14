import Image from 'next/image';
import styles from '../Page.module.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Someplace Social, our mission to build community, and the criteria for our event listings.',
};

export default function AboutPage() {
  return (
    <main className={styles.page}>
      <section className={styles.heroSection}>
        <div className={styles.heroText}>
          <h1 style={{ fontSize: '3em', marginBottom: '1rem' }}>About The Guides</h1>
          <p style={{ fontSize: '1.2em', lineHeight: 1.6 }}>
            We are inherently social creatures. However, modern life can sometimes lead to isolation. The solution is actually super fun: More clubs, classes, art, and parties. We can leverage technology to find existing communities, encourage new spaces, and go someplace social.
          </p>
        </div>
        <div className={styles.illustrationContainer}>
          <Image src="/images/hero-guides.png" alt="Illustration of capybaras sitting around a table" width={400} height={300} style={{ width: '100%', height: 'auto' }} />
        </div>
      </section>

      <section className={styles.contentBox}>
        <h2 style={{ fontSize: '2.5em', marginBottom: '1rem' }}>Why Our Listings Are Different</h2>
        <ul>
          <li><strong>More listings</strong> because we don't rely on the organization hosting the events to add. Anyone from the community can submit and spread the word.</li>
          <li><strong>Better organized</strong> events listed in order of date and time rather than by who pays the most.</li>
          <li><strong>Better quality</strong> events because they are vetted by real humans.</li>
        </ul>
        
        <h2 style={{ fontSize: '2.5em', marginTop: '2.5rem', marginBottom: '1rem' }}>Event Listings Criteria</h2>
        <ul>
          <li><strong>Regularly Occurring:</strong> must happen weekly or biweekly.</li>
          <li><strong>Group Event:</strong> must be open to multiple people. No one-on-one sessions.</li>
          <li><strong>Open:</strong> must be inclusive and open to all.</li>
          <li><strong>Affordable:</strong> must be relatively affordable.</li>
        </ul>
      </section>

      <section className={styles.heroSection} style={{ marginTop: '4rem' }}>
        <div className={styles.illustrationContainer}>
          <Image src="/images/hero-about.png" alt="Illustration of a person relaxing in a hammock" width={400} height={300} style={{ width: '100%', height: 'auto' }} />
        </div>
        <div className={styles.heroText}>
          <h2 style={{ fontSize: '2.5em', marginBottom: '1rem' }}>About Someplace Social</h2>
          <p style={{ fontSize: '1.2em', lineHeight: 1.6 }}>
            Someplace Social was born out of frustration that a quick, easy list of weekly activities in Medellin didn't exist. We decided to make a website so we could help other people find their communities.
          </p>
          <div style={{ marginTop: '1rem' }}>
             <a href="https://buymeacoffee.com/someplacesocial" target="_blank" rel="noopener noreferrer" className={styles.button}>
              Donate
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}