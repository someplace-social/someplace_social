import Image from 'next/image';
import Accordion from '../components/Accordion';
import ContactForm from '../components/ContactForm';
import styles from '../Page.module.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Submit a new event, request an edit to an existing listing, or ask a question.',
};

const submitEventFields = [
  { name: 'Your Name', label: 'Your Name', placeholder: 'e.g. John Doe', type: 'text', required: false },
  { name: 'Your Email', label: 'Your Email Address', placeholder: 'e.g. john@doe.com', type: 'email', required: false },
  { name: 'Event Frequency', label: 'How often does this event happen?', placeholder: 'e.g. Weekly', type: 'text', required: false },
  { name: 'Day of Week', label: 'Day of Week', placeholder: 'e.g. Monday', type: 'text', required: false },
  { name: 'Event Name', label: 'Name of Event', placeholder: 'e.g. Verb & Vibe Game Nite', type: 'text', required: false },
  { name: 'Organizer', label: 'Organizer', placeholder: 'e.g. Life Dance Studios', type: 'text', required: false },
  { name: 'Activity Type', label: 'Type of Activity', placeholder: 'e.g. Language Exchange, Dance, Social...', type: 'text', required: false },
  { name: 'Other Activities', label: '*If you chose "Other" under "Type of Activity", list the activities here', placeholder: '', type: 'text', required: false },
  { name: 'Start Time', label: 'Start Time', placeholder: 'e.g. 7:30 PM', type: 'text', required: false },
  { name: 'End Time', label: 'End Time', placeholder: 'e.g. 10:00 PM', type: 'text', required: false },
  { name: 'Price', label: 'Price', placeholder: 'e.g. 10k, Free, or Donation', type: 'text', required: false },
  { name: 'Location', label: 'Location', placeholder: 'e.g. Café Revolución', type: 'text', required: false },
  { name: 'Neighborhood', label: 'Neighborhood', placeholder: 'e.g. Laureles', type: 'text', required: false },
  { name: 'Google Map Link', label: 'Google Map Link', placeholder: 'e.g. www.maps.app.goo.gl/BNNzzoaq3avhH3TE6', type: 'text', required: false },
  { name: 'Website', label: 'Your Website', placeholder: 'e.g. www.theflyer.info/medellinweeklyevents', type: 'text', required: false },
  { name: 'Social Media Link', label: 'Social Media Link', placeholder: 'e.g. www.instagram.com/medellinweeklyevents/', type: 'text', required: false },
  { name: 'Whatsapp Link', label: 'Whatsapp Link', placeholder: 'api.whatsapp.com/send?phone=573052372904', type: 'text', required: false },
  { name: 'Anything else', label: 'Anything else you\'d like to say?', placeholder: '', type: 'textarea', required: false },
] as const;

const editEventFields = [
  { name: 'Your Email', label: 'Your Email? (optional)', placeholder: 'e.g. john@doe.com', type: 'email', required: false },
  { name: 'Listing Needs to be Updated', label: 'Which Listing Needs to be Updated? *', placeholder: "This part can't be blank or we won't know what listing you're referring to!", type: 'text', required: true },
  { name: 'What Needs to be Changed', label: 'What Needs to be Changed? *', placeholder: "Ex. time, price, location etc. Or say, DOESN'T EXIST", type: 'textarea', required: true },
] as const;

const askQuestionFields = [
  { name: 'First Name', label: 'First Name *', placeholder: 'E.g. John', type: 'text', required: true },
  { name: 'Email Address', label: 'Email Address *', placeholder: 'E.g. john@doe.com', type: 'email', required: true },
  { name: 'Message', label: 'Message *', placeholder: 'Enter your message...', type: 'textarea', required: true },
] as const;

export default function ContactPage() {
  return (
    <main className={styles.page}>
      <section className={styles.heroSection}>
        <div className={styles.heroText}>
          <h1>Contact Us</h1>
          <p style={{ fontSize: '1.2em', lineHeight: 1.6 }}>
            This site relies on the community to keep information updated and correct. If you have a submission, a question, or if listing info is wrong, use the links below.
          </p>
        </div>
        <div className={styles.illustrationContainer}>
          <Image src="/images/hero-contact.png" alt="Illustration of a capybara drinking a coffee" width={400} height={300} style={{ width: '100%', height: 'auto' }} />
        </div>
      </section>

      <section className={styles.contentBox}>
        <h2 style={{ fontSize: '2.5em', marginBottom: '1rem' }}>Thanks for Contributing</h2>
        <p>This site’s free for everyone—no ads, no pop-ups. It runs 100% on donations. If you’re able, <a href="https://buymeacoffee.com/someplacesocial" target="_blank" rel="noopener noreferrer" style={{color: 'inherit'}}>buy me a drink.</a></p>
      </section>

      <div style={{width: '100%', marginTop: '2rem'}}>
        <Accordion title="Submit an Event">
          <div>
            <strong>A FEW NOTES</strong>
            <p>• Anyone can submit an event as long as it meets the criteria below.</p>
            <p>• If you're submitting an event you know of, but don't know all the details, you can put a “?” in the box.</p>
            <br/>
            <strong>WEEKLY EVENT LISTINGS CRITERIA</strong>
            <p><strong>• Regularly Occurring:</strong> must happen weekly or biweekly.</p>
            <p><strong>• Group Event:</strong> must be open to multiple people. No one-on-one sessions.</p>
            <p><strong>• Open:</strong> must be inclusive and open to all.</p>
            <p><strong>• Affordable:</strong> must be relatively affordable.</p>
            <hr style={{margin: '2rem 0'}} />
            <ContactForm formType="Submit an Event" fields={submitEventFields} />
          </div>
        </Accordion>
        <Accordion title="Edit Event Info">
          <ContactForm formType="Edit Event Info" fields={editEventFields} />
        </Accordion>
        <Accordion title="Ask a Question">
          <ContactForm formType="Ask a Question" fields={askQuestionFields} />
        </Accordion>
      </div>
    </main>
  );
}