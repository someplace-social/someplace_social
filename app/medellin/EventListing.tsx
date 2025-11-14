import { Event } from '../lib/google-sheets';
import styles from './Medellin.module.css';

type EventListingProps = {
  event: Event;
  onEdit: (content: string) => void;
};

// Helper to create links only if a URL is provided
const createLink = (text: string, url: string) => {
  if (!url || url.trim() === '') return null;
  const fullUrl = url.startsWith("http://") || url.startsWith("https://") ? url : "https://" + url;
  return <a href={fullUrl} target="_blank" rel="noopener noreferrer">{text}</a>;
};

export default function EventListing({ event, onEdit }: EventListingProps) {
  const activities = [event.activity1, event.activity2, event.activity3].filter(Boolean).join(', ');
  const organizationText = event.organization ? ` w/ ${event.organization}` : "";

  const visualText = `${event.title}${organizationText}\n${activities}\n⏳ ${event.startTime} - ${event.endTime} 💰 ${event.price} 📍 ${event.location} 🗺️ ${event.area}\nMap: ${event.map}\nSocial: ${event.social}\nWebsite: ${event.website}\nContact: ${event.contact}`;

  return (
    <div className={styles.listing}>
      <strong className={styles.listingTitle}>{event.title}{organizationText}</strong>
      <p><em>{activities}</em></p>
      <p className={styles.listingDetails}>
        <span>⏳ {event.startTime} - {event.endTime}</span>
        <span>💰 {event.price || 'Free or Varies'}</span>
        <span>📍 {event.location}</span>
        <span>🗺️  {event.area}</span>
      </p>
      <p className={styles.listingLinks}>
        {createLink('Map', event.map)}
        {createLink('Social', event.social)}
        {createLink('Website', event.website)}
        {createLink('Contact', event.contact)}
        <a href="#" onClick={(e) => { e.preventDefault(); onEdit(visualText); }} className={styles.editLink}>✏️ EDIT</a>
      </p>
    </div>
  );
}