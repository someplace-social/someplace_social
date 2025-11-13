import { getEvents } from '../lib/google-sheets';

export default async function MedellinPage() {
  const events = await getEvents();

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Medellin Weekly Events</h1>
      <p>Found {events.length} events.</p>
      <ul>
        {events.map((event, index) => (
          <li key={index}>{event.title}</li>
        ))}
      </ul>
    </main>
  );
}