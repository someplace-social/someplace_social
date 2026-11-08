'use client';

import { useState } from 'react';
import { Event } from '../../lib/google-sheets';
import styles from './SuggestEditModal.module.css';

interface SuggestEditModalProps {
  event: Event;
  cityName: string;
  onClose: () => void;
}

export default function SuggestEditModal({
  event,
  cityName,
  onClose,
}: SuggestEditModalProps) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(
    `City: ${cityName}\nEvent: ${event.title}\nVenue: ${event.venue || event.location}\nTime: ${event.startTime} - ${event.endTime}\nFrequency: ${event.frequency || 'Weekly'}${event.frequencyNotes ? ` (${event.frequencyNotes})` : ''}\nLocation: ${event.location} (${event.area})${event.preRegistration ? `\nPre-Registration: ${event.preRegistration}` : ''}\n\nRequested changes: `
  );
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('Submitting update...');
    try {
      const fullMessage = `Sender Email: ${email || 'Not provided'}\n\n${message}`;
      const response = await fetch('/api/send-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formType: `Edit a Listing (${cityName})`,
          message: fullMessage,
        }),
      });
      const res = await response.json();
      if (res.success) {
        setStatus('Thanks! Your edit suggestion has been sent.');
        setTimeout(onClose, 1800);
      } else {
        setStatus('Failed to send. Please try again.');
      }
    } catch {
      setStatus('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>Suggest Edit</h2>
            <small className={styles.modalSubtitle}>{event.title}</small>
          </div>
          <button
            type="button"
            className={styles.modalCloseBtn}
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.modalField}>
            <label htmlFor="editEmail">Your Email (optional)</label>
            <input
              id="editEmail"
              type="email"
              className={styles.modalInput}
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className={styles.modalField}>
            <label htmlFor="editMessage">What needs to be changed? *</label>
            <textarea
              id="editMessage"
              required
              className={styles.modalTextarea}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.modalCancelBtn}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.modalSubmitBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Edit'}
            </button>
          </div>
          {status && <p className={styles.statusMsg}>{status}</p>}
        </form>
      </div>
    </div>
  );
}