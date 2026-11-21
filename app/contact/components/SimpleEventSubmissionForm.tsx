'use client';
import { useState } from 'react';
import styles from '../Contact.module.css';

interface SimpleEventSubmissionFormProps {
  cityName?: string;
}

export default function SimpleEventSubmissionForm({
  cityName,
}: SimpleEventSubmissionFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventLink, setEventLink] = useState('');
  const [hp, setHp] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    const messageLines = [
      cityName ? `City Page: ${cityName}` : null,
      `Name: ${name}`,
      `Email Address: ${email}`,
      `Event Name: ${eventName}`,
      `Event Link: ${eventLink}`,
    ].filter((line): line is string => line !== null);

    try {
      const response = await fetch('/api/send-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formType: cityName ? `Submit an Event (${cityName})` : 'Submit an Event',
          message: messageLines.join('\n'),
          hp,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setStatus({
          success: true,
          message:
            'Thank you! Your event submission has been sent. We will review and add it shortly.',
        });
        setName('');
        setEmail('');
        setEventName('');
        setEventLink('');
        setHp('');
      } else {
        setStatus({
          success: false,
          message: result.message || 'Failed to submit event. Please try again.',
        });
      }
    } catch {
      setStatus({
        success: false,
        message: 'A connection error occurred. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      id="panel-submit"
      role="tabpanel"
      aria-labelledby="tab-submit"
      onSubmit={handleSubmit}
    >
      <div className={styles.hpField} aria-hidden="true">
        <label htmlFor="s-contact-ref">Leave this blank</label>
        <input
          id="s-contact-ref"
          name="contact_ref"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={hp}
          onChange={(e) => setHp(e.target.value)}
        />
      </div>
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Submit an Event</legend>
        <p className={styles.sectionDescription}>
          Know of an event not on the list? Tell us. Note: events must already be
          listed somewhere online - we&apos;ll get the details from there.
        </p>
        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="s-name" className={styles.label}>
              Name *
            </label>
            <input
              id="s-name"
              type="text"
              required
              maxLength={120}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="s-email" className={styles.label}>
              Email *
            </label>
            <input
              id="s-email"
              type="email"
              required
              maxLength={160}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. john@doe.com"
              className={styles.input}
            />
          </div>
        </div>
        <div className={styles.field}>
          <label htmlFor="s-event-name" className={styles.label}>
            Name of Event *
          </label>
          <input
            id="s-event-name"
            type="text"
            required
            maxLength={200}
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="e.g. Weekly Board Game Night"
            className={styles.input}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="s-event-link" className={styles.label}>
            Link to Event *
          </label>
          <input
            id="s-event-link"
            type="text"
            required
            maxLength={500}
            value={eventLink}
            onChange={(e) => setEventLink(e.target.value)}
            placeholder="e.g. instagram.com/... or meetup.com/..."
            className={styles.input}
          />
        </div>
      </fieldset>
      <button type="submit" className={styles.submitBtn} disabled={loading}>
        {loading ? 'Submitting event...' : 'Submit Event'}
      </button>
      {status && (
        <div
          className={`${styles.statusAlert} ${
            status.success ? styles.statusSuccess : styles.statusError
          }`}
          role="status"
        >
          {status.message}
        </div>
      )}
    </form>
  );
}