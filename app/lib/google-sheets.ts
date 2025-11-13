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

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS2zEDH8-8__S6s0_a0evopp5lh0e34Tv0_fPcPQetnhed1kXHCCGNhIsXen_za-xB8SpS9CIdZaH9C/pub?gid=0&single=true&output=csv';

// This is a more robust CSV parser that handles quoted fields with commas.
function parseCsv(csvText: string): string[][] {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField);
      currentField = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      currentRow.push(currentField);
      rows.push(currentRow);
      currentRow = [];
      currentField = '';
      // Skip the next character if it's a newline sequence (\r\n)
      if (char === '\r' && csvText[i + 1] === '\n') {
        i++;
      }
    } else {
      currentField += char;
    }
  }
  // Add the last field and row
  currentRow.push(currentField);
  rows.push(currentRow);

  return rows;
}

export async function getEvents(): Promise<Event[]> {
  try {
    const response = await fetch(CSV_URL, {
      next: { revalidate: 3600 }, // Revalidate data every hour
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch sheet: ${response.statusText}`);
    }

    const csvText = await response.text();
    const rows = parseCsv(csvText);

    const dataRows = rows.slice(1); // Remove header row

    const events = dataRows.map((row): Event | null => {
      // Ensure the row has enough columns to prevent errors
      if (row.length < 18) return null;
      return {
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
      };
    }).filter(event => event !== null) as Event[];

    return events.filter(event => event.database.toLowerCase().trim() === 'medellin' && event.title);

  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}