'use client';
import { useState, useEffect } from 'react';
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

const PRE_REGISTRATION_OPTIONS = [
  'Drop-in (no RSVP needed)',
  'RSVP recommended',
  'RSVP required',
  'Ticketed / pre-pay',
] as const;

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

  const [city, setCity] = useState('Medellín, Colombia');
  const [title, setTitle] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [activity, setActivity] = useState('');
  const [otherActivities, setOtherActivities] = useState('');
  const [about, setAbout] = useState('');

  // Section 2: When & Schedule
  const [frequency, setFrequency] = useState('Weekly');
  const [frequencyNotes, setFrequencyNotes] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // Section 3: Where / Location
  const [venue, setVenue] = useState('');
  const [location, setLocation] = useState('');
  const [area, setArea] = useState('');
  const [map, setMap] = useState('');

  // Section 4: Cost & Pre-Registration
  const [price, setPrice] = useState('');
  const [preRegistrationType, setPreRegistrationType] = useState('Drop-in (no RSVP needed)');
  const [preRegistrationDetails, setPreRegistrationDetails] = useState('');

  // Section 5: Links & Contact
  const [website, setWebsite] = useState('');
  const [social, setSocial] = useState('');
  const [contact, setContact] = useState('');

  // Section 6: Submitter Info & Notes
  const [submitterName, setSubmitterName] = useState('');
  const [submitterEmail, setSubmitterEmail] = useState('');
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  // Status states
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Send a message tab states
  const [questionName, setQuestionName] = useState('');
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

    const fullActivity = otherActivities.trim()
      ? activity === 'Other'
        ? otherActivities.trim()
        : `${activity ? `${activity}, ` : ''}${otherActivities.trim()}`
      : activity || 'Not specified';

    const fullPreRegistration = preRegistrationDetails.trim()
      ? `${preRegistrationType} - ${preRegistrationDetails.trim()}`
      : preRegistrationType;

    const daysText = selectedDays.length > 0 ? selectedDays.join(', ') : '';

    const summaryLines = [
      `=== EVENT SUBMISSION ===`,
      `City: ${city}`,
      `Title: ${title}`,
      `Venue: ${venue || 'Not specified'}`,
      `Location / Address: ${location || 'Not specified'}`,
      `Area / Neighborhood: ${area || 'Not specified'}`,
      `Activity: ${fullActivity}`,
      `Day of Week: ${daysText || 'Not specified'}`,
      `Start Time: ${startTime || 'Not specified'}`,
      `End Time: ${endTime || 'Not specified'}`,
      `Frequency: ${frequency}`,
      frequencyNotes ? `Frequency Notes: ${frequencyNotes}` : null,
      `Price: ${price || 'Not specified'}`,
      `Pre-Registration: ${fullPreRegistration}`,
      map ? `Google Maps Link: ${map}` : null,
      social ? `Social Media: ${social}` : null,
      website ? `Website: ${website}` : null,
      contact ? `Contact (Email / Phone / WhatsApp / Form): ${contact}` : null,
      about ? `About / Description:\n${about}` : null,
      ``,
      `=== SUBMITTER INFO ===`,
      `Submitter Name: ${submitterName || 'Anonymous / Not provided'}`,
      `Submitter Email: ${submitterEmail || 'Not provided'}`,
      `Is Event Host/Organizer: ${isOrganizer ? 'Yes' : 'No (Community member)'}`,
      adminNotes ? `Notes for Admin:\n${adminNotes}` : null,
      ``,
      `=== COPY-PASTE GOOGLE SHEET ROW (TSV) ===`,
      `Title\tVenue\tLocation\tArea\tActivity\tDay of Week\tStart Time\tEnd Time\tFrequency\tFrequency Notes\tPrice\tPre-Registration\tMap\tSocial\tWebsite\tContact\tAbout`,
      [
        title.replace(/[\t\r\n]+/g, ' '),
        venue.replace(/[\t\r\n]+/g, ' '),
        location.replace(/[\t\r\n]+/g, ' '),
        area.replace(/[\t\r\n]+/g, ' '),
        fullActivity.replace(/[\t\r\n]+/g, ' '),
        daysText.replace(/[\t\r\n]+/g, ' '),
        startTime.replace(/[\t\r\n]+/g, ' '),
        endTime.replace(/[\t\r\n]+/g, ' '),
        frequency.replace(/[\t\r\n]+/g, ' '),
        frequencyNotes.replace(/[\t\r\n]+/g, ' '),
        price.replace(/[\t\r\n]+/g, ' '),
        fullPreRegistration.replace(/[\t\r\n]+/g, ' '),
        map.replace(/[\t\r\n]+/g, ' '),
        social.replace(/[\t\r\n]+/g, ' '),
        website.replace(/[\t\r\n]+/g, ' '),
        contact.replace(/[\t\r\n]+/g, ' '),
        about.replace(/[\t\r\n]+/g, ' '),
      ].join('\t'),
    ].filter(Boolean);

    try {
      const response = await fetch('/api/send-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formType: `Submit an Event (${city})`,
          message: summaryLines.join('\n'),
        }),
      });

      const result = await response.json();
      if (result.success) {
        setSubmitStatus({
          success: true,
          message: 'Thank you! Your event submission has been sent. We will review and add it shortly.',
        });
        setTitle('');
        setOrganizer('');
        setActivity('');
        setOtherActivities('');
        setAbout('');
        setFrequency('Weekly');
        setFrequencyNotes('');
        setSelectedDays([]);
        setStartTime('');
        setEndTime('');
        setVenue('');
        setLocation('');
        setArea('');
        setMap('');
        setPrice('');
        setPreRegistrationType('Drop-in (no RSVP needed)');
        setPreRegistrationDetails('');
        setWebsite('');
        setSocial('');
        setContact('');
        setSubmitterName('');
        setSubmitterEmail('');
        setIsOrganizer(false);
        setAdminNotes('');
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
      `Name: ${questionName}`,
      `Email Address: ${questionEmail}`,
      `Message:`,
      questionMessage,
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
        setQuestionStatus({
          success: true,
          message: 'Thank you! Your message has been sent. We will get back to you soon.',
        });
        setQuestionName('');
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
          <form
            id="panel-question"
            role="tabpanel"
            aria-labelledby="tab-question"
            onSubmit={handleQuestionSubmit}
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
                    value={questionName}
                    onChange={(e) => setQuestionName(e.target.value)}
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
              {questionLoading ? 'Sending message...' : 'Send Message'}
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
        ) : (
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
                  <strong>Affordable:</strong> free, donation, or reasonably priced.
                </li>
              </ul>
              <p className={styles.criteriaFootnote}>
                Only the <strong>event title</strong> is required. Don&apos;t worry if you don&apos;t know all details — share whatever you know!
              </p>
            </div>
            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>The Event</legend>
              <p className={styles.sectionDescription}>
                Basic details about the event.
              </p>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="submit-city" className={styles.label}>
                    City / Region
                  </label>
                  <select
                    id="submit-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={styles.select}
                  >
                    <option value="Medellín, Colombia">Medellín, Colombia</option>
                    <option value="Fort Collins, Colorado">Fort Collins, Colorado</option>
                    <option value="Other / New City">Other / New City</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label htmlFor="submit-title" className={styles.label}>
                    Event Title *
                  </label>
                  <input
                    id="submit-title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Verb &amp; Vibe Game Nite"
                    className={styles.input}
                  />
                  <span className={styles.helperText}>The only required field!</span>
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="submit-organizer" className={styles.label}>
                    Organizer / Host
                    <span className={styles.labelSub}>(optional)</span>
                  </label>
                  <input
                    id="submit-organizer"
                    type="text"
                    value={organizer}
                    onChange={(e) => setOrganizer(e.target.value)}
                    placeholder="e.g. Life Dance Studios, English Club"
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="submit-activity" className={styles.label}>
                    Activity / Category
                    <span className={styles.labelSub}>(optional)</span>
                  </label>
                  <select
                    id="submit-activity"
                    value={activity}
                    onChange={(e) => setActivity(e.target.value)}
                    className={styles.select}
                  >
                    <option value="">Select an activity…</option>
                    <option value="Language exchange">Language exchange</option>
                    <option value="Dance">Dance (Salsa, Bachata, etc.)</option>
                    <option value="Games">Games &amp; Trivia</option>
                    <option value="Music">Live Music &amp; Jam</option>
                    <option value="Social">Social &amp; Drinks</option>
                    <option value="Fitness">Fitness, Sports &amp; Yoga</option>
                    <option value="Art & Craft">Art &amp; Crafts</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              {activity === 'Other' && (
                <div className={styles.field}>
                  <label htmlFor="submit-other-act" className={styles.label}>
                    Describe the activity
                  </label>
                  <input
                    id="submit-other-act"
                    type="text"
                    value={otherActivities}
                    onChange={(e) => setOtherActivities(e.target.value)}
                    placeholder="e.g. Book club, Coding meetup, Chess"
                    className={styles.input}
                  />
                </div>
              )}
              <div className={styles.field}>
                <label htmlFor="submit-about" className={styles.label}>
                  About the event
                  <span className={styles.labelSub}>(optional)</span>
                </label>
                <textarea
                  id="submit-about"
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  placeholder="What is this event about? What can people expect when they arrive?"
                  className={styles.textarea}
                />
              </div>
            </fieldset>

            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>When &amp; Schedule</legend>
              <p className={styles.sectionDescription}>
                Help people know when to show up.
              </p>
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
                    <option value="Bi-weekly (every two weeks)">Bi-weekly (every two weeks)</option>
                    <option value="Monthly (1st Tuesday…)">Monthly (e.g. 1st Tuesday)</option>
                    <option value="Seasonal / Irregular">Seasonal / Irregular</option>
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
                    placeholder="e.g. 1st &amp; 3rd Friday of each month, May–Sep only"
                    className={styles.input}
                  />
                </div>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>
                  Day of week <span className={styles.labelSub}>(select all that apply)</span>
                </span>
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
                    <span className={styles.labelSub}>(optional)</span>
                  </label>
                  <input
                    id="submit-start-time"
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="e.g. 7:00 PM"
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="submit-end-time" className={styles.label}>
                    End time
                    <span className={styles.labelSub}>(optional)</span>
                  </label>
                  <input
                    id="submit-end-time"
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="e.g. 9:30 PM"
                    className={styles.input}
                  />
                </div>
              </div>
            </fieldset>

            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>Where / Location</legend>
              <p className={styles.sectionDescription}>
                Where does the event take place?
              </p>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="submit-venue" className={styles.label}>
                    Venue name
                    <span className={styles.labelSub}>(optional)</span>
                  </label>
                  <input
                    id="submit-venue"
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="e.g. Café Revolución, Washington Park"
                    className={styles.input}
                  />
                  <span className={styles.helperText}>Name of the café, bar, studio, or park</span>
                </div>
                <div className={styles.field}>
                  <label htmlFor="submit-area" className={styles.label}>
                    Neighborhood / Area
                    <span className={styles.labelSub}>(optional)</span>
                  </label>
                  <input
                    id="submit-area"
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. Laureles, Poblado, Old Town"
                    className={styles.input}
                  />
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="submit-location" className={styles.label}>
                    Address / Specific location
                    <span className={styles.labelSub}>(optional)</span>
                  </label>
                  <input
                    id="submit-location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Cra. 37 #8A-37, 2nd floor"
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="submit-map" className={styles.label}>
                    Google Maps link
                    <span className={styles.labelSub}>(optional)</span>
                  </label>
                  <input
                    id="submit-map"
                    type="text"
                    value={map}
                    onChange={(e) => setMap(e.target.value)}
                    placeholder="e.g. maps.app.goo.gl/…"
                    className={styles.input}
                  />
                </div>
              </div>
            </fieldset>

            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>Cost &amp; Pre-Registration</legend>
              <p className={styles.sectionDescription}>
                Is it free, paid, or does it require signing up in advance?
              </p>
              <div className={styles.field}>
                <label htmlFor="submit-price" className={styles.label}>
                  Price
                  <span className={styles.labelSub}>(optional)</span>
                </label>
                <input
                  id="submit-price"
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. Free, Donation, $10, or 15k COP"
                  className={styles.input}
                />
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Pre-Registration / RSVP</span>
                <div className={styles.radioGroup}>
                  {PRE_REGISTRATION_OPTIONS.map((opt) => {
                    const isSelected = preRegistrationType === opt;
                    return (
                      <label
                        key={opt}
                        className={`${styles.radioPill} ${isSelected ? styles.radioPillActive : ''}`}
                      >
                        <input
                          type="radio"
                          name="preRegistrationType"
                          value={opt}
                          checked={isSelected}
                          onChange={(e) => setPreRegistrationType(e.target.value)}
                          className={styles.radioInput}
                        />
                        {opt}
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className={styles.field}>
                <label htmlFor="submit-prereg-details" className={styles.label}>
                  Registration link or instructions
                  <span className={styles.labelSub}>(optional)</span>
                </label>
                <input
                  id="submit-prereg-details"
                  type="text"
                  value={preRegistrationDetails}
                  onChange={(e) => setPreRegistrationDetails(e.target.value)}
                  placeholder="e.g. eventbrite.com/... or DM @account on Instagram"
                  className={styles.input}
                />
              </div>
            </fieldset>

            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>
                Links &amp; Contact <span className={styles.legendOptional}>(optional)</span>
              </legend>
              <p className={styles.sectionDescription}>
                How people can find more information or reach out to the organizer.
              </p>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="submit-website" className={styles.label}>
                    Website link
                    <span className={styles.labelSub}>(optional)</span>
                  </label>
                  <input
                    id="submit-website"
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="e.g. somedomain.com/event"
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="submit-social" className={styles.label}>
                    Social media / Instagram
                    <span className={styles.labelSub}>(optional)</span>
                  </label>
                  <input
                    id="submit-social"
                    type="text"
                    value={social}
                    onChange={(e) => setSocial(e.target.value)}
                    placeholder="e.g. instagram.com/ourgroup or @ourgroup"
                    className={styles.input}
                  />
                </div>
              </div>
              <div className={styles.field}>
                <label htmlFor="submit-contact" className={styles.label}>
                  Organizer contact
                  <span className={styles.labelSub}>(optional)</span>
                </label>
                <input
                  id="submit-contact"
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="e.g. organizer@gmail.com, +57 300 123 4567, or WhatsApp / form link"
                  className={styles.input}
                />
                <span className={styles.helperText}>
                  Can be an email address, phone number, WhatsApp link, or web contact form.
                </span>
              </div>
            </fieldset>

            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>
                About You <span className={styles.legendOptional}>(optional)</span>
              </legend>
              <p className={styles.sectionDescription}>
                Let us know who is submitting in case we have a question before publishing.
              </p>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="submit-name" className={styles.label}>
                    Your name
                    <span className={styles.labelSub}>(optional)</span>
                  </label>
                  <input
                    id="submit-name"
                    type="text"
                    value={submitterName}
                    onChange={(e) => setSubmitterName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="submit-email" className={styles.label}>
                    Your email address
                    <span className={styles.labelSub}>(optional)</span>
                  </label>
                  <input
                    id="submit-email"
                    type="email"
                    value={submitterEmail}
                    onChange={(e) => setSubmitterEmail(e.target.value)}
                    placeholder="e.g. alex@gmail.com"
                    className={styles.input}
                  />
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.checkboxContainer}>
                  <input
                    type="checkbox"
                    checked={isOrganizer}
                    onChange={(e) => setIsOrganizer(e.target.checked)}
                    className={styles.checkboxCustom}
                  />
                  <span className={styles.checkboxLabelText}>
                    I am the organizer or host of this event
                  </span>
                </label>
              </div>
              <div className={styles.field}>
                <label htmlFor="submit-admin-notes" className={styles.label}>
                  Note for administrator
                  <span className={styles.labelSub}>(optional)</span>
                </label>
                <textarea
                  id="submit-admin-notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Any extra context or private notes for us (e.g., 'Venue might change next month', 'Found this on Instagram')."
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
        )}
      </section>
    </main>
  );
}