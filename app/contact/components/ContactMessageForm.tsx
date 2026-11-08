'use client';
import { useState } from 'react';
import styles from '../Contact.module.css';

export default function ContactMessageForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const messageLines = [
      `Name: ${name}`,
      `Email Address: ${email}`,
      `Message:`,
      message,
    ];

    try {
      const response = await fetch('/api/send-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formType: 'Question / Message',
          message: messageLines.join('\n'),
        }),
      });

      const result = await response.json();
      if (result.success) {
        setStatus({
          success: true,
          message: 'Thank you! Your message has been sent. We will get back to you soon.',
        });
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setStatus({
          success: false,
          message: 'Failed to send message. Please try again.',
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
      id="panel-question"
      role="tabpanel"
      aria-labelledby="tab-question"
      onSubmit={handleSubmit}
    >
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Question? Comment? Suggestion?</legend>
        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="q-name" className={styles.label}>
              Name *
            </label>
            <input
              id="q-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="q-email" className={styles.label}>
              Email *
            </label>
            <input
              id="q-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. john@doe.com"
              className={styles.input}
            />
          </div>
        </div>
        <div className={styles.field}>
          <label htmlFor="q-message" className={styles.label}>
            Message *
          </label>
          <textarea
            id="q-message"
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message…"
            className={styles.textarea}
          />
        </div>
      </fieldset>
      <button type="submit" className={styles.submitBtn} disabled={loading}>
        {loading ? 'Sending message...' : 'Send Message'}
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