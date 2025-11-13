// Corresponds to the columns in your Google Sheet
export type Event = {
  database: string;
  title: string;
  organization: string;
  activity1: string;
  activity2: string;
  activity3: string;
  startTime: string;
  endTime: string;
  price: string;
  location: string;
  area: string;
  map: string;
  social: string;
  website: string;
  contact: string;
  dayOfWeek: string;
  id: string;
  notes: string;
};

// This is the "Publish to web" URL for your Google Sheet as a CSV
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS2zEDH8-8__S6s0_a0evopp5lh0e34Tv0_fPcPQetnhed1kXHCCGNhIsXen_za-xB8SpS9CIdZaH9C/pub?gid=0&single=true&output=csv';

// A simple CSV parser
function parseCsv(csvText: string): string[][] {
  const lines = csvText.trim().split('\n');
  return lines.map(line => line.split(','));
}

export async function getEvents(): Promise<Event[]> {
  try {
    const response = await fetch(CSV_URL, {
      // Revalidate data every hour
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch sheet: ${response.statusText}`);
    }

    const csvText = await response.text();
    const rows = parseCsv(csvText);

    // Remove the header row
    const dataRows = rows.slice(1);

    const events = dataRows.map((row): Event => ({
      database: row[0] || '',
      title: row[1] || '',
      organization: row[2] || '',
      activity1: row[3] || '',
      activity2: row[4] || '',
      activity3: row[5] || '',
      startTime: row[6] || '',
      endTime: row[7] || '',
      price: row[8] || '',
      location: row[9] || '',
      area: row[10] || '',
      map: row[11] || '',
      social: row[12] || '',
      website: row[13] || '',
      contact: row[14] || '',
      dayOfWeek: row[15] || '',
      id: row[16] || '',
      notes: row[17] || '',
    }));

    // Filter for events that are in Medellin and have a title
    return events.filter(event => event.database.toLowerCase() === 'medellin' && event.title);

  } catch (error) {
    console.error("Error fetching events:", error);
    return []; // Return an empty array on error
  }
}