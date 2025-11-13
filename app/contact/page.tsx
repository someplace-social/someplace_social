import Accordion from '../components/Accordion';
import ContactForm from '../components/ContactForm';

const pageStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '2rem',
  maxWidth: '1000px',
  margin: '0 auto',
};

const heroSectionStyles: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '2rem',
  width: '100%',
  marginBottom: '4rem',
};

const heroTextStyles: React.CSSProperties = {
  flex: 1,
  maxWidth: '500px',
};

const illustrationPlaceholderStyles: React.CSSProperties = {
  flex: 1,
  maxWidth: '400px',
  height: '300px',
  backgroundColor: '#e0e0e0',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const contentBoxStyles: React.CSSProperties = {
  backgroundColor: '#fdf8e1',
  border: '1px solid #eee',
  borderRadius: '8px',
  padding: '2rem',
  width: '100%',
};

const submitEventFields = [
  { name: 'Your Name', label: 'Your Name', type: 'text', required: true },
  { name: 'Your Email', label: 'Your Email Address', type: 'email', required: true },
  { name: 'Event Details', label: 'Event Details (Please include all info)', type: 'textarea', required: true },
];

const editEventFields = [
  { name: 'Your Email', label: 'Your Email (So we can follow up)', type: 'email', required: true },
  { name: 'Listing Needs to be Updated', label: 'Which Listing Needs to be Updated?', type: 'text', required: true },
  { name: 'What Needs to be Changed', label: 'What Needs to be Changed?', type: 'textarea', required: true },
];

const askQuestionFields = [
  { name: 'Your Name', label: 'Your Name', type: 'text', required: true },
  { name: 'Your Email', label: 'Your Email Address', type: 'email', required: true },
  { name: 'Your Question', label: 'Anything else you\'d like to say?', type: 'textarea', required: true },
];

export default function ContactPage() {
  return (
    <main style={pageStyles}>
      <section style={heroSectionStyles}>
        <div style={heroTextStyles}>
          <h1 style={{ fontSize: '3em', marginBottom: '1rem' }}>Contact Us</h1>
          <p style={{ fontSize: '1.2em', lineHeight: 1.6 }}>
            This site relies on the community to keep information updated and spread the word. If you see info that's incorrect, have a suggestion, or just want to say hello, let us know below.
          </p>
        </div>
        <div style={illustrationPlaceholderStyles}>
          <span>Illustration Placeholder</span>
        </div>
      </section>

      <section style={contentBoxStyles}>
        <h2 style={{ fontSize: '2em', marginBottom: '1rem' }}>Thanks for Contributing</h2>
        <p>This site has no ads and is not pay-to-play. It only runs on donations. If you're able, buy me a drink.</p>
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