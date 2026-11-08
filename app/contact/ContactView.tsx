'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import styles from './Contact.module.css';

const DAYS_OF_WEEK = [
  { id: 'mon', label: 'Mon' },
  { id: 'tue', label: 'Tue' },
  { id: 'wed', label: 'Wed' },
  { id: 'thu', label: 'Thu' },
  { id: 'fri', label: 'Fri' },
  { id: 'sat', label: 'Sat' },
  { id: 'sun', label: 'Sun' },
] as const;

export default function ContactView() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'question' ? 'question' : 'submit';

  const [activeTab, setActiveTab] = useState<'submit' | 'question'>(initialTab);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [eventName, setEventName] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [activity, setActivity] = useState('');
  const [otherActivities, setOtherActivities] = useState('');
  const [frequency, setFrequency] = useState('Weekly');
  const [frequencyNotes, setFrequencyNotes] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [price, setPrice] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [location, setLocation] = useState('');
  const [googleMaps, setGoogleMaps] = useState('');
  const [website, setWebsite] = useState('');
  const [social, setSocial] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [notes, setNotes] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ success: boolean; message: string } | null>(null);

  const [questionFirstName, setQuestionFirstName] = useState('');
  const [questionEmail, setQuestionEmail] = useState('');
  const [questionMessage, setQuestionMessage] = useState('');
  const [questionLoading, setQuestionLoading] = useState(false);
  const [questionStatus, setQuestionStatus] = useState<{ success: boolean; message: string } | null>(null);

  const toggleDay = (dayLabel: string) => {
    setSelectedDays((prev) =>
      prev.includes(dayLabel) ? prev.filter((d) => d !== dayLabel) : [...prev, dayLabel]
    );
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitStatus(null);

    const messageLines = [
      `Submitter Name: ${name || 'Not provided'}`,
      `Submitter Email: ${email || 'Not provided'}`,
      `Event Name: ${eventName}`,
      `Organizer: ${organizer || 'Not provided'}`,
      `Activity: ${activity || 'Not provided'}`,
      otherActivities ? `Other Activities: ${otherActivities}` : null,
      `Frequency: ${frequency}`,
      frequencyNotes ? `Frequency Notes: ${frequencyNotes}` : null,
      `Days of Week: ${selectedDays.length > 0 ? selectedDays.join(', ') : 'Not specified'}`,
      `Start Time: ${startTime || 'Not specified'}`,
      `End Time: ${endTime || 'Not specified'}`,
      `Price: ${price || 'Not specified'}`,
      `Neighborhood: ${neighborhood || 'Not specified'}`,
      `Location: ${location || 'Not specified'}`,
      googleMaps ? `Google Maps: ${googleMaps}` : null,
      website ? `Website: ${website}` : null,
      social ? `Social Media: ${social}` : null,
      whatsapp ? `WhatsApp: ${whatsapp}` : null,
      notes ? `Additional Notes: ${notes}` : null,
    ].filter(Boolean);

    try {
      const response = await fetch('/api/send-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formType: 'Submit an Event',
          message: messageLines.join('\n'),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus({
          success: true,
          message: 'Thank you! Your event submission has been sent. We will review it shortly.',
        });
        setName('');
        setEmail('');
        setEventName('');
        setOrganizer('');
        setActivity('');
        setOtherActivities('');
        setFrequency('Weekly');
        setFrequencyNotes('');
        setSelectedDays([]);
        setStartTime('');
        setEndTime('');
        setPrice('');
        setNeighborhood('');
        setLocation('');
        setGoogleMaps('');
        setWebsite('');
        setSocial('');
        setWhatsapp('');
        setNotes('');
      } else {
        setSubmitStatus({
          success: false,
          message: 'Failed to submit event. Please try again.',
        });
      }
    } catch {
      setSubmitStatus({
        success: false,
        message: 'A connection error occurred. Please try again.',
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuestionLoading(true);
    setQuestionStatus(null);

    const messageLines = [
      `First Name: ${questionFirstName}`,
      `Email Address: ${questionEmail}`,
      `Message:`,
      questionMessage,
    ];

    try {
      const response = await fetch('/api/send-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formType: 'Ask a Question',
          message: messageLines.join('\n'),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setQuestionStatus({
          success: true,
          message: 'Thank you! Your message has been sent. We will get back to you soon.',
        });
        setQuestionFirstName('');
        setQuestionEmail('');
        setQuestionMessage('');
      } else {
        setQuestionStatus({
          success: false,
          message: 'Failed to send message. Please try again.',
        });
      }
    } catch {
      setQuestionStatus({
        success: false,
        message: 'A connection error occurred. Please try again.',
      });
    } finally {
      setQuestionLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div>
          <h1 className={styles.heroTitle}>Contact Us</h1>
          <p className={styles.heroDescription}>
            Have an event to share or a question for us? Use the forms below and we&apos;ll get back to you.
          </p>
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

      <section className={styles.thanks}>
        <h2 className={styles.thanksTitle}>Thanks for contributing</h2>
        <p className={styles.thanksText}>
          Free for everyone — no ads, no pop-ups. It runs 100% on donations. If you&apos;re able,{' '}
          <a
            href="https://buymeacoffee.com/someplacesocial"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.drinkLink}
          >
            buy me a drink
          </a>.
        </p>
      </section>

      <div className={styles.labelDivider}>
        <span>Get in touch</span>
        <div className={styles.labelLine} aria-hidden="true" />
      </div>

      <section className={styles.panel}>
        <div className={styles.tabs} role="tablist" aria-label="Contact options">
          <button
            type="button"
            role="tab"
            id="tab-submit"
            aria-selected={activeTab === 'submit'}
            aria-controls="panel-submit"
            className={`${styles.tabBtn} ${activeTab === 'submit' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('submit')}
          >
            Submit an event
          </button>
          <button
            type="button"
            role="tab"
            id="tab-question"
            aria-selected={activeTab === 'question'}
            aria-controls="panel-question"
            className={`${styles.tabBtn} ${activeTab === 'question' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('question')}
          >
            Ask a question
          </button>
        </div>

        {activeTab === 'submit' ? (
          <form
            id="panel-submit"
            role="tabpanel"
            aria-labelledby="tab-submit"
            onSubmit={handleEventSubmit}
          >
            <div className={styles.criteria}>
              <h3 className={styles.criteriaHeading}>Event listing criteria</h3>
              <ul className={styles.criteriaGrid}>
                <li className={styles.criteriaItem}>
                  <strong>Regularly occurring:</strong> weekly, bi-weekly, or monthly.
                </li>
                <li className={styles.criteriaItem}>
                  <strong>Group event:</strong> open to multiple people, no one-on-one.
                </li>
                <li className={styles.criteriaItem}>
                  <strong>Open:</strong> inclusive and open to all.
                </li>
                <li className={styles.criteriaItem}>
                  <strong>Affordable:</strong> relatively affordable.
                </li>
              </ul>
              <p className={styles.criteriaFootnote}>
                Don&apos;t know all the details? Put a &ldquo;?&rdquo; in the box.
              </p>
            </div>

            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>About you</legend>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="submit-name" className={styles.label}>
                    Your name
                  </label>
                  <input
                    id="submit-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="submit-email" className={styles.label}>
                    Your email address
                  </label>
                  <input
                    id="submit-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. john@doe.com"
                    className={styles.input}
                  />
                </div>
              </div>
            </fieldset>

            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>The event</legend>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="submit-event-name" className={styles.label}>
                    Name of event *
                  </label>
                  <input
                    id="submit-event-name"
                    type="text"
                    required
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="e.g. Verb &amp; Vibe Game Nite"
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="submit-organizer" className={styles.label}>
                    Organizer
                  </label>
                  <input
                    id="submit-organizer"
                    type="text"
                    value={organizer}
                    onChange={(e) => setOrganizer(e.target.value)}
                    placeholder="e.g. Life Dance Studios"
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="submit-activity" className={styles.label}>
                    Activity
                  </label>
                  <select
                    id="submit-activity"
                    value={activity}
                    onChange={(e) => setActivity(e.target.value)}
                    className={styles.select}
                  >
                    <option value="">Select an activity…</option>
                    <option value="Language exchange">Language exchange</option>
                    <option value="Dance">Dance</option>
                    <option value="Games">Games</option>
                    <option value="Music">Music</option>
                    <option value="Social">Social</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label htmlFor="submit-other-act" className={styles.label}>
                    If &ldquo;Other&rdquo;, list the activities
                    <span className={styles.labelSub}>(optional)</span>
                  </label>
                  <input
                    id="submit-other-act"
                    type="text"
                    value={otherActivities}
                    onChange={(e) => setOtherActivities(e.target.value)}
                    className={styles.input}
                  />
                </div>
              </div>
            </fieldset>

            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>When</legend>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="submit-frequency" className={styles.label}>
                    How often does it happen?
                  </label>
                  <select
                    id="submit-frequency"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className={styles.select}
                  >
                    <option value="Weekly">Weekly</option>
                    <option value="Bi-weekly">Bi-weekly</option>
                    <option value="Monthly (1st Tuesday…)">Monthly (1st Tuesday…)</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label htmlFor="submit-freq-notes" className={styles.label}>
                    Frequency notes
                    <span className={styles.labelSub}>(optional)</span>
                  </label>
                  <input
                    id="submit-freq-notes"
                    type="text"
                    value={frequencyNotes}
                    onChange={(e) => setFrequencyNotes(e.target.value)}
                    placeholder="e.g. May–Sep only, Even/Odd weeks"
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <span className={styles.label}>Day of week</span>
                <div className={styles.days}>
                  {DAYS_OF_WEEK.map((day) => {
                    const isChecked = selectedDays.includes(day.label);
                    return (
                      <label
                        key={day.id}
                        className={`${styles.dayPill} ${isChecked ? styles.dayPillActive : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleDay(day.label)}
                          className={styles.dayCheckbox}
                        />
                        {day.label}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="submit-start-time" className={styles.label}>
                    Start time
                  </label>
                  <input
                    id="submit-start-time"
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="e.g. 7:30 PM"
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="submit-end-time" className={styles.label}>
                    End time
                  </label>
                  <input
                    id="submit-end-time"
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="e.g. 10:00 PM"
                    className={styles.input}
                  />
                </div>
              </div>
            </fieldset>

            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>Where &amp; how much</legend>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="submit-price" className={styles.label}>
                    Price
                  </label>
                  <input
                    id="submit-price"
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 10k, Free, or Donation"
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="submit-neighborhood" className={styles.label}>
                    Neighborhood
                  </label>
                  <input
                    id="submit-neighborhood"
                    type="text"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    placeholder="e.g. Laureles"
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="submit-location" className={styles.label}>
                    Location
                  </label>
                  <input
                    id="submit-location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Café Revolución"
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="submit-maps" className={styles.label}>
                    Google Maps link
                  </label>
                  <input
                    id="submit-maps"
                    type="text"
                    value={googleMaps}
                    onChange={(e) => setGoogleMaps(e.target.value)}
                    placeholder="e.g. maps.app.goo.gl/…"
                    className={styles.input}
                  />
                </div>
              </div>
            </fieldset>

            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>
                Links <span className={styles.legendOptional}>(optional)</span>
              </legend>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="submit-website" className={styles.label}>
                    Website
                  </label>
                  <input
                    id="submit-website"
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="e.g. theflyer.info/…"
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="submit-social" className={styles.label}>
                    Social media
                  </label>
                  <input
                    id="submit-social"
                    type="text"
                    value={social}
                    onChange={(e) => setSocial(e.target.value)}
                    placeholder="e.g. instagram.com/…"
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="submit-wa" className={styles.label}>
                  WhatsApp link
                </label>
                <input
                  id="submit-wa"
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="e.g. api.whatsapp.com/send?phone=…"
                  className={styles.input}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="submit-notes" className={styles.label}>
                  Anything else you&apos;d like to say?
                </label>
                <textarea
                  id="submit-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={styles.textarea}
                />
              </div>
            </fieldset>

            <button type="submit" className={styles.submitBtn} disabled={submitLoading}>
              {submitLoading ? 'Submitting event...' : 'Submit event'}
            </button>

            {submitStatus && (
              <div
                className={`${styles.statusAlert} ${
                  submitStatus.success ? styles.statusSuccess : styles.statusError
                }`}
                role="status"
              >
                {submitStatus.message}
              </div>
            )}
          </form>
        ) : (
          <form
            id="panel-question"
            role="tabpanel"
            aria-labelledby="tab-question"
            onSubmit={handleQuestionSubmit}
          >
            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>Ask a question</legend>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="q-first-name" className={styles.label}>
                    First name *
                  </label>
                  <input
                    id="q-first-name"
                    type="text"
                    required
                    value={questionFirstName}
                    onChange={(e) => setQuestionFirstName(e.target.value)}
                    placeholder="e.g. John"
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="q-email" className={styles.label}>
                    Email address *
                  </label>
                  <input
                    id="q-email"
                    type="email"
                    required
                    value={questionEmail}
                    onChange={(e) => setQuestionEmail(e.target.value)}
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
                  value={questionMessage}
                  onChange={(e) => setQuestionMessage(e.target.value)}
                  placeholder="Enter your message…"
                  className={styles.textarea}
                />
              </div>
            </fieldset>

            <button type="submit" className={styles.submitBtn} disabled={questionLoading}>
              {questionLoading ? 'Sending message...' : 'Send message'}
            </button>

            {questionStatus && (
              <div
                className={`${styles.statusAlert} ${
                  questionStatus.success ? styles.statusSuccess : styles.statusError
                }`}
                role="status"
              >
                {questionStatus.message}
              </div>
            )}
          </form>
        )}
      </section>
    </main>
  );
}