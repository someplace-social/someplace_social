'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import ContactMessageForm from './components/ContactMessageForm';
import EventSubmissionForm from './components/EventSubmissionForm';
import styles from './Contact.module.css';

export default function ContactView() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'question' | 'submit'>(() => {
    return tabParam === 'submit' || tabParam === 'event' ? 'submit' : 'question';
  });

  useEffect(() => {
    if (tabParam === 'submit' || tabParam === 'event') {
      setActiveTab('submit');
    } else {
      setActiveTab('question');
    }
  }, [tabParam]);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <p className={styles.eyebrow}>CONTACT</p>
          <h1 className={styles.heroTitle}>Contact Us</h1>
          <p className={styles.heroDescription}>
            Have an event to share, or a question, comment, or suggestion? Use the forms below and we&apos;ll get back to you.
          </p>
          <div className={styles.pillGroup} role="tablist" aria-label="Contact options">
            <button
              type="button"
              role="tab"
              id="tab-question"
              aria-selected={activeTab === 'question'}
              aria-controls="panel-question"
              className={`${styles.pillBtn} ${activeTab === 'question' ? styles.pillBtnActive : ''}`}
              onClick={() => {
                setActiveTab('question');
                window.history.replaceState(null, '', '/contact');
              }}
            >
              Send a Message
            </button>
            <button
              type="button"
              role="tab"
              id="tab-submit"
              aria-selected={activeTab === 'submit'}
              aria-controls="panel-submit"
              className={`${styles.pillBtn} ${activeTab === 'submit' ? styles.pillBtnActive : ''}`}
              onClick={() => {
                setActiveTab('submit');
                window.history.replaceState(null, '', '/contact?tab=submit');
              }}
            >
              Submit an Event
            </button>
          </div>
        </div>
        <div className={styles.heroImageContainer}>
          <Image
            src="/images/hero-contact.png"
            alt="Illustration of a capybara drinking coffee"
            width={340}
            height={260}
            priority
            className={styles.heroImage}
          />
        </div>
      </section>

      <section className={styles.panel}>
        {activeTab === 'question' ? (
          <ContactMessageForm />
        ) : (
          <EventSubmissionForm />
        )}
      </section>
    </main>
  );
}