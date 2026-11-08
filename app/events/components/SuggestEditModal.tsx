'use client';

import { useState, useMemo, useEffect } from 'react';
import { Event } from '../../lib/google-sheets';
import styles from './SuggestEditModal.module.css';

interface SuggestEditModalProps {
  event: Event;
  cityName: string;
  onClose: () => void;
}

interface FormValues {
  title: string;
  organization: string;
  venue: string;
  location: string;
  area: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  frequency: string;
  frequencyNotes: string;
  price: string;
  preRegistration: string;
  map: string;
  website: string;
  social: string;
}

const FIELD_LABELS: Record<keyof FormValues, string> = {
  title: 'Event Title',
  organization: 'Organizer / Host',
  venue: 'Venue',
  location: 'Address / Location',
  area: 'Neighborhood / Area',
  dayOfWeek: 'Day of Week',
  startTime: 'Start Time',
  endTime: 'End Time',
  frequency: 'Frequency',
  frequencyNotes: 'Frequency Notes',
  price: 'Price',
  preRegistration: 'Pre-Registration',
  map: 'Google Maps Link',
  website: 'Website',
  social: 'Social Media / Instagram',
};

export default function SuggestEditModal({
  event,
  cityName,
  onClose,
}: SuggestEditModalProps) {
  const initialValues: FormValues = useMemo(
    () => ({
      title: event.title || '',
      organization: event.organization || '',
      venue: event.venue || event.location || '',
      location: event.location || '',
      area: event.area || '',
      dayOfWeek: event.dayOfWeek || '',
      startTime: event.startTime || '',
      endTime: event.endTime || '',
      frequency: event.frequency || '',
      frequencyNotes: event.frequencyNotes || '',
      price: event.price || '',
      preRegistration: event.preRegistration || '',
      map: event.map || '',
      website: event.website || '',
      social: event.social || '',
    }),
    [event]
  );

  const [values, setValues] = useState<FormValues>(initialValues);
  const [notes, setNotes] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isSubmitting]);

  const handleChange = (key: keyof FormValues, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const changedFields = useMemo(() => {
    const diffs: {
      key: keyof FormValues;
      label: string;
      original: string;
      updated: string;
    }[] = [];

    (Object.keys(initialValues) as (keyof FormValues)[]).forEach((key) => {
      const orig = (initialValues[key] || '').trim();
      const curr = (values[key] || '').trim();
      if (orig !== curr) {
        diffs.push({
          key,
          label: FIELD_LABELS[key],
          original: orig || '(empty)',
          updated: curr || '(cleared)',
        });
      }
    });

    return diffs;
  }, [initialValues, values]);

  const hasChanges = changedFields.length > 0 || notes.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges) return;

    setIsSubmitting(true);
    setStatus(null);

    const messageLines: string[] = [
      `Event: ${event.title}`,
      `City: ${cityName}`,
      `Submitter Email: ${email.trim() || 'Not provided'}`,
      '',
    ];

    if (changedFields.length > 0) {
      messageLines.push(`EDITED FIELDS (${changedFields.length}):`);
      messageLines.push('────────────────────────────────────────');
      changedFields.forEach((diff) => {
        messageLines.push(`• ${diff.label}:`);
        messageLines.push(`    Original: ${diff.original}`);
        messageLines.push(`    Updated:  ${diff.updated}`);
      });
      messageLines.push('────────────────────────────────────────');
    } else {
      messageLines.push('No individual field changes detected.');
    }

    if (notes.trim()) {
      messageLines.push('');
      messageLines.push('Additional Notes / Context:');
      messageLines.push(notes.trim());
    }

    try {
      const response = await fetch('/api/send-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formType: `Edit a Listing (${cityName})`,
          message: messageLines.join('\n'),
        }),
      });

      const res = await response.json();
      if (res.success) {
        setStatus({
          success: true,
          message: 'Thank you! Your suggested edits have been sent for review.',
        });
        setTimeout(onClose, 1800);
      } else {
        setStatus({
          success: false,
          message: 'Failed to send edit. Please try again.',
        });
      }
    } catch {
      setStatus({
        success: false,
        message: 'A connection error occurred. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFieldChanged = (key: keyof FormValues) =>
    (initialValues[key] || '').trim() !== (values[key] || '').trim();

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="suggest-edit-title"
      >
        <div className={styles.modalHeader}>
          <div className={styles.modalTitleGroup}>
            <h2 id="suggest-edit-title" className={styles.modalTitle}>
              Suggest Edit
            </h2>
            <div className={styles.modalSubtitle}>
              {event.title} · {cityName}
            </div>
          </div>
          <button
            type="button"
            className={styles.modalCloseBtn}
            onClick={onClose}
            aria-label="Close modal"
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.modalScrollArea}>
            <div className={styles.infoBanner}>
              Section headers and original details are fixed below. Pre-filled fields are editable — only fields you change will be sent to the administrator.
            </div>

            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>Event Info</span>
                <div className={styles.sectionLine} aria-hidden="true" />
              </div>
              <div className={styles.gridRow}>
                <div className={styles.field}>
                  <div className={styles.fieldHeader}>
                    <label htmlFor="edit-title" className={styles.label}>
                      Event Title
                    </label>
                    {isFieldChanged('title') && <span className={styles.changedBadge}>Edited</span>}
                  </div>
                  <input
                    id="edit-title"
                    type="text"
                    value={values.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className={`${styles.input} ${isFieldChanged('title') ? styles.inputChanged : ''}`}
                  />
                </div>
                <div className={styles.field}>
                  <div className={styles.fieldHeader}>
                    <label htmlFor="edit-org" className={styles.label}>
                      Organizer / Host
                    </label>
                    {isFieldChanged('organization') && <span className={styles.changedBadge}>Edited</span>}
                  </div>
                  <input
                    id="edit-org"
                    type="text"
                    value={values.organization}
                    onChange={(e) => handleChange('organization', e.target.value)}
                    className={`${styles.input} ${isFieldChanged('organization') ? styles.inputChanged : ''}`}
                  />
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>Venue &amp; Location</span>
                <div className={styles.sectionLine} aria-hidden="true" />
              </div>
              <div className={styles.gridRow}>
                <div className={styles.field}>
                  <div className={styles.fieldHeader}>
                    <label htmlFor="edit-venue" className={styles.label}>
                      Venue
                    </label>
                    {isFieldChanged('venue') && <span className={styles.changedBadge}>Edited</span>}
                  </div>
                  <input
                    id="edit-venue"
                    type="text"
                    value={values.venue}
                    onChange={(e) => handleChange('venue', e.target.value)}
                    className={`${styles.input} ${isFieldChanged('venue') ? styles.inputChanged : ''}`}
                  />
                </div>
                <div className={styles.field}>
                  <div className={styles.fieldHeader}>
                    <label htmlFor="edit-area" className={styles.label}>
                      Neighborhood / Area
                    </label>
                    {isFieldChanged('area') && <span className={styles.changedBadge}>Edited</span>}
                  </div>
                  <input
                    id="edit-area"
                    type="text"
                    value={values.area}
                    onChange={(e) => handleChange('area', e.target.value)}
                    className={`${styles.input} ${isFieldChanged('area') ? styles.inputChanged : ''}`}
                  />
                </div>
              </div>
              <div className={styles.field}>
                <div className={styles.fieldHeader}>
                  <label htmlFor="edit-location" className={styles.label}>
                    Address / Full Location
                  </label>
                  {isFieldChanged('location') && <span className={styles.changedBadge}>Edited</span>}
                </div>
                <input
                  id="edit-location"
                  type="text"
                  value={values.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className={`${styles.input} ${isFieldChanged('location') ? styles.inputChanged : ''}`}
                />
              </div>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>Time &amp; Schedule</span>
                <div className={styles.sectionLine} aria-hidden="true" />
              </div>
              <div className={styles.gridRow3}>
                <div className={styles.field}>
                  <div className={styles.fieldHeader}>
                    <label htmlFor="edit-day" className={styles.label}>
                      Day of Week
                    </label>
                    {isFieldChanged('dayOfWeek') && <span className={styles.changedBadge}>Edited</span>}
                  </div>
                  <input
                    id="edit-day"
                    type="text"
                    value={values.dayOfWeek}
                    onChange={(e) => handleChange('dayOfWeek', e.target.value)}
                    className={`${styles.input} ${isFieldChanged('dayOfWeek') ? styles.inputChanged : ''}`}
                  />
                </div>
                <div className={styles.field}>
                  <div className={styles.fieldHeader}>
                    <label htmlFor="edit-start" className={styles.label}>
                      Start Time
                    </label>
                    {isFieldChanged('startTime') && <span className={styles.changedBadge}>Edited</span>}
                  </div>
                  <input
                    id="edit-start"
                    type="text"
                    value={values.startTime}
                    onChange={(e) => handleChange('startTime', e.target.value)}
                    className={`${styles.input} ${isFieldChanged('startTime') ? styles.inputChanged : ''}`}
                  />
                </div>
                <div className={styles.field}>
                  <div className={styles.fieldHeader}>
                    <label htmlFor="edit-end" className={styles.label}>
                      End Time
                    </label>
                    {isFieldChanged('endTime') && <span className={styles.changedBadge}>Edited</span>}
                  </div>
                  <input
                    id="edit-end"
                    type="text"
                    value={values.endTime}
                    onChange={(e) => handleChange('endTime', e.target.value)}
                    className={`${styles.input} ${isFieldChanged('endTime') ? styles.inputChanged : ''}`}
                  />
                </div>
              </div>
              <div className={styles.gridRow}>
                <div className={styles.field}>
                  <div className={styles.fieldHeader}>
                    <label htmlFor="edit-freq" className={styles.label}>
                      Frequency
                    </label>
                    {isFieldChanged('frequency') && <span className={styles.changedBadge}>Edited</span>}
                  </div>
                  <input
                    id="edit-freq"
                    type="text"
                    value={values.frequency}
                    onChange={(e) => handleChange('frequency', e.target.value)}
                    className={`${styles.input} ${isFieldChanged('frequency') ? styles.inputChanged : ''}`}
                  />
                </div>
                <div className={styles.field}>
                  <div className={styles.fieldHeader}>
                    <label htmlFor="edit-freq-notes" className={styles.label}>
                      Frequency Notes
                    </label>
                    {isFieldChanged('frequencyNotes') && <span className={styles.changedBadge}>Edited</span>}
                  </div>
                  <input
                    id="edit-freq-notes"
                    type="text"
                    value={values.frequencyNotes}
                    onChange={(e) => handleChange('frequencyNotes', e.target.value)}
                    placeholder="e.g. Even weeks, May-Sep"
                    className={`${styles.input} ${isFieldChanged('frequencyNotes') ? styles.inputChanged : ''}`}
                  />
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>Price &amp; Registration</span>
                <div className={styles.sectionLine} aria-hidden="true" />
              </div>
              <div className={styles.gridRow}>
                <div className={styles.field}>
                  <div className={styles.fieldHeader}>
                    <label htmlFor="edit-price" className={styles.label}>
                      Price
                    </label>
                    {isFieldChanged('price') && <span className={styles.changedBadge}>Edited</span>}
                  </div>
                  <input
                    id="edit-price"
                    type="text"
                    value={values.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    className={`${styles.input} ${isFieldChanged('price') ? styles.inputChanged : ''}`}
                  />
                </div>
                <div className={styles.field}>
                  <div className={styles.fieldHeader}>
                    <label htmlFor="edit-prereg" className={styles.label}>
                      Pre-Registration / RSVP
                    </label>
                    {isFieldChanged('preRegistration') && <span className={styles.changedBadge}>Edited</span>}
                  </div>
                  <input
                    id="edit-prereg"
                    type="text"
                    value={values.preRegistration}
                    onChange={(e) => handleChange('preRegistration', e.target.value)}
                    className={`${styles.input} ${isFieldChanged('preRegistration') ? styles.inputChanged : ''}`}
                  />
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>Links &amp; Social</span>
                <div className={styles.sectionLine} aria-hidden="true" />
              </div>
              <div className={styles.gridRow}>
                <div className={styles.field}>
                  <div className={styles.fieldHeader}>
                    <label htmlFor="edit-map" className={styles.label}>
                      Google Maps Link
                    </label>
                    {isFieldChanged('map') && <span className={styles.changedBadge}>Edited</span>}
                  </div>
                  <input
                    id="edit-map"
                    type="text"
                    value={values.map}
                    onChange={(e) => handleChange('map', e.target.value)}
                    className={`${styles.input} ${isFieldChanged('map') ? styles.inputChanged : ''}`}
                  />
                </div>
                <div className={styles.field}>
                  <div className={styles.fieldHeader}>
                    <label htmlFor="edit-social" className={styles.label}>
                      Instagram / Social Link
                    </label>
                    {isFieldChanged('social') && <span className={styles.changedBadge}>Edited</span>}
                  </div>
                  <input
                    id="edit-social"
                    type="text"
                    value={values.social}
                    onChange={(e) => handleChange('social', e.target.value)}
                    className={`${styles.input} ${isFieldChanged('social') ? styles.inputChanged : ''}`}
                  />
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>Notes &amp; Submitter Info</span>
                <div className={styles.sectionLine} aria-hidden="true" />
              </div>
              <div className={styles.field}>
                <label htmlFor="edit-notes" className={styles.label}>
                  What changed or needs updating? (optional context)
                </label>
                <textarea
                  id="edit-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Explain reason for changes or provide additional links..."
                  className={styles.textarea}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="edit-email" className={styles.label}>
                  Your Email (optional)
                </label>
                <input
                  id="edit-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className={styles.input}
                />
              </div>
            </div>

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
          </div>

          <div className={styles.modalFooter}>
            <div
              className={`${styles.changeSummary} ${
                changedFields.length > 0 ? styles.changeSummaryActive : ''
              }`}
            >
              {changedFields.length === 0
                ? notes.trim()
                  ? 'Note only'
                  : 'No changes made yet'
                : `${changedFields.length} field${changedFields.length === 1 ? '' : 's'} modified`}
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
                disabled={isSubmitting || !hasChanges}
              >
                {isSubmitting
                  ? 'Sending...'
                  : changedFields.length > 0
                  ? `Send ${changedFields.length} Edit${changedFields.length === 1 ? '' : 's'}`
                  : 'Send Edit'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}