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
  organizerUrl: string;
  venue: string;
  venueUrl: string;
  location: string;
  area: string;
  map: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  frequency: string;
  frequencyNotes: string;
  price: string;
  preRegistration: string;
  registrationUrl: string;
}

const FIELD_LABELS: Record<keyof FormValues, string> = {
  title: 'Event Title',
  organization: 'Organizer / Host',
  organizerUrl: 'Organizer URL',
  venue: 'Venue',
  venueUrl: 'Venue URL',
  location: 'Address / Location',
  area: 'Neighborhood / Area',
  map: 'Google Maps Link',
  dayOfWeek: 'Day of Week',
  startTime: 'Start Time',
  endTime: 'End Time',
  frequency: 'Frequency',
  frequencyNotes: 'Frequency Notes',
  price: 'Price',
  preRegistration: 'Pre-Registration',
  registrationUrl: 'Registration URL',
};

function EditField({
  id,
  label,
  value,
  changed,
  placeholder,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  changed: boolean;
  placeholder?: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className={styles.field}>
      <div className={styles.fieldHeader}>
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
        {changed && <span className={styles.changedBadge}>Edited</span>}
      </div>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${styles.input} ${changed ? styles.inputChanged : ''}`}
      />
    </div>
  );
}

export default function SuggestEditModal({
  event,
  cityName,
  onClose,
}: SuggestEditModalProps) {
  const initialValues: FormValues = useMemo(
    () => ({
      title: event.title || '',
      organization: event.organization || '',
      organizerUrl: event.organizerUrl || '',
      venue: event.venue || '',
      venueUrl: event.venueUrl || '',
      location: event.location || '',
      area: event.area || '',
      map: event.map || '',
      dayOfWeek: event.dayOfWeek || '',
      startTime: event.startTime || '',
      endTime: event.endTime || '',
      frequency: event.frequency || '',
      frequencyNotes: event.frequencyNotes || '',
      price: event.price || '',
      preRegistration: event.preRegistration || '',
      registrationUrl: event.registrationUrl || '',
    }),
    [event]
  );
  const [values, setValues] = useState<FormValues>(initialValues);
  const [notes, setNotes] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
      window.removeEventListener('keydown', handleKeyDown);
    };
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
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>Event Info</span>
                <div className={styles.sectionLine} aria-hidden="true" />
              </div>
              <EditField
                id="edit-title"
                label="Event Title"
                value={values.title}
                changed={isFieldChanged('title')}
                onChange={(v) => handleChange('title', v)}
              />
              <div className={styles.gridRow}>
                <EditField
                  id="edit-org"
                  label="Organizer / Host"
                  value={values.organization}
                  changed={isFieldChanged('organization')}
                  onChange={(v) => handleChange('organization', v)}
                />
                <EditField
                  id="edit-org-url"
                  label="Organizer URL"
                  value={values.organizerUrl}
                  changed={isFieldChanged('organizerUrl')}
                  placeholder="Website or social profile"
                  onChange={(v) => handleChange('organizerUrl', v)}
                />
              </div>
            </div>
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>Venue &amp; Location</span>
                <div className={styles.sectionLine} aria-hidden="true" />
              </div>
              <div className={styles.gridRow}>
                <EditField
                  id="edit-venue"
                  label="Venue"
                  value={values.venue}
                  changed={isFieldChanged('venue')}
                  onChange={(v) => handleChange('venue', v)}
                />
                <EditField
                  id="edit-venue-url"
                  label="Venue URL"
                  value={values.venueUrl}
                  changed={isFieldChanged('venueUrl')}
                  placeholder="Website or social profile"
                  onChange={(v) => handleChange('venueUrl', v)}
                />
              </div>
              <div className={styles.gridRow}>
                <EditField
                  id="edit-area"
                  label="Neighborhood / Area"
                  value={values.area}
                  changed={isFieldChanged('area')}
                  onChange={(v) => handleChange('area', v)}
                />
                <EditField
                  id="edit-map"
                  label="Google Maps Link"
                  value={values.map}
                  changed={isFieldChanged('map')}
                  onChange={(v) => handleChange('map', v)}
                />
              </div>
              <EditField
                id="edit-location"
                label="Address / Full Location"
                value={values.location}
                changed={isFieldChanged('location')}
                onChange={(v) => handleChange('location', v)}
              />
            </div>
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>Time &amp; Schedule</span>
                <div className={styles.sectionLine} aria-hidden="true" />
              </div>
              <div className={styles.gridRow3}>
                <EditField
                  id="edit-day"
                  label="Day of Week"
                  value={values.dayOfWeek}
                  changed={isFieldChanged('dayOfWeek')}
                  onChange={(v) => handleChange('dayOfWeek', v)}
                />
                <EditField
                  id="edit-start"
                  label="Start Time"
                  value={values.startTime}
                  changed={isFieldChanged('startTime')}
                  onChange={(v) => handleChange('startTime', v)}
                />
                <EditField
                  id="edit-end"
                  label="End Time"
                  value={values.endTime}
                  changed={isFieldChanged('endTime')}
                  onChange={(v) => handleChange('endTime', v)}
                />
              </div>
              <div className={styles.gridRow}>
                <EditField
                  id="edit-freq"
                  label="Frequency"
                  value={values.frequency}
                  changed={isFieldChanged('frequency')}
                  onChange={(v) => handleChange('frequency', v)}
                />
                <EditField
                  id="edit-freq-notes"
                  label="Frequency Notes"
                  value={values.frequencyNotes}
                  changed={isFieldChanged('frequencyNotes')}
                  placeholder="e.g. Even weeks, May-Sep"
                  onChange={(v) => handleChange('frequencyNotes', v)}
                />
              </div>
            </div>
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>Price &amp; Registration</span>
                <div className={styles.sectionLine} aria-hidden="true" />
              </div>
              <div className={styles.gridRow}>
                <EditField
                  id="edit-price"
                  label="Price"
                  value={values.price}
                  changed={isFieldChanged('price')}
                  onChange={(v) => handleChange('price', v)}
                />
                <EditField
                  id="edit-prereg"
                  label="Pre-Registration / RSVP"
                  value={values.preRegistration}
                  changed={isFieldChanged('preRegistration')}
                  onChange={(v) => handleChange('preRegistration', v)}
                />
              </div>
              <EditField
                id="edit-reg-url"
                label="Registration URL"
                value={values.registrationUrl}
                changed={isFieldChanged('registrationUrl')}
                placeholder="Only if registration is required or recommended"
                onChange={(v) => handleChange('registrationUrl', v)}
              />
            </div>
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>Notes &amp; Submitter Info</span>
                <div className={styles.sectionLine} aria-hidden="true" />
              </div>
              <div className={styles.field}>
                <label htmlFor="edit-notes" className={styles.label}>
                  What changed or needs updating? (optional)
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